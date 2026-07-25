/**
 * Applies pending Drizzle migrations during a Vercel production build, before
 * the new code is promoted.
 *
 * `npm run db:migrate` used to be a manual step, so a deploy could ship code
 * that expected a migration nobody had applied. That is not a hypothetical: a
 * release once reached production still expecting `credit_ledger`'s
 * `funding_purchase_id` column, and every dashboard load 500'd until the
 * migration was run by hand.
 *
 * Ordering matters. Migrations run first and the build aborts if they fail, so
 * a deploy can only go live once the schema it expects already exists. Our
 * migrations are additive, which keeps the intermediate state safe: the
 * currently-live code simply ignores columns and tables it does not know about.
 *
 * Preview and development builds never migrate — they would otherwise mutate
 * the production database from an unmerged branch. They still report whether
 * DATABASE_URL is readable at build time, so a preview deploy surfaces broken
 * environment wiring before a production deploy depends on it.
 */

import { spawnSync } from "node:child_process";

const environment = process.env.VERCEL_ENV ?? "local";
const databaseUrl = process.env.DATABASE_URL;

if (environment !== "production") {
  const visibility = databaseUrl
    ? "DATABASE_URL is readable at build time"
    : "DATABASE_URL is NOT readable at build time; a production deploy would fail this check";
  console.log(
    `[deploy-migrate] ${environment} build: skipping migrations (${visibility}).`,
  );
  process.exit(0);
}

if (!databaseUrl) {
  console.error(
    "[deploy-migrate] DATABASE_URL is missing from the production build environment. " +
      "Refusing to build, because deploying without it would ship code ahead of its schema. " +
      "Add DATABASE_URL to the project's production environment variables and redeploy.",
  );
  process.exit(1);
}

console.log("[deploy-migrate] production build: applying pending migrations…");

const result = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(`[deploy-migrate] could not start drizzle-kit: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `[deploy-migrate] migrations failed (exit ${result.status}). Aborting the build so the ` +
      "current deployment keeps serving against the schema it was written for.",
  );
  process.exit(result.status ?? 1);
}

console.log("[deploy-migrate] migrations are up to date.");
