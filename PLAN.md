# 100Questions — AI Visibility Checker · Plan

## Context

`kyl3kan3/100Questions` is currently an **empty GitHub repo** (no commits, no code on any
branch). The goal is to build a website that tells a user **where their product/brand/site
shows up in AI assistant answers** — an "AI visibility" / Answer Engine Optimization tool.

**Core flow**

1. A user enters a subject (product, brand, or site) + a short description.
2. We auto-generate **100 research questions** about that subject.
3. We ask each question to **3 AI services** (OpenAI, Anthropic, Google Gemini) → ~300 answers.
4. We analyze each answer: was the brand mentioned? where/how? sentiment? which competitors
   showed up instead?
5. We present an automatic results dashboard: overall visibility score, per-provider
   breakdown, share-of-voice vs competitors, sentiment, and a browsable question-by-question
   table.

**Decisions locked with you**

| Decision | Choice |
|---|---|
| Stack | Next.js (App Router) + Vercel |
| AI services | OpenAI, Anthropic, Google Gemini (official APIs) |
| Questions | AI-generated per subject |
| Cost model | Site-owner keys, server-side, with a queue + rate/run limits |

**Key design note — web grounding.** Raw provider APIs answer from training data and won't
reflect live web visibility. So each provider adapter enables that provider's
**web-search / search-grounding tool** (OpenAI web search, Anthropic web search, Gemini
Google Search grounding) and captures the returned **citations**. This makes results reflect
what a real user querying these assistants would see. If a provider tool is unavailable, we
fall back to a plain completion and label the run "training-data mode."

---

## Architecture

Single Next.js app on Vercel. Because one run makes ~300 external calls (far past a single
serverless request budget), the fan-out runs as **durable background jobs**, not in the HTTP
request.

- **Web app (Next.js App Router)** — landing/start form, run dashboard with live progress.
- **API route handlers** — create a run; read run status + aggregated results.
- **Background orchestration (Inngest)** — durable fan-out of the 300 provider calls with
  per-provider concurrency limits, automatic retries, and a final aggregation step.
  *Alternative:* a Postgres-backed job table drained by a Vercel Cron function in batches.
  Inngest is recommended because reliable 300-call fan-out with retries/concurrency is exactly
  its job.
- **Database (Neon Postgres + Drizzle ORM)** — typed schema + migrations; stores runs,
  questions, results. *Alternative:* Supabase if we want built-in auth/storage sooner.
- **Provider adapters** — one module per service behind a common interface, each enabling its
  web-search tool.
- **LLM helpers** — question generation + answer analysis, using a cheaper/faster model.

### Data model (Drizzle schema)

- **`runs`** — `id`, `subject`, `subject_url`, `description`, `competitors` (jsonb, optional),
  `status` (pending | running | complete | failed), `question_count`, `created_at`,
  `completed_at`.
- **`questions`** — `id`, `run_id`, `text`, `category`, `sort_order`.
- **`results`** — `id`, `run_id`, `question_id`, `provider` (openai | anthropic | google),
  `model`, `answer_text`, `citations` (jsonb), `brand_mentioned` (bool),
  `position` (first | top | mentioned | absent), `sentiment` (positive | neutral | negative),
  `competitors_mentioned` (jsonb), `raw` (jsonb), `status`, `error`, `latency_ms`,
  `created_at`.

---

## Implementation

### Provider adapters — `lib/providers/`
- `types.ts` — common interface:
  `askQuestion(question: string): Promise<{ text: string; citations: Citation[]; model: string }>`.
- `openai.ts` — Responses API with the **web search** tool; capture answer + URL citations.
- `anthropic.ts` — Messages API with the **web search** server tool; capture answer +
  citations. *(Consult the `claude-api` skill for current Anthropic model IDs and the exact
  web-search tool name/config before coding.)*
- `google.ts` — Gemini with **Google Search grounding**; capture answer + grounding sources.
- `index.ts` — registry `[openai, anthropic, google]` iterated by the orchestrator.
- Each reads its key from env (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`) and
  applies timeouts + a small retry.

### Question generation — `lib/questions.ts`
One call to a capable model (e.g., Claude Sonnet 5 or GPT-4o) taking
`{ subject, description, competitors? }` and returning **100 structured questions** as JSON,
spread across categories a real researcher would ask: recommendations ("best X for Y"),
comparisons/alternatives, how-to, trust/reviews, pricing, use-case fit. Deduplicate, clamp to
`question_count`, persist to `questions`.

### Answer analysis — `lib/analysis.ts`
After each answer is stored, classify it into
`{ brand_mentioned, position, sentiment, competitors_mentioned[] }`.
Deterministic brand/alias string match for `brand_mentioned` (cheap, reliable) **plus** a
batched call to a cheap fast model (e.g., Claude Haiku 4.5 or gpt-4o-mini) for `position`,
`sentiment`, and competitor extraction. Batch multiple answers per analysis call to control
cost.

### Orchestration — `inngest/` + `app/api/inngest/route.ts`
`run.created` event →
1. generate questions →
2. **fan out** one job per (question × provider) with per-provider concurrency caps →
3. analyze each result →
4. finalize run (compute aggregates, set `status = complete`).

Idempotent steps + retries so partial failures don't lose the whole run.

### API routes — `app/api/`
- `POST /api/runs` — validate input, enforce the access gate + run limits, create the `runs`
  row, emit the Inngest event, return `{ id }`.
- `GET /api/runs/[id]` — return run status, per-question/per-provider results, and aggregates
  for the dashboard (used for live polling).

### UI — `app/` + `components/`
- `app/page.tsx` — landing + start form (subject, URL, description, optional competitors).
- `app/runs/[id]/page.tsx` — dashboard:
  - **Visibility score** (% of answers mentioning the brand) overall + per provider.
  - **Share of voice** vs competitors; **sentiment** breakdown; **category** breakdown.
  - **Results table** of 100 questions × 3 providers with mention/sentiment chips, expandable
    to the full answer + citations.
  - **Live progress** while running (poll `GET /api/runs/[id]` until complete).

### Cost & access controls
- Per-run question cap (default 100), per-provider concurrency limits, retries w/ backoff.
- Lightweight **access gate** for MVP (env-configured access code or allowlist) so random
  visitors can't burn the owner's API budget; a simple global daily-run limit.
- All keys in Vercel env vars; `.env.example` documents them.

### Critical files to create
- `lib/providers/{types,openai,anthropic,google,index}.ts`
- `lib/questions.ts`, `lib/analysis.ts`
- `lib/db/{schema,index}.ts`, `drizzle.config.ts`
- `inngest/functions.ts`, `inngest/client.ts`, `app/api/inngest/route.ts`
- `app/api/runs/route.ts`, `app/api/runs/[id]/route.ts`
- `app/page.tsx`, `app/runs/[id]/page.tsx`, `components/*`
- `.env.example`, `README.md`

---

## Milestones

1. **Scaffold** — Next.js + TypeScript + Tailwind; Neon + Drizzle; schema + first migration;
   `.env.example`.
2. **Providers** — three adapters w/ web-search tools + `scripts/test-providers.ts` asking one
   shared question to all three.
3. **Questions** — subject → 100 questions, persisted.
4. **Orchestration** — Inngest run: create → fan out 300 calls → store results (with a
   `questionCount` override for cheap testing, e.g. 5).
5. **Analysis** — mention / position / sentiment / competitors.
6. **Dashboard** — aggregates + live progress + results table.
7. **Controls & deploy** — access gate, run limits, deploy to Vercel with real keys.

---

## Verification

- **Provider smoke test:** `npx tsx scripts/test-providers.ts "best CRM for startups"` returns
  non-empty text **and** citations from all three providers.
- **End-to-end (cheap):** run `npm run dev` + the Inngest dev server, start a run with
  `questionCount=5`, watch all 15 jobs process, confirm `results` rows populate and
  `runs.status` → `complete`.
- **Dashboard check:** open `/runs/[id]`, confirm the visibility score / share-of-voice /
  sentiment aggregates match the raw `results` rows, and that expanding a row shows the full
  answer + citations.
- **Full run:** one real 100-question run behind the access gate; confirm concurrency limits
  hold and cost stays within the expected ~300-call budget.
- **Deploy:** Vercel preview with env keys set; repeat the cheap end-to-end against the
  preview.

---

## Out of scope (Phase 2+)

User accounts + saved run history, scheduled re-runs / tracking visibility over time, adding
more services (Perplexity, Copilot), and BYOK (bring-your-own-key). The data model already
leaves room for these.
