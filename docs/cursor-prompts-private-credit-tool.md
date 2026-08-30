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

## PROMPT 10 — Tab: IC Memo

```
In the Deal Details page, implement the IC Memo tab.

Create a separate component: components/deals/ICMemoTab.tsx
It receives deal: Deal as a prop (the full deal object, not just id) so the memo can reference deal data.

Also load security and due diligence data inside this component to use in memo generation.

States to manage:
- existingMemo: ICMemo | null (loaded from memoService.getMemoByDealId)
- isGenerating: boolean
- generatedContent: string | null

Layout when NO memo exists yet:
- Empty state card with:
  - Icon (FileText from lucide-react)
  - Title: "No IC Memo Generated"
  - Subtitle: "Generate an Investment Committee memo based on deal data, securities, and diligence findings."
  - Big primary button: "Generate IC Memo"

Layout when memo EXISTS:
- Card header: "Investment Committee Memo" + date generated
- Formatted memo content (rendered as sections with headings)
- A subtle "Regenerate" button

--- GENERATE BEHAVIOR ---

When "Generate IC Memo" is clicked:
1. Set isGenerating = true
2. Show loading state: spinner + "Generating memo from deal data..." text
3. After 2 seconds (setTimeout to simulate LLM latency):
   a. Build a realistic IC Memo string using data from the deal, security, and findings
   b. Call memoService.generateMemo(dealId, content)
   c. Set generatedContent and isGenerating = false

The generated memo content should be DYNAMIC — it must actually use the deal's real data:
- Company name, size, industry, sponsor, EBITDA, leverage
- Security type, rate, maturity
- Findings titles and risk levels

Build the memo as a structured string with these sections:
- Investment Recommendation (1 sentence: Approve $XXm [type] to [Company])
- Executive Summary (2–3 sentences using deal data)
- Investment Thesis (2–3 bullet points)
- Financial Overview (deal financials in a structured block)
- Key Risks (from actual findings, grouped by risk level)
- Mitigants (from finding.mitigation fields)
- Recommendation (final paragraph)

--- MEMO DISPLAY ---
Render the memo with proper formatting:
- Section headings: bold, slightly larger
- Body text: readable, line-height generous
- "Key Risks" section: show each finding as a styled row with its risk badge
- The whole memo should be in a white card that looks like a real document
- Add a subtle "Export to PDF" button (it doesn't need to function — just visual)

Add a comment at the top of the component:
// In production, this button would call POST /api/memos which calls an LLM provider (OpenAI/Anthropic).
// The frontend-to-mock pattern here is a prototype simplification.
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
- The IC Memo module assembles data from all prior modules to generate a structured investment recommendation
- The deal stage is visible at all times, giving the deal team a unified view of where each deal stands in the underwriting process

## 2. Architecture

Describe the architecture decisions:
- Next.js App Router with TypeScript and Tailwind CSS
- Service layer abstraction (dealService, securityService, dueDiligenceService, memoService) that sits between the UI and data sources
- Today: services read from local JSON files in mock-api/
- Tomorrow: services can be swapped to call real REST endpoints (e.g. fetch('/api/deals')) without any changes to UI components
- The IC Memo is generated client-side using assembled deal data in this prototype. In production, a backend would handle the LLM call to prevent API key exposure
- Draw a simple ASCII architecture diagram:

  [UI Components]
       ↓
  [Service Layer]
       ↓ (today)          ↓ (future)
  [mock-api/*.json]   [REST API / Backend]
                               ↓
                          [Database + LLM]

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
- No real backend or database — data is in-memory and resets on page reload
- POST actions (create deal, add finding, generate memo) are mocked client-side
- No update or delete operations (GET and POST only, to keep scope focused)
- No real LLM integration — memo is assembled programmatically from deal data (but architecture is ready for a real LLM call)
- No document upload or financial model ingestion
- No real-time collaboration between team members
- Direct LLM access from frontend would expose API keys — this is a prototype simplification

## 5. What More We Would Do With Extra Time

List concrete next steps, organized in priority order:
1. Backend API layer (Node/Express or Next.js API routes) with PostgreSQL
2. Authentication with role-based access (Analyst, Associate, MD, LP)
3. Real LLM integration (OpenAI GPT-4 or Anthropic Claude) for IC Memo with structured output
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

1. LOADING STATES
   All pages that fetch data should show a skeleton loader while loading.
   Create a simple Skeleton component (gray animated pulse blocks) and use it in:
   - Dashboard KPI cards
   - Deals table
   - Deal details header
   - Each tab content area

2. EMPTY STATES
   Ensure every list or data section has a proper empty state (icon + message) when data is not found.

3. RESPONSIVE CHECK
   The sidebar should collapse to a bottom nav or hamburger on mobile screens (below md breakpoint).
   This doesn't need to be perfect — just not broken.

4. TYPOGRAPHY CONSISTENCY
   - Page titles: text-2xl font-semibold text-slate-900
   - Section titles: text-sm font-semibold text-slate-500 uppercase tracking-wider
   - Body text: text-sm text-slate-700
   - Muted/secondary: text-xs text-slate-400
   Apply these consistently across all pages.

5. COLOR PALETTE AUDIT
   Ensure the entire app uses the same neutral palette:
   - Background: slate-50 or gray-50
   - Sidebar: slate-900
   - Cards: white with border border-slate-200
   - Primary accent: indigo-600 or slate-800 (for buttons, active states)
   - No random colors that don't match the palette

6. NAVIGATION ACTIVE STATE
   Make sure the correct sidebar nav item is highlighted based on the current route (use usePathname() from next/navigation).

7. FINAL CHECK
   Run through this checklist and fix anything broken:
   - [ ] Dashboard loads and shows real calculated KPIs from mock data
   - [ ] Deals list shows all 6 deals with correct stage badges
   - [ ] Clicking a deal navigates to /deals/[id]
   - [ ] All 4 tabs work on deal details page
   - [ ] "Add Finding" modal opens, submits, and new finding appears in list
   - [ ] "Generate IC Memo" button shows loading then displays memo with real deal data
   - [ ] No TypeScript errors
   - [ ] No broken imports

Report any issues found and fix them.
```

---

## ✅ Ordem de Execução

| # | Prompt | O que cria |
|---|--------|------------|
| 1 | Setup do Projeto | Estrutura de pastas e dependências |
| 2 | Dados Mock JSON | Dados realistas nos arquivos mock-api/ |
| 3 | Tipos + Serviços | types/index.ts + 4 service files |
| 4 | Layout + Sidebar | app/layout.tsx + componentes UI base |
| 5 | Dashboard | app/page.tsx com KPIs e pipeline |
| 6 | Lista de Deals | app/deals/page.tsx com filtros e modal |
| 7 | Deal Details + Overview | app/deals/[id]/page.tsx + tab Overview |
| 8 | Tab Securities | SecuritiesTab.tsx |
| 9 | Tab Due Diligence | DueDiligenceTab.tsx + modal de findings |
| 10 | Tab IC Memo | ICMemoTab.tsx com geração dinâmica |
| 11 | Documentação | SYSTEM_EXPLANATION.md |
| 12 | Polimento Final | Loading states, responsividade, consistência |

---

> **Dica pro Cursor:** Se em algum prompt o Cursor pedir confirmação ou fizer perguntas, responda "yes, proceed" ou "sim, pode continuar". Cada prompt é autocontido e parte do que foi criado nos anteriores.
