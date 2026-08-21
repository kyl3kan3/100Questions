import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const DEFAULT_BASE_URL = "https://100questionsai.com";

export const PAGE_REQUIREMENTS = [
  {
    path: "/",
    types: [
      "Organization",
      "Person",
      "Brand",
      "WebSite",
      "WebPage",
      "Product",
    ],
  },
  { path: "/about", types: ["AboutPage", "Brand"] },
  { path: "/faq", types: ["FAQPage", "Brand"] },
  {
    path: "/chatgpt-seo-tool",
    types: ["Product", "Brand"],
  },
  {
    path: "/ai-visibility-checker",
    types: ["Service", "Brand"],
  },
  {
    path: "/ai-search-visibility-tool",
    types: ["Product", "Brand"],
  },
  {
    path: "/ai-brand-risk-checker",
    types: ["Service", "Brand"],
  },
  {
    path: "/llms-txt-checker",
    types: ["Service", "Brand"],
  },
  {
    path: "/mcp",
    types: ["WebPage", "WebAPI"],
  },
  {
    path: "/ai-visibility-audit",
    types: ["Service", "Brand"],
  },
  {
    path: "/ai-visibility-tools",
    types: ["Article", "ItemList", "Brand"],
  },
  {
    path: "/ai-seo-tools",
    types: ["Article", "ItemList", "Brand"],
  },
  {
    path: "/how-to-get-chatgpt-to-recommend-your-business",
    types: ["Article", "Brand"],
  },
  {
    path: "/answer-engine-optimization-tools",
    types: ["Article", "ItemList", "Brand"],
  },
  {
    path: "/peec-ai-alternative",
    types: ["Article", "ItemList", "Brand"],
  },
];

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function normalizeText(value) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

export function visibleText(html) {
  return normalizeText(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

export function extractJsonLdNodes(html) {
  const documents = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(scriptPattern)) {
    if (!/\btype=["']application\/ld\+json["']/i.test(match[1])) continue;
    documents.push(JSON.parse(decodeHtml(match[2]).trim()));
  }

  return documents.flatMap((document) => {
    if (Array.isArray(document)) return document;
    if (Array.isArray(document?.["@graph"])) return document["@graph"];
    return [document];
  });
}

export function nodeHasType(node, type) {
  const value = node?.["@type"];
  return Array.isArray(value) ? value.includes(type) : value === type;
}

function requireNode(nodes, type, path) {
  const node = nodes.find((candidate) => nodeHasType(candidate, type));
  if (!node) throw new Error(`${path}: missing ${type} JSON-LD`);
  return node;
}

function assertVisible(text, value, path, label) {
  const normalizedValue = normalizeText(String(value));
  if (!text.includes(normalizedValue)) {
    throw new Error(`${path}: ${label} is in JSON-LD but not visible in raw HTML`);
  }
}

function validateFaq(nodes, text, path) {
  const faq = requireNode(nodes, "FAQPage", path);
  if (!Array.isArray(faq.mainEntity) || faq.mainEntity.length === 0) {
    throw new Error(`${path}: FAQPage has no questions`);
  }

  for (const question of faq.mainEntity) {
    assertVisible(text, question.name, path, `FAQ question "${question.name}"`);
    assertVisible(
      text,
      question.acceptedAnswer?.text,
      path,
      `FAQ answer for "${question.name}"`,
    );
  }
}

function validateItemList(nodes, text, path) {
  const list = requireNode(nodes, "ItemList", path);
  if (!Array.isArray(list.itemListElement) || list.itemListElement.length < 2) {
    throw new Error(`${path}: ItemList must contain at least two entries`);
  }

  for (const item of list.itemListElement) {
    assertVisible(text, item.name, path, `ItemList entry "${item.name}"`);
  }
}

function formatVisibleUsd(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function validateProduct(nodes, text, path) {
  const product = requireNode(nodes, "Product", path);

  for (const field of ["sku", "category", "dateModified"]) {
    if (!product[field]) throw new Error(`${path}: Product is missing ${field}`);
  }
  const imageUrl =
    typeof product.image === "string"
      ? product.image
      : product.image?.contentUrl || product.image?.url;
  if (!imageUrl) {
    throw new Error(`${path}: Product is missing a crawlable image`);
  }
  if (!Array.isArray(product.featureList) || product.featureList.length < 4) {
    throw new Error(`${path}: Product featureList is incomplete`);
  }
  for (const feature of product.featureList) {
    assertVisible(text, feature, path, `product feature "${feature}"`);
  }

  const offers = Array.isArray(product.offers?.offers)
    ? product.offers.offers
    : product.offers
      ? [product.offers]
      : [];
  if (!Array.isArray(offers) || offers.length === 0) {
    throw new Error(`${path}: Product has no concrete offers`);
  }
  for (const offer of offers) {
    if (
      offer.priceCurrency !== "USD" ||
      offer.price === undefined ||
      !offer.sku
    ) {
      throw new Error(`${path}: Offer is missing price, USD currency, or SKU`);
    }
    if (offer.availability !== "https://schema.org/OnlineOnly") {
      throw new Error(`${path}: Offer availability is not OnlineOnly`);
    }
    assertVisible(
      text,
      formatVisibleUsd(offer.price),
      path,
      `offer price ${offer.price}`,
    );
  }

}

function validateSoftwareApplicationEligibility(nodes, path) {
  const softwareTypes = [
    "SoftwareApplication",
    "WebApplication",
    "MobileApplication",
  ];

  for (const node of nodes) {
    if (!softwareTypes.some((type) => nodeHasType(node, type))) continue;
    if (!node.aggregateRating && !node.review) {
      throw new Error(
        `${path}: Google-targeted software app schema needs a genuine aggregateRating or review; remove the software app type when none exists`,
      );
    }
  }
}

function validateBrand(nodes, html, path) {
  const brand = requireNode(nodes, "Brand", path);
  if (!Array.isArray(brand.sameAs) || brand.sameAs.length < 3) {
    throw new Error(`${path}: Brand needs at least three independent entity references`);
  }

  // The About page is the human-readable corroboration surface. Requiring
  // every sitewide Brand node to repeat directory links would force noisy
  // global navigation and weaken the site's information hierarchy.
  if (path === "/about") {
    for (const profile of brand.sameAs) {
      if (!html.includes(profile)) {
        throw new Error(`${path}: Brand sameAs URL is not linked in raw HTML: ${profile}`);
      }
    }
  }
}

export function validateDiscoveryPage({ html, path, requiredTypes }) {
  const nodes = extractJsonLdNodes(html);
  if (nodes.length === 0) throw new Error(`${path}: no JSON-LD found`);
  const text = visibleText(html);

  for (const type of requiredTypes) requireNode(nodes, type, path);
  validateSoftwareApplicationEligibility(nodes, path);
  if (requiredTypes.includes("FAQPage")) validateFaq(nodes, text, path);
  if (requiredTypes.includes("ItemList")) validateItemList(nodes, text, path);
  if (requiredTypes.includes("Product")) validateProduct(nodes, text, path);
  if (requiredTypes.includes("Brand")) validateBrand(nodes, html, path);

  return { nodes: nodes.length, types: requiredTypes.length };
}

export async function runDiscoveryValidation({
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = fetch,
  requirements = PAGE_REQUIREMENTS,
} = {}) {
  const results = [];

  for (const requirement of requirements) {
    const url = new URL(requirement.path, baseUrl);
    const response = await fetchImpl(url, {
      headers: { "user-agent": "100questions-discovery-validator/1.0" },
    });
    if (!response.ok) {
      throw new Error(`${requirement.path}: HTTP ${response.status}`);
    }
    const html = await response.text();
    const result = validateDiscoveryPage({
      html,
      path: requirement.path,
      requiredTypes: requirement.types,
    });
    results.push({ path: requirement.path, ...result });
  }

  return results;
}

async function main() {
  const results = await runDiscoveryValidation({
    baseUrl: process.env.DISCOVERY_BASE_URL || DEFAULT_BASE_URL,
  });
  const nodeCount = results.reduce((sum, result) => sum + result.nodes, 0);
  console.log(
    `[discovery] validated ${results.length} raw HTML pages and ${nodeCount} JSON-LD nodes.`,
  );
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(
      `[discovery] ${error instanceof Error ? error.message : error}`,
    );
    process.exitCode = 1;
  });
}
