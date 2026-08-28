# Search Console baseline and indexing checklist

Prepared: August 20, 2026
Updated: August 28, 2026
Property: `https://100questionsai.com/`

## Current access state

Search Console performance and URL Inspection data were not available to this workspace. The connected Google-platform account reports Search Console as not connected, and the available SEO connector requires a paid plan for performance exports. No `site:` query was used as indexing evidence.

The implementation therefore preserves every valuable URL and defers consolidation or redirect decisions until page-and-query evidence exists.

## Two URL inspections required after deployment

In Google Search Console, open **URL inspection**, use the exact canonical URL, and record the following fields for each:

1. `https://100questionsai.com/aeo-vs-geo`
2. `https://100questionsai.com/ai-search-visibility-tool`

Record:

- URL is on Google: yes/no
- Indexing status and reason
- Last crawl date
- Crawled as
- Page fetch status
- Indexing allowed
- User-declared canonical
- Google-selected canonical
- Referring sitemaps
- Enhancements detected
- Live test result after the production deployment

If the live test passes and an updated page is not indexed, use **Request indexing** once. Do not repeatedly request indexing or interpret a successful request as a guarantee of inclusion.

## Performance export

Use **Search results → Performance** with:

- Search type: Web
- Country: United States
- Date: last 3 complete months, plus a comparison with the preceding 3 months
- Include: clicks, impressions, CTR, and average position
- Export both the **Queries** and **Pages** tables as CSV
- If available, also export a query-by-page table through the Search Console API or Looker Studio connector

Run three query-regex filters and export each result:

```text
(?i)(ai visibility audit|ai search visibility tool|chatgpt seo tool)
(?i)(ai search optimization|answer engine optimization|generative engine optimization|llm seo|ai visibility)
(?i)(ai seo tools|ai visibility tools|answer engine optimization tools)
```

Also export exact and close variants for:

```text
(?i)(aeo vs geo|geo vs aeo|aeo seo|what is aeo in marketing)
```

## Query-to-page baseline

Populate `SEO_QUERY_PAGE_BASELINE.csv` from the exports. Keep one row per query and landing page; do not combine pages before checking whether they have distinct conversion roles.

Flag a potential overlap only when all are true:

- the same material query appears for two or more mapped URLs;
- impressions are meaningfully split across repeated periods rather than one short fluctuation;
- neither page consistently wins clicks, CTR, position, or conversions;
- the pages do not serve distinct intent in `SEO_INTENT_MAP.md`;
- a rewrite and contextual-link test has already had time to be crawled and measured.

Only then consider consolidation or a redirect. Until then, improve the page with the weaker intent match and keep self-canonicals intact.

## Commercial measurement

For each organic landing page, pair Search Console data with analytics and checkout data:

- organic landing-page sessions
- checkout starts
- completed introductory-audit purchases
- audits purchased per organic landing-page session
- sample-report views and assisted purchases

Traffic alone is not the success criterion. The primary commercial rate is completed audits divided by organic landing-page sessions for the mapped page.

## AI referral and machine-discovery measurement

The site records an `ai_referral_landing` event when the browser referrer or
`utm_source` identifies ChatGPT, Perplexity, Claude, Copilot, Gemini, or You.com.
Report sessions, checkout starts, and purchases by the event's `source` and
`landing_path` properties. Direct visits with stripped referrers remain
unattributed; do not relabel them as AI traffic without campaign parameters.

The free technical checker records `readiness_check_completed` with the score
and pass count. Server-side machine-resource requests are logged separately as
`machine_discovery_request`, including the requested path, representation, and
recognized crawler client. Treat crawler access as discovery telemetry, not as
evidence that a page was indexed, cited, or recommended.
