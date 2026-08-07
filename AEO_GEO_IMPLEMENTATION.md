# AEO/GEO implementation record

This repository adapts Microsoft's retail-oriented [AEO/GEO guidance](https://about.ads.microsoft.com/en/blog/post/january-2026/from-discovery-to-influence-a-guide-to-geo) to a prepaid SaaS benchmark.

## Implemented

- The homepage publishes one JSON-LD entity typed as both `Product` and `SoftwareApplication`, with `Offer`, `Brand`, `ImageObject`, language, currency, SKU, online availability, features, audience, and `dateModified` data.
- Prices and offer descriptions come from the same billing package constants used by the visible pricing cards and checkout logic.
- Product features, best-fit use cases, limitations, and FAQs come from one shared facts module used by visible HTML and structured data.
- The FAQ page exposes every marked-up question and answer in server-rendered HTML.
- Comparison and alternatives pages use `ItemList`, show the compared products, cite their sources, and describe real tradeoffs.
- The global `Organization` and `Brand` entities link to public third-party profiles. The About page labels these accurately as independent references, not endorsements or reviews.
- Product images use descriptive alt text and `ImageObject` markup. There are no product videos requiring transcripts.
- The sitemap and `llms.txt` files expose the updated product facts, limitations, and canonical public pages.
- The post-deployment workflow validates the live raw HTML before sending the sitemap to IndexNow.

## Intentionally omitted

- `AggregateRating` and `Review` remain absent until genuine, attributable customer reviews are displayed publicly.
- GTIN, MPN, color, size, physical inventory, shipping, and product-condition fields do not describe this digital service.
- The first-purchase price is eligibility-based, not a time-limited promotion, so no fabricated promotion end date is published.
- Merchant Center feeds are not treated as a prerequisite for this SaaS service. Reassess feed eligibility if 100 Questions later sells a supported retail or agentic-commerce catalog.

## Validation

Run `npm run discovery:validate` after deployment. It fetches the raw HTML for the primary product, FAQ, checker, and comparison pages; parses all JSON-LD; checks required entity types and fields; and verifies that marked-up features, prices, questions, answers, list entries, and entity links are visible without relying on client-side JavaScript.

Use Google Rich Results Test and Schema Markup Validator for an additional manual review after material schema changes. Rich-result eligibility is not the same thing as semantic validity or AI recommendation eligibility.
