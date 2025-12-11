import { useState } from "react";
import { AlertCircle, DollarSign, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useInvoice } from "@/contexts/InvoiceContext";
import { getInvoiceField } from "@/lib/nocodb";

// n8n webhook base URL
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://n8n-mailing.kart-automation.xyz/webhook";

interface Issue {
  id: string;
  title: string;
  description: string;
  type: "missing-po" | "low-confidence" | "needs-review" | "validation-error";
}

export const AiFindingsSection = (): React.ReactNode => {
  const { selectedInvoice, refreshInvoices } = useInvoice();
  const [loading, setLoading] = useState<string | null>(null);

  // Build issues list based on actual invoice data
  const issues: Issue[] = [];

  // Check for missing PO
  if (selectedInvoice?.PO_Status === "missing" || !selectedInvoice?.Purchase_Order_Number) {
    issues.push({
      id: "missing-po",
      title: "Missing Purchase Order",
      description: "No PO number found in the invoice. A purchase order may be required for validation.",
      type: "missing-po",
    });
  }

  // Check confidence score
  const confidence = selectedInvoice?.Confidence_Score ??
    getInvoiceField<number>(selectedInvoice, 'Extraction_Confidence', 'Extraction Confidence') ?? 100;
  if (confidence < 70) {
    issues.push({
      id: "low-confidence",
      title: "Low Extraction Confidence",
      description: `The AI extraction confidence is ${confidence}%. Manual review recommended to verify extracted data.`,
      type: "low-confidence",
    });
  }

  // Check needs review flag
  if (selectedInvoice?.Needs_Review) {
    issues.push({
      id: "needs-review",
      title: "Manual Review Required",
      description: "This invoice has been flagged for manual review due to potential data quality issues.",
      type: "needs-review",
    });
  }

  // Check for validation errors
  const validationErrors = selectedInvoice?.Validation_Errors ||
    getInvoiceField<string>(selectedInvoice, 'Validation_Errors', 'Validation Errors');
  if (validationErrors) {
    try {
      const errors = JSON.parse(validationErrors);
      if (Array.isArray(errors) && errors.length > 0) {
        issues.push({
          id: "validation-error",
          title: "Validation Errors",
          description: errors.join(". "),
          type: "validation-error",
        });
      }
    } catch {
      issues.push({
        id: "validation-error",
        title: "Validation Error",
        description: validationErrors,
        type: "validation-error",
      });
    }
  }

  const callWebhook = async (action: string) => {
    if (!selectedInvoice?.Id) return;

    setLoading(action);
    try {
      const response = await fetch(`${N8N_WEBHOOK_URL}/invoice/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: selectedInvoice.Id }),
      });

      if (!response.ok) throw new Error("Webhook failed");

      // Refresh invoices to get updated status
      await refreshInvoices();
    } catch (error) {
      console.error(`Error calling ${action} webhook:`, error);
    } finally {
      setLoading(null);
    }
  };

  const handleValidate = () => callWebhook("validate");
  const handleMarkToReview = () => callWebhook("review");
  const handleRequestPO = () => callWebhook("request-po");

  const getIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "missing-po":
        return <AlertCircle className={cn(iconClass, "text-destructive")} />;
      case "low-confidence":
        return <AlertTriangle className={cn(iconClass, "text-orange-500")} />;
      case "needs-review":
        return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />;
      case "validation-error":
        return <DollarSign className={cn(iconClass, "text-destructive")} />;
      default:
        return <AlertCircle className={cn(iconClass, "text-destructive")} />;
    }
  };

  const showRequestPO = selectedInvoice?.PO_Status === "missing" || !selectedInvoice?.Purchase_Order_Number;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Detected Issues (AI)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length === 0 ? (
          <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <div className="shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">No Issues Detected</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The AI analysis found no issues with this invoice. Confidence: {confidence}%
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex gap-3 p-4 bg-muted/30 rounded-lg border border-border"
              >
                <div className="shrink-0 mt-0.5">{getIcon(issue.type)}</div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-foreground">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={handleValidate} disabled={loading !== null}>
            {loading === "validate" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Validate
          </Button>
          <Button variant="outline" onClick={handleMarkToReview} disabled={loading !== null}>
            {loading === "review" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark to Review
          </Button>
          {showRequestPO && (
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5" onClick={handleRequestPO} disabled={loading !== null}>
              {loading === "request-po" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request PO
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
