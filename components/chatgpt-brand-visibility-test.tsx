"use client";

import { useMemo, useState } from "react";

import { CHATGPT_BRAND_VISIBILITY_PROMPTS } from "@/lib/public-tool-data";

type Result = "not-tested" | "absent" | "mentioned" | "cited";

export function ChatgptBrandVisibilityTest() {
  const [results, setResults] = useState<Result[]>(() =>
    CHATGPT_BRAND_VISIBILITY_PROMPTS.map(() => "not-tested"),
  );

  const summary = useMemo(() => {
    const tested = results.filter((result) => result !== "not-tested").length;
    const mentions = results.filter(
      (result) => result === "mentioned" || result === "cited",
    ).length;
    const citations = results.filter((result) => result === "cited").length;

    return {
      tested,
      mentionRate: tested ? Math.round((mentions / tested) * 100) : 0,
      citationRate: tested ? Math.round((citations / tested) * 100) : 0,
    };
  }, [results]);

  return (
    <div className="rounded-[26px] bg-[#0b0e0c] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
      <div className="grid gap-6 border-b border-white/[0.07] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow">10-prompt manual test</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white">
            Record what ChatGPT actually returns
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
            Replace the bracketed fields, use fresh sessions with consistent web
            search settings, save each answer, and classify the visible result.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            ["Tested", `${summary.tested}/10`],
            ["Mention rate", `${summary.mentionRate}%`],
            ["Citation rate", `${summary.citationRate}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/[0.04] px-3 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              <p className="font-mono text-lg text-emerald-300">{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {CHATGPT_BRAND_VISIBILITY_PROMPTS.map((prompt, index) => (
          <li key={prompt} className="grid gap-3 rounded-2xl bg-white/[0.025] p-4 md:grid-cols-[1fr_11rem] md:items-center">
            <div className="flex gap-3 text-sm leading-6 text-zinc-300">
              <span className="font-mono text-[11px] text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
              <span>{prompt}</span>
            </div>
            <select
              aria-label={`Result for prompt ${index + 1}`}
              className="h-10 rounded-lg border border-white/[0.1] bg-[#101411] px-3 text-sm text-zinc-200 outline-none focus:border-emerald-300/50"
              value={results[index]}
              onChange={(event) => {
                const result = event.target.value as Result;
                setResults((current) =>
                  current.map((value, resultIndex) =>
                    resultIndex === index ? result : value,
                  ),
                );
              }}
            >
              <option value="not-tested">Not tested</option>
              <option value="absent">Brand absent</option>
              <option value="mentioned">Brand mentioned</option>
              <option value="cited">Brand + owned citation</option>
            </select>
          </li>
        ))}
      </ol>
    </div>
  );
}
