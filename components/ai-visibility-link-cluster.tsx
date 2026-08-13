import Link from "next/link";

const paths = [
  {
    href: "/ai-visibility-checker",
    title: "Free AI visibility checker",
    description: "Test crawl access, page signals, schema, and sitemap discovery.",
  },
  {
    href: "/ai-seo-tools",
    title: "Best AI visibility tools",
    description: "Compare monitoring platforms, research suites, and fixed audits.",
  },
  {
    href: "/answer-engine-optimization-tools",
    title: "Answer engine optimization tools",
    description: "Choose AEO software by workflow, cadence, evidence, and fit.",
  },
  {
    href: "/ai-visibility",
    title: "AI visibility guide",
    description: "Understand the metrics, evidence, limits, and improvement loop.",
  },
  {
    href: "/how-to-get-chatgpt-to-recommend-your-business",
    title: "How to get ChatGPT to recommend your business",
    description: "Improve the controllable inputs without promising a guaranteed mention.",
  },
] as const;

type AiVisibilityLinkClusterProps = {
  currentPath: (typeof paths)[number]["href"];
};

export function AiVisibilityLinkCluster({
  currentPath,
}: AiVisibilityLinkClusterProps) {
  return (
    <section aria-labelledby="ai-visibility-paths-heading">
      <p className="eyebrow">Related paths</p>
      <h2
        id="ai-visibility-paths-heading"
        className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
      >
        Continue the AI visibility workflow
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {paths
          .filter(({ href }) => href !== currentPath)
          .map(({ href, title, description }) => (
            <Link
              key={href}
              href={href}
              className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/[0.045]"
            >
              <h3 className="font-semibold text-emerald-300">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {description}
              </p>
            </Link>
          ))}
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-400">
        When you are ready to compare actual answers across four AI providers,
        review the{" "}
        <Link
          href="/#pricing"
          className="text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
        >
          $9 AI visibility audit on the homepage
        </Link>
        .
      </p>
    </section>
  );
}
