import { NextResponse } from "next/server";
import crypto from "crypto";
import {  eq } from "drizzle-orm";
import { db } from "~/server/db";
import { subscriptions, optInTokens } from "~/server/db/schema";
import { Resend } from "resend";
import { env } from "~/env";
import { newsletterSubSchema } from "./schema";
import Newsletter from "~/lib/services/email/templates/Newsletter";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY as string) : null;


export async function POST(req: Request) {
  const form = await req.formData();
  
  const validation = newsletterSubSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    website: form.get("website"),
    agreement: form.get("agreement"),
  });
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, error: validation.error.errors.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }
  const { name, email, website, agreement } = validation.data;
  const emailLc = email.toLowerCase().trim();

  if (!name || !emailLc || agreement !== "on" || website !== "") {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const now = new Date();
  const referer = req.headers.get("referer") ?? undefined;

  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.email, emailLc))
    .limit(1);

  let subscriptionId: string;

  if (existing.length && existing[0]) {
    await db
      .update(subscriptions)
      .set({ name, status: "PENDING", sourcePath: referer, updatedAt: now })
      .where(eq(subscriptions.id, existing[0].id));
      subscriptionId = existing[0].id;
  } else {
    const inserted = await db
      .insert(subscriptions)
      .values({
        name,
        email,
        status: "PENDING",
        consentAt: now,
        sourcePath: referer,
        ip: req.headers.get("x-forwarded-for") ?? "",
        userAgent: req.headers.get("user-agent") ?? "",
      })
      .returning({ id: subscriptions.id });
      if(inserted.length === 0 || !inserted[0]){
        return NextResponse.json({ ok: false, error: "Failed to create subscription" }, { status: 500 });
      }
      subscriptionId = inserted[0].id;
  }

  // Create token
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db.insert(optInTokens).values({ token, subscriptionId, expiresAt });

  const base = env.NEXT_PUBLIC_SITE_URL as string;
  const confirmUrl = `${base}/api/newsletter/confirm?token=${token}`;

  if (!resend) {
    return NextResponse.json({ ok: true, message: "DEV: RESEND_API_KEY missing, token created." });
  }

  await resend.emails.send({
    from: "CMOTD <no-reply@cmotd.org>",
    to: "connectmarsel@gmail.com",
    subject: "Newsletter Subscription Confirmation",
    react: Newsletter({ confirmUrl }),
  });

  return NextResponse.json({ ok: true, message: "Check your email to confirm." });
}
