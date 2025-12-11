import { Badge } from "@/components/ui/badge";
import { useInvoice } from "@/contexts/InvoiceContext";
import { getInvoiceField } from "@/lib/nocodb";
import type { Invoice } from "@/lib/nocodb";

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
};

const formatAmount = (amount?: number, currency?: string): string => {
  if (amount === undefined || amount === null) return "—";
  const curr = currency || "EUR";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: curr,
  }).format(amount);
};

const getPOStatusBadge = (poStatus?: string, poNumber?: string) => {
  if (poNumber) {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-600">
        Linked
      </Badge>
    );
  }

  switch (poStatus) {
    case "linked":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-600">
          Linked
        </Badge>
      );
    case "missing":
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
          Missing PO
        </Badge>
      );
    case "not_required":
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          Not Required
        </Badge>
      );
    default:
      return null;
  }
};

// Helper to get value with space/underscore fallback
const getField = <T,>(
  invoice: Invoice | null,
  underscoreKey: keyof Invoice,
  spaceKey?: keyof Invoice
): T | undefined => {
  return getInvoiceField<T>(invoice, underscoreKey, spaceKey);
};

export const DetailsGrid = (): React.ReactNode => {
  const { selectedInvoice } = useInvoice();

  // Get amounts with fallbacks for different field name variants
  const totalAmount = selectedInvoice?.Total_Amount ?? 0;
  const taxAmount = selectedInvoice?.Tax_Amount ?? 0;
  const subtotalHT = getField<number>(selectedInvoice, 'Subtotal_HT', 'Subtotal HT');
  // Use Subtotal_HT if available, otherwise calculate
  const amountHT = subtotalHT ?? (totalAmount - taxAmount);

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Supplier</p>
        <p className="text-sm font-medium text-foreground">
          {selectedInvoice?.Supplier_Name || "—"}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Invoice Number</p>
        <p className="text-sm font-medium text-foreground">
          {selectedInvoice?.Invoice_Number || "—"}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Invoice Date</p>
        <p className="text-sm font-medium text-foreground">
          {formatDate(selectedInvoice?.Invoice_Date)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Amount (TTC)</p>
        <p className="text-sm font-bold text-foreground">
          {formatAmount(selectedInvoice?.Total_Amount, selectedInvoice?.Currency)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">PO Number</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">
            {selectedInvoice?.Purchase_Order_Number || "—"}
          </span>
          {getPOStatusBadge(selectedInvoice?.PO_Status, selectedInvoice?.Purchase_Order_Number)}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Amount (HT)</p>
        <p className="text-sm font-medium text-foreground">
          {formatAmount(amountHT, selectedInvoice?.Currency)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Due Date</p>
        <p className="text-sm font-medium text-foreground">
          {formatDate(selectedInvoice?.Due_Date)}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">Tax Amount (TVA)</p>
        <p className="text-sm font-medium text-foreground">
          {formatAmount(selectedInvoice?.Tax_Amount, selectedInvoice?.Currency)}
        </p>
      </div>
    </div>
  );
};
