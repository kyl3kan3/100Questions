import { parse as parseDomain } from "tldts";

import { analyzeAiReadiness, type AiReadinessResult } from "./ai-readiness";
import { normalizeCanonicalDomain } from "./ai/matching";
import {
  buildHomepageUrlCandidates,
  fetchPublicResourceFollowRedirects,
  PUBLIC_BROWSER_ACCEPT_HTML,
  PUBLIC_BROWSER_USER_AGENT,
} from "./public-site-http";

const MAX_HTML_BYTES = 768_000;
const MAX_TEXT_BYTES = 128_000;

export type SiteReadinessFetchOutcome = {
  readiness: AiReadinessResult | null;
  resolvedDomain: string | null;
  fetchNote: string | null;
  homepageFetched: boolean;
};

export async function fetchPublicSiteReadinessWithFallback(
  submittedWebsite: string,
): Promise<SiteReadinessFetchOutcome> {
  const hostname = normalizeCanonicalDomain(submittedWebsite);
  if (!hostname) {
    throw new Error("invalid_website");
  }

  const parsed = parseDomain(hostname, { allowPrivateDomains: false });
  if (!parsed.domain || parsed.isIp || parsed.isPrivate) {
    throw new Error("invalid_website");
  }

  const candidates = buildHomepageUrlCandidates(hostname);
  let lastError = "Website unavailable";

  for (const candidate of candidates) {
    try {
      const homepage = await fetchPublicResourceFollowRedirects({
        initialUrl: candidate,
        accept: PUBLIC_BROWSER_ACCEPT_HTML,
        maxBytes: MAX_HTML_BYTES,
        requireHtml: true,
      });

      const baseUrl = new URL(homepage.finalUrl);
      const sidecars = await fetchSidecarTexts(
        baseUrl,
        homepage.registrableDomain,
      );

      const readiness = analyzeAiReadiness({
        finalUrl: homepage.finalUrl,
        html: homepage.text,
        responseHeaders: homepage.response.headers,
        robotsText: sidecars.robotsText,
        sitemapFound: sidecars.sitemapFound,
        llmsText: sidecars.llmsText,
      });

      const resolvedHost = baseUrl.hostname.toLowerCase();
      const note =
        resolvedHost !== hostname.toLowerCase()
          ? `Homepage resolved to ${resolvedHost} after redirects (entered ${hostname}).`
          : null;

      return {
        readiness,
        resolvedDomain: resolvedHost,
        fetchNote: note,
        homepageFetched: true,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Website unavailable";
    }
  }

  const partial = await buildPartialOutcomeFromSidecars(hostname, parsed.domain, lastError);
  return partial;
}

/** @deprecated Use fetchPublicSiteReadinessWithFallback */
export async function fetchPublicSiteReadiness(submittedWebsite: string) {
  const outcome = await fetchPublicSiteReadinessWithFallback(submittedWebsite);
  if (!outcome.readiness) {
    throw new Error(outcome.fetchNote ?? "website_unavailable");
  }
  return outcome.readiness;
}

async function buildPartialOutcomeFromSidecars(
  enteredHostname: string,
  registrableDomain: string,
  homepageError: string,
): Promise<SiteReadinessFetchOutcome> {
  const hosts = buildHomepageUrlCandidates(enteredHostname).map(
    (url) => url.hostname,
  );
  const uniqueHosts = [...new Set(hosts.map((host) => host.toLowerCase()))];

  let robotsText: string | null = null;
  let llmsText: string | null = null;
  let sitemapFound = false;
  let anySidecar = false;

  for (const host of uniqueHosts) {
    const baseUrl = new URL(`https://${host}/`);
    const sidecars = await fetchSidecarTexts(baseUrl, registrableDomain);
    if (sidecars.robotsText) {
      robotsText = sidecars.robotsText;
      anySidecar = true;
    }
    if (sidecars.llmsText) {
      llmsText = sidecars.llmsText;
      anySidecar = true;
    }
    if (sidecars.sitemapFound) {
      sitemapFound = true;
      anySidecar = true;
    }
  }

  const blockedLikely =
    /returned 403|returned 401|returned 429|did not return HTML/i.test(
      homepageError,
    );

  const fetchNote = blockedLikely
    ? "The homepage blocked or challenged our automated fetch (common on high-traffic sites). Sidecar files below were checked where reachable — this is not a live ChatGPT test."
    : `We could not download the homepage HTML (${homepageError}). Sidecar checks ran where possible — not a live ChatGPT test.`;

  if (!anySidecar) {
    return {
      readiness: null,
      resolvedDomain: enteredHostname,
      fetchNote,
      homepageFetched: false,
    };
  }

  const readiness = analyzeAiReadiness({
    finalUrl: `https://${enteredHostname}/`,
    html: minimalPlaceholderHtml(enteredHostname),
    robotsText,
    sitemapFound,
    llmsText,
  });

  return {
    readiness: {
      ...readiness,
      score: Math.min(readiness.score, 45),
      grade: "Several readiness gaps",
      detected: {
        ...readiness.detected,
        title: null,
        description: null,
        h1: null,
      },
    },
    resolvedDomain: enteredHostname,
    fetchNote,
    homepageFetched: false,
  };
}

function minimalPlaceholderHtml(hostname: string) {
  return `<!doctype html><html><head><title>${hostname}</title></head><body></body></html>`;
}

async function fetchSidecarTexts(baseUrl: URL, registrableDomain: string) {
  const parsedFinal = parseDomain(baseUrl.hostname, { allowPrivateDomains: false });
  const domainForSidecars = parsedFinal.domain ?? registrableDomain;

  const [robots, standardSitemap, llms] = await Promise.all([
    fetchOptionalText(
      new URL("/robots.txt", baseUrl),
      domainForSidecars,
      "text/plain,*/*;q=0.2",
    ),
    fetchOptionalText(
      new URL("/sitemap.xml", baseUrl),
      domainForSidecars,
      "application/xml,text/xml,*/*;q=0.2",
    ),
    fetchOptionalText(
      new URL("/llms.txt", baseUrl),
      domainForSidecars,
      "text/plain,*/*;q=0.2",
    ),
  ]);

  let sitemapFound = isSitemap(standardSitemap?.text ?? "");
  if (!sitemapFound && robots?.text) {
    const declared = readDeclaredSitemap(robots.text, baseUrl, domainForSidecars);
    if (declared) {
      const declaredSitemap = await fetchOptionalText(
        declared,
        domainForSidecars,
        "application/xml,text/xml,*/*;q=0.2",
      );
      sitemapFound = isSitemap(declaredSitemap?.text ?? "");
    }
  }

  return {
    robotsText: robots?.text ?? null,
    llmsText: llms?.text ?? null,
    sitemapFound,
  };
}

async function fetchOptionalText(
  url: URL,
  registrableDomain: string,
  accept: string,
) {
  try {
    const parsed = parseDomain(url.hostname, { allowPrivateDomains: false });
    if (!parsed.domain || parsed.isPrivate) return null;

    const result = await fetchPublicResourceFollowRedirects({
      initialUrl: url,
      accept,
      maxBytes: MAX_TEXT_BYTES,
      requireHtml: false,
    });
    return result.response.ok ? result : null;
  } catch {
    return null;
  }
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

export { PUBLIC_BROWSER_USER_AGENT };
