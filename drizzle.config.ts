import { type Config } from "drizzle-kit";
import { env } from "~/env";


export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  }
  },
  strict: true,
  out: "./src/server/db/migrations"
} satisfies Config;
