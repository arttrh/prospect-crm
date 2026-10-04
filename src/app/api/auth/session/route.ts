import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { databaseProvider } from "@/lib/db";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, database: databaseProvider() });
}
