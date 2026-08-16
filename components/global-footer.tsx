import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { MEASUREMENT_TOOLKIT_LINKS } from "@/lib/resource-catalog";

const footerGroups = [
  {
    label: "Explore",
    links: [
      ["Resources", "/resources"],
      ["AI visibility tools", "/ai-visibility-tools"],
      ["AI visibility guide", "/ai-visibility"],
      ["AI Visibility Index", "/ai-visibility-index"],
      ["Methodology", "/methodology"],
      ["Sample report", "/sample-report"],
    ],
  },
  {
    label: "Use",
    links: [
      ["AI search visibility tool", "/ai-search-visibility-tool"],
      ["AI visibility audit", "/ai-visibility-audit"],
      ["AI brand risk checker", "/ai-brand-risk-checker"],
      ["Free readiness checker", "/ai-visibility-checker"],
      ["MCP for agents", "/mcp"],
      ["AEO tools comparison", "/answer-engine-optimization-tools"],
      ["AEO vs GEO", "/aeo-vs-geo"],
      ["For agencies", "/for-agencies"],
      ["Pricing", "/#pricing"],
      ["FAQ", "/faq"],
    ],
  },
  {
    label: "Free resources",
    links: [
      ["llms.txt checker", "/llms-txt-checker"],
      ["llms.txt site index", "/llms.txt"],
      ["Markdown site index", "/index.md"],
      ...MEASUREMENT_TOOLKIT_LINKS.map(
        ({ footerLabel, href }) => [footerLabel, href] as const,
      ),
    ],
  },
  {
    label: "Company",
    links: [
      ["About", "/about"],
      ["Support", "/support"],
      ["Contact", "/contact"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Sign in", "/auth/sign-in"],
    ],
  },
] as const;

export function GlobalFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#070908] text-zinc-400">
      <div className="page-shell grid gap-10 py-10 sm:py-12 lg:grid-cols-[1fr_3fr]">
        <div>
          <BrandMark showName={false} />
          <p className="mt-4 max-w-sm text-sm leading-6">
            A directional, API-grounded AI visibility benchmark with inspectable
            evidence, explicit limits, and no subscription.
          </p>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            Results may differ from consumer chat products and do not guarantee
            future mentions or citations.
          </p>
        </div>

        <nav
          className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Footer navigation"
        >
          {footerGroups.map((group) => (
            <div key={group.label}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-500">
                {group.label}
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link className="hover:text-zinc-200" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
