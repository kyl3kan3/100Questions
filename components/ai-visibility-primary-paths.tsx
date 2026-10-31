import Link from "next/link";

const paths = [
  {
    href: "/",
    label: "AI search visibility platform",
    description: "100 Questions — prepaid cross-model benchmarks with stored evidence.",
  },
  {
    href: "/ai-visibility",
    label: "What is AI visibility?",
    description: "Definitions, metrics, worked examples, and how visibility differs from SEO.",
  },
  {
    href: "/ai-visibility-checker",
    label: "Free AI visibility checker",
    description: "Technical readiness scan plus a manual answer-check workflow — no account.",
  },
  {
    href: "/ai-visibility-audit",
    label: "AI visibility audit service",
    description: "Paid 100-answer benchmark across OpenAI, Claude, Gemini, and Grok from $9.",
  },
] as const;

type AiVisibilityPrimaryPathsProps = {
  currentPath: (typeof paths)[number]["href"];
};

export function AiVisibilityPrimaryPaths({
  currentPath,
}: AiVisibilityPrimaryPathsProps) {
  const others = paths.filter(({ href }) => href !== currentPath);

  return (
    <nav
      className="mt-6 rounded-[22px] bg-white/[0.03] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-6"
      aria-label="Related AI visibility pages"
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-400">
        Pick the right page
      </p>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
        {others.map(({ href, label, description }) => (
          <li key={href}>
            <Link
              href={href}
              className="font-medium text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
            >
              {label}
            </Link>
            <span className="text-zinc-500"> — </span>
            {description}
          </li>
        ))}
      </ul>
    </nav>
  );
}
