import type { EmailProvider } from "~/types/email"; 
import { ConsoleEmailProvider } from "../providers/console.provider"; 
import { ResendEmailProvider } from "../providers/resend.provider"; 

const DEFAULT_FROM = process.env.EMAIL_FROM!;

function getEmailProvider(): EmailProvider {
  const vendor = (process.env.EMAIL_PROVIDER!).toLowerCase();

  if (vendor === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is required for EMAIL_PROVIDER=resend");
    return new ResendEmailProvider({ apiKey, defaultFrom: DEFAULT_FROM });
    // TODO: add sendgrid/mailgun/smtp providers and switch here via provider flag.
  }

  // Default safe dev provider (prints to console)
  return new ConsoleEmailProvider({ defaultFrom: DEFAULT_FROM });
}

export {getEmailProvider};
