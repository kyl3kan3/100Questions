# 100Questions

100Questions is a private, paid AI-visibility benchmark. Benchmark v2 freezes exactly 25 shared questions and plans 100 provider answers across OpenAI, Claude, Gemini, and Grok with native web search. Successful sourced answers and coverage gaps remain visible behind transparent metrics. Historical v1 runs keep their original frozen provider set and denominators.

The product is an API-grounded benchmark, not a claim of parity with the providers' consumer chat interfaces.

## What is implemented

- Next.js 16 App Router and React 19 interface
- Managed Neon Auth with server-validated sessions
- Neon Postgres and Drizzle schema/migration
- Stripe-hosted one-time Checkout, signed idempotent webhooks, prepaid run credits, and Customer Portal
- AI SDK 6 through Vercel AI Gateway with native OpenAI, Anthropic, Google, and xAI search tools (including `@ai-sdk/xai` and the default `xai/grok-4.5` route)
- Vercel Workflow orchestration with bounded batches and retry classification
- A fixed 20-question neutral discovery / 5-question target-named diagnostic split
- Versioned visibility, prominence, share-of-voice, citation, sentiment, and coverage calculations
- Owner-only dashboard, progress, evidence, and deletion routes

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

Vercel deployments authenticate to AI Gateway using Vercel OIDC. Local Gateway development may require `vercel env pull` or the local credentials documented by Vercel.

Internal test accounts can bypass prepaid credits and per-user daily quotas by
setting `UNLIMITED_ACCESS_USER_IDS` to a comma-separated list of trusted Neon
Auth user IDs. This policy is evaluated only from the authenticated server
session. Unlimited runs still keep one active run at a time, per-run budget
confirmation, workflow accounting, and Gateway-level spending controls.

## Stripe setup

1. Create a one-time Stripe Price for one benchmark purchase.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_CREDITS_PER_PURCHASE`.
3. Forward these Stripe events to `/api/stripe/webhook` and set the resulting signing secret as `STRIPE_WEBHOOK_SECRET`: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.funds_withdrawn`, and `charge.dispute.funds_reinstated`.
4. Enable the Stripe Customer Portal if billing-history access is desired.

The browser never submits a price ID. The server owns the configured Price and grants one credit per fixed run only after a signed Checkout event reports a paid session. Billing is fail-closed: Checkout stays unavailable unless the server secret, signing secret, Price, and credit quantity are all configured. Full refunds revoke still-unspent purchased credits; dispute withdrawals freeze them and reinstatements restore exactly the frozen amount. The Price amount and currency remain owned by Stripe and are not hard-coded here.

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

Do not run a paid provider canary or a full fixed benchmark until the displayed run budget has been reviewed and explicitly confirmed. A run contains 25 shared questions and plans 100 provider answers (20 discovery and 5 diagnostic questions per provider). With the default guardrails, the planning estimate is about $2.48 and the hard scheduling guard is about $3.93. Results are directional: with only 25 questions, a rough worst-case sampling interval is about +/-20 percentage points, before accounting for question-set selection and provider variability. The pure metric and question-validation test suites do not make paid model calls.

## Required production checks

- Configure the Neon Auth trusted production domain, custom SMTP, and email verification.
- Keep `NEON_AUTH_COOKIE_SECRET` at least 32 random characters.
- Configure Stripe webhook delivery for the production domain and verify test mode before live mode.
- Confirm AI Gateway credit/payment settings and the five frozen model IDs (four answer models plus the analysis model).
- Set a random `CRON_SECRET` for dispatch reconciliation.
- Verify a four-provider, one-question grounded canary before expanding batch size.
- Inspect Vercel logs for failures without logging prompts, answers, cookies, or secrets.
