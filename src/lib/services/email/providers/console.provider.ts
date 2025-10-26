import type { EmailPayload, EmailProvider } from "~/types/email";

export class ConsoleEmailProvider implements EmailProvider {
  constructor(private cfg: { defaultFrom: string }) {}

  async send(mail: EmailPayload) {
    const payload = { from: mail.from ?? this.cfg.defaultFrom, ...mail };
    console.info("[EMAIL:console]", JSON.stringify(payload, null, 2));
    return { id: "console-" + Date.now() };
  }
}
