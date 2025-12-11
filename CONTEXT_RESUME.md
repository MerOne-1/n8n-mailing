# POC-Mailing - Context Resume

## Session Date: 2025-12-11

---

## WHAT HAS BEEN COMPLETED

### 1. NocoDB Tables Verification and Setup

**Invoices Table (mhb90l86e3msa85)** - Already has all required columns:
- Email fields: Email_ID, Message_ID, Thread_ID, Email_From, Email_Subject, Email_Date
- Invoice core: Invoice_Number, Invoice_Date, Due_Date, Total_Amount, Currency, Tax_Amount, Subtotal HT, Purchase_Order_Number, Line_Items, Line Items Count, Payment_Terms, Document Type, File Name
- Supplier info: Supplier_Name, Supplier_Email, Supplier_Address, Supplier_City, Supplier Postal Code, Supplier Country, Supplier_Phone, Supplier_VAT_Number, Supplier SIRET
- Customer info: Customer Name, Customer Address, Customer City, Customer Postal Code, Customer Country, Client Number, Contract Number
- Payment: Payment Method, IBAN, BIC
- Status: Status, PO_Status, Needs_Review, Reminder_Sent, Reminder_Count, Last_Reminder_Date, Processed_At
- Quality: Confidence_Score, Extraction Confidence, Classification Confidence, Validation Errors
- Storage: Attachments_JSON, PDF_B2_URL, PDF_B2_File_ID, Raw OCR JSON

**Other_Emails Table (m5dswefkm5vdiw2)** - Columns added in this session:
- B2_URL (URL type) - for Backblaze B2 file URL
- B2_File_ID (SingleLineText) - for B2 file identifier
- File_Name (SingleLineText) - original attachment filename
- Message_ID (SingleLineText) - Gmail message ID
- Thread_ID (SingleLineText) - Gmail thread ID
- Classification_Reason (LongText) - why it was classified as non-invoice

---

### 2. New Workflow Created: "Invoice Classification & Storage Pipeline"

**Workflow ID:** `azOUSmfEattCfzEb`
**URL:** https://n8n-mailing.kart-automation.xyz/workflow/azOUSmfEattCfzEb

**Workflow Architecture:**
```
Gmail Trigger (new email with attachment)
      |
      v
Has Attachment? -----> NO ----> Skip
      |
      v (YES)
Detect File Type
      |
      v
Is Image? -----> YES ----> Classify Image (Binary) ----> Parse Classification
      |                                                         |
      v (NO)                                                    v
Is PDF? -----> YES ----> Convert PDF ----> Get URL ----> Classify Image (URL) ----> Parse Classification
      |                                                                                      |
      v (NO)                                                                                 v
Unsupported                                                                     Merge Classifications
                                                                                            |
                                                                                            v
                                                                                       Is Invoice?
                                                                               YES /           \ NO
                                                                                  v             v
                                                                        Upload Invoice      Upload Other
                                                                          to B2               to B2
                                                                            |                   |
                                                                            v                   v
                                                                       Prepare for OCR    Prepare Other Data
                                                                            |                   |
                                                                            v                   v
                                                                     Source Type?         Store in NocoDB
                                                                    /           \          (other_emails)
                                                                   v             v
                                                          Full OCR (Binary)  Full OCR (URL)
                                                                   \           /
                                                                    v         v
                                                               Parse & Validate OCR
                                                                        |
                                                                        v
                                                               Store in NocoDB (invoices)
                                                                        |
                                                                        v
                                                                   Missing PO?
                                                                  YES /    \ NO
                                                                     v      v
                                                            Send PO Reminder  Complete
```

**Key Features:**
1. **Gmail Trigger** - Polls every minute for emails with attachments
2. **File Type Detection** - Identifies images vs PDFs vs unsupported files
3. **Quick Classification** - Uses gpt-4o-mini for fast, cheap classification (INVOICE vs NOT_INVOICE)
4. **B2 Storage** - All attachments stored in Backblaze B2 with public URLs
5. **Full OCR** - Uses gpt-4o for detailed invoice data extraction (invoices only)
6. **NocoDB Storage** - Invoices go to `invoices` table, others to `other_emails` table
7. **PO Reminder** - Sends email if invoice is missing a Purchase Order number

**Nodes Created:**
| Node Name | Type | Purpose |
|-----------|------|---------|
| Gmail Trigger | gmailTrigger | Trigger on new emails with attachments |
| Has Attachment? | if | Check if email has binary attachment |
| Detect File Type | code | Identify file type and prepare metadata |
| Is Image? | if | Route images vs other files |
| Is PDF? | if | Route PDFs vs unsupported files |
| Convert PDF to Image | httpRequest | ConvertAPI PDF to JPG |
| Get Image URL from PDF | code | Extract converted image URL |
| Classify Image (Binary) | openAi | gpt-4o-mini classification for images |
| Classify Image (URL) | openAi | gpt-4o-mini classification for PDFs |
| Parse Classification (Binary) | code | Parse classification result |
| Parse Classification (URL) | code | Parse classification result |
| Merge Classifications | merge | Combine both classification paths |
| Is Invoice? | if | Route invoices vs non-invoices |
| Upload Invoice to B2 | awsS3 | Store invoice attachment |
| Upload Other to B2 | awsS3 | Store non-invoice attachment |
| Prepare for OCR | code | Add B2 URL and prepare for full OCR |
| Prepare Other Email Data | code | Prepare data for other_emails table |
| Store in NocoDB (Other Emails) | httpRequest | Save to other_emails table |
| Source Type? | if | Route based on image vs PDF source |
| Full OCR (Binary) | openAi | gpt-4o detailed extraction for images |
| Full OCR (URL) | openAi | gpt-4o detailed extraction for PDFs |
| Parse & Validate OCR | code | Parse JSON and validate amounts |
| Store in NocoDB (Invoices) | httpRequest | Save to invoices table |
| Missing PO? | if | Check if PO is missing |
| Send PO Reminder | gmail | Send reminder email for missing PO |
| Invoice Processing Complete | set | Mark processing complete |

---

## MANUAL CONFIGURATION REQUIRED

### 1. Create NocoDB HTTP Header Credential

In n8n, create a new credential:
- **Type:** Header Auth
- **Name:** NocoDB API
- **Header Name:** `xc-token`
- **Header Value:** `O0m_Z0rmQxprPKFwio3B5gb5mHSHgKuHtXJY1koc`

Then update these nodes to use this credential:
- "Store in NocoDB (Other Emails)"
- "Store in NocoDB (Invoices)"

### 2. Verify Existing Credentials

The workflow references these existing credentials (should already exist):
- **Gmail account 1** (ID: DoH5ipbmJ3RhKXve) - for Gmail Trigger and Send PO Reminder
- **OpenAi account** (ID: cpXOYyKJ54TqvOW1) - for all OpenAI Vision nodes
- **Backblaze B2** (ID: 1vAQNlptIqFR5FCP) - for S3 upload nodes
- **ConvertAPI** (ID: hSI4u5nyQUpkt1oh) - for PDF conversion

### 3. Activate the Workflow

The workflow was created in inactive state. After configuring credentials:
1. Open the workflow in n8n
2. Test with a manual execution first
3. Activate it to start processing emails automatically

---

## TESTING CHECKLIST

- [ ] Send a test invoice email (PDF or image)
- [ ] Verify classification works correctly
- [ ] Check B2 upload creates public URL
- [ ] Verify invoice data appears in NocoDB invoices table
- [ ] Send a non-invoice email
- [ ] Verify it appears in NocoDB other_emails table
- [ ] Test PO reminder for invoice without PO number

---

## EXISTING WORKING WORKFLOW

The workflow "Invoice OCR with Vision AI" (ID: `iKQVk11fmJSCZY7Z`) already works correctly for OCR. This was NOT modified.

---

## CREDENTIALS REFERENCE

### ConvertAPI (for PDF to Image)
- Secret: `c9PEFtsX9w34d0eP4yiq0rGhYD101QVP`
- Endpoint: `https://v2.convertapi.com/convert/pdf/to/jpg`

### Backblaze B2 (S3-compatible)
- Bucket: n8n-NocoDB-Files
- Endpoint: https://s3.us-west-004.backblazeb2.com
- Region: us-west-004
- Access Key ID: 0032d1a16c7e6680000000008
- Secret Access Key: K003CKGOzkgAS6FDJ0jQPTV1aRqhLKo
- Force Path Style: true

### NocoDB
- URL: https://nocodb.kart-automation.xyz
- API Token: O0m_Z0rmQxprPKFwio3B5gb5mHSHgKuHtXJY1koc
- Base ID: plyw0owsqsivsl9
- Invoices Table ID: mhb90l86e3msa85
- Other_Emails Table ID: m5dswefkm5vdiw2

### OpenAI
- Use existing credential in n8n
- Models: gpt-4o-mini for classification, gpt-4o for full OCR
- Vision API settings: detail=high, maxTokens=4000
