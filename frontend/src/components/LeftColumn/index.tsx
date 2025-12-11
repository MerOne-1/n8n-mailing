import { ChevronRight, Clock, AlertTriangle, FileText, CheckCircle, Loader2, Ban, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInvoice } from "@/contexts/InvoiceContext";
import type { Invoice } from "@/lib/nocodb";

type StatusType = Invoice['Status'];

const StatusIcon = ({ status }: { status?: StatusType }): React.ReactNode => {
  const iconClass = "h-4 w-4";
  switch (status) {
    case "pending_validation":
      return <Clock className={cn(iconClass, "text-muted-foreground")} />;
    case "pending_po":
      return <AlertTriangle className={cn(iconClass, "text-orange-500")} />;
    case "validated":
      return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    case "rejected":
      return <Ban className={cn(iconClass, "text-destructive")} />;
    case "paid":
      return <CreditCard className={cn(iconClass, "text-blue-500")} />;
    default:
      return <FileText className={cn(iconClass, "text-muted-foreground")} />;
  }
};

const getStatusLabel = (status?: StatusType) => {
  switch (status) {
    case "pending_validation":
      return { label: "To review", color: "text-muted-foreground" };
    case "pending_po":
      return { label: "Pending PO", color: "text-orange-600" };
    case "validated":
      return { label: "Validated", color: "text-green-600" };
    case "rejected":
      return { label: "Rejected", color: "text-destructive" };
    case "paid":
      return { label: "Paid", color: "text-blue-600" };
    default:
      return { label: "Unknown", color: "text-muted-foreground" };
  }
};

const formatAmount = (amount?: number, currency?: string): string => {
  if (amount === undefined || amount === null) return "€0.00";
  const curr = currency || "EUR";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: curr,
  }).format(amount);
};

export const LeftColumn = (): React.ReactNode => {
  const { invoices, selectedInvoice, loading, error, selectInvoice } = useInvoice();

  if (loading) {
    return (
      <aside className="flex flex-col h-full bg-card border-r border-border items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading invoices...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="flex flex-col h-full bg-card border-r border-border items-center justify-center p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      </aside>
    );
  }

  if (invoices.length === 0) {
    return (
      <aside className="flex flex-col h-full bg-card border-r border-border items-center justify-center p-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No invoices found</p>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border overflow-y-auto">
      <div className="flex flex-col">
        {invoices.map((invoice) => {
          const isSelected = selectedInvoice?.Id === invoice.Id;
          const statusInfo = getStatusLabel(invoice.Status);
          return (
            <div
              key={invoice.Id}
              onClick={() => selectInvoice(invoice.Id)}
              className={cn(
                "flex items-center px-5 py-4 cursor-pointer transition-all duration-200",
                "hover:bg-accent/50",
                isSelected
                  ? "bg-primary/5 border-l-[3px] border-primary"
                  : "border-l-[3px] border-transparent"
              )}
            >
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground text-sm truncate">
                    {invoice.Supplier_Name || "Unknown Supplier"}
                  </span>
                  <div className="shrink-0">
                    {isSelected ? (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    ) : (
                      <StatusIcon status={invoice.Status} />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground text-sm">
                    {formatAmount(invoice.Total_Amount, invoice.Currency)}
                  </span>
                  <span className={cn("text-xs font-medium", statusInfo.color)}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
