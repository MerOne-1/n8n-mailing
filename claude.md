# POC-Mailing

Invoice automation POC for a building company (9000 employees).

## Stack
- **n8n**: https://n8n-mailing.kart-automation.xyz
- **NocoDB Base**: POC_Mailing (ID: plyw0owsqsivsl9)
- **Server**: 46.224.42.156
- **Storage**: Backblaze B2 (bucket: n8n-NocoDB-Files)

## MCP Servers
Two MCP servers are available:
- `n8n` - n8n instance API
- `n8n-docs` - n8n node documentation

**Use `n8n` and `n8n-docs` when working on this project.**

## NocoDB Tables
| Table | table_name | Table ID |
|-------|------------|----------|
| Invoices | invoices | mhb90l86e3msa85 |
| Other_Emails | other_emails | m5dswefkm5vdiw2 |
| Processing_Logs | processing_logs | mnjuqujmjar4s13 |

## Credentials
All credentials, API tokens, and configuration details are in `.env.md`
