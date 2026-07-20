# 100Questions

100Questions is a private, paid AI-visibility benchmark. It freezes a neutral question set, asks the same questions across OpenAI, Anthropic, and Google with native web search, and keeps the normalized answers and sources behind transparent metrics.

The product is an API-grounded benchmark, not a claim of parity with the providers' consumer chat interfaces.

## What is implemented

- Next.js 16 App Router and React 19 interface
- Managed Neon Auth with server-validated sessions
- Neon Postgres and Drizzle schema/migration
- Stripe-hosted one-time Checkout, signed idempotent webhooks, prepaid run credits, and Customer Portal
- AI SDK 6 through Vercel AI Gateway with native OpenAI, Anthropic, and Google search tools
- Vercel Workflow orchestration with bounded batches and retry classification
- 80% neutral discovery / 20% target-named diagnostic question cohorts
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

## Stripe setup

1. Create a one-time Stripe Price for one benchmark purchase.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_CREDITS_PER_PURCHASE`.
3. Forward these Stripe events to `/api/stripe/webhook` and set the resulting signing secret as `STRIPE_WEBHOOK_SECRET`: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.funds_withdrawn`, and `charge.dispute.funds_reinstated`.
4. Enable the Stripe Customer Portal if billing-history access is desired.

The browser never submits a price ID. The server owns the configured Price and grants credits only after a signed Checkout event reports a paid session. Full refunds revoke still-unspent purchased credits; dispute withdrawals freeze them and reinstatements restore exactly the frozen amount.

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

Do not run a paid provider canary or full 100-question benchmark until the displayed run budget has been reviewed and explicitly confirmed. The pure metric and question-validation test suites do not make paid model calls.

## Required production checks

- Configure the Neon Auth trusted production domain, custom SMTP, and email verification.
- Keep `NEON_AUTH_COOKIE_SECRET` at least 32 random characters.
- Configure Stripe webhook delivery for the production domain and verify test mode before live mode.
- Confirm AI Gateway credit/payment settings and the four frozen model IDs.
- Set a random `CRON_SECRET` for dispatch reconciliation.
- Verify a three-provider, one-question grounded canary before expanding batch size.
- Inspect Vercel logs for failures without logging prompts, answers, cookies, or secrets.
