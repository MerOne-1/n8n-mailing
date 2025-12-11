import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvoice } from "@/contexts/InvoiceContext";

export const PdfPreviewSection = (): React.ReactNode => {
  const { selectedInvoice, loading } = useInvoice();

  const pdfUrl = selectedInvoice?.PDF_B2_URL;
  const invoiceNumber = selectedInvoice?.Invoice_Number || "No invoice selected";

  const handleOpenPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">Invoice Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[420px] bg-muted/50 rounded-lg border border-border flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Invoice Document</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleOpenPdf}
          disabled={!pdfUrl}
        >
          Open PDF
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {pdfUrl ? (
          <div className="relative w-full h-[420px] bg-muted/50 rounded-lg border border-border overflow-hidden">
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title={`Invoice ${invoiceNumber}`}
            />
          </div>
        ) : (
          <div className="relative w-full h-[420px] bg-muted/50 rounded-lg border border-border flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted">
                <FileText className="h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {selectedInvoice ? "No PDF Available" : "No Invoice Selected"}
                </p>
                <p className="text-sm">{invoiceNumber}</p>
              </div>
            </div>

            {/* Skeleton lines */}
            <div className="absolute top-6 left-6 right-6 space-y-4 opacity-20">
              <div className="flex justify-between items-start">
                <div className="w-28 h-6 bg-muted-foreground/30 rounded" />
                <div className="w-20 h-4 bg-muted-foreground/30 rounded" />
              </div>
              <div className="space-y-2 mt-8">
                <div className="w-full h-2.5 bg-muted-foreground/30 rounded" />
                <div className="w-4/5 h-2.5 bg-muted-foreground/30 rounded" />
                <div className="w-3/5 h-2.5 bg-muted-foreground/30 rounded" />
              </div>
              <div className="border-t border-muted-foreground/20 pt-4 mt-6 space-y-2">
                <div className="flex justify-between">
                  <div className="w-32 h-2.5 bg-muted-foreground/30 rounded" />
                  <div className="w-16 h-2.5 bg-muted-foreground/30 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="w-28 h-2.5 bg-muted-foreground/30 rounded" />
                  <div className="w-20 h-2.5 bg-muted-foreground/30 rounded" />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
