import Link from "next/link";

import { EDITORIAL_AUTHOR } from "@/lib/editorial";

type ContentBylineProps = {
  publishedAt: string;
  publishedLabel: string;
  modifiedAt?: string;
  modifiedLabel?: string;
  note?: string;
};

export function ContentByline({
  publishedAt,
  publishedLabel,
  modifiedAt,
  modifiedLabel,
  note,
}: ContentBylineProps) {
  return (
    <div className="mt-5 flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-zinc-400">
      <span>
        By{" "}
        <Link className="text-zinc-300 hover:text-emerald-200" href={EDITORIAL_AUTHOR.profilePath}>
          {EDITORIAL_AUTHOR.name}, {EDITORIAL_AUTHOR.role.toLowerCase()}
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Published <time dateTime={publishedAt}>{publishedLabel}</time>
      </span>
      {modifiedAt && modifiedLabel ? (
        <>
          <span aria-hidden="true">·</span>
          <span>
            Fact-checked <time dateTime={modifiedAt}>{modifiedLabel}</time>
          </span>
        </>
      ) : null}
      {note ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{note}</span>
        </>
      ) : null}
    </div>
  );
}
