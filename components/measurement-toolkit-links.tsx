import Link from "next/link";

import { MEASUREMENT_TOOLKIT_LINKS } from "@/lib/resource-catalog";
import { getSearchIntentPage } from "@/lib/search-intent-map";

type MeasurementToolkitLinksProps = {
  currentPath?: string;
};

const priorityLinks = [
  {
    href: "/ai-search-visibility-tool",
    title: "Measure mentions and citations",
    description:
      "Run a frozen 25-question benchmark across four providers and inspect the underlying answer evidence.",
  },
  {
    href: "/aeo-vs-geo",
    title: "Choose the AEO or GEO lens",
    description:
      "Map answer selection, brand understanding, SEO, and cross-model measurement to the right program.",
  },
  {
    href: "/methodology",
    title: "Audit the measurement method",
    description:
      "Review eligibility, denominators, coverage, citations, retention, and like-for-like rerun rules.",
  },
] as const;

function selectLinks(currentPath?: string) {
  const freeLinks = MEASUREMENT_TOOLKIT_LINKS.filter(
    ({ href }) => href !== currentPath,
  );

  if (currentPath?.includes("prompt") || currentPath?.includes("question")) {
    return [priorityLinks[0], freeLinks[1], freeLinks[2]];
  }
  if (currentPath?.includes("citation") || currentPath?.includes("report")) {
    return [priorityLinks[0], priorityLinks[2], freeLinks[3]];
  }
  if (currentPath?.includes("measure") || currentPath?.includes("score")) {
    return [priorityLinks[0], priorityLinks[1], freeLinks[2]];
  }
  if (currentPath?.includes("overview") || currentPath?.includes("alert")) {
    return [priorityLinks[1], priorityLinks[0], priorityLinks[2]];
  }
  return [priorityLinks[0], priorityLinks[1], freeLinks[0]];
}

export function MeasurementToolkitLinks({
  currentPath,
}: MeasurementToolkitLinksProps) {
  const intent = currentPath ? getSearchIntentPage(currentPath) : undefined;
  const links = selectLinks(currentPath).filter(
    ({ href }) => href !== currentPath,
  );

  return (
    <section aria-labelledby="measurement-toolkit-heading">
      <p className="eyebrow">Contextual next steps</p>
      <h2
        id="measurement-toolkit-heading"
        className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
      >
        {intent ? `Continue from ${intent.intent.toLowerCase()}` : "Connect this resource to answer evidence"}
      </h2>
      <p className="mt-5 max-w-3xl text-pretty leading-7 text-zinc-400">
        {intent?.uniqueJob ??
          "Use the next resource that matches the decision at hand: define the program, inspect the method, or collect a comparable cross-provider baseline."}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {links.map(({ href, title, description }, index) => (
          <Link
            key={href}
            href={href}
            className="rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/[0.045]"
          >
            <span className="font-mono text-xs text-emerald-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
