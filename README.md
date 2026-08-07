# 100Questions

100Questions is a private, prepaid AI visibility audit. Benchmark v2 freezes exactly 25 shared questions and plans 100 provider answers across OpenAI, Claude, Gemini, and Grok with a shared web-search harness. It turns stored answer and citation evidence into up to five prioritized actions. Historical v1 runs keep their original frozen provider set and denominators.

The product is an API-grounded benchmark, not a claim of parity with the providers' consumer chat interfaces.

## What is implemented

- Next.js 16 App Router and React 19 interface
- Managed Neon Auth with server-validated sessions
- Neon Postgres and Drizzle schema/migration
- Stripe-hosted one-time Checkout, signed idempotent webhooks, prepaid run credits, and Customer Portal
- AI SDK 6 through Vercel AI Gateway with a bounded, provider-independent Exa search harness and separate OpenAI, Anthropic, Google, and xAI answer models
- Vercel Workflow orchestration with bounded batches and retry classification
- Transactional completion, partial-result, failure, and cancellation email notifications through Resend
- A fixed 20-question neutral discovery / 5-question target-named diagnostic split
- Versioned visibility, prominence, share-of-voice, citation, sentiment, and coverage calculations
- Evidence-linked, versioned action plans with owner-only PDF and CSV exports
- Exact-question reruns with owner-only baseline comparisons
- Owner-only dashboard, progress, evidence, rerun, export, and deletion routes

The complete methodology and operational decisions live in [PLAN.md](./PLAN.md).

## Local setup

Requirements: Node.js 20.9 or newer, a Neon project with Managed Neon Auth, a Stripe test-mode account, and a Vercel project with AI Gateway enabled.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

On Windows PowerShell, copy the environment file with `Copy-Item .env.example .env.local`.

`npm run db:migrate` above applies migrations to whichever database `DATABASE_URL`
points at, so it is only needed for local development. Deployments migrate
themselves — see [Database migrations](#database-migrations).

Vercel deployments authenticate to AI Gateway using Vercel OIDC. Local Gateway development may require `vercel env pull` or the local credentials documented by Vercel.

## Database migrations

Production deployments apply pending migrations automatically. Vercel runs the
`vercel-build` script, which executes `scripts/deploy-migrate.mjs` before
`next build`:

- **Production builds** apply pending migrations first. If they fail, the build
  fails and the existing deployment keeps serving, so code can never go live
  ahead of the schema it expects. Migrations are additive, so the live code
  safely ignores columns and tables added moments before it is promoted.
- **Production builds without `DATABASE_URL`** fail deliberately rather than
  skipping silently, because a silent skip is what lets drift reappear.
- **Preview and development builds never migrate.** A preview branch can carry
  unmerged migrations, and every Vercel environment points at the same database,
  so migrating there would apply unreviewed schema changes to production. They
  still log whether `DATABASE_URL` is readable at build time, which surfaces
  broken environment wiring before a production deploy depends on it.

`DATABASE_URL` must therefore be present in the Vercel project's **production**
environment variables and exposed to the build step.

To add a migration, run `npm run db:generate` after changing
`lib/db/schema.ts`, commit the generated SQL in `drizzle/`, and let the deploy
apply it. Note that Drizzle's migrator tracks progress by timestamp: it applies
everything newer than the newest applied migration, so never edit or reorder a
migration that has already run in production.

Run notifications require a verified sender domain plus `RESEND_API_KEY` and
`RUN_NOTIFICATION_FROM_EMAIL`. If either value is missing, benchmark execution
continues normally and the notification step is skipped.

Provider jobs run in bounded batches. `WORKFLOW_MAX_CONCURRENT_JOBS` is capped
at the four configured providers. `WORKFLOW_AI_CALL_DELAY_MS` defaults to zero
and can add an incident-response cooldown without requiring a deploy. Per-run
duration, budget, credit, and cancellation guards still apply before new model
calls are scheduled.

Internal test accounts can bypass prepaid credits and per-user daily quotas by
setting `UNLIMITED_ACCESS_USER_IDS` to a comma-separated list of trusted Neon
Auth user IDs. This policy is evaluated only from the authenticated server
session. Unlimited runs still keep one active run at a time, workflow
accounting, and Gateway-level spending controls.

## Stripe setup

1. Create four one-time Stripe Prices: $9 introductory, $15 single, $39 three-pack, and $99 ten-pack.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_INTRO`, `STRIPE_PRICE_SINGLE`, `STRIPE_PRICE_THREE`, and `STRIPE_PRICE_TEN`.
3. Forward these Stripe events to `/api/stripe/webhook` and set the resulting signing secret as `STRIPE_WEBHOOK_SECRET`: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`, `charge.dispute.funds_withdrawn`, and `charge.dispute.funds_reinstated`.
4. Configure the Stripe Tax origin, product tax code/tax behavior, and at least one active Tax Registration, then enable the Stripe Customer Portal for billing history. The Stripe key must be able to read Tax Registrations; Checkout fails closed when it cannot confirm one before enabling automatic tax.

The browser submits only a package key; the server maps it to a configured Stripe Price and versioned, immutable credit grant. The $9 introductory package is enforced by one durable per-user claim. Its complete Checkout request snapshot and resulting Session URL are reused across browser retries, while expired or failed Sessions advance that claim to a new attempt. Signed Checkout events grant 1, 3, or 10 credits, and each credit expires 12 months after purchase. Billing is fail-closed unless every package Price, webhook configuration, and an active Stripe Tax Registration are present. Full refunds revoke still-unspent purchased credits; dispute withdrawals freeze them and timely reinstatements restore exactly the frozen amount.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Do not run a paid provider canary or a full fixed benchmark without deliberate approval. A run contains 25 shared questions and plans 100 provider answers (20 discovery and 5 diagnostic questions per provider). Internal cost ceilings remain enforced server-side. Results are directional: with only 25 questions, a rough worst-case sampling interval is about +/-20 percentage points, before accounting for question-set selection and provider variability. The pure metric and question-validation test suites do not make paid model calls.

## Search discovery

Public search inventory is generated from `lib/seo.ts` and includes the home
page, the sample report, the AI visibility guide, the generative engine optimization guide, the
methodology, and the FAQ. Private authentication, dashboard, run, workflow, and
API URLs are excluded from the sitemap or marked `noindex` at the page level.

For Google Search Console and Bing Webmaster Tools, set the production
`GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` values supplied by the
respective ownership flows. The site also hosts an IndexNow ownership key at
the domain root so newly published or materially updated public URLs can be
submitted to participating search engines after deployment. Run
`npm run indexnow:check` to validate the hosted key and live sitemap without
submitting anything, or `npm run indexnow:submit` to submit the complete public
sitemap as one IndexNow batch. Run `npm run discovery:validate` to confirm that
the live raw HTML exposes the expected product, brand, offer, FAQ, and comparison
facts. `.github/workflows/indexnow.yml` runs that validation before submitting
the sitemap after a successful Vercel production deployment; preview deployments
are excluded.

The SaaS-specific schema decisions and intentionally inapplicable retail fields
are documented in `AEO_GEO_IMPLEMENTATION.md`.

## Required production checks

- Configure the Neon Auth trusted production domain, custom SMTP, and email verification.
- Keep `NEON_AUTH_COOKIE_SECRET` at least 32 random characters.
- Configure Stripe webhook delivery for the production domain and verify test mode before live mode.
- Confirm AI Gateway credit/payment settings and the five frozen model IDs (four answer models plus the analysis model).
- Set a random `CRON_SECRET` for dispatch reconciliation.
- Verify a four-provider, one-question grounded canary before expanding batch size.
- Inspect Vercel logs for failures without logging prompts, answers, cookies, or secrets.
