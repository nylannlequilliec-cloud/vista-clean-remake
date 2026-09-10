const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const rateLimitState = new Map<string, { count: number; resetAt: number }>();

/** Autorise uniquement les appels browser provenant de l'origine du site. */
export function hasValidSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const configuredOrigin = process.env.APP_ORIGIN ?? "https://vista-clean.fr";
    if (origin === configuredOrigin) return true;

    const host = request.headers.get("host")?.split(":")[0];
    return (
      (host === "localhost" || host === "127.0.0.1") &&
      (originUrl.hostname === host || originUrl.hostname === "localhost")
    );
  } catch {
    return false;
  }
}

/** Limiteur best-effort : la protection durable doit être ajoutée au proxy/WAF. */
export function allowRequest(request: Request): boolean {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const current = rateLimitState.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitState.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

export async function readJsonBody(request: Request): Promise<unknown | null> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType !== "application/json") return null;

  const body = await request.text();
  if (body.length > 20_000) return null;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

export function jsonError(message: string, status: number): Response {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
