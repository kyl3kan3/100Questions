import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const footerGroups = [
  {
    label: "Explore",
    links: [
      ["Resources", "/resources"],
      ["AI visibility guide", "/ai-visibility"],
      ["AI Visibility Index", "/ai-visibility-index"],
      ["Methodology", "/methodology"],
      ["Sample report", "/sample-report"],
    ],
  },
  {
    label: "Use",
    links: [
      ["Free readiness checker", "/ai-visibility-checker"],
      ["AEO tools comparison", "/answer-engine-optimization-tools"],
      ["For agencies", "/for-agencies"],
      ["Pricing", "/#pricing"],
      ["FAQ", "/faq"],
    ],
  },
  {
    label: "Company",
    links: [
      ["About", "/about"],
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
      <div className="page-shell grid gap-10 py-10 sm:grid-cols-[1.2fr_1.8fr] sm:py-12">
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
          className="grid gap-8 sm:grid-cols-3"
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
