import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const DEFAULT_SITE_URL = "https://100questionsai.com";
export const DEFAULT_SITEMAP_URL = `${DEFAULT_SITE_URL}/sitemap.xml`;
export const DEFAULT_INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY = "452cc09a3c7f4de49d7aa061865e6ef5";
export const INDEXNOW_KEY_LOCATION = `${DEFAULT_SITE_URL}/${INDEXNOW_KEY}.txt`;

const MAX_URLS = 10_000;

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

export function extractLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
    decodeXml(match[1].trim()),
  );
}

async function fetchText(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: { "user-agent": "100questions-indexnow/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Could not fetch ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

export async function collectSitemapUrls(
  sitemapUrl,
  { fetchImpl = fetch, visited = new Set() } = {},
) {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  const xml = await fetchText(sitemapUrl, fetchImpl);
  const locations = extractLocations(xml);

  if (/<sitemapindex\b/i.test(xml)) {
    const nested = await Promise.all(
      locations.map((location) =>
        collectSitemapUrls(location, { fetchImpl, visited }),
      ),
    );
    return [...new Set(nested.flat())];
  }

  return [...new Set(locations)];
}

export function validateUrls(urls, siteUrl = DEFAULT_SITE_URL) {
  const site = new URL(siteUrl);
  const unique = [...new Set(urls)];

  if (unique.length === 0) {
    throw new Error("The sitemap did not contain any URLs.");
  }

  if (unique.length > MAX_URLS) {
    throw new Error(
      `The sitemap contains ${unique.length} URLs; IndexNow accepts at most ${MAX_URLS} per request.`,
    );
  }

  for (const value of unique) {
    const url = new URL(value);
    if (url.origin !== site.origin) {
      throw new Error(`Refusing to submit a URL outside ${site.origin}: ${value}`);
    }
  }

  return unique;
}

export async function submitIndexNow({
  dryRun = false,
  endpoint = DEFAULT_INDEXNOW_ENDPOINT,
  fetchImpl = fetch,
  key = INDEXNOW_KEY,
  keyLocation = INDEXNOW_KEY_LOCATION,
  siteUrl = DEFAULT_SITE_URL,
  sitemapUrl = DEFAULT_SITEMAP_URL,
} = {}) {
  const hostedKey = (await fetchText(keyLocation, fetchImpl)).trim();
  if (hostedKey !== key) {
    throw new Error(`The hosted IndexNow key at ${keyLocation} does not match.`);
  }

  const urls = validateUrls(
    await collectSitemapUrls(sitemapUrl, { fetchImpl }),
    siteUrl,
  );

  if (dryRun) {
    return { dryRun: true, status: null, submitted: 0, urls };
  }

  const site = new URL(siteUrl);
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      "user-agent": "100questions-indexnow/1.0",
    },
    body: JSON.stringify({
      host: site.host,
      key,
      keyLocation,
      urlList: urls,
    }),
  });

  if (response.status !== 200 && response.status !== 202) {
    const responseBody = (await response.text()).trim();
    throw new Error(
      `IndexNow rejected the submission with HTTP ${response.status}${
        responseBody ? `: ${responseBody}` : ""
      }`,
    );
  }

  return {
    dryRun: false,
    status: response.status,
    submitted: urls.length,
    urls,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const result = await submitIndexNow({
    dryRun,
    endpoint: process.env.INDEXNOW_ENDPOINT || DEFAULT_INDEXNOW_ENDPOINT,
    siteUrl: process.env.INDEXNOW_SITE_URL || DEFAULT_SITE_URL,
    sitemapUrl: process.env.INDEXNOW_SITEMAP_URL || DEFAULT_SITEMAP_URL,
  });

  if (result.dryRun) {
    console.log(
      `[indexnow] dry run: validated ${result.urls.length} sitemap URLs; nothing submitted.`,
    );
    return;
  }

  console.log(
    `[indexnow] submitted ${result.submitted} URLs successfully (HTTP ${result.status}).`,
  );
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(`[indexnow] ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  });
}
