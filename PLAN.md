# 100Questions — AI Visibility Benchmark

## Product contract

100Questions is an authenticated, paid web application that measures how often a brand
appears in web-grounded answers from OpenAI, Anthropic, Google, and xAI. A user defines a brand,
canonical domain, aliases, category/use-case description, market, locale, and optional
competitors. The system freezes exactly 25 shared questions, sends every question to all four
providers through Vercel AI Gateway, and reports across 100 planned provider answers:

- Discovery mention rate and prominence
- Provider coverage and grounded-answer rate
- Share of voice against normalized competitors
- Claimed-domain citation rate
- Sentiment among answers that mention the target
- Diagnostic source mix and answer evidence for manual review
- Per-run usage and cost

Results are a time-stamped API-grounded benchmark. They do not claim parity with the
ChatGPT, Claude, or Gemini consumer interfaces, whose prompts, personalization, routing,
and search behavior can differ.

## Locked decisions

| Area | Decision |
|---|---|
| Application | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 |
| AI routing | AI SDK 6 through Vercel AI Gateway |
| Providers | OpenAI, Anthropic, Google, and xAI (Grok) |
| Grounding | Provider-native web-search tools; no plain-completion fallback |
| Orchestration | Vercel Workflow, with bounded durable batches |
| Database | Neon Postgres, Drizzle ORM, and the Neon serverless driver |
| Authentication | Managed Neon Auth with email and password |
| Payments | Stripe-hosted Checkout selling prepaid run credits |
| Deployment | Existing `100-questions` Vercel project |
| Funding | The site owner funds Gateway usage; users spend purchased run credits |

Model IDs remain environment-configurable and are frozen per run:

- `AI_GATEWAY_OPENAI_MODEL`
- `AI_GATEWAY_ANTHROPIC_MODEL`
- `AI_GATEWAY_GOOGLE_MODEL`
- `AI_GATEWAY_XAI_MODEL`
- `AI_GATEWAY_ANALYSIS_MODEL`

Vercel deployments authenticate to AI Gateway with OIDC. No direct OpenAI, Anthropic,
Google, or xAI API keys are used.

## Benchmark methodology

Every run freezes its benchmark version, question set, model IDs, locale, timestamp,
prompt versions, cohort mix, grounding mode, and scoring version. Benchmark v2 is the fixed
25-question, four-provider contract described below. Historical v1 runs retain their frozen
provider/model set and remain readable under their original denominators.

The fixed 25-question split is:

- **20 discovery questions:** neutral category and use-case questions that must not contain
  the brand, aliases, or canonical domain.
- **5 diagnostic questions:** explicitly name the target to examine trust, comparisons,
  support, pricing, and factual knowledge.

Question generation is two-stage:

1. Produce a neutral category/use-case brief from the user description.
2. Generate discovery and diagnostic questions separately.

Discovery questions are normalized, deduplicated, and rejected or regenerated if they
contain a target alias or domain. The exact frozen question and a neutral system prompt are
sent to all four providers without hidden target context. This produces 25 OpenAI, 25 Claude,
25 Gemini, and 25 Grok answers: 100 planned provider answers per fixed run.

A result is score-eligible only when the provider call succeeds and returns valid grounding
sources. `no_sources`, `unsupported`, and failed results are excluded from eligible-score
denominators and remain visible in coverage. The system never silently downgrades a grounded
query to an ungrounded completion.

A single run is a directional snapshot because search results and model responses vary. With
only 25 shared questions, a simple worst-case sampling interval is roughly +/-20 percentage
points (and the 20-question discovery cohort is slightly wider). This is a scale cue, not a
claim that the generated question set is a random or representative statistical sample.
Repeated sampling and longitudinal trend claims remain Phase 2.

## Metrics

- **Discovery visibility:** target-mentioned eligible discovery answers divided by eligible
  discovery answers.
- **Conservative visibility floor:** target-mentioned discovery answers divided by all
  planned discovery answers.
- **Coverage:** eligible answers divided by planned answers.
- **Prominence:** mean of `lead = 1`, `shortlist = 0.67`, `incidental = 0.33`, `absent = 0`.
- **Share of voice:** target answer-entity mention events divided by all target and competitor
  answer-entity mention events, counting an entity at most once per answer.
- **Claimed-domain citation rate:** eligible answers citing the canonical domain or one of its
  subdomains divided by eligible answers.
- **Sentiment:** positive/neutral/negative distribution only among target-mentioned answers.
- **Diagnostic reporting:** source mix, sentiment, and answers for review. The product does
  not label this “accuracy” without user-supplied ground truth.

Coverage is always displayed beside visibility. Metrics are marked provisional below a
configurable coverage threshold, initially 90%.

Brand presence uses normalized deterministic matching across canonical name, aliases, and
domain and stores the matched alias. Structured AI analysis supplies prominence, sentiment,
and normalized competitors under an explicit `analysis_version`.

## Architecture

- **Next.js Server Components** render authenticated pages and initial database reads.
- **Route handlers** handle auth, Checkout, webhooks, run creation, run reads, deletion, and
  reconciliation.
- **Vercel AI Gateway** handles question generation, provider-native search, structured
  analysis, usage metadata, and model observability.
- **Vercel Workflow** handles durable question generation, bounded provider fan-out,
  analysis, and finalization.
- **Neon Postgres** is the source of truth for application, workflow-dispatch, result, quota,
  and billing state.
- **Managed Neon Auth** owns users and sessions in `neon_auth`; application tables reference
  the authenticated user ID without modifying managed tables.
- **Stripe Checkout and webhooks** sell and grant run credits; Stripe Customer Portal exposes
  receipts and billing details when available.

The database is never accessed directly from the browser. `proxy.ts` improves protected-page
UX, but every protected Server Component and route handler revalidates the Neon Auth session.
Workflow's `/.well-known/workflow/` routes are explicitly excluded from the auth proxy.

## Data model

### `runs`

- `id`, `user_id`, `client_request_id`
- Subject, canonical domain, description, aliases, competitors, market, locale
- `status`: `queued | generating | querying | analyzing | complete | partial | failed | cancelled`
- Question/cohort counts and planned, eligible, succeeded, and failed provider-call counts
- Benchmark, prompt, analysis, and scoring versions
- Frozen models and grounding mode
- Budget confirmation, estimated cost, actual cost, and cost provenance
- Workflow ID, claim step ID, dispatch state, and sanitized failure summary
- Created, started, updated, completed, and retention-expiry timestamps
- Unique `(user_id, client_request_id)`

### `questions`

- `id`, `run_id`, `cohort`, `category`, `text`, `sort_order`
- Generator model, prompt version, and normalized hash
- Unique `(run_id, normalized_hash)`

### `provider_jobs`

- `id`, `run_id`, `question_id`, provider, model, fixed mode `web_grounded`
- `status`: `queued | running | succeeded | failed`
- Stable Workflow step ID, attempts, sanitized error code/message, and timestamps
- Unique `(run_id, question_id, provider, grounding_mode)`

### `results`

- One-to-one `job_id`
- Answer text, normalized sources, search queries, and required attribution metadata
- Grounding requested/observed and exclusion reason
- Target mention, matched aliases, owned-domain citation, prominence, sentiment, competitors
- Analysis version, usage, cost, cost type, latency, and Gateway request ID

Complete raw provider payloads are not retained. Only normalized answer/citation data and the
minimal provider metadata required for attribution, debugging, and cost reconciliation are
stored.

### `workflow_dispatches`

- Run ID, dispatch status, Workflow run ID, attempt count, and timestamps
- Supports recovery when the database commit succeeds but Workflow start fails

### `billing_customers`

- `user_id`, Stripe customer ID, and timestamps
- Unique Stripe customer ID and unique user ID

### `billing_events`

- Stripe event ID, type, processing status, sanitized failure code, and timestamps
- Unique Stripe event ID makes webhook handling idempotent

### `credit_ledger`

- `id`, `user_id`, amount, type, run ID, Stripe Checkout Session ID, Stripe
  PaymentIntent ID, and timestamps
- Types include `purchase`, `reserve`, `consume`, `release`, and `adjustment`
- Balance is the sum of ledger entries; unique external references prevent duplicate grants

## Payments contract

- Stripe-hosted Checkout runs in one-time `payment` mode against server-configured
  `STRIPE_PRICE_ID`; the browser cannot choose an arbitrary price.
- A completed, paid Checkout Session grants `STRIPE_CREDITS_PER_PURCHASE` credits, initially
  one, through a signed webhook. One credit starts one fixed v2 benchmark run.
- Billing is fail-closed: Checkout is unavailable unless the Stripe secret, webhook signing
  secret, Price, and positive credit quantity are all configured.
- One idempotently-created Stripe Customer is persisted before Checkout so concurrent sessions
  cannot split a user's billing history across customers.
- Checkout metadata contains only stable internal IDs needed for reconciliation.
- Webhooks verify `Stripe-Signature` against the raw request body and persist each Stripe
  event before applying its ledger mutation.
- Full refunds revoke any still-unspent credits. Stripe dispute fund withdrawals freeze the
  same amount, and fund reinstatements restore exactly what that dispute froze.
- Starting a benchmark atomically reserves one credit. The workflow consumes it when provider
  querying begins, releases it if dispatch/generation fails before paid model work, and does
  not auto-refund after provider spend begins.
- The price amount and currency are owned by Stripe and are not hard-coded in the app.
- Stripe Customer Portal is available to authenticated users with a Stripe customer record.

Required Stripe configuration:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `STRIPE_CREDITS_PER_PURCHASE`

## Workflow

1. `POST /api/runs` authenticates the user, validates input, requires an idempotency key and
   displayed budget confirmation, enforces one active run, and verifies a credit balance.
2. One database transaction creates the run and dispatch row, reserves a credit, and reserves
   the user's daily quota.
3. The route starts Vercel Workflow and records its run ID. An owner-scoped detail-page retry
   recovers uncertain starts after 60 seconds; a signed daily reconciliation job is the
   unattended Hobby-compatible fallback.
4. The workflow claims the run. A deterministic Workflow hook token and database claim make
   duplicate starts harmless.
5. Generate, validate, and persist the frozen discovery and diagnostic questions.
6. Create provider job slots with `ON CONFLICT DO NOTHING`.
7. Process question/provider work in bounded batches with provider-aware concurrency and
   durable pacing. Never fan out all 100 provider calls at once.
8. Separate Gateway calls from persistence steps so a database retry does not repeat a
   successfully recorded model-step return value.
9. Retry transient throttling and 5xx failures with capped backoff; do not retry auth,
   unsupported-tool, budget, or validation failures.
10. Run deterministic mention matching and batched structured analysis.
11. Finalize when every job is terminal. Use `partial` when useful results exist but coverage
    is incomplete.

Execution is at-least-once. Unique constraints and upserts provide exactly-once database
effects, but an ambiguous provider timeout can still produce a duplicate billed call. Budget
estimates account for bounded retries.

## Provider contract

Each provider adapter returns a normalized object:

```ts
{
  provider,
  model,
  text,
  sources,
  searchQueries,
  groundingStatus,
  providerRequestId,
  requiredAttribution,
  usage,
  cost,
  warnings,
}
```

Adapters use Gateway model strings while supplying native tools from `@ai-sdk/openai`,
`@ai-sdk/anthropic`, `@ai-sdk/google`, and `@ai-sdk/xai`. The default Grok route is
`xai/grok-4.5`. Prompts require web search and citations. A provider canary fails instead of
downgrading when a selected model does not support its native search tool.

## API and UI

Routes:

- `/api/auth/[...path]`
- `POST /api/billing/checkout`
- `POST /api/billing/portal`
- `POST /api/stripe/webhook`
- `POST /api/runs`
- `GET /api/runs`
- `GET /api/runs/[id]`
- `POST /api/runs/[id]/dispatch` (owner-scoped recovery for an uncertain start)
- `GET /api/runs/[id]/results`
- `DELETE /api/runs/[id]`
- `GET /api/cron/reconcile` (Vercel Cron; also purges expired terminal runs)
- `POST /api/cron/reconcile` (authenticated manual reconciliation)

Pages:

- Public landing page with benchmark limitations and provider-processing disclosure
- Sign-up and sign-in pages
- Authenticated dashboard with credit balance, Checkout action, run history, and start form
- Run detail page with phase/progress, cost, coverage warning, metrics, provider comparison,
  cohort/category filters, and expandable answers with source links
- No public share URLs in MVP

## Cost, security, and privacy guardrails

- Exactly 25 shared questions and four providers, producing 100 planned provider answers
- One active run per user by default
- Configurable per-user daily run and cost ceilings
- Per-provider concurrency limits, maximum output tokens, and native-search-use limits
- Pre-run upper-bound estimate and explicit confirmation
- Pre-run cost planning includes grounded provider queries, worst-case structured analysis,
  and the bounded question-generation allowance; progress still reports provider jobs.
- The default planning estimate is 12,000 micros per AI call. For 100 provider calls, up to
  100 analysis calls, and the bounded 7-call question-generation allowance, the displayed
  estimate is about $2.48 per fixed run.
- The hard scheduling guard uses 19,000 micros per AI call across the same 207-call planning
  envelope, or about $3.93. Actual spend can vary with model usage and ambiguous retries.
- The default per-user daily reserved-cost ceiling is 12,000,000 micros ($12).
- Stop scheduling remaining calls when the conservative per-run scheduling estimate reaches
  its ceiling. Successful calls use Gateway actual cost when available; failed or retried calls
  use conservative estimates. This guard is not a provider billing guarantee because an
  ambiguous timeout can still be billed; the Vercel AI Gateway account budget is the ultimate
  owner-level backstop.
- Store Gateway actual cost when exposed; label fallback calculations as estimates
- Application-layer ownership checks on every run and result query
- Same-origin mutation checks and bounded input lengths, aliases, and competitors
- Citation URLs allow only `http:` and `https:` protocols
- Never log secrets, cookies, full descriptions, prompts, answer bodies, or raw Stripe events
- Runs are owner-only and deletable. A signed daily maintenance job deletes expired terminal
  runs so the default 30-day answer-retention promise is enforced rather than merely labeled.
- Disclose that inputs and questions pass through Vercel to four third-party AI providers

Production Neon Auth requires trusted production domains, a 32+ character cookie secret,
custom SMTP, and email verification. Managed Neon Auth is currently Beta and its production
configuration is a deployment prerequisite.

## Milestones

1. Methodology, schema, payment, and provider contracts
2. Next.js/Vercel linkage, Neon database, Drizzle migrations, and Neon Auth
3. Stripe Checkout, signed webhooks, credit ledger, and billing portal
4. AI Gateway provider canary with one shared question across four providers
5. Cohort-aware question generation and discovery-question validation
6. Vercel Workflow with idempotent jobs, bounded fan-out, quotas, and reconciliation
7. Analysis and versioned metric functions
8. Authenticated dashboard, citations, progress, cost, deletion, and disclosures
9. Automated verification and Vercel preview deployment

## Verification

- Lint, type-check, unit tests, and production build
- Tests proving discovery questions reject every target alias and domain
- Metric denominator, coverage, share-of-voice, prominence, and domain-citation tests
- Ownership tests preventing cross-user reads and deletes
- Credit reservation, webhook idempotency, quota, and provider-job idempotency tests
- Seeded fixture end-to-end path requiring no paid model calls
- Stripe test-mode Checkout and signed webhook smoke test
- Paid provider canary: one shared question across all four providers, each returning text and
  sources
- Five-question Workflow smoke test with retry and partial-result injection
- Full fixed run (25 shared questions and 100 planned provider answers) only after an explicit budget
  confirmation
- Verify the Vercel preview, authenticated navigation, progress polling, source rendering,
  payment return flow, and absence of secrets in client bundles and logs

## Phase 2

Repeated samples, scheduled comparisons, statistically meaningful trend reporting, verified
domain ownership, public sharing, team accounts, subscriptions or usage-based Stripe Billing,
additional providers, exports, and user-supplied factual ground truth.
