// server/db/pool.ts
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

export function getPool(): Pool {
  return new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
}

export const pool = getPool();