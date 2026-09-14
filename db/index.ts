import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import * as relations from "../drizzle/relations";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_POSTGRES_URL ||
  "";

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL or SUPABASE_POSTGRES_URL is not set!");
}

const client = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  max: 10,
});

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
});

export * from "../drizzle/schema";
