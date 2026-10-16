import { parse as parseDomain } from "tldts";

import {
  fetchPinnedHttps,
  resolvePublicAddresses,
} from "./auth/public-network";
import type { FetchTimeBudget } from "./fetch-time-budget";

export const PUBLIC_BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export const PUBLIC_BROWSER_ACCEPT_HTML =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

export const DEFAULT_PUBLIC_FETCH_TIMEOUT_MS = 15_000;
export const DEFAULT_PUBLIC_MAX_REDIRECTS = 10;

export function buildHomepageUrlCandidates(hostname: string): URL[] {
  const seen = new Set<string>();
  const candidates: URL[] = [];

  const push = (host: string) => {
    const key = host.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(new URL(`https://${host}/`));
  };

  push(hostname);
  if (!hostname.startsWith("www.")) {
    push(`www.${hostname}`);
  }

  const withoutWww = hostname.replace(/^www\./iu, "");
  if (withoutWww !== hostname) {
    push(withoutWww);
  }

  return candidates;
}

export async function assertPublicHttpsUrl(url: URL) {
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  ) {
    throw new Error("Unsafe website URL");
  }

  const parsed = parseDomain(url.hostname, { allowPrivateDomains: false });
  if (!parsed.hostname || parsed.isIp || parsed.isPrivate) {
    throw new Error("Unsafe website URL");
  }

  return resolvePublicAddresses(url.hostname);
}

export type PublicFetchedResource = {
  response: Response;
  finalUrl: string;
  text: string;
  registrableDomain: string;
};

export async function fetchPublicResourceFollowRedirects(options: {
  initialUrl: URL;
  accept: string;
  maxBytes: number;
  requireHtml: boolean;
  timeoutMs?: number;
  maxRedirects?: number;
  budget?: FetchTimeBudget;
}): Promise<PublicFetchedResource> {
  const perHopCap = options.timeoutMs ?? DEFAULT_PUBLIC_FETCH_TIMEOUT_MS;
  const maxRedirects = options.maxRedirects ?? DEFAULT_PUBLIC_MAX_REDIRECTS;
  let currentUrl = options.initialUrl;

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    options.budget?.assertTimeRemaining();
    const timeoutMs =
      options.budget?.timeoutForNextHop(perHopCap) ?? perHopCap;

    const addresses = await assertPublicHttpsUrl(currentUrl);
    const response = await fetchPinnedHttps(currentUrl, addresses, {
      headers: {
        accept: options.accept,
        "accept-encoding": "identity",
        "accept-language": "en-US,en;q=0.9",
        "user-agent": PUBLIC_BROWSER_USER_AGENT,
      },
      timeoutMs,
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirectCount === maxRedirects) {
        throw new Error("Redirect could not be followed");
      }
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (!response.ok) {
      throw new Error(`Website returned ${response.status}`);
    }

    if (options.requireHtml) {
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("text/html")) {
        throw new Error("Website did not return HTML");
      }
    }

    const parsed = parseDomain(currentUrl.hostname, { allowPrivateDomains: false });
    if (!parsed.domain) {
      throw new Error("Unsafe website URL");
    }

    return {
      response,
      finalUrl: currentUrl.href,
      text: await readLimitedText(response, options.maxBytes),
      registrableDomain: parsed.domain,
    };
  }

  throw new Error("Too many redirects");
}

export async function readLimitedText(response: Response, maxBytes: number) {
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
