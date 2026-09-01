# 📋 Plano de Prompts — Private Credit Underwriting Tool

### Para usar no Cursor IDE, um por um, na ordem abaixo.

---

> **Como usar:** Abra o Cursor IDE, pressione `Ctrl+Shift+P` → "New Chat" (ou abra o painel de chat com `Ctrl+L`), copie e cole cada prompt em sequência. Espere o Cursor terminar cada um antes de passar ao próximo.

---

## PROMPT 1 — Setup do Projeto

```
Create a new Next.js project with the following setup:

Project name: private-credit-tool

Configuration:
- TypeScript: yes
- ESLint: yes
- Tailwind CSS: yes
- src/ directory: no
- App Router: yes
- Import alias: yes (default @/*)

After creating the project, install these additional dependencies:
- lucide-react
- recharts
- clsx
- tailwind-merge

Then create the following folder structure inside the project root:

mock-api/
  deals.json
  securities.json
  due-diligence.json
  ic-memos.json

types/
  index.ts

services/
  dealService.ts
  securityService.ts
  dueDiligenceService.ts
  memoService.ts

components/
  ui/
    Badge.tsx
    Card.tsx
    Button.tsx
    Tabs.tsx

Leave all new files empty for now — just create the structure.

Show me the final folder tree when done.
```

---

## PROMPT 2 — Dados Mock (JSON)

```
Populate the mock-api/ JSON files with realistic private credit data. All data must feel like real investment platform data, not placeholder text.

--- mock-api/deals.json ---
Create an array of 6 deals with this exact shape per item:
{
  "id": string (e.g. "deal-001"),
  "companyName": string,
  "industry": string (Industrial | Healthcare | Technology | Retail | Energy | Real Estate),
  "dealSize": number (in millions, e.g. 50),
  "revenue": number (in millions),
  "ebitda": number (in millions),
  "leverage": number (e.g. 3.8 — EBITDA multiple),
  "sponsor": string (name of a PE firm),
  "stage": string (one of: "Screening" | "Due Diligence" | "IC Review" | "Closed"),
  "owner": string (analyst name),
  "riskScore": number (0–100),
  "riskBreakdown": {
    "financials": "green" | "yellow" | "red",
    "collateral": "green" | "yellow" | "red",
    "industry": "green" | "yellow" | "red",
    "legal": "green" | "yellow" | "red"
  },
  "createdAt": string (ISO date),
  "timeline": [
    { "label": string, "date": string, "completed": boolean }
  ],
  "recentActivity": [
    { "action": string, "date": string }
  ]
}

Use realistic company names, industries, and sponsor names (e.g. Blackstone, KKR, Apollo, Ares, Carlyle).
Distribute stages: 1 Screening, 2 Due Diligence, 2 IC Review, 1 Closed.

--- mock-api/securities.json ---
Create one security object per deal (6 total) with this shape:
{
  "id": string,
  "dealId": string (must match deal id),
  "type": string (e.g. "Senior Secured Term Loan"),
  "amount": number (in millions),
  "rate": string (e.g. "SOFR + 650bps"),
  "maturity": string (e.g. "5 years"),
  "originationFee": string (e.g. "2.0%"),
  "covenants": [
    { "id": string, "name": string, "threshold": string }
  ],
  "collateral": string[] (list of collateral assets)
}

Use at least 2–3 covenants per security and 3–4 collateral items.

--- mock-api/due-diligence.json ---
Create an array of workstream + findings objects per deal (for all 6 deals):
{
  "dealId": string,
  "workstreams": [
    { "name": string, "status": "Complete" | "In Progress" | "Pending" }
  ],
  "findings": [
    {
      "id": string,
      "dealId": string,
      "title": string,
      "description": string,
      "riskLevel": "High" | "Medium" | "Low",
      "mitigation": string,
      "owner": string,
      "status": "Open" | "Mitigated" | "Monitoring"
    }
  ]
}

Workstreams should be: Financial, Legal, Commercial, ESG, Technical.
Include 2–4 findings per deal with realistic titles (e.g. "Customer Concentration Risk", "Regulatory Exposure", "Environmental Liabilities").

--- mock-api/ic-memos.json ---
Start with an empty array: []

This file will be populated when the user generates a memo in the app.
```

---

## PROMPT 3 — Tipos TypeScript e Camada de Serviços

```
Now create the TypeScript types and service layer for the project.

--- types/index.ts ---
Export the following interfaces based on the JSON data we created:

- Deal (all fields from deals.json including nested riskBreakdown and timeline)
- Security (all fields from securities.json including covenants array and collateral array)
- Covenant { id, name, threshold }
- DueDiligence { dealId, workstreams, findings }
- Workstream { name, status }
- Finding { id, dealId, title, description, riskLevel, mitigation, owner, status }
- ICMemo { id, dealId, generatedAt, content }

Use TypeScript string literal unions for fields like stage, riskLevel, status, etc.

--- services/dealService.ts ---
Import deals from mock-api/deals.json.

Export these functions:
- getDeals(): Promise<Deal[]> — returns all deals (wrap in Promise.resolve to simulate async)
- getDealById(id: string): Promise<Deal | undefined>
- createDeal(data: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal>
  For now, createDeal should log the new deal to console and return a mock Deal with a generated id (Math.random based). Add a comment: // TODO: replace with POST /api/deals

--- services/securityService.ts ---
Import securities from mock-api/securities.json.

Export:
- getSecurityByDealId(dealId: string): Promise<Security | undefined>
- createSecurity(data: Omit<Security, 'id'>): Promise<Security>
  (same mock pattern as createDeal)

--- services/dueDiligenceService.ts ---
Import due-diligence data from mock-api/due-diligence.json.

Export:
- getDueDiligenceByDealId(dealId: string): Promise<DueDiligence | undefined>
- addFinding(finding: Omit<Finding, 'id'>): Promise<Finding>
  For addFinding: generate an id, push to the in-memory array, and log to console with comment // TODO: replace with POST /api/due-diligence/findings

--- services/memoService.ts ---
Import ic-memos from mock-api/ic-memos.json.

Export:
- getMemoByDealId(dealId: string): Promise<ICMemo | undefined>
- generateMemo(dealId: string, content: string): Promise<ICMemo>
  Push to in-memory array, log to console with comment // TODO: replace with POST /api/memos
  (PROMPT 10B replaces this mock with a real POST /api/memos call that hits an LLM provider)

Important rule: UI components must NEVER import JSON files directly. They must always go through these service functions. Add a JSDoc comment to each service file explaining this rule.
```

---

## PROMPT 4 — Layout Principal com Sidebar

```
Create the main application layout with a professional sidebar navigation.

--- app/layout.tsx ---
Wrap the app in a layout that has:
- A fixed left sidebar (width: 240px)
- A main content area that fills the rest of the screen

The sidebar should include:
- App logo/name at the top: "CreditDesk" with a small icon (use a building/bank icon from lucide-react)
- Navigation items:
  - Dashboard (icon: LayoutDashboard) → href="/"
  - Deals (icon: Briefcase) → href="/deals"
- At the bottom of the sidebar: a user avatar placeholder with name "Sarah Johnson" and role "Senior Associate"

Active nav item should have a highlighted background (darker shade).

Design requirements:
- Dark sidebar: background color around #0f172a (slate-900) or similar deep navy
- White/light main content area
- Clean, modern look similar to PitchBook or Juniper Square
- Use Tailwind only (no external UI library)
- The sidebar should feel like a real fintech product — not a tutorial sidebar

--- components/ui/Badge.tsx ---
Create a reusable Badge component that accepts:
- variant: "screening" | "due-diligence" | "ic-review" | "closed" | "high" | "medium" | "low" | "complete" | "in-progress" | "pending" | "open" | "mitigated" | "monitoring" | "green" | "yellow" | "red"
- children: React.ReactNode

Map each variant to appropriate Tailwind colors:
- screening → blue
- due-diligence → amber/yellow
- ic-review → purple
- closed → green
- high → red
- medium → amber
- low → green
- complete → green
- in-progress → blue
- pending → gray
- open → red
- mitigated → green
- monitoring → amber
- green → emerald
- yellow → amber
- red → red

--- components/ui/Card.tsx ---
Create a reusable Card component with:
- Props: title? (string), children, className?
- Renders a white card with subtle border and shadow
- Optional title renders as a small section header

--- components/ui/Button.tsx ---
Create a Button component with variants:
- primary (dark navy/blue fill)
- secondary (outlined)
- ghost (no border, subtle hover)
Props: variant, size (sm | md | lg), loading (boolean — shows spinner), disabled, onClick, children
```

---

## PROMPT 5 — Dashboard (Tela Inicial)

```
Create the Dashboard page at app/page.tsx.

This is the executive overview screen. It should feel like a real investment platform dashboard — professional, data-rich, and visually polished.

Import data using the service layer (dealService.getDeals()) with useEffect + useState since this is a client component ('use client').

Layout: CSS Grid with responsive columns.

Sections to build:

1. PAGE HEADER
   - Title: "Underwriting Dashboard"
   - Subtitle: current date formatted nicely (e.g. "Monday, June 9, 2025")

2. KPI CARDS ROW (4 cards side by side)
   Using Card component. Each card shows:
   - Total Active Deals: count deals where stage !== "Closed"
   - Total Committed: sum of dealSize for all deals, formatted as "$XXXm"
   - Avg Deal Size: average dealSize, formatted as "$XXm"
   - Deals in IC Review: count where stage === "IC Review"
   Each card has a small icon (lucide-react), label, big number, and a subtle trend indicator text.

3. PIPELINE SUMMARY (horizontal bar or card group)
   Show deal counts per stage in 4 boxes:
   - Screening | Due Diligence | IC Review | Closed
   Each box: stage name + count + colored left border (use Badge colors)

4. RISK DISTRIBUTION (use Recharts PieChart or BarChart)
   Show count of deals by riskScore bucket:
   - Low Risk (score 70–100): green
   - Medium Risk (score 40–69): amber
   - High Risk (score 0–39): red
   Keep the chart small and clean.

5. RECENT ACTIVITY FEED
   Pull recentActivity from all deals, sort by date descending, show top 6.
   Each item: colored dot + action text + relative date (e.g. "2 days ago")
   Use a card with a subtle vertical timeline line.

6. DEALS TABLE PREVIEW (last 4 deals)
   A compact table showing: Company | Industry | Size | Stage | Owner
   With a "View all deals →" link at the bottom.

Design: use slate/navy color palette. Cards should have white background with very subtle shadows. The page should feel premium and minimal — not colorful or "startup-ish".
```

---

## PROMPT 6 — Lista de Deals

```
Create the Deals list page at app/deals/page.tsx.

This is a 'use client' component.

Use dealService.getDeals() to load data.

Page layout:

1. PAGE HEADER
   - Title: "Deal Pipeline"
   - Subtitle: "X active deals across Y stages"
   - Button top-right: "+ New Deal" (clicking opens a modal — implement the modal too)

2. FILTERS ROW (below header)
   - Search input: filters by companyName (client-side filtering)
   - Dropdown filter: Stage (All | Screening | Due Diligence | IC Review | Closed)
   - Dropdown filter: Industry (All | + each distinct industry in the data)
   Filters should work together and update the table in real time.

3. DEALS TABLE
   Columns: Company | Industry | Deal Size | Leverage | Stage | Owner | Risk Score | Actions

   - Company: bold text + small industry tag below
   - Deal Size: formatted as "$XXm"
   - Leverage: formatted as "X.Xx EBITDA"
   - Stage: use the Badge component with correct variant
   - Risk Score: small colored progress bar + number (e.g. "72/100")
   - Owner: avatar initials + name
   - Actions: "View →" link to /deals/[id]

   Each row should be clickable (clicking anywhere on row navigates to /deals/[id]).
   Rows should have hover state.

4. NEW DEAL MODAL
   When "+ New Deal" is clicked, show a modal overlay with a form:
   Fields: Company Name, Industry (select), Deal Size ($M), Revenue ($M), EBITDA ($M), Sponsor, Owner

   On submit:
   - Call dealService.createDeal() with form data
   - Show a success toast/notification
   - Close the modal
   - Do NOT update the list in real time (add a comment: // TODO: refetch or update state after real POST)

   The modal should have a clean design with a dark overlay and white card.

Design: the table should look like a Bloomberg or PitchBook data table — clean rows, good typography, subtle alternating row colors or hover effects.
```

---

## PROMPT 7 — Deal Details: Estrutura + Tab Overview

```
Create the Deal Details page at app/deals/[id]/page.tsx.

This is a 'use client' component.

Load the deal using dealService.getDealById(id) where id comes from useParams().

Page structure:

1. BREADCRUMB
   Deals → [Company Name]

2. DEAL HEADER (full-width card at the top)
   Left side:
   - Company name (large, bold)
   - Sponsor name below (smaller, muted)
   - Stage badge (using Badge component)

   Right side (row of KPI chips):
   - Deal Size: $XXm
   - Revenue: $XXm
   - EBITDA: $XXm
   - Leverage: X.Xx
   - Owner: name with avatar initials

3. TABS ROW
   Four tabs: Overview | Securities | Due Diligence | IC Memo
   Use URL hash or local state to control which tab is active.
   Active tab has an underline indicator.

4. TAB CONTENT AREA
   Render the correct tab content below.

--- TAB 1: OVERVIEW ---
Layout: 2-column grid (left: main info, right: sidebar)

LEFT COLUMN:
- Section: "Deal Summary"
  Cards showing: Borrower, Sector, Revenue, EBITDA, Sponsor, Owner — in a 2x3 grid of labeled fields

- Section: "Risk Assessment"
  Large number: "[riskScore] / 100" with a horizontal progress bar
  Below: 4 rows for Financials, Collateral, Industry, Legal
  Each row: label + colored dot (green/yellow/red from riskBreakdown) + status text

RIGHT COLUMN:
- Section: "Deal Timeline"
  Vertical timeline with steps from deal.timeline
  Completed steps: solid colored dot + bold text
  Incomplete steps: empty circle dot + muted text

- Section: "Recent Activity"
  List of last 3 activity items with dates

Design: professional, clean. The layout should feel like a CRM or deal management workspace, not a simple form.
```

---

## PROMPT 8 — Tab: Securities

```
In the Deal Details page (app/deals/[id]/page.tsx), implement the Securities tab content.

Create a separate component: components/deals/SecuritiesTab.tsx
It receives dealId: string as a prop.

Inside the component:
- Load data with securityService.getSecurityByDealId(dealId)
- Show loading skeleton while loading

Layout:

1. INSTRUMENT OVERVIEW (Card)
   Display as a clean labeled field grid (2 columns):
   - Security Type
   - Amount: "$XXm"
   - Interest Rate
   - Maturity
   - Origination Fee

   Title of card: "Credit Instrument"

2. COVENANTS TABLE (Card)
   Title: "Financial Covenants"
   Table with columns: Covenant Name | Threshold
   Each row should have a small icon or indicator
   Add a small info note below: "Breach of any covenant triggers an event of default."

3. COLLATERAL SECTION (Card)
   Title: "Collateral Package"
   Display collateral items as a list with checkmark icons (lucide-react CheckCircle)
   Each item on its own row with a subtle divider

Design: this tab should feel like a term sheet viewer — clean, legible, formal. Use monospace or tabular font for numbers where appropriate.
```

---

## PROMPT 9 — Tab: Due Diligence

```
In the Deal Details page, implement the Due Diligence tab.

Create a separate component: components/deals/DueDiligenceTab.tsx
It receives dealId: string as a prop.

Inside the component:
- Load data with dueDiligenceService.getDueDiligenceByDealId(dealId)
- Keep local state for findings (so new findings appear without page reload)

Layout:

1. WORKSTREAM STATUS TABLE (Card)
   Title: "Diligence Workstreams"
   Table with columns: Workstream | Status | (icon)
   Status uses Badge component: Complete (green) | In Progress (blue) | Pending (gray)

   Below table: a completion summary line, e.g. "3 of 5 workstreams complete"

2. FINDINGS SECTION (Card)
   Title: "Key Findings"
   Right of title: a "+ Add Finding" button

   List of findings. Each finding card shows:
   - Finding title (bold)
   - Description (muted text, truncated at 2 lines)
   - Row of badges: Risk Level badge + Status badge
   - "Mitigation: [text]" in a subtle highlighted box
   - Owner name with avatar initials

3. ADD FINDING MODAL
   When "+ Add Finding" is clicked, show a modal with a form:
   Fields:
   - Title (text input)
   - Description (textarea)
   - Risk Level (select: High | Medium | Low)
   - Mitigation (textarea)
   - Owner (text input)
   - Status (select: Open | Mitigated | Monitoring)

   On submit:
   - Call dueDiligenceService.addFinding() with form data + dealId
   - Add the returned finding to local state so it appears in the list immediately
   - Show success message
   - Close modal

   Add a comment in the service call:
   // POST /api/due-diligence/findings — currently mocked, persists to in-memory array

Design: findings should look like cards in a Jira or Notion board — each finding is distinct and visually organized. Use color coding aggressively for risk levels (red border-left for High, amber for Medium, green for Low).
```

---

## PROMPT 10A — Tab: IC Memo (parte 1: interface visual)

> Esta parte constrói **apenas a interface** da aba IC Memo (estados vazio, carregando, erro e memo pronto). A geração real via LLM vem no PROMPT 10B.

```
In the Deal Details page, implement the IC Memo tab — VISUAL LAYER ONLY.
Do NOT integrate any LLM provider in this prompt; that comes in the next prompt.

Create a separate component: components/deals/ICMemoTab.tsx
It receives deal: Deal as a prop (the full deal object, not just id) so the memo view can reference deal data.

Also load security and due diligence data inside this component (securityService.getSecurityByDealId,
dueDiligenceService.getDueDiligenceByDealId) — the next prompt will send this context to the LLM,
and the Key Risks section already needs the findings to render risk badges.

States to manage:
- memo: ICMemo | null (loaded from memoService.getMemoByDealId on mount)
- isLoading: boolean (initial data fetch)
- isGenerating: boolean
- error: string | null

Render four mutually exclusive states:

1. LOADING (initial fetch)
   Skeleton blocks in the shape of the memo card.

2. EMPTY STATE (no memo yet)
   - Icon (FileText from lucide-react)
   - Title: "No IC Memo Generated"
   - Subtitle: "Generate an Investment Committee memo based on deal data, securities, and diligence findings."
   - Big primary button: "Generate IC Memo"

3. GENERATING
   - Spinner + "Generating memo from deal data..." text
   - Secondary muted line: "This can take up to 30 seconds."
   - The generate button uses the Button component's loading prop and is disabled while generating

4. ERROR
   - Card with AlertTriangle icon, the error message, and a "Try Again" button
   - The error text comes from state — do not hardcode a message

Layout when memo EXISTS:
- Card header: "Investment Committee Memo" + generated date (formatted, e.g. "Generated on June 9, 2025 at 14:32")
- Right of the header: subtle "Export to PDF" button (visual only, no behavior) and a "Regenerate" button
- Below: the rendered memo content

--- MEMO RENDERER ---
Create components/deals/MemoContent.tsx that receives content: string and findings: Finding[].

The memo content is plain text / lightweight markdown with section headings written as "## Section Name".
Parse it into sections and render:
- Section headings: uppercase, small, semibold, letter-spaced (matching the app's section title style)
- Body text: text-sm, generous line-height, paragraphs preserved
- Lines starting with "-" or "*" render as bullet lists
- For the "Key Risks" section, if a line mentions a finding title from the findings array, render that
  line as a styled row with the finding's Risk Level badge (use the Badge component)
- The whole memo sits in a white card with document-like padding and a max readable width

--- GENERATE BEHAVIOR (TEMPORARY) ---
For this prompt only, wire the "Generate IC Memo" / "Regenerate" buttons to a placeholder function:

// TEMPORARY — replaced by the real LLM call in the next prompt.
async function generatePlaceholderMemo(): Promise<string>

It waits 1.5s and returns a short hardcoded memo string with the "## Section Name" heading format,
covering: Investment Recommendation, Executive Summary, Investment Thesis, Financial Overview,
Key Risks, Mitigants, Recommendation. Then it calls memoService.generateMemo(deal.id, content)
and updates state so the memo view renders.

Mark it clearly:
// TODO(next prompt): replace generatePlaceholderMemo with POST /api/memos (real LLM call).

Design: the memo should look like a real investment document — formal, legible, printable.
```

---

## PROMPT 10B — Tab: IC Memo (parte 2: integração real com LLM)

> Esta parte substitui o placeholder por uma **chamada real** a um provider de LLM (OpenAI, Anthropic ou Gemini) através de uma API route do Next.js, e persiste o memo gerado no JSON mockado.

```
Now replace the placeholder memo generation with a REAL LLM integration.

The API key must NEVER reach the browser: the LLM call happens server-side in a Next.js Route Handler,
and the client only talks to our own endpoint.

--- 1. ENVIRONMENT VARIABLES ---

Create .env.example (committed, no real values) and .env (same keys, empty values for me to fill):

# Which provider to use: openai | anthropic | gemini
LLM_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Anthropic
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Google Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# Shared generation settings
LLM_MAX_OUTPUT_TOKENS=2000
LLM_TEMPERATURE=0.3

Rules:
- Never prefix these with NEXT_PUBLIC_ — that would expose the key in the client bundle.
- .gitignore already ignores .env* — add an exception line so the template is committed:
  !.env.example
- Read every value with process.env inside server code only, and read it at request time
  (not at module top level) so I can change .env without rebuilding.

--- 2. LLM CLIENT ---

Create lib/llm.ts — a provider-agnostic wrapper using plain fetch (do NOT add any SDK dependency).

Export:
- type LlmProvider = 'openai' | 'anthropic' | 'gemini'
- class LlmConfigError extends Error   (thrown when the provider is unknown or the API key is missing)
- class LlmRequestError extends Error  (thrown when the provider returns a non-2xx; include status + provider message)
- async function generateText({ system, prompt }: { system: string; prompt: string }):
    Promise<{ text: string; provider: LlmProvider; model: string }>

generateText resolves the provider from LLM_PROVIDER (default 'openai'), validates that the matching
API key exists, and calls the right endpoint:

openai   → POST https://api.openai.com/v1/chat/completions
           Headers: Authorization: Bearer ${OPENAI_API_KEY}, Content-Type: application/json
           Body: { model, temperature, max_tokens, messages: [{ role: 'system', content: system },
                   { role: 'user', content: prompt }] }
           Text: data.choices[0].message.content

anthropic → POST https://api.anthropic.com/v1/messages
           Headers: x-api-key: ${ANTHROPIC_API_KEY}, anthropic-version: 2023-06-01, Content-Type: application/json
           Body: { model, max_tokens, temperature, system, messages: [{ role: 'user', content: prompt }] }
           Text: data.content[0].text

gemini    → POST https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent
           Headers: x-goog-api-key: ${GEMINI_API_KEY}, Content-Type: application/json
           Body: { systemInstruction: { parts: [{ text: system }] },
                   contents: [{ role: 'user', parts: [{ text: prompt }] }],
                   generationConfig: { temperature, maxOutputTokens } }
           Text: data.candidates[0].content.parts[0].text

Also:
- Use AbortSignal.timeout(60_000) on the fetch so a hanging provider doesn't hang the request.
- Throw LlmConfigError with an actionable message, e.g.
  "OPENAI_API_KEY is not set. Add it to .env (see .env.example) and restart the dev server."
- Never log the API key.

--- 3. MEMO PROMPT BUILDER ---

Create lib/memoPrompt.ts exporting:
- MEMO_SYSTEM_PROMPT: string — positions the model as a private credit investment professional writing
  for an Investment Committee. It must instruct the model to:
  - use ONLY the data provided (no invented figures, no placeholders like [TBD])
  - write in the exact section format "## Section Name" followed by body text/bullets
  - output these sections in order: Investment Recommendation, Executive Summary, Investment Thesis,
    Financial Overview, Key Risks, Mitigants, Recommendation
  - keep it 500–800 words, formal, plain text (no markdown tables, no code fences)
  - reference each diligence finding by its exact title in Key Risks

- buildMemoPrompt({ deal, security, dueDiligence }): string — serializes the real data into a readable
  block: company name, industry, sponsor, owner, stage, deal size, revenue, EBITDA, leverage, risk score
  and risk breakdown; security type, amount, rate, maturity, origination fee, covenants, collateral;
  every finding with title, risk level, status, description, mitigation and owner.

--- 4. API ROUTE ---

Create app/api/memos/route.ts (Route Handler, App Router — not a pages/api file).

export const runtime = 'nodejs'   // needs the filesystem and the provider SDK-free fetch

POST — body: { dealId: string }
1. Validate dealId is a non-empty string → 400 { error } if not.
2. Load the deal, security and due diligence for that dealId from the mock-api JSON files
   (import them directly here — this is server code, the "UI must not import JSON" rule applies to
   components, not to the API layer). Deal not found → 404.
3. Build the prompt and call generateText from lib/llm.ts.
4. Persist the memo into mock-api/ic-memos.json with fs/promises:
   - read the file, parse the array
   - upsert by dealId (regenerating a memo replaces the existing entry, keeping its id)
   - shape: { id, dealId, generatedAt, content, provider, model }
   - write back with JSON.stringify(memos, null, 2) + trailing newline
5. Return 200 with the ICMemo object.

Error mapping:
- LlmConfigError → 503 with the actionable message (so the UI can tell me to fill .env)
- LlmRequestError → 502 with a message including the provider status
- anything else → 500 with a generic message
Always log the real error server-side with console.error.

GET — optional convenience: /api/memos?dealId=xxx returns the stored memo or 404.

Add a comment at the top of the file:
// Server-side only: the LLM API key lives in process.env and never reaches the browser.

--- 5. UPDATE types/index.ts ---

Extend ICMemo with the provenance fields:
  provider?: 'openai' | 'anthropic' | 'gemini'
  model?: string

--- 6. UPDATE services/memoService.ts ---

Replace the mocked generateMemo with a real call to our own endpoint:

- generateMemo(dealId: string): Promise<ICMemo>
  POST /api/memos with JSON body { dealId }.
  If the response is not ok, read the JSON body and throw new Error(body.error ?? 'Failed to generate memo')
  so the UI can display the provider/config message.
  Remove the old (dealId, content) signature and the in-memory push.

- getMemoByDealId stays reading from the JSON import (fast, no round-trip), but add a comment noting
  that after a generation the fresh memo comes from the POST response.

Keep the JSDoc rule: components go through the service layer, never fetch the provider directly.

--- 7. UPDATE components/deals/ICMemoTab.tsx ---

- Delete generatePlaceholderMemo and its TODO comment.
- handleGenerate now: setIsGenerating(true), setError(null) → await memoService.generateMemo(deal.id)
  → set the returned memo → finally setIsGenerating(false).
- On failure, put the thrown message into the error state so the existing error card shows it
  (including the "add your API key to .env" case).
- When a memo exists, show a small muted footer line with its provenance:
  "Generated by {provider} · {model}".
- Keep every visual state from the previous prompt unchanged.

--- 8. VERIFY ---
Report to me:
- which env vars I need to fill to make it work
- how to switch providers
- confirm that mock-api/ic-memos.json is written after a successful generation
```

---

## PROMPT 11 — Documento de Explicação do Sistema

```
Create a markdown file at the root of the project called SYSTEM_EXPLANATION.md.

Write a professional 1–2 page system explanation document as if it were the technical documentation submitted alongside the demo. It must cover these 5 sections:

---

# Private Credit Underwriting Tool — System Explanation

## 1. What Was Built

Describe the prototype:
- A frontend-only deal management platform for private credit fund teams
- Four core modules: Deal Pipeline, Securities Structuring, Due Diligence Tracking, IC Memo Generation
- The IC Memo module assembles data from all prior modules and sends it to an LLM provider (OpenAI, Anthropic or Gemini) to generate a structured investment recommendation
- The deal stage is visible at all times, giving the deal team a unified view of where each deal stands in the underwriting process

## 2. Architecture

Describe the architecture decisions:
- Next.js App Router with TypeScript and Tailwind CSS
- Service layer abstraction (dealService, securityService, dueDiligenceService, memoService) that sits between the UI and data sources
- Today: read operations are served from local JSON files in mock-api/
- Tomorrow: services can be swapped to call real REST endpoints (e.g. fetch('/api/deals')) without any changes to UI components
- The IC Memo is the exception and already follows the production shape: memoService calls POST /api/memos (a Next.js Route Handler), which builds the prompt from deal + security + diligence data, calls the configured LLM provider (OpenAI / Anthropic / Gemini) and persists the result. The API key lives in server-side environment variables and never reaches the browser
- Provider selection is configuration, not code: LLM_PROVIDER plus the matching API key and model in .env
- Draw a simple ASCII architecture diagram:

  [UI Components]
       ↓
  [Service Layer]
       ↓ (reads today)     ↓ (memo generation today)   ↓ (future)
  [mock-api/*.json]   [POST /api/memos → LLM]     [REST API / Backend]
                               ↓                          ↓
                       [mock-api/ic-memos.json]     [Database + LLM]

## 3. Data Model

Document the five core entities and their relationships:
- Deal (central entity)
- Security (1:1 with Deal)
- Covenant (1:many with Security)
- Due Diligence Finding (1:many with Deal)
- IC Memo (1:1 with Deal, generated from all above)

Include a brief ERD in text format.

## 4. Tradeoffs

Be honest and specific about what was simplified:
- No authentication or authorization
- No real backend or database — deal, security and diligence data is in-memory and resets on page reload
- Create deal and add finding are mocked client-side; only memo generation hits a real endpoint
- Generated memos are persisted to mock-api/ic-memos.json on disk, which works for a single-instance demo but is not concurrency-safe and would be a database table in production
- No update or delete operations (GET and POST only, to keep scope focused)
- The LLM call is unstreamed and unvalidated — the model returns free-form text that the UI parses by section heading, instead of structured/JSON output with a schema
- No retry, rate-limit handling, cost tracking or caching around the LLM call
- No document upload or financial model ingestion
- No real-time collaboration between team members

## 5. What More We Would Do With Extra Time

List concrete next steps, organized in priority order:
1. Backend API layer (Node/Express or Next.js API routes) with PostgreSQL
2. Authentication with role-based access (Analyst, Associate, MD, LP)
3. Harden the LLM layer: structured/JSON output with schema validation, streaming into the UI, retries with backoff, prompt versioning and cost/latency telemetry
4. Update and delete operations with audit trail
5. Document upload with OCR and AI extraction of financial model data
6. Deal collaboration features (comments, @mentions, version history)
7. IC Memo versioning and approval workflows
8. Financial model ingestion (Excel/PDF parsing)
9. Investment scoring model with configurable risk parameters
10. Export to PDF for IC Memos and deal summaries

---

Keep the tone professional and concise. This document should impress both a technical reviewer and a non-technical investment professional. Total length: approximately 500–700 words.
```

---

## PROMPT 12 — Revisão Final e Polimento Visual

```
Review the entire application and apply these final polish improvements:

1. EMPTY STATES
   Ensure every list or data section has a proper empty state (icon + message) when data is not found.

2. RESPONSIVE CHECK
   The sidebar should collapse to a bottom nav or hamburger on mobile screens (below md breakpoint).
   This doesn't need to be perfect — just not broken.

3. DARK THEME & TYPOGRAPHY
   Apply a full-site dark theme — not just the sidebar. The app should feel like a formal institutional tool for private credit deal teams: restrained, data-dense, and professional (think Bloomberg/PitchBook, not a colorful startup).
   - Page background: slate-800 (#1e293b) — a dark blue-gray that is clearly dark but not near-black
   - Sidebar: slate-900 (#0f172a) — one step darker than the page for visual hierarchy
   - Cards / elevated surfaces: slate-800 or slate-700 with border border-slate-600
   - Primary accent: blue-500 or indigo-500 (buttons, active nav, links) — use sparingly
   - Status badges (stage, risk): keep semantic colors but tone them down (e.g. bg-emerald-900/40 text-emerald-300) so they don't clash with the dark palette
   - No white backgrounds or light-gray page surfaces anywhere
   Typography (apply consistently across all pages):
   - Page titles: text-2xl font-semibold text-slate-100
   - Section titles: text-sm font-semibold text-slate-400 uppercase tracking-wider
   - Body text: text-sm text-slate-300
   - Muted/secondary: text-xs text-slate-500
   - Table headers: text-xs font-semibold text-slate-400 uppercase tracking-wider
   - Borders and dividers: border-slate-600 or border-slate-700 — subtle, never harsh white

4. COLOR PALETTE AUDIT
   Walk every page and component and confirm the dark palette above is applied end-to-end:
   - Dashboard KPI cards, deals table, deal details header, and all tab content areas
   - Modals and dropdowns: dark surface (slate-800) with slate-600 border, not white cards
   - Form inputs: bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500
   - Hover states: bg-slate-700/50 or bg-slate-600/30 — subtle, not bright
   - Empty states: muted slate-500 icons and text on the dark background
   - No random colors that don't match the palette

5. NAVIGATION ACTIVE STATE
   Make sure the correct sidebar nav item is highlighted based on the current route (use usePathname() from next/navigation).

6. FINAL CHECK
   Run through this checklist and fix anything broken:
   - [ ] Dashboard loads and shows real calculated KPIs from mock data
   - [ ] Deals list shows all 6 deals with correct stage badges
   - [ ] Clicking a deal navigates to /deals/[id]
   - [ ] All 4 tabs work on deal details page
   - [ ] "Add Finding" modal opens, submits, and new finding appears in list
   - [ ] "Generate IC Memo" calls POST /api/memos, shows the loading state, then displays the LLM-generated memo
   - [ ] With no API key in .env, the IC Memo tab shows a readable error telling the user to fill .env (it does not crash)
   - [ ] After a successful generation, the memo is written to mock-api/ic-memos.json and survives a page reload
   - [ ] No API key or provider secret appears anywhere in client components or in the browser bundle
   - [ ] .env.example exists and lists every required variable; .env is not committed
   - [ ] No TypeScript errors
   - [ ] No broken imports

Report any issues found and fix them.
```

---

## ✅ Ordem de Execução

| #   | Prompt                  | O que cria                                                               |
| --- | ----------------------- | ------------------------------------------------------------------------ |
| 1   | Setup do Projeto        | Estrutura de pastas e dependências                                       |
| 2   | Dados Mock JSON         | Dados realistas nos arquivos mock-api/                                   |
| 3   | Tipos + Serviços        | types/index.ts + 4 service files                                         |
| 4   | Layout + Sidebar        | app/layout.tsx + componentes UI base                                     |
| 5   | Dashboard               | app/page.tsx com KPIs e pipeline                                         |
| 6   | Lista de Deals          | app/deals/page.tsx com filtros e modal                                   |
| 7   | Deal Details + Overview | app/deals/[id]/page.tsx + tab Overview                                   |
| 8   | Tab Securities          | SecuritiesTab.tsx                                                        |
| 9   | Tab Due Diligence       | DueDiligenceTab.tsx + modal de findings                                  |
| 10A | Tab IC Memo (visual)    | ICMemoTab.tsx + MemoContent.tsx (estados e renderização)                 |
| 10B | Tab IC Memo (LLM real)  | .env/.env.example, lib/llm.ts, lib/memoPrompt.ts, app/api/memos/route.ts |
| 11  | Documentação            | SYSTEM_EXPLANATION.md                                                    |
| 12  | Polimento Final         | Loading states, responsividade, consistência                             |

---

> **Dica pro Cursor:** Se em algum prompt o Cursor pedir confirmação ou fizer perguntas, responda "yes, proceed" ou "sim, pode continuar". Cada prompt é autocontido e parte do que foi criado nos anteriores.
