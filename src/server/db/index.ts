import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import fs from "node:fs";

import { env } from "~/env";
import * as schema from "./schema";

if (!env.DB_SSL_CA_CERT || typeof env.DB_SSL_CA_CERT !== "string") {
  throw new Error("Missing or invalid DB_SSL_CA_CERT environment variable");
}


const certPath = env.DB_SSL_CA_CERT as string;

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn =
  globalForDb.conn ??
  postgres(env.DATABASE_URL, {
    ssl: { ca: fs.readFileSync(certPath).toString(), rejectUnauthorized: true },
  });
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

