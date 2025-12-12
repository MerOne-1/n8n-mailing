// NocoDB API configuration and service
// In development, use proxy (/api) to avoid CORS issues
// In production, use the full URL
const isDev = import.meta.env.DEV;
const NOCODB_BASE_URL = isDev ? '' : (import.meta.env.VITE_NOCODB_URL || '');
const NOCODB_TOKEN = import.meta.env.VITE_NOCODB_TOKEN || '';

// Table IDs from POC_Mailing base
export const TABLES = {
  INVOICES: 'mhb90l86e3msa85',
  OTHER_EMAILS: 'm5dswefkm5vdiw2',
  PROCESSING_LOGS: 'mnjuqujmjar4s13',
} as const;

// Types for NocoDB records (using Title case as NocoDB returns)
// Note: Some fields use spaces in NocoDB, we map both variants
export interface Invoice {
  Id: number;
  CreatedAt?: string;
  UpdatedAt?: string;

  // Email metadata
  Email_ID?: string;
  Message_ID?: string;
  Thread_ID?: string;
  Email_From?: string;
  Email_Subject?: string;
  Email_Date?: string;

  // Document info
  Document_Type?: string;
  'Document Type'?: string;
  Invoice_Number?: string;
  Invoice_Date?: string;
  Due_Date?: string;
  File_Name?: string;
  'File Name'?: string;

  // Supplier info (underscore variant)
  Supplier_Name?: string;
  Supplier_Email?: string;
  Supplier_Address?: string;
  Supplier_City?: string;
  Supplier_Postal_Code?: string;
  Supplier_Country?: string;
  Supplier_Phone?: string;
  Supplier_VAT_Number?: string;
  Supplier_SIRET?: string;
  // Supplier info (space variant from NocoDB)
  'Supplier Address'?: string;
  'Supplier City'?: string;
  'Supplier Postal Code'?: string;
  'Supplier Country'?: string;
  'Supplier Phone'?: string;
  'Supplier VAT Number'?: string;
  'Supplier SIRET'?: string;

  // Customer info
  Customer_Name?: string;
  'Customer Name'?: string;
  Customer_Address?: string;
  'Customer Address'?: string;
  Customer_City?: string;
  'Customer City'?: string;
  Customer_Postal_Code?: string;
  'Customer Postal Code'?: string;
  Customer_Country?: string;
  'Customer Country'?: string;
  Client_Number?: string;
  'Client Number'?: string;
  Contract_Number?: string;
  'Contract Number'?: string;

  // Financial info
  Subtotal_HT?: number;
  'Subtotal HT'?: number;
  Tax_Amount?: number;
  Total_Amount?: number;
  Currency?: string;

  // Payment info
  Payment_Terms?: string;
  Payment_Method?: string;
  'Payment Method'?: string;
  IBAN?: string;
  BIC?: string;
  Purchase_Order_Number?: string;

  // Line items
  Line_Items?: string;
  Line_Items_Count?: number;
  'Line Items Count'?: number;

  // Status fields
  Status?: 'pending_validation' | 'pending_po' | 'validated' | 'rejected' | 'paid';
  PO_Status?: 'linked' | 'missing' | 'not_required';
  Confidence_Score?: number;
  Extraction_Confidence?: number;
  'Extraction Confidence'?: number;
  Classification_Confidence?: number;
  'Classification Confidence'?: number;
  Needs_Review?: boolean;
  Validation_Errors?: string;
  'Validation Errors'?: string;

  // Reminder tracking
  Reminder_Sent?: boolean;
  Reminder_Count?: number;
  Last_Reminder_Date?: string;
  Processed_At?: string;

  // Storage
  Attachments_JSON?: string;
  PDF_B2_URL?: string;
  PDF_B2_File_ID?: string;
  Raw_OCR_JSON?: string;
  'Raw OCR JSON'?: string;
}

export interface OtherEmail {
  Id: number;
  subject?: string;
  sender?: string;
  received_at?: string;
  category?: string;
  status?: string;
}

export interface ProcessingLog {
  Id: number;
  invoice_id?: number;
  action?: string;
  message?: string;
  created_at?: string;
}

// Helper to get field value with fallback for space/underscore variants
export function getInvoiceField<T>(
  invoice: Invoice | null | undefined,
  underscoreKey: keyof Invoice,
  spaceKey?: keyof Invoice
): T | undefined {
  if (!invoice) return undefined;
  const value = invoice[underscoreKey];
  if (value !== undefined && value !== null) return value as T;
  if (spaceKey) {
    const spaceValue = invoice[spaceKey];
    if (spaceValue !== undefined && spaceValue !== null) return spaceValue as T;
  }
  return undefined;
}

interface NocoDBListResponse<T> {
  list: T[];
  pageInfo: {
    totalRows: number;
    page: number;
    pageSize: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
}

// Generic fetch function for NocoDB API
async function nocodbFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${NOCODB_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'xc-token': NOCODB_TOKEN,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`NocoDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Invoice API functions
export const invoicesApi = {
  list: async (params?: { limit?: number; offset?: number; sort?: string; where?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.where) searchParams.set('where', params.where);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return nocodbFetch<NocoDBListResponse<Invoice>>(
      `/api/v2/tables/${TABLES.INVOICES}/records${query}`
    );
  },

  get: async (id: number) => {
    return nocodbFetch<Invoice>(
      `/api/v2/tables/${TABLES.INVOICES}/records/${id}`
    );
  },

  create: async (data: Partial<Invoice>) => {
    return nocodbFetch<Invoice>(
      `/api/v2/tables/${TABLES.INVOICES}/records`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  update: async (id: number, data: Partial<Invoice>) => {
    return nocodbFetch<Invoice>(
      `/api/v2/tables/${TABLES.INVOICES}/records`,
      {
        method: 'PATCH',
        body: JSON.stringify({ Id: id, ...data }),
      }
    );
  },

  delete: async (id: number) => {
    return nocodbFetch<void>(
      `/api/v2/tables/${TABLES.INVOICES}/records`,
      {
        method: 'DELETE',
        body: JSON.stringify({ Id: id }),
      }
    );
  },
};

// Other Emails API functions
export const otherEmailsApi = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return nocodbFetch<NocoDBListResponse<OtherEmail>>(
      `/api/v2/tables/${TABLES.OTHER_EMAILS}/records${query}`
    );
  },

  get: async (id: number) => {
    return nocodbFetch<OtherEmail>(
      `/api/v2/tables/${TABLES.OTHER_EMAILS}/records/${id}`
    );
  },
};

// Processing Logs API functions
export const processingLogsApi = {
  list: async (params?: { limit?: number; offset?: number; invoiceId?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.invoiceId) searchParams.set('where', `(invoice_id,eq,${params.invoiceId})`);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return nocodbFetch<NocoDBListResponse<ProcessingLog>>(
      `/api/v2/tables/${TABLES.PROCESSING_LOGS}/records${query}`
    );
  },
};
