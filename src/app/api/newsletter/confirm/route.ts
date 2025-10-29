export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db"; 
import { subscriptions, optInTokens } from "~/server/db/schema";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  const now = new Date();
  const [row] = await db
    .select({
      token: optInTokens.token,
      usedAt: optInTokens.usedAt,
      expiresAt: optInTokens.expiresAt,
      subscriptionId: optInTokens.subscriptionId,
    })
    .from(optInTokens)
    .where(eq(optInTokens.token, token))
    .limit(1);

  if (!row || row.usedAt || row.expiresAt <= now) {
    return NextResponse.json({ ok: false, error: "Invalid or expired token" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(subscriptions)
      .set({ status: "CONFIRMED", updatedAt: now })
      .where(eq(subscriptions.id, row.subscriptionId));
    await tx
      .update(optInTokens)
      .set({ usedAt: now })
      .where(eq(optInTokens.token, token));
  });

  // Redirect to a nice page in your app
  return NextResponse.redirect(new URL("/newsletter/confirmed", req.url));
}
