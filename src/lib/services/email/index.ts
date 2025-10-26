import type { EmailPayload } from "~/types/email"; 
import { getEmailProvider } from "./factory"; 

async function sendEmail(payload: EmailPayload) {
  const client = getEmailProvider();
  try {
    return await client.send(payload);
  } catch (err) {
    console.error("[EMAIL:error]", err);
    // quick retry once
    try { return await client.send(payload); } catch {}
    throw err;
  }
}

export {sendEmail};
