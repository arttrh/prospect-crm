import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { listLeads, updateLead } from "@/lib/db";
import { CONTACT_CHANNELS, LEAD_STATUSES, type LeadPatch } from "@/lib/types";

export const runtime = "nodejs";

function isValidDate(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second, , offsetHour, offsetMinute] = match;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp) || Number(offsetHour) > 23 || Number(offsetMinute) > 59) return false;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)
    && Number(hour) < 24 && Number(minute) < 60 && Number(second) < 60;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json({ leads: await listLeads() });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  try {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    const body = payload as Record<string, unknown>;
    if (!body.id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    const patch: LeadPatch = {};
    if ("status" in body) {
      if (typeof body.status !== "string" || !(LEAD_STATUSES as readonly string[]).includes(body.status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
      patch.status = body.status as LeadPatch["status"];
    }
    if ("preferredChannel" in body) {
      if (body.preferredChannel !== null && (typeof body.preferredChannel !== "string" || !(CONTACT_CHANNELS as readonly string[]).includes(body.preferredChannel))) return NextResponse.json({ error: "Canal preferido inválido" }, { status: 400 });
      patch.preferredChannel = body.preferredChannel as LeadPatch["preferredChannel"];
    }
    if ("notes" in body) patch.notes = String(body.notes || "").slice(0, 4000);
    if ("nextFollowUpAt" in body) {
      if (!isValidDate(body.nextFollowUpAt)) return NextResponse.json({ error: "Próximo follow-up inválido" }, { status: 400 });
      patch.nextFollowUpAt = body.nextFollowUpAt;
    }
    if ("lastContactAt" in body) {
      if (!isValidDate(body.lastContactAt)) return NextResponse.json({ error: "Último contato inválido" }, { status: 400 });
      patch.lastContactAt = body.lastContactAt;
    }
    return NextResponse.json({ lead: await updateLead(String(body.id), patch) });
  } catch (error) {
    return apiError(error);
  }
}
