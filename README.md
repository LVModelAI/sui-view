## Sui View — Transaction Translator

Human-readable explanations for Sui blockchain transactions. Paste a transaction digest and get a clear, Markdown-formatted summary of what happened, which tokens were involved, object changes, and gas usage.

### Architecture

- **Framework**: Next.js App Router (Next 16, React 19)
- **Frontend**: `src/app/page.tsx`
  - Accepts a Sui transaction digest or URL
  - Fetches raw transaction + metadata, enriches with coin info, sends to explain endpoint
  - Renders Markdown via `src/components/markdown.tsx`
- **APIs** (`src/app/api/*`):
  - `GET /api/raw-transaction?digest=` → Proxies Sui raw transaction
  - `GET /api/get-coin-metadata?coinType=` → Proxies Sui coin metadata
  - `GET /api/get-txn-metadata?digest=` → Proxies Sui txn metadata
  - `POST /api/explain` → Calls OpenAI with enriched JSON + in-repo Sui guide context
- **Enrichment**: `src/lib/utils.ts`
  - Extracts coin types from events/balance changes
  - Annotates balance/object changes, events, and gas with human-friendly values
- **Model Context**: `src/lib/sui-context.ts`
  - Curated Sui transaction analysis guide included with the prompt

Data flow

1. User enters digest → 2) Fetch raw txn from Sui blockchain → 3) Extract coin types → 4) Fetch coin metadata → 5) Annotate txn → 6) Fetch txn metadata → 7) POST to `/api/explain` with enriched JSON → 8) Render Markdown explanation.

### Data Sources

- **Sui Blockchain API**: Primary on-chain data (raw transactions, transaction metadata, coin metadata)
  - Key: `SUI_API_KEY`
- **OpenAI**: Natural language generation for explanations
  - Env: `OPENAI_API_KEY`, model: `gpt-4o`
- **@mysten/sui**: Types and helpers; fullnode client is available but not required for current flow

### Setup

Requirements

- Node.js 18.18+ (Next.js 16 requirement)

Environment
Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=sk-...
SUI_API_KEY=...
```

Install and run

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build and start

```bash
npm run build
npm start
```

### Usage (UI)

1. Open the app and paste a Sui transaction digest (or URL). 2) Click Translate. 3) Read the generated summary under “Explanation”.

### Usage (API)

Raw transaction

```bash
curl "http://localhost:3000/api/raw-transaction?digest=YOUR_TX_DIGEST" \
  -H "accept: application/json"
```

Transaction metadata

```bash
curl "http://localhost:3000/api/get-txn-metadata?digest=YOUR_TX_DIGEST" \
  -H "accept: application/json"
```

Coin metadata

```bash
curl "http://localhost:3000/api/get-coin-metadata?coinType=0x2::sui::SUI" \
  -H "accept: application/json"
```

Explain (server-generated summary)

```bash
curl -X POST "http://localhost:3000/api/explain" \
  -H "content-type: application/json" \
  -d '{
    "digest": "YOUR_TX_DIGEST",
    "rawText": "<stringified enriched JSON from the UI flow>"
  }'
```

Notes

- The UI orchestrates enrichment then calls `/api/explain` with the enriched JSON. If calling the API directly, you should supply comparable enriched data.

### Key Files

- `src/app/page.tsx`: Main UI and client-side orchestration
- `src/app/api/raw-transaction/route.ts`: Raw txn proxy (Sui)
- `src/app/api/get-coin-metadata/route.ts`: Coin metadata proxy (Sui)
- `src/app/api/get-txn-metadata/route.ts`: Txn metadata proxy (Sui)
- `src/app/api/explain/route.ts`: OpenAI explanation endpoint
- `src/lib/utils.ts`: Annotation helpers (coins, events, gas)
- `src/lib/sui-context.ts`: Built-in Sui analysis guide for prompt grounding

### Caveats

- Requires valid `SUI_API_KEY` and `OPENAI_API_KEY` to function
- Sui Blockchain and OpenAI rate limits apply
- No wallet/private keys are used; this app only reads public chain data and generates summaries

### License

MIT
