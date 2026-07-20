import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let database: Database | undefined;

/**
 * Lazily initializes the Neon HTTP client on first server-side use. Keeping
 * initialization out of module scope lets Next.js build routes that do not use
 * the database without requiring DATABASE_URL at build time.
 */
export function getDb(): Database {
  if (database) {
    return database;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  database = drizzle(neon(connectionString), { schema });

  return database;
}

export { schema };
