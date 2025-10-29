export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "~/server/db"; 
import { contactMessages } from "~/server/db/schema";
import { contactSchema } from "./schema";
import { env } from "~/env";
import { Feedback } from "~/lib/services/email/templates/Feedback";
import { Resend } from "resend";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY as string) : null;

export async function POST(req: Request) {
  const form = await req.formData();
  const raw = Object.fromEntries(form) as Record<string, string>;
  const parsed = contactSchema.safeParse({
    ...raw,
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const { name, email, message } = parsed.data;

  const [saved] = await db
    .insert(contactMessages)
    .values({
      name,
      email: email.trim().toLowerCase(),
      message,
      ip: req.headers.get("x-forwarded-for") ?? "",
      userAgent: req.headers.get("user-agent") ?? "",
    })
    .returning({ id: contactMessages.id });

    if (!resend) {
      return NextResponse.json({ ok: true, message: "DEV: RESEND_API_KEY missing, token created." });
    }
    const to = env.EMAIL_INBOX as string;
    const res = await resend.emails.send({
    from: `CMOTD <no-reply@cmotd.org>`,
    to: [to],
    subject: `New Feedback from ${name}`,
    react: Feedback({ name, email, message }),
    headers: { "Reply-To": `${name} <${email}>` },
    });

    if ("error" in res && res.error) {
        return NextResponse.json(
        { ok: false, error: res.error.message ?? "Failed to send notification email" },
        { status: 502 }
        );
    }

  return NextResponse.json({ ok: true, id: saved?.id });
}
