import { ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  EVIDENCE_SOURCES,
  type EvidenceSourceId,
} from "@/lib/evidence-sources";

type EvidenceNotesProps = {
  sourceIds: readonly EvidenceSourceId[];
  reviewedAt?: string;
  context?: string;
};

export function EvidenceNotes({
  sourceIds,
  reviewedAt = "August 20, 2026",
  context = "These sources support the framework and its limits; they do not establish a universal ranking formula.",
}: EvidenceNotesProps) {
  return (
    <section
      aria-labelledby="evidence-notes-heading"
      className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8"
    >
      <p className="eyebrow">Evidence notes</p>
      <h2
        id="evidence-notes-heading"
        className="mt-4 text-balance text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl"
      >
        Primary sources behind the claims
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
        {context} Sources reviewed {reviewedAt}.
      </p>
      <ul className="mt-6 grid gap-4 lg:grid-cols-2">
        {sourceIds.map((sourceId) => {
          const source = EVIDENCE_SOURCES[sourceId];
          const external = source.href.startsWith("http");
          const className =
            "block rounded-2xl bg-[#0b0e0c] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] hover:bg-white/[0.04]";
          const content = (
            <>
              <span className="flex items-start gap-2 font-semibold leading-6 text-zinc-100">
                {source.title}
                {external ? (
                  <ExternalLink className="mt-1 size-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
                ) : null}
              </span>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">
                {source.note}
              </span>
            </>
          );

          return (
            <li key={sourceId}>
              {external ? (
                <a className={className} href={source.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <Link className={className} href={source.href}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
