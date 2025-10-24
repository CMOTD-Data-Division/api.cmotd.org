CREATE TYPE "public"."status_enum" AS ENUM('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');--> statement-breakpoint
CREATE TABLE "contact_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(320) NOT NULL,
	"message" text NOT NULL,
	"sourcePath" varchar(512),
	"ip" varchar(128),
	"userAgent" varchar(512),
	"tenantId" varchar(64),
	"extras" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(64) NOT NULL,
	"email" varchar(320) NOT NULL,
	"subscriptionId" uuid,
	"meta" jsonb,
	"occurredAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opt_in_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(128) NOT NULL,
	"subscriptionId" uuid NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"usedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "opt_in_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(320) NOT NULL,
	"status" "status_enum" DEFAULT 'PENDING' NOT NULL,
	"consentAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"sourcePath" varchar(512),
	"ip" varchar(128),
	"userAgent" varchar(512),
	"tenantId" varchar(64),
	"extras" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "email_event" ADD CONSTRAINT "email_event_subscriptionId_subscription_id_fk" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscription"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opt_in_token" ADD CONSTRAINT "opt_in_token_subscriptionId_subscription_id_fk" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_email_idx" ON "contact_message" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_event_email_idx" ON "email_event" USING btree ("email");--> statement-breakpoint
CREATE INDEX "subscription_status_idx" ON "subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_email_idx" ON "subscription" USING btree ("email");