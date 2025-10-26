export type EmailPayload = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  headers?: Record<string, string>;
  react?: ReactElement;
};

export interface EmailProvider {
  send(mail: EmailPayload): Promise<{ id?: string }>;
}
