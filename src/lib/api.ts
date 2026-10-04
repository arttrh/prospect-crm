import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAuthorized } from "./auth";

export function requireAuth(request: NextRequest): NextResponse | null {
  return isAuthorized(request) ? null : NextResponse.json({ error: "Não autenticado" }, { status: 401 });
}

export function apiError(error: unknown): NextResponse {
  console.error(error);
  return NextResponse.json({ error: error instanceof Error ? error.message : "Erro interno" }, { status: 500 });
}
