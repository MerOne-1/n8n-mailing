import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { invoicesApi } from '@/lib/nocodb';
import type { Invoice } from '@/lib/nocodb';

interface InvoiceContextType {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  selectInvoice: (id: number) => void;
  refreshInvoices: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoicesApi.list({ limit: 50, sort: '-CreatedAt' });
      setInvoices(response.list);

      // Auto-select first invoice if none selected
      if (response.list.length > 0 && !selectedInvoice) {
        setSelectedInvoice(response.list[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectInvoice = (id: number) => {
    const invoice = invoices.find((inv) => inv.Id === id);
    if (invoice) {
      setSelectedInvoice(invoice);
    }
  };

  const refreshInvoices = async () => {
    await fetchInvoices();
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        selectedInvoice,
        loading,
        error,
        selectInvoice,
        refreshInvoices,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}
