"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Counts = {
  eligible: number;
  mentions: number;
  prominent: number;
  citations: number;
  accurate: number;
};

const fields = [
  ["eligible", "Eligible answers", "Answers successfully collected with the required grounding."],
  ["mentions", "Answers mentioning the brand", "Count the brand only when it appears in the answer itself."],
  ["prominent", "Prominent mentions", "Answers where the brand leads or appears in the primary shortlist."],
  ["citations", "Claimed-domain citations", "Eligible answers linking to the brand's canonical domain."],
  ["accurate", "Accurate brand descriptions", "Mentioning answers with materially correct positioning and facts."],
] as const;

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((Math.min(numerator, denominator) / denominator) * 100);
}

export function AiVisibilityScoreCalculator() {
  const [counts, setCounts] = useState<Counts>({
    eligible: 100,
    mentions: 25,
    prominent: 10,
    citations: 12,
    accurate: 22,
  });

  const scores = useMemo(() => {
    const visibility = percent(counts.mentions, counts.eligible);
    const prominence = percent(counts.prominent, counts.mentions);
    const citation = percent(counts.citations, counts.eligible);
    const accuracy = percent(counts.accurate, counts.mentions);
    const composite = Math.round(
      visibility * 0.5 + prominence * 0.2 + citation * 0.2 + accuracy * 0.1,
    );

    return { visibility, prominence, citation, accuracy, composite };
  }, [counts]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[26px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
        <p className="eyebrow">Observed-answer inputs</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
          Enter counts from a real prompt test
        </h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {fields.map(([key, label, help]) => (
            <div key={key} className={key === "eligible" ? "sm:col-span-2" : undefined}>
              <Label htmlFor={`score-${key}`}>{label}</Label>
              <Input
                id={`score-${key}`}
                className="mt-2"
                type="number"
                min={0}
                max={10000}
                value={counts[key]}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  setCounts((current) => ({
                    ...current,
                    [key]: Number.isFinite(value) ? Math.max(0, value) : 0,
                  }));
                }}
              />
              <p className="mt-2 text-xs leading-5 text-zinc-500">{help}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-emerald-300/15 bg-emerald-300/[0.035] p-6 sm:p-8">
        <p className="eyebrow">Transparent composite</p>
        <div className="mt-4 flex items-end gap-3">
          <span className="font-mono text-6xl font-semibold tracking-[-0.06em] text-white">
            {scores.composite}
          </span>
          <span className="pb-2 text-zinc-400">/ 100</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Composite = 50% visibility + 20% prominence + 20% claimed-domain
          citation rate + 10% factual accuracy. Keep the components visible;
          the composite alone cannot explain what changed.
        </p>
        <dl className="mt-7 space-y-4">
          {[
            ["Visibility", scores.visibility, "mentions ÷ eligible answers"],
            ["Prominence", scores.prominence, "prominent ÷ mentioning answers"],
            ["Owned citations", scores.citation, "claimed-domain citations ÷ eligible answers"],
            ["Accuracy", scores.accuracy, "accurate ÷ mentioning answers"],
          ].map(([label, value, formula]) => (
            <div key={label} className="rounded-2xl bg-white/[0.035] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-medium text-zinc-200">{label}</dt>
                <dd className="font-mono text-lg text-emerald-300">{value}%</dd>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{formula}</p>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
