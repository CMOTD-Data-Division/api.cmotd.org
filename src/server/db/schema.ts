import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `${name}`);

export const statusEnum = pgEnum("status_enum", ["PENDING", "CONFIRMED", "UNSUBSCRIBED"]);

export const subscriptions = createTable(
  "subscription",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    name: d.varchar({ length: 256 }).notNull(),
    email: d.varchar({ length: 320 }).notNull(),
    status: statusEnum().default("PENDING").notNull(),
    consentAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    sourcePath: d.varchar({ length: 512 }),
    ip: d.varchar({ length: 128 }),
    userAgent: d.varchar({ length: 512 }),
    tenantId: d.varchar({ length: 64 }),
    extras: d.jsonb().$type<Record<string, unknown>>().default(sql`'{}'::jsonb`),
    createdAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("subscription_status_idx").on(t.status),
    index("subscription_email_idx").on(t.email),
  ],
);

export const uniqueLowerEmailIndex = sql`
  CREATE UNIQUE INDEX IF NOT EXISTS subscription_email_lower_unique
  ON ${subscriptions} (lower(email));
`;

export const optInTokens = createTable(
  "opt_in_token",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    token: d.varchar({ length: 128 }).notNull().unique(),
    subscriptionId: d.uuid().notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    usedAt: d.timestamp({ withTimezone: true }),
    createdAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }),
  () => [],
);

export const contactMessages = createTable(
  "contact_message",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    name: d.varchar({ length: 256 }).notNull(),
    email: d.varchar({ length: 320 }).notNull(),
    message: d.text().notNull(),
    sourcePath: d.varchar({ length: 512 }),
    ip: d.varchar({ length: 128 }),
    userAgent: d.varchar({ length: 512 }),
    tenantId: d.varchar({ length: 64 }),
    extras: d.jsonb().$type<Record<string, unknown>>().default(sql`'{}'::jsonb`),

    createdAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }),
  (t) => [index("contact_email_idx").on(t.email)],
);

export const emailEvents = createTable(
  "email_event",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    type: d.varchar({ length: 64 }).notNull(), // e.g. OPEN, CLICK, CONFIRMED, UNSUBSCRIBED
    email: d.varchar({ length: 320 }).notNull(),
    subscriptionId: d.uuid().references(() => subscriptions.id, { onDelete: "set null" }),
    meta: d.jsonb().$type<Record<string, unknown>>(),
    occurredAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }),
  (t) => [index("email_event_email_idx").on(t.email)],
);
