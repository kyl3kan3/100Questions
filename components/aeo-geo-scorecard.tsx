"use client";

import { Check, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const needs = [
  {
    id: "rankings",
    label: "We need qualified traffic from traditional search results.",
    disciplines: ["SEO"],
  },
  {
    id: "answers",
    label: "We need concise answers selected for snippets, voice, or AI summaries.",
    disciplines: ["AEO"],
  },
  {
    id: "brands",
    label: "We need our brand understood and recommended across generative engines.",
    disciplines: ["GEO"],
  },
  {
    id: "citations",
    label: "We need to earn citations and third-party corroboration.",
    disciplines: ["AEO", "GEO"],
  },
  {
    id: "measurement",
    label: "We need a repeatable cross-model visibility baseline.",
    disciplines: ["AEO", "GEO"],
  },
] as const;

type NeedId = (typeof needs)[number]["id"];

export function AeoGeoScorecard() {
  const [selected, setSelected] = useState<NeedId[]>([]);
  const recommendation = useMemo(() => {
    const scores = { SEO: 0, AEO: 0, GEO: 0 };
    for (const item of needs) {
      if (!selected.includes(item.id)) continue;
      for (const discipline of item.disciplines) scores[discipline] += 1;
    }
    const active = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([discipline]) => discipline);

    if (!active.length) return "Select the outcomes that matter to your team.";
    if (active.length === 3) return "Use one integrated SEO + AEO + GEO program.";
    if (active.length === 1) return `Start with ${active[0]}, then measure the adjacent surfaces.`;
    return `Prioritize ${active.join(" + ")} with one shared content and measurement plan.`;
  }, [selected]);

  return (
    <div className="grid gap-6 rounded-[28px] border border-emerald-300/15 bg-emerald-300/[0.035] p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
      <fieldset>
        <legend className="text-xl font-semibold text-white">
          Which outcomes do you need?
        </legend>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Check every outcome that applies. The scorecard maps the work, not a
          new set of organizational silos.
        </p>
        <div className="mt-5 space-y-3">
          {needs.map((need) => {
            const checked = selected.includes(need.id);
            return (
              <label
                key={need.id}
                className="flex cursor-pointer gap-3 rounded-2xl bg-white/[0.035] p-4 text-sm leading-6 text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]"
              >
                <input
                  className="sr-only"
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelected((current) =>
                      checked
                        ? current.filter((id) => id !== need.id)
                        : [...current, need.id],
                    )
                  }
                />
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    checked
                      ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                      : "border-white/20 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <Check className="size-3.5" />
                </span>
                <span>{need.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col justify-between rounded-[22px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <div>
          <p className="eyebrow">Your starting point</p>
          <p className="mt-4 text-balance text-2xl font-semibold leading-tight text-white" aria-live="polite">
            {recommendation}
          </p>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Crawlability, useful pages, entity consistency, original evidence,
            and earned authority support every discipline. Keep one roadmap and
            report each surface with its own metric.
          </p>
        </div>
        {selected.length ? (
          <Button
            className="mt-6 self-start"
            type="button"
            variant="ghost"
            onClick={() => setSelected([])}
          >
            <RotateCcw aria-hidden="true" /> Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
