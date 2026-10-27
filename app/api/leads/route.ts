import { isSameOrigin, jsonError } from "../../../lib/http";
import {
  checkPublicApiRateLimit,
  clientIpFromRequest,
} from "../../../lib/public-api-guard";

export const runtime = "nodejs";

const LEAD_RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/u;

// Smallest opt-in: email the owner each lead via Resend (already configured
// for run notifications). Resend's sent log is the durable proof per lead.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Cross-origin request rejected.", 403, "invalid_origin");
  }
  const rate = checkPublicApiRateLimit(
    `leads:${clientIpFromRequest(request)}`,
    LEAD_RATE_LIMIT,
  );
  if (!rate.allowed) {
    return Response.json(
      { error: "Too many requests. Try again later.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    email?: unknown; website?: unknown; score?: unknown; utm?: unknown;
    company_url?: unknown;
  } | null;
  // Honeypot: real users never see this field. Accept silently, send nothing.
  if (typeof body?.company_url === "string" && body.company_url.trim() !== "") {
    return Response.json({ ok: true });
  }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email)) {
    return jsonError("Enter a valid email.", 400, "invalid_email");
  }
  const website = String(body?.website ?? "").slice(0, 200);
  const score = String(body?.score ?? "").slice(0, 8);
  const utm = String(body?.utm ?? "").slice(0, 300);

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RUN_NOTIFICATION_FROM_EMAIL?.trim();
  const to = process.env.LEAD_NOTIFY_EMAIL?.trim();
  if (!apiKey || !from || !to) {
    console.error("lead_capture_not_configured", { email, website });
    return jsonError("Opt-in is not available right now.", 503, "not_configured");
  }

  const text = `New checker opt-in\nEmail: ${email}\nWebsite: ${website}\nReadiness score: ${score}\nUTM: ${utm}\nAt: ${new Date().toISOString()}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [to], reply_to: email,
      subject: `[100Q lead] ${email} (${website || "no site"})`,
      text,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    return jsonError("Could not save your email. Try again.", 502, "provider_error");
  }
  return Response.json({ ok: true });
}
