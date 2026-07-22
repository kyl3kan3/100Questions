import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

import { parse as parseDomain } from "tldts";

import { normalizeCanonicalDomain } from "@/lib/ai/matching";
import {
  buildAppStoreSuggestion,
  parseAppStoreListingUrl,
  type AppStoreLookupResult,
} from "@/lib/app-store-preview";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 256_000;
const MAX_REDIRECTS = 4;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }

  const user = await getAuthenticatedUser();
  if (!user) return jsonError("Sign in to continue.", 401, "unauthorized");

  const body = (await request.json().catch(() => null)) as
    | { subjectName?: unknown; canonicalDomain?: unknown }
    | null;
  const subjectName = typeof body?.subjectName === "string" ? body.subjectName.trim() : "";
  const submittedLocation =
    typeof body?.canonicalDomain === "string" ? body.canonicalDomain.trim() : "";
  const hostname =
    submittedLocation ? normalizeCanonicalDomain(submittedLocation) : null;

  if (!subjectName || !hostname) {
    return jsonError("Enter a valid brand name and public domain.", 400, "invalid_subject");
  }

  const parsed = parseDomain(hostname, { allowPrivateDomains: false });
  if (!parsed.domain || parsed.isIp || parsed.isPrivate) {
    return jsonError("Enter a public website domain.", 400, "invalid_domain");
  }

  try {
    const appStoreListing = parseAppStoreListingUrl(submittedLocation);
    if (appStoreListing) {
      const appSuggestion = await lookupAppStoreListing(
        appStoreListing.id,
        appStoreListing.country,
        subjectName,
      );
      if (appSuggestion) {
        return Response.json({
          ...appSuggestion,
          sourceUrl: appSuggestion.sourceUrl ?? appStoreListing.url,
          populated: true,
          sourceType: "app-store",
        });
      }
    }

    const submittedUrl = normalizeSubmittedUrl(submittedLocation, hostname);
    const { response, finalUrl } = await fetchHomepage(submittedUrl, parsed.domain);
    const html = await readLimitedHtml(response);
    const description =
      readMeta(html, "description") ||
      readMeta(html, "og:description") ||
      readMeta(html, "twitter:description") ||
      readJsonLdString(html, "description");
    const siteName =
      readMeta(html, "og:site_name") ||
      readJsonLdString(html, "alternateName") ||
      readJsonLdString(html, "name");
    const title = readTitle(html);
    const aliases = [
      ...new Set(
        [subjectName, cleanText(siteName), cleanTitle(title)]
          .filter(Boolean)
          .filter((value) => value.length <= 120),
      ),
    ].slice(0, 6);
    const cleanDescription = cleanText(description).slice(0, 2_000);

    return Response.json({
      description: cleanDescription,
      aliases,
      sourceUrl: finalUrl,
      populated: Boolean(cleanDescription || aliases.length > 1),
      sourceType: "website",
    });
  } catch (error) {
    console.warn("[subject-preview] Homepage metadata unavailable.", {
      hostname,
      message: error instanceof Error ? error.message : "Unknown preview failure",
    });
    return Response.json({
      description: "",
      aliases: [subjectName],
      sourceUrl: null,
      populated: false,
    });
  }
}

async function lookupAppStoreListing(
  id: string,
  country: string,
  subjectName: string,
) {
  const lookupUrl = new URL("https://itunes.apple.com/lookup");
  lookupUrl.searchParams.set("id", id);
  lookupUrl.searchParams.set("country", country);
  lookupUrl.searchParams.set("entity", "software");
  const response = await fetch(lookupUrl, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    resultCount?: number;
    results?: AppStoreLookupResult[];
  };
  const result = payload.results?.find(
    (item) => item.wrapperType === "software" || item.kind === "software",
  );
  return result ? buildAppStoreSuggestion(result, subjectName) : null;
}

function normalizeSubmittedUrl(value: string, hostname: string) {
  const candidate = /^[a-z][a-z\d+.-]*:\/\//iu.test(value)
    ? value
    : `https://${value}`;
  try {
    const url = new URL(candidate);
    url.hash = "";
    return url;
  } catch {
    return new URL(`https://${hostname}`);
  }
}

async function fetchHomepage(initialUrl: URL, registrableDomain: string) {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertSafePublicUrl(currentUrl, registrableDomain);
    const response = await fetch(currentUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 (compatible; 100QuestionsBot/1.0; +https://100questionsai.com)",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new Error("Homepage redirect could not be followed");
      }
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (!response.ok) throw new Error("Homepage unavailable");
    return { response, finalUrl: currentUrl.href };
  }

  throw new Error("Too many homepage redirects");
}

async function assertSafePublicUrl(url: URL, registrableDomain: string) {
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  ) {
    throw new Error("Unsafe homepage URL");
  }

  const parsed = parseDomain(url.hostname, { allowPrivateDomains: false });
  if (parsed.domain !== registrableDomain || parsed.isIp || parsed.isPrivate) {
    throw new Error("Cross-domain homepage redirect rejected");
  }

  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Unsafe homepage address");
  }
}

async function readLimitedHtml(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLocaleLowerCase("en-US").includes("text/html")) {
    throw new Error("Homepage did not return HTML");
  }

  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_HTML_BYTES) throw new Error("Homepage too large");
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let html = "";
  while (bytesRead < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (bytesRead >= MAX_HTML_BYTES) {
      await reader.cancel();
      break;
    }
  }
  return html.slice(0, MAX_HTML_BYTES);
}

function readMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const direct = new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "iu").exec(html)?.[1];
  const reversed = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "iu").exec(html)?.[1];
  return direct ?? reversed ?? "";
}

function readTitle(html: string) {
  return /<title[^>]*>([^<]*)<\/title>/iu.exec(html)?.[1] ?? "";
}

function readJsonLdString(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = new RegExp(`"${escaped}"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")`, "iu").exec(html)?.[1];
  if (!match) return "";
  try {
    const value = JSON.parse(match) as unknown;
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
}

function cleanTitle(value: string) {
  return cleanText(value).split(/\s+[|—–-]\s+/u)[0]?.trim() ?? "";
}

function cleanText(value: string) {
  return value
    .replace(/&amp;/giu, "&")
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/\s+/gu, " ")
    .trim();
}

function isPrivateAddress(address: string) {
  if (isIP(address) === 4) {
    const [a = 0, b = 0] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }

  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("::ffff:127.") || normalized.startsWith("::ffff:10.") || normalized.startsWith("::ffff:192.168.");
}
