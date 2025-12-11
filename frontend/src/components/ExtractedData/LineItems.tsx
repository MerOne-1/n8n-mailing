import { useInvoice } from "@/contexts/InvoiceContext";

interface LineItem {
  line_number?: number;
  description: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

const formatAmount = (amount?: number, currency?: string): string => {
  if (amount === undefined || amount === null) return "—";
  const curr = currency || "EUR";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: curr,
  }).format(amount);
};

export const LineItems = (): React.ReactNode => {
  const { selectedInvoice } = useInvoice();

  // Parse line items from JSON string
  let items: LineItem[] = [];
  if (selectedInvoice?.Line_Items) {
    try {
      const parsed = JSON.parse(selectedInvoice.Line_Items);
      items = Array.isArray(parsed) ? parsed : [];
    } catch {
      items = [];
    }
  }

  const currency = selectedInvoice?.Currency;

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
        <div className="rounded-lg border border-border p-4 text-center text-sm text-muted-foreground">
          No line items available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Line Items</h3>

      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_100px_100px] gap-4 px-4 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground">
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit Price</span>
          <span className="text-right">Amount</span>
        </div>

        {/* Rows */}
        {items.map((item, index) => (
          <div
            key={item.line_number ?? index}
            className="grid grid-cols-[1fr_80px_100px_100px] gap-4 px-4 py-3 text-sm border-t border-border bg-card"
          >
            <span className="text-foreground">{item.description || "—"}</span>
            <span className="text-right text-foreground">{item.quantity ?? "—"}</span>
            <span className="text-right text-foreground">{formatAmount(item.unit_price, currency)}</span>
            <span className="text-right text-foreground font-medium">{formatAmount(item.total, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
