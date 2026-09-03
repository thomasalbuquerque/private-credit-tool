# Private Credit Underwriting Tool — System Explanation

## 1. What Was Built

A working prototype of a deal management and underwriting platform for a private credit fund team. It can be accessed at [https://private-credit-tool.vercel.app](https://private-credit-tool.vercel.app).

The application covers the underwriting workflow end to end across four modules:

- **Deal Pipeline** — a portfolio dashboard and deal list with size, leverage, sponsor, owner and risk score, filterable by stage and industry.
- **Securities Structuring** — the proposed instrument for each deal: type, amount, pricing, maturity, origination fee, covenant package and collateral.
- **Due Diligence Tracking** — workstream status plus a findings register, each finding carrying a risk level, mitigation and owner.
- **IC Memo Generation** — assembles the deal, security and diligence data for a given deal, sends it to an LLM provider (OpenAI, Anthropic or Gemini) and renders a structured investment recommendation.

The deal stage (Screening → Due Diligence → IC Review → Closed) is visible at every level of the interface, so the team always sees where a deal stands in the underwriting process.

## 2. Architecture

Built on Next.js with TypeScript and Tailwind CSS. The key decision is a **service layer** (`dealService`, `securityService`, `dueDiligenceService`, `memoService`) sitting between the UI and the data source. Components never touch data directly — they call async service functions.

Today, read operations resolve from local JSON files in `mock-api/`. Tomorrow, each service can be repointed at real REST endpoints (`fetch('/api/deals')`) with no changes to any UI component, because the service signatures are already promise-based.

IC Memo generation is the exception: it already follows the production shape. `memoService` calls `POST /api/memos`, a Next.js Route Handler that builds the prompt from deal, security and diligence data, calls the configured provider and persists the result. The API key lives in server-side environment variables and never reaches the browser. Provider selection is configuration rather than code — `LLM_PROVIDER` plus the matching key and model in `.env`.

```
  [UI Components]
  ↓
  [Service Layer]
  ↓ (reads today)          ↓ (memo generation today)      ↓ (future)
  [mock-api/*.json]        [POST /api/memos → LLM]        [REST API / Backend]
                           ↓                              ↓
                           [mock-api/ic-memos.json]       [Database + LLM]
```

## 3. Data Model

Five entities, with the Deal as the hub:

```
Deal (1) ──── (1) Security ──── (many) Covenant
  │
  ├────────── (many) Due Diligence Finding
  │
  └────────── (1) IC Memo
```

- **Deal** — company, industry, deal size, revenue, EBITDA, leverage, sponsor, stage, owner, risk score and a four-factor risk breakdown (financials, collateral, industry, legal), plus timeline and activity history.
- **Security** — one instrument per deal, joined via `dealId`.
- **Covenant** — nested within a Security; name and threshold.
- **Due Diligence Finding** — grouped per deal alongside workstream status; each finding has title, description, risk level, mitigation, owner and status.
- **IC Memo** — one per deal, storing the generated content plus the provider and model used, so any memo is traceable to how it was produced.

## 4. Tradeoffs

This is a prototype, and the simplifications are deliberate:

- No authentication or authorization.
- No backend or database. Deal, security and diligence data is loaded in memory and resets on page reload.
- Creating a deal just presents a confirmation message, and adding a finding is mocked client-side; only memo generation calls a real endpoint.
- Generated memos are written to `mock-api/ic-memos.json` on disk when running locally. On the deployed instance the serverless filesystem is read-only, so a memo lives only in the open tab and is lost on reload — regenerating it takes one click. This would be a database table in production.
- The LLM call is unstreamed and unvalidated. The model returns free-form text that the UI parses by section heading, rather than structured JSON validated against a schema.
- No retry, rate-limit handling, cost tracking or caching around the LLM call.
- No document upload or financial model ingestion, and no real-time collaboration.

## 5. What more I would do

### With a couple extra days of work to finish the demo:

1. Backend API (NestJS) backed by PostgreSQL database, so we can persist the data and not just load it from memory.
2. Full CRUD operations (Create, Read, Update, Delete) connecting frontend and backend.
3. Authentication with role-based access control (RBAC), allowing different users to have distinct permission levels, each able to view and manage deals according to their role.

### Additional features suggested for a future production release

1. Investment scoring engine with formulas and configurable risk parameters.
2. Harden the LLM layer: structured JSON output with schema validation, streaming into the UI, retries with backoff, prompt versioning, and cost/latency telemetry.
3. Document upload with OCR and AI extraction of financial model data (Excel/PDF parsing), so we can ingest the data from the documents into the system.
4. Deal collaboration: comments, @mentions, so we can collaborate on the deals with the team.
5. IC Memo versioning and review workflows.
6. PDF export for IC memos and deal summaries.
7. Notifications by email or Slack for deal progress and critical events.
