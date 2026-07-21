import { describe, expect, it } from "vitest";

import { buildRunNotificationContent } from "./run-notification-content";

describe("run notification content", () => {
  it("builds a completion email without internal cost information", () => {
    const content = buildRunNotificationContent({
      subjectName: "Acme",
      status: "complete",
      runUrl: "https://100questionsai.com/runs/run-123",
    });

    expect(content.subject).toBe("Acme: benchmark is ready");
    expect(content.text).toContain("Review your benchmark");
    expect(content.html).toContain("Review benchmark");
    expect(`${content.text}${content.html}`).not.toMatch(/cost|\$\d/u);
  });

  it("escapes user-controlled brand names in HTML", () => {
    const content = buildRunNotificationContent({
      subjectName: "<script>alert('x')</script>",
      status: "partial",
      runUrl: "https://100questionsai.com/runs/run-123",
    });

    expect(content.html).not.toContain("<script>");
    expect(content.html).toContain("&lt;script&gt;");
  });
});
