import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

function leadRequest(body: unknown, ip = "203.0.113.1") {
  return new Request("https://100questionsai.com/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/leads", () => {
  const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));

  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("RUN_NOTIFICATION_FROM_EMAIL", "100 Questions <n@100questionsai.com>");
    vi.stubEnv("LEAD_NOTIFY_EMAIL", "owner@example.com");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects an invalid email", async () => {
    const res = await POST(leadRequest({ email: "nope" }, "203.0.113.10"));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a valid lead to the owner", async () => {
    const res = await POST(
      leadRequest({ email: "Buyer@Agency.com", website: "agency.com" }, "203.0.113.11"),
    );
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("silently drops honeypot submissions", async () => {
    const res = await POST(
      leadRequest({ email: "bot@spam.com", company_url: "http://spam" }, "203.0.113.12"),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rate limits per IP after 5 requests", async () => {
    const ip = "203.0.113.13";
    for (let i = 0; i < 5; i += 1) {
      expect((await POST(leadRequest({ email: `a${i}@b.co` }, ip))).status).toBe(200);
    }
    const blocked = await POST(leadRequest({ email: "a9@b.co" }, ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
    const otherIp = await POST(leadRequest({ email: "c@d.co" }, "203.0.113.14"));
    expect(otherIp.status).toBe(200);
  });
});
