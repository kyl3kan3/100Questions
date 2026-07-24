import { parse as parseDomain } from "tldts";

import { analyzeAiReadiness } from "@/lib/ai-readiness";
import { normalizeCanonicalDomain } from "@/lib/ai/matching";
import {
  fetchPinnedHttps,
  resolvePublicAddresses,
} from "@/lib/auth/public-network";
import { isSameOrigin, jsonError } from "@/lib/http";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 512_000;
const MAX_TEXT_BYTES = 128_000;
const MAX_REDIRECTS = 4;
const FETCH_TIMEOUT_MS = 8_000;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }

  const body = (await request.json().catch(() => null)) as
    | { website?: unknown }
    | null;
  const submittedWebsite =
    typeof body?.website === "string" ? body.website.trim() : "";
  if (!submittedWebsite || submittedWebsite.length > 500) {
    return jsonError(
      "Enter a public website domain.",
      400,
      "invalid_website",
    );
  }

  const hostname = normalizeCanonicalDomain(submittedWebsite);
  if (!hostname) {
    return jsonError(
      "Enter a valid public website domain.",
      400,
      "invalid_website",
    );
  }

  const parsed = parseDomain(hostname, { allowPrivateDomains: false });
  if (!parsed.domain || parsed.isIp || parsed.isPrivate) {
    return jsonError(
      "Enter a valid public website domain.",
      400,
      "invalid_website",
    );
  }

  try {
    const homepage = await fetchPublicResource(
      new URL(`https://${hostname}/`),
      parsed.domain,
      "text/html,application/xhtml+xml",
      MAX_HTML_BYTES,
      true,
    );
    const baseUrl = new URL(homepage.finalUrl);

    const [robots, standardSitemap, llms] = await Promise.all([
      fetchOptionalText(
        new URL("/robots.txt", baseUrl),
        parsed.domain,
        "text/plain,*/*;q=0.2",
      ),
      fetchOptionalText(
        new URL("/sitemap.xml", baseUrl),
        parsed.domain,
        "application/xml,text/xml,*/*;q=0.2",
      ),
      fetchOptionalText(
        new URL("/llms.txt", baseUrl),
        parsed.domain,
        "text/plain,*/*;q=0.2",
      ),
    ]);

    let sitemapFound = isSitemap(standardSitemap?.text ?? "");
    if (!sitemapFound && robots?.text) {
      const declared = readDeclaredSitemap(robots.text, baseUrl, parsed.domain);
      if (declared) {
        const declaredSitemap = await fetchOptionalText(
          declared,
          parsed.domain,
          "application/xml,text/xml,*/*;q=0.2",
        );
        sitemapFound = isSitemap(declaredSitemap?.text ?? "");
      }
    }

    const result = analyzeAiReadiness({
      finalUrl: homepage.finalUrl,
      html: homepage.text,
      responseHeaders: homepage.response.headers,
      robotsText: robots?.text ?? null,
      sitemapFound,
      llmsText: llms?.text ?? null,
    });

    return Response.json(result, {
      headers: {
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    console.warn("[ai-readiness] Public site check failed.", {
      hostname,
      message: error instanceof Error ? error.message : "Unknown check failure",
    });
    return jsonError(
      "We could not fetch that website over HTTPS. Check the domain and try again.",
      422,
      "website_unavailable",
    );
  }
}

async function fetchOptionalText(
  url: URL,
  registrableDomain: string,
  accept: string,
) {
  try {
    const result = await fetchPublicResource(
      url,
      registrableDomain,
      accept,
      MAX_TEXT_BYTES,
      false,
    );
    return result.response.ok ? result : null;
  } catch {
    return null;
  }
}

async function fetchPublicResource(
  initialUrl: URL,
  registrableDomain: string,
  accept: string,
  maxBytes: number,
  requireHtml: boolean,
) {
  let currentUrl = initialUrl;

  for (
    let redirectCount = 0;
    redirectCount <= MAX_REDIRECTS;
    redirectCount += 1
  ) {
    const addresses = await assertSafePublicUrl(currentUrl, registrableDomain);
    const response = await fetchPinnedHttps(currentUrl, addresses, {
      headers: {
        accept,
        "accept-encoding": "identity",
        "user-agent":
          "Mozilla/5.0 (compatible; 100QuestionsReadinessBot/1.0; +https://100questionsai.com/ai-visibility-checker)",
      },
      timeoutMs: FETCH_TIMEOUT_MS,
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new Error("Redirect could not be followed");
      }
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (!response.ok) throw new Error(`Website returned ${response.status}`);
    if (requireHtml) {
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("text/html")) {
        throw new Error("Website did not return HTML");
      }
    }

    return {
      response,
      finalUrl: currentUrl.href,
      text: await readLimitedText(response, maxBytes),
    };
  }

  throw new Error("Too many redirects");
}

async function assertSafePublicUrl(url: URL, registrableDomain: string) {
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  ) {
    throw new Error("Unsafe website URL");
  }

  const parsed = parseDomain(url.hostname, { allowPrivateDomains: false });
  if (parsed.domain !== registrableDomain || parsed.isIp || parsed.isPrivate) {
    throw new Error("Cross-domain redirect rejected");
  }

  return resolvePublicAddresses(url.hostname);
}

async function readLimitedText(response: Response, maxBytes: number) {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new Error("Website response too large");
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";

  while (bytesRead < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    text += decoder.decode(value, { stream: true });
    if (bytesRead >= maxBytes) {
      await reader.cancel();
      break;
    }
  }

  return text.slice(0, maxBytes);
}

function readDeclaredSitemap(
  robotsText: string,
  baseUrl: URL,
  registrableDomain: string,
) {
  for (const match of robotsText.matchAll(/^\s*sitemap:\s*(\S+)/gimu)) {
    try {
      const candidate = new URL(match[1], baseUrl);
      const parsed = parseDomain(candidate.hostname, {
        allowPrivateDomains: false,
      });
      if (
        candidate.protocol === "https:" &&
        parsed.domain === registrableDomain &&
        !candidate.username &&
        !candidate.password
      ) {
        return candidate;
      }
    } catch {
      // Ignore malformed sitemap declarations.
    }
  }
  return null;
}

function isSitemap(value: string) {
  return /<(?:urlset|sitemapindex)\b/iu.test(value);
}
