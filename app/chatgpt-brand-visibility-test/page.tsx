import { ChatgptBrandVisibilityTest } from "@/components/chatgpt-brand-visibility-test";
import { SeoResourceShell } from "@/components/seo-resource-shell";
import { buildResourceMetadata } from "@/lib/resource-metadata";
import { CHATGPT_BRAND_VISIBILITY_PROMPTS } from "@/lib/public-tool-data";

const path = "/chatgpt-brand-visibility-test" as const;

export const metadata = buildResourceMetadata({
  path,
  title: "Free ChatGPT Brand Visibility Test",
  description:
    "Run a free 10-prompt ChatGPT brand visibility test and record brand mentions, owned citations, discovery gaps, and brand accuracy without signup.",
});

const faqs = [
  {
    question: "How do I test whether my brand appears in ChatGPT?",
    answer:
      "Define buyer questions, replace the placeholders, use consistent fresh-session and web-search conditions, save each answer, and record whether the brand appears and whether the claimed domain is cited.",
  },
  {
    question: "Why are only three prompts brand-named?",
    answer:
      "Neutral prompts test whether ChatGPT discovers the brand independently. Brand-named prompts instead test recognition, accuracy, and competitive framing and should be reported separately.",
  },
  {
    question: "Will ChatGPT return the same answer every time?",
    answer:
      "No. Answers can vary by model, product surface, session context, search behavior, location, and time. Record the conditions and treat a small manual test as directional.",
  },
  {
    question: "Does a mention prove that ChatGPT recommends the brand?",
    answer:
      "No. A mention may be incidental, comparative, negative, or prompted by the brand name. Record prominence, recommendation language, sentiment, accuracy, and citations separately.",
  },
] as const;

export default function ChatgptBrandVisibilityTestPage() {
  return (
    <SeoResourceShell
      path={path}
      eyebrow="Free interactive test"
      breadcrumb="ChatGPT brand visibility test"
      title="ChatGPT brand visibility test"
      description="A ten-question manual test for checking whether ChatGPT discovers, describes, compares, and cites your brand under consistent conditions."
      download={{
        href: "/chatgpt-brand-visibility-test.csv",
        label: "Download the test worksheet",
      }}
      faqs={faqs}
    >
      <ChatgptBrandVisibilityTest />

      <noscript>
        <section
          className="rounded-[26px] border border-amber-300/20 bg-amber-300/[0.04] p-6 sm:p-8"
          aria-labelledby="manual-chatgpt-test-heading"
        >
          <p className="eyebrow">No-JavaScript worksheet</p>
          <h2
            id="manual-chatgpt-test-heading"
            className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white"
          >
            Run and record the ten prompts manually
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
            Replace the bracketed fields, save each answer and its visible source
            URLs, then mark the brand absent, mentioned, or mentioned with an
            owned citation. Mention rate = mentioning answers ÷ tested answers;
            citation rate = answers with an owned citation ÷ tested answers.
          </p>
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-300">
            {CHATGPT_BRAND_VISIBILITY_PROMPTS.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ol>
        </section>
      </noscript>

      <section className="grid gap-5 md:grid-cols-3" aria-label="Test protocol">
        {[
          ["Freeze the setup", "Record the ChatGPT surface, model label, web-search setting, date, locale, and whether the session is fresh."],
          ["Save the evidence", "Keep the full answer, visible source URLs, prompt wording, and any errors instead of recording only a yes or no."],
          ["Repeat carefully", "Use the same prompts and conditions for a rerun. Label a changed prompt set as a new benchmark."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-[22px] bg-white/[0.025] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
          </article>
        ))}
      </section>
    </SeoResourceShell>
  );
}
