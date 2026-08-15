"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateVisibilityScores,
  DEFAULT_VISIBILITY_SCORE_COUNTS,
  VISIBILITY_SCORE_FIELDS,
  type VisibilityScoreCounts,
} from "@/lib/public-tool-data";

export function AiVisibilityScoreCalculator() {
  const [counts, setCounts] = useState<VisibilityScoreCounts>(
    DEFAULT_VISIBILITY_SCORE_COUNTS,
  );

  const scores = useMemo(() => calculateVisibilityScores(counts), [counts]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[26px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
        <p className="eyebrow">Observed-answer inputs</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
          Enter counts from a real prompt test
        </h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {VISIBILITY_SCORE_FIELDS.map(([key, label, help]) => (
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
