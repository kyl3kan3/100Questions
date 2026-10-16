import {
  checkPublicApiRateLimit,
  clientIpFromRequest,
  readMemoryCache,
  writeMemoryCache,
} from "@/lib/public-api-guard";
import { fetchPublicSiteReadinessWithFallback } from "@/lib/fetch-public-site-readiness";
import { jsonError } from "@/lib/http";
import {
  buildStartupVisibilityFromReadiness,
  cacheKeyForStartupVisibility,
  normalizeStartupVisibilityInput,
  type StartupChatgptVisibilityResult,
} from "@/lib/startup-chatgpt-visibility";

export const runtime = "nodejs";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FAILURE_CACHE_TTL_MS = 5 * 60 * 1000;
const IP_LIMIT_PER_MINUTE = 30;

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const rate = checkPublicApiRateLimit(`chatgpt-startup:${ip}`, {
    limit: IP_LIMIT_PER_MINUTE,
    windowMs: 60_000,
  });
  if (!rate.allowed) {
    return jsonError(
      "Too many checks from this network. Try again in a minute.",
      429,
      "rate_limited",
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { query?: unknown }
    | null;
  const rawQuery = typeof body?.query === "string" ? body.query.trim() : "";
  if (!rawQuery || rawQuery.length > 200) {
    return jsonError(
      "Enter a public domain or brand name.",
      400,
      "invalid_query",
    );
  }

  const normalized = normalizeStartupVisibilityInput(rawQuery);
  if (!normalized.inputLabel || !normalized.brandName) {
    return jsonError(
      "Enter a public domain or brand name.",
      400,
      "invalid_query",
    );
  }

  const cacheKey = cacheKeyForStartupVisibility(normalized.inputLabel);
  const cached = readMemoryCache<StartupChatgptVisibilityResult>(cacheKey);
  if (cached) {
    return jsonResponse(cached, { cached: true });
  }

  try {
    let result: StartupChatgptVisibilityResult;
    let cacheTtl = CACHE_TTL_MS;

    if (normalized.domain) {
      const outcome = await fetchPublicSiteReadinessWithFallback(
        normalized.domain,
      );
      result = buildStartupVisibilityFromReadiness(normalized, outcome.readiness, {
        fetchNote: outcome.fetchNote,
        resolvedDomain: outcome.resolvedDomain,
      });
      if (!outcome.homepageFetched) {
        cacheTtl = FAILURE_CACHE_TTL_MS;
      }
    } else {
      result = buildStartupVisibilityFromReadiness(normalized, null);
    }

    writeMemoryCache(cacheKey, result, cacheTtl);
    return jsonResponse(result, { cached: false });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_website") {
      return jsonError(
        "Enter a valid public website domain.",
        400,
        "invalid_website",
      );
    }
    console.warn("[chatgpt-startup-visibility] Check failed.", {
      query: normalized.inputLabel,
      message: error instanceof Error ? error.message : "unknown",
    });

    const fallback = buildStartupVisibilityFromReadiness(normalized, null, {
      fetchNote:
        "This domain could not be checked automatically. Add a public website or try again later — not a live ChatGPT test.",
    });
    writeMemoryCache(cacheKey, fallback, FAILURE_CACHE_TTL_MS);
    return jsonResponse(fallback, { cached: false });
  }
}

function jsonResponse(
  result: StartupChatgptVisibilityResult,
  meta: { cached: boolean },
) {
  return Response.json(
    {
      ...result,
      cache: meta.cached ? "hit" : "miss",
    },
    {
      headers: {
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
