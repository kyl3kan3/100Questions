import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

import { parse as parseDomain } from "tldts";

import { normalizeCanonicalDomain } from "@/lib/ai/matching";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 256_000;

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
  const hostname =
    typeof body?.canonicalDomain === "string"
      ? normalizeCanonicalDomain(body.canonicalDomain)
      : null;

  if (!subjectName || !hostname) {
    return jsonError("Enter a valid brand name and public domain.", 400, "invalid_subject");
  }

  const parsed = parseDomain(hostname, { allowPrivateDomains: false });
  if (!parsed.domain || parsed.isIp || parsed.isPrivate) {
    return jsonError("Enter a public website domain.", 400, "invalid_domain");
  }

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
      return jsonError("That domain cannot be previewed.", 400, "unsafe_domain");
    }

    const response = await fetch(`https://${hostname}`, {
      headers: { "user-agent": "100QuestionsBot/1.0 (+https://100questions.ai)" },
      redirect: "manual",
      signal: AbortSignal.timeout(6_000),
    });

    if (!response.ok) throw new Error("Homepage unavailable");
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_HTML_BYTES) throw new Error("Homepage too large");
    const html = (await response.text()).slice(0, MAX_HTML_BYTES);
    const description = readMeta(html, "description") || readMeta(html, "og:description");
    const siteName = readMeta(html, "og:site_name");
    const title = readTitle(html);

    return Response.json({
      description: cleanText(description).slice(0, 2_000),
      aliases: [...new Set([subjectName, cleanText(siteName), cleanTitle(title)].filter(Boolean))].slice(0, 6),
    });
  } catch {
    return Response.json({ description: "", aliases: [subjectName] });
  }
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
