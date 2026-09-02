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

### More details about item 8

Today, the **Risk Assessment** card (score out of 100 plus four dimension labels — Financials, Collateral, Industry, Legal) is static demo data stored in `mock-api/deals.json`. The UI renders it faithfully, and the IC Memo prompt includes it as context for the LLM, but nothing in the application computes or updates it. New deals get a hardcoded placeholder (`50`, all dimensions `Monitor`).

In production, this would become a dedicated **risk scoring engine** — a server-side service that derives `riskScore` and `riskBreakdown` from real deal inputs, recalculates when underlying data changes, and persists a full history of how the score evolved.

#### What the engine would compute

The output shape stays the same as today (`riskScore: 0–100`, `riskBreakdown` with `green` / `yellow` / `red` per dimension), but every value would be traceable to inputs and rules:

| Dimension | Example inputs | Example rules |
|-----------|----------------|---------------|
| **Financials** | Revenue, EBITDA, leverage, margin, revenue concentration, cash conversion | Leverage above fund policy → downgrade; declining EBITDA trend → penalty; high customer concentration (from DD) → downgrade |
| **Collateral** | Security type, loan-to-value, collateral list, lien position, covenant package strength | First-lien on hard assets → upgrade; thin collateral coverage → downgrade; weak covenant headroom → penalty |
| **Industry** | Sector, cyclicality, macro exposure, peer default rates | Cyclical or stressed sector → downgrade; defensive sector with stable comps → upgrade |
| **Legal** | Legal DD workstream status, regulatory findings, litigation, environmental exposure | Open High-severity legal finding → downgrade; clean legal DD with workstream Complete → upgrade |

Each dimension would produce a **sub-score** (0–100). The overall `riskScore` would be a weighted sum of those sub-scores, with weights configurable per fund (e.g. Financials 40%, Collateral 25%, Industry 20%, Legal 15%). Sub-scores would map to status labels using fund-defined thresholds (e.g. ≥ 70 → `green` / Strong, 40–69 → `yellow` / Monitor, &lt; 40 → `red` / Elevated concern).

#### How it would integrate with the rest of the system

```
  Deal financials ──┐
  Security / collateral ──┤
  Industry metadata ──┼──► riskScoringService ──► riskScore + riskBreakdown
  DD findings ────────────┤         │                      │
  Fund scoring config ────┘         │                      ▼
                                    │              risk_score_history (DB)
                                    ▼
                            triggered on create / update
                            of any contributing entity
```

- **Due Diligence findings** would no longer be independent of the score. Adding, mitigating, or closing a finding would trigger a recalculation of the relevant dimension (e.g. a High finding on customer concentration affects Financials; an environmental issue affects Legal).
- **Security structuring** changes (collateral added, covenants tightened) would feed the Collateral dimension in real time.
- **Document ingestion** (item 5) would populate the financial inputs automatically instead of relying on manual entry.
- The **IC Memo** would continue to receive the score as prompt context, but the numbers would always reflect the latest engine output rather than static JSON.

#### Configuration and governance

The scoring model would be **configurable without code changes**:

- Per-fund **weights** for each dimension.
- Per-dimension **thresholds and rule sets** (e.g. max leverage 5.0x, min interest coverage 2.0x).
- **Category tags** on DD findings so the engine knows which dimension to adjust.
- **Versioned scoring configs** so recalculating an old deal uses the rules that were active at the time, while new deals use the current policy.

Analysts would be able to **override** a dimension or the overall score with a written rationale. Overrides would be stored separately from the computed value, visible in the UI (e.g. "Computed: 48 → Override: 52 — sponsor track record"), and included in the audit trail (item 4).

#### Demo today vs. production engine

| Aspect | Demo today | Production engine |
|--------|------------|-------------------|
| **Source** | Fixed fields in `deals.json` | `riskScoringService` backed by API + database |
| **Calculation** | None | Rules + configurable weights per fund |
| **Four dimensions** | Hand-written in JSON | Derived from categorized deal, security and DD data |
| **Due Diligence** | Independent of score | Findings tagged by category; open/closed status drives dimension sub-scores |
| **New deals** | Always `50` / all Monitor | Initial score computed from submitted financials and industry |
| **Updates** | Never changes after load | Recalculated on any contributing data change |
| **Traceability** | None | Full history: inputs, rule version, computed value, optional analyst override |

#### Suggested implementation path

1. Add a `riskScoringService` alongside the existing service layer, with a pure function interface: `(deal, security, diligence, config) → { riskScore, riskBreakdown, breakdownDetail }`.
2. Store scoring config in the database (or a config file per fund in an early version).
3. Expose `POST /api/deals/:id/recalculate-risk` and call it automatically after deal, security or finding mutations.
4. Add a `risk_score_history` table and surface the trend in the Overview tab.
5. Keep the UI unchanged — it already consumes `riskScore` and `riskBreakdown`; only the data source and computation layer change.

The goal is not a black-box AI score, but a **transparent, auditable underwriting model** that the investment team can tune to their mandate and defend in IC discussions.
