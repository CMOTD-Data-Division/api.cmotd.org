import { type Config } from "drizzle-kit";
import fs from "node:fs";
import { env } from "~/env";

if (!env.DB_SSL_CA_CERT || typeof env.DB_SSL_CA_CERT !== "string") {
  throw new Error("Missing or invalid DB_SSL_CA_CERT environment variable");
}

const certPath = env.DB_SSL_CA_CERT as string;

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  ssl: { 
    ca: fs.readFileSync(certPath, "utf8"),
    rejectUnauthorized: true 
  }
  },
  strict: true,
  out: "./src/server/db/migrations"
} satisfies Config;
