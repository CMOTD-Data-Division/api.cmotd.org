import { env } from "~/env";
import type { JsonValue } from "~/types/payload";



function pickOrigin(req: Request): string {
  const requestOrigin = req.headers.get("origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS;
  console.log("CORS check:", { requestOrigin, allowed });

  if (allowed.includes(requestOrigin)) return requestOrigin;
  return allowed[0] ?? "null";
}

function withCors<T extends JsonValue>(req: Request, json: T, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", pickOrigin(req));
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  headers.set("Vary", "Origin");
  return new Response(JSON.stringify(json), { ...init, headers });
}

function handleOptions(req: Request) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", pickOrigin(req));
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  headers.set("Vary", "Origin");
  return new Response(null, { status: 204, headers });
}


export { withCors, handleOptions };

