export const NON_HTML_NOINDEX_HEADER = {
  key: "X-Robots-Tag",
  value: "noindex",
} as const;

type HeaderRule = {
  source: string;
  headers: { key: string; value: string }[];
};

/**
 * Response headers for static assets and machine-readable files that should
 * remain fetchable but should not appear as separate URLs in search indexes.
 */
export function nonHtmlNoindexHeaderRules(): HeaderRule[] {
  const withNoindex = (source: string): HeaderRule => ({
    source,
    headers: [{ ...NON_HTML_NOINDEX_HEADER }],
  });

  return [
    withNoindex("/_next/static/:path*"),
    withNoindex("/favicon.ico"),
    withNoindex("/favicon-v3.ico"),
    withNoindex("/apple-touch-icon.png"),
    withNoindex("/icon-192.png"),
    withNoindex("/icon-512.png"),
    withNoindex("/maskable-icon-512.png"),
    withNoindex("/icon.svg"),
    withNoindex("/:path*.md"),
    withNoindex("/:path*.csv"),
    withNoindex("/:path*.json"),
    withNoindex("/data/:path*"),
    withNoindex("/.well-known/:path*"),
  ];
}
