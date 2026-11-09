import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const MARKER_PATTERN = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
const MARKER_STRIP_PATTERN = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;

export const DEFAULT_INLINE_INTERNAL_LINK_CLASS =
  "text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200";

export function stripInlineInternalLinkMarkers(text: string): string {
  return text.replace(MARKER_STRIP_PATTERN, "$2");
}

export function renderInlineInternalLinks(
  text: string,
  linkClassName = DEFAULT_INLINE_INTERNAL_LINK_CLASS,
): ReactNode {
  const pattern = new RegExp(MARKER_PATTERN.source, MARKER_PATTERN.flags);
  if (!pattern.test(text)) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const href = match[1];
    const label = match[2];
    nodes.push(
      <Link key={`${match.index}-${href}`} className={linkClassName} href={href}>
        {label}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  if (nodes.length === 0) {
    return text;
  }

  return (
    <>
      {nodes.map((node, index) => (
        <Fragment key={index}>{node}</Fragment>
      ))}
    </>
  );
}
