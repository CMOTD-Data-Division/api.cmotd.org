import { env } from "~/env";
import type { JsonValue } from "~/types/payload";



function pickOrigin(req: Request): string {
  const requestOrigin = req.headers.get("origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS; // string[]

  if (allowed.includes(requestOrigin)) return requestOrigin;
  return allowed[0] ?? "null";
}

function withCors<T extends JsonValue>(req: Request, json: T, init?: ResponseInit) {
  return new Response(JSON.stringify(json), {
    ...(init ?? {}),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": pickOrigin(req),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      ...(init?.headers ?? {}),
    },
  });
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

