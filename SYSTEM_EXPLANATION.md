# Private Credit Underwriting Tool — System Explanation

## 1. What Was Built

A working prototype of a deal management and underwriting platform for a private credit fund team. The application covers the underwriting workflow end to end across four modules:

- **Deal Pipeline** — a portfolio dashboard and deal list with size, leverage, sponsor, owner and risk score, filterable by stage and industry.
- **Securities Structuring** — the proposed instrument for each deal: type, amount, pricing, maturity, origination fee, covenant package and collateral.
- **Due Diligence Tracking** — workstream status plus a findings register, each finding carrying a risk level, mitigation and owner.
- **IC Memo Generation** — assembles the deal, security and diligence data for a given deal, sends it to an LLM provider (OpenAI, Anthropic or Gemini) and renders a structured investment recommendation.

The deal stage (Screening → Due Diligence → IC Review → Closed) is visible at every level of the interface, so the team always sees where a deal stands in the underwriting process.

## 2. Architecture

Built on Next.js (App Router) with TypeScript and Tailwind CSS. The key decision is a **service layer** (`dealService`, `securityService`, `dueDiligenceService`, `memoService`) sitting between the UI and the data source. Components never touch data directly — they call async service functions.

Today, read operations resolve from local JSON files in `mock-api/`. Tomorrow, each service can be repointed at real REST endpoints (`fetch('/api/deals')`) with no changes to any UI component, because the service signatures are already promise-based.

IC Memo generation is the exception: it already follows the production shape. `memoService` calls `POST /api/memos`, a Next.js Route Handler that builds the prompt from deal, security and diligence data, calls the configured provider and persists the result. The API key lives in server-side environment variables and never reaches the browser. Provider selection is configuration rather than code — `LLM_PROVIDER` plus the matching key and model in `.env`.

```
  [UI Components]
       ↓
  [Service Layer]
       ↓ (reads today)     ↓ (memo generation today)   ↓ (future)
  [mock-api/*.json]   [POST /api/memos → LLM]     [REST API / Backend]
                               ↓                          ↓
                       [mock-api/ic-memos.json]     [Database + LLM]
```

## 3. Data Model

Five entities, with the Deal as the hub:

```
Deal (1) ──── (1) Security ──── (many) Covenant
  │
  ├──── (many) Due Diligence Finding
  │
  └──── (1) IC Memo
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
- Creating a deal and adding a finding are mocked client-side; only memo generation calls a real endpoint.
- Generated memos are written to `mock-api/ic-memos.json` on disk. This is fine for a single-instance demo but is not concurrency-safe and would be a database table in production.
- GET and POST only — no update or delete operations, to keep scope focused.
- The LLM call is unstreamed and unvalidated. The model returns free-form text that the UI parses by section heading, rather than structured JSON validated against a schema.
- No retry, rate-limit handling, cost tracking or caching around the LLM call.
- No document upload or financial model ingestion, and no real-time collaboration.

## 5. What More We Would Do With Extra Time

In priority order:

1. Backend API layer (Next.js Route Handlers or Node/Express) backed by PostgreSQL.
2. Authentication with role-based access.
3. Harden the LLM layer: structured JSON output with schema validation, streaming into the UI, retries with backoff, prompt versioning, and cost/latency telemetry.
4. Update and delete operations with a full audit trail.
5. Document upload with OCR and AI extraction of financial model data (Excel/PDF parsing).
6. Deal collaboration: comments, @mentions.
7. IC Memo versioning and review workflows.
8. Investment scoring model with configurable risk parameters.
9. PDF export for IC memos and deal summaries.
10. Notifications by email or Slack for deal progress and critical events.
