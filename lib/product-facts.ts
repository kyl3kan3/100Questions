import { BILLING_PACKAGES, formatPackagePrice } from "./billing/packages";

export const PRODUCT_NAME = "100 Questions AI Visibility Benchmark";
export const PRODUCT_SKU = "100Q-AI-VISIBILITY-BENCHMARK-V2";
export const PRODUCT_UPDATED_AT = "2026-08-20T00:00:00.000Z";

export const BENCHMARK_QUESTION_COUNT = 25;
export const BENCHMARK_PROVIDER_COUNT = 4;
export const BENCHMARK_PLANNED_ANSWER_COUNT =
  BENCHMARK_QUESTION_COUNT * BENCHMARK_PROVIDER_COUNT;
export const BENCHMARK_RETENTION_DAYS = 30;
export const BENCHMARK_HAS_SUBSCRIPTION = false;

export const BENCHMARK_MODEL_DEFAULTS = {
  openai: "openai/gpt-5.4-mini",
  anthropic: "anthropic/claude-sonnet-5",
  google: "google/gemini-3.1-flash-lite",
  xai: "xai/grok-4.5",
  analysis: "openai/gpt-5.4-nano",
} as const;

export const BENCHMARK_PROVIDER_FACTS = [
  {
    key: "openai",
    provider: "OpenAI",
    model: "GPT-5.4 mini",
    modelId: BENCHMARK_MODEL_DEFAULTS.openai,
    grounding: "Web-grounded search",
  },
  {
    key: "anthropic",
    provider: "Claude",
    model: "Claude Sonnet 5",
    modelId: BENCHMARK_MODEL_DEFAULTS.anthropic,
    grounding: "Web-grounded search",
  },
  {
    key: "google",
    provider: "Gemini",
    model: "Gemini 3.1 Flash Lite",
    modelId: BENCHMARK_MODEL_DEFAULTS.google,
    grounding: "Web-grounded search",
  },
  {
    key: "xai",
    provider: "Grok",
    model: "Grok 4.5",
    modelId: BENCHMARK_MODEL_DEFAULTS.xai,
    grounding: "Web-grounded search",
  },
] as const;

// Study labels are intentionally separate from current product configuration.
// They describe the frozen July 30, 2026 protocol and must not drift when the
// live benchmark changes models later.
export const AI_VISIBILITY_INDEX_2026_MODEL_FACTS = [
  { provider: "OpenAI / ChatGPT model family", model: "GPT-5.4 mini via API" },
  { provider: "Claude", model: "Claude Sonnet 5 via API" },
  { provider: "Gemini", model: "Gemini 3.1 Flash Lite via API" },
  { provider: "Grok", model: "Grok 4.5 via API" },
] as const;

export const PRODUCT_FEATURES = [
  `${BENCHMARK_QUESTION_COUNT} buyer questions`,
  "Four web-grounded providers",
  "Competitor comparison",
  "Answer and citation evidence",
  "Five prioritized actions",
  "PDF and CSV exports",
] as const;

export const PRODUCT_BEST_FITS = [
  "A point-in-time baseline before an AI visibility project",
  "A client-ready audit with inspectable answer and citation evidence",
  "A like-for-like rerun after meaningful technical, content, or authority work",
] as const;

export const PRODUCT_LIMITATIONS = [
  "It is not continuous monitoring and does not send daily alerts.",
  "It does not currently test Perplexity or reproduce consumer chat interfaces.",
  `It is a directional ${BENCHMARK_QUESTION_COUNT}-question sample, not a statistically representative market ranking.`,
] as const;

export const VERIFIED_BRAND_PROFILES = [
  {
    name: "VerifiedDR",
    url: "https://verifieddr.com/website/100questionsai-com",
    description: "Public domain-authority profile",
  },
  {
    name: "Findly.tools",
    url: "https://findly.tools/100-questions",
    description: "Independent software-directory listing",
  },
  {
    name: "neeed.directory",
    url: "https://neeed.directory/products/100-questions",
    description: "Independent product-directory listing",
  },
  {
    name: "Peerlist",
    url: "https://peerlist.io/kyl3kan3/project/100-questions",
    description: "Public project profile",
  },
  {
    name: "SEOReceipts",
    url: "https://seoreceipts.com/site/100questionsai/",
    description: "Public search-performance profile",
  },
] as const;

function packagePrice(id: (typeof BILLING_PACKAGES)[number]["id"]) {
  const billingPackage = BILLING_PACKAGES.find((item) => item.id === id);
  if (!billingPackage) throw new Error(`Missing billing package: ${id}`);
  return formatPackagePrice(billingPackage.priceCents);
}

export const PRODUCT_FAQS = [
  {
    id: "best-fit",
    question: "Who is 100 Questions best for?",
    answer:
      "100 Questions is best for consultants, agencies, and in-house teams that need a bounded AI visibility baseline, an evidence-linked client deliverable, or a comparable rerun after implementation work.",
  },
  {
    id: "continuous-monitoring",
    question: "When is continuous AI visibility monitoring a better choice?",
    answer:
      "Choose continuous monitoring when you need daily or weekly trend lines, alerts, a large configurable prompt program, Perplexity coverage, or ongoing multi-project reporting. 100 Questions is deliberately a point-in-time benchmark rather than an always-on dashboard.",
  },
  {
    id: "product-pricing",
    question: "How much does a 100 Questions benchmark cost?",
    answer: `The first benchmark costs ${packagePrice("intro")}. After that, one benchmark costs ${packagePrice("single")}, three cost ${packagePrice("three")}, and ten cost ${packagePrice("ten")}. There is no subscription, credits remain valid for 12 months, and Stripe shows applicable taxes before payment.`,
  },
  {
    id: "placement-guarantee",
    question: "Does 100 Questions guarantee placement in AI answers?",
    answer:
      "No. It measures a time-stamped, API-grounded sample and preserves the evidence behind it. AI answers vary by provider, model, search results, prompt, location, and time, so no credible tool can guarantee future mentions or citations.",
  },
] as const;
