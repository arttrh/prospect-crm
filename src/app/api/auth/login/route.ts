import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, sessionCookieOptions, sessionSecretConfigured, verifyPassword } from "@/lib/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_CLIENTS = 10_000;
const attempts = new Map<string, { count: number; expiresAt: number }>();

function clientKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string, now = Date.now()): boolean {
  for (const [client, entry] of attempts) if (entry.expiresAt <= now) attempts.delete(client);
  const entry = attempts.get(key);
  if (entry && entry.count >= MAX_ATTEMPTS) return true;
  if (!entry) {
    if (attempts.size >= MAX_CLIENTS) attempts.delete(attempts.keys().next().value!);
    attempts.set(key, { count: 0, expiresAt: now + WINDOW_MS });
  }
  return false;
}

function recordFailure(key: string): void {
  const entry = attempts.get(key)!;
  entry.count++;
}

export async function POST(request: NextRequest) {
  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const key = clientKey(request);
  if (isRateLimited(key)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }
  if (!verifyPassword(String(password || ""))) {
    recordFailure(key);
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }
  attempts.delete(key);
  if (!sessionSecretConfigured()) {
    return NextResponse.json({ error: "Sessão indisponível. Tente novamente mais tarde." }, { status: 503 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionValue(), sessionCookieOptions());
  return response;
}
