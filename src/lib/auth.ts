import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "prospect_crm_session";
const MAX_AGE = 60 * 60 * 24 * 14;

function secret(): string {
  return process.env.SESSION_SECRET || "";
}

function signature(expires: string): string {
  return createHmac("sha256", secret()).update(`arthur:${expires}`).digest("base64url");
}

export function createSessionValue(): string {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  return `${expires}.${signature(expires)}`;
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.CRM_ACCESS_PASSWORD || "";
  if (!expected || !password) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(password);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production" && !process.env.CRM_ACCESS_PASSWORD) return true;
  if (!secret()) return false;
  const value = request.cookies.get(SESSION_COOKIE)?.value || "";
  const [expires, received] = value.split(".");
  if (!expires || !received || Number(expires) < Date.now() / 1000) return false;
  const expected = signature(expires);
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}
