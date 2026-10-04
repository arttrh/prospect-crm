import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (!verifyPassword(String(password || ""))) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionValue(), sessionCookieOptions());
  return response;
}
