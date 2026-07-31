import { describe, expect, it } from "vitest";

import { resolvePostAuthPath } from "./post-auth-path";

describe("resolvePostAuthPath", () => {
  it("prefers a safe internal next path", () => {
    expect(
      resolvePostAuthPath({ next: "/dashboard?buy=intro", packageId: "three" }),
    ).toBe("/dashboard?buy=intro");
  });

  it("rejects protocol-relative and external next paths", () => {
    expect(resolvePostAuthPath({ next: "//evil.example" })).toBe("/dashboard");
    expect(resolvePostAuthPath({ next: "https://evil.example" })).toBe(
      "/dashboard",
    );
  });

  it("maps a known package to dashboard buy intent", () => {
    expect(resolvePostAuthPath({ packageId: "intro" })).toBe(
      "/dashboard?buy=intro",
    );
    expect(resolvePostAuthPath({ packageId: "three" })).toBe(
      "/dashboard?buy=three",
    );
  });

  it("ignores unknown packages", () => {
    expect(resolvePostAuthPath({ packageId: "nope" })).toBe("/dashboard");
  });
});
