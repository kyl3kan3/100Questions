import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const scriptPath = join(process.cwd(), "scripts", "deploy-migrate.mjs");

function runScript(env: Record<string, string | undefined>) {
  const base = { ...process.env };
  // Guarantee a clean slate: the local shell may export either variable.
  delete base.VERCEL_ENV;
  delete base.DATABASE_URL;

  return spawnSync(process.execPath, [scriptPath], {
    encoding: "utf8",
    env: { ...base, ...env },
  });
}

describe("deploy-time migrations", () => {
  it("runs migrations ahead of the production build", () => {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    );

    // Vercel prefers `vercel-build` over `build`, which keeps a local
    // `npm run build` from ever reaching a real database.
    const vercelBuild: string = pkg.scripts["vercel-build"];
    expect(vercelBuild).toBe("node scripts/deploy-migrate.mjs && next build");
    expect(pkg.scripts.build).toBe("next build");
    expect(existsSync(scriptPath)).toBe(true);

    // `&&` is what makes the build abort when migrations fail; `;` or `||`
    // would let code ship ahead of its schema, which is the whole failure
    // mode this script exists to prevent.
    expect(vercelBuild.indexOf("deploy-migrate")).toBeLessThan(
      vercelBuild.indexOf("next build"),
    );
    expect(vercelBuild).toContain("&&");
  });

  it("fails a production build when DATABASE_URL is absent", () => {
    const result = runScript({ VERCEL_ENV: "production" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("DATABASE_URL is missing");
  });

  it("never migrates from preview or local builds", () => {
    for (const env of [
      { VERCEL_ENV: "preview", DATABASE_URL: "postgres://unused" },
      { VERCEL_ENV: "development", DATABASE_URL: "postgres://unused" },
      {},
    ]) {
      const result = runScript(env);

      // A preview branch carries unmerged migrations, and Vercel points every
      // environment at the same database, so migrating here would apply an
      // unreviewed schema change to production.
      expect(result.status).toBe(0);
      expect(result.stdout).toContain("skipping migrations");
      expect(result.stdout).not.toContain("applying pending migrations");
    }
  });

  it("reports build-time DATABASE_URL visibility so previews catch broken wiring", () => {
    expect(
      runScript({ VERCEL_ENV: "preview", DATABASE_URL: "postgres://unused" })
        .stdout,
    ).toContain("DATABASE_URL is readable at build time");

    expect(runScript({ VERCEL_ENV: "preview" }).stdout).toContain(
      "DATABASE_URL is NOT readable at build time",
    );
  });
});
