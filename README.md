# POC-Mailing Frontend

Frontend React pour la gestion et validation des factures extraites automatiquement par n8n.

## Stack technique

- **React 19** + TypeScript
- **Vite 7** (build tool)
- **Tailwind CSS 4**
- **Radix UI** (composants)

## Prérequis

- **Node.js** v18 ou supérieur
- **npm** v9 ou supérieur
- Une instance **NocoDB** avec les tables configurées (voir ci-dessous)

## Installation

### 1. Cloner le repo

```bash
git clone https://github.com/ton-username/POC-Mailing.git
cd POC-Mailing/frontend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Édite le fichier `.env` avec tes valeurs :

```env
VITE_NOCODB_URL=https://ton-nocodb.example.com
VITE_NOCODB_TOKEN=ton_token_api_nocodb

# Optionnel - pour les boutons Valider/Rejeter (appels webhook n8n)
VITE_N8N_WEBHOOK_URL=https://ton-n8n.example.com/webhook
```

> **Note :** La variable `VITE_N8N_WEBHOOK_URL` est optionnelle. Sans elle, les boutons de validation/rejet ne fonctionneront pas, mais le reste du POC (affichage des factures, preview PDF, données extraites) sera pleinement fonctionnel.

**Pour obtenir le token NocoDB :**
1. Va dans NocoDB > clic sur ton avatar > Account Settings
2. Onglet "API Tokens"
3. Crée un nouveau token

### 4. Configurer les Table IDs

Édite le fichier `src/lib/nocodb.ts` et remplace les Table IDs par les tiens :

```typescript
export const TABLES = {
  INVOICES: 'ton_table_id_invoices',        // Table des factures
  OTHER_EMAILS: 'ton_table_id_other_emails', // Table des autres emails
  PROCESSING_LOGS: 'ton_table_id_logs',      // Table des logs
} as const;
```

**Pour trouver un Table ID dans NocoDB :**
1. Ouvre ta table dans NocoDB
2. L'URL ressemble à : `https://nocodb.example.com/dashboard/#/nc/view/xxxxxxxx`
3. Ou utilise l'API Explorer de NocoDB

### 5. Configurer le proxy (développement)

Édite `vite.config.ts` et remplace l'URL du proxy par ton instance NocoDB :

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://ton-nocodb.example.com',  // <-- Ton URL NocoDB
      changeOrigin: true,
      secure: true,
    },
  },
},
```

### 6. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Structure des tables NocoDB requises

### Table `invoices`

| Champ | Type | Description |
|-------|------|-------------|
| Id | Auto-increment | ID unique |
| Invoice_Number | Text | Numéro de facture |
| Invoice_Date | Date | Date de la facture |
| Supplier_Name | Text | Nom du fournisseur |
| Total_Amount | Number | Montant total TTC |
| Status | Single Select | pending_validation, validated, rejected |
| PDF_B2_URL | URL | Lien vers le PDF |
| Line_Items | Long Text (JSON) | Lignes de facturation |
| ... | ... | Voir `src/lib/nocodb.ts` pour tous les champs |

### Table `other_emails`

| Champ | Type | Description |
|-------|------|-------------|
| Id | Auto-increment | ID unique |
| subject | Text | Sujet de l'email |
| sender | Email | Expéditeur |
| category | Single Select | Catégorie |
| status | Single Select | Statut |

### Table `processing_logs`

| Champ | Type | Description |
|-------|------|-------------|
| Id | Auto-increment | ID unique |
| invoice_id | Number | ID de la facture liée |
| action | Text | Action effectuée |
| message | Long Text | Détails |

## Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Preview du build
npm run lint     # Linter ESLint
```

## Production

Pour builder l'application :

```bash
npm run build
```

Les fichiers de production seront dans `dist/`. Tu peux les servir avec n'importe quel serveur statique (nginx, Caddy, etc.).

**Note :** En production, configure `VITE_NOCODB_URL` avec l'URL complète de ton NocoDB car le proxy Vite n'est pas disponible.
