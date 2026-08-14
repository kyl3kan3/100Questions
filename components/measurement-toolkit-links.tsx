import Link from "next/link";

import { MEASUREMENT_TOOLKIT_LINKS } from "@/lib/resource-catalog";

type MeasurementToolkitLinksProps = {
  currentPath?: string;
};

export function MeasurementToolkitLinks({
  currentPath,
}: MeasurementToolkitLinksProps) {
  const links = MEASUREMENT_TOOLKIT_LINKS.filter(
    ({ href }) => href !== currentPath,
  );

  return (
    <section aria-labelledby="measurement-toolkit-heading">
      <p className="eyebrow">Free measurement toolkit</p>
      <h2
        id="measurement-toolkit-heading"
        className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl"
      >
        Move from technical access to a repeatable report
      </h2>
      <p className="mt-5 max-w-3xl text-pretty leading-7 text-zinc-400">
        Use the tools in order or open the one that matches your current job.
        Every resource is public and ungated.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
