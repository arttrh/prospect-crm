import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { listLeads, updateLead } from "@/lib/db";
import { LEAD_STATUSES, type LeadPatch } from "@/lib/types";

export const runtime = "nodejs";

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
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    const patch: LeadPatch = {};
    if (body.status && LEAD_STATUSES.includes(body.status)) patch.status = body.status;
    if ("preferredChannel" in body) patch.preferredChannel = body.preferredChannel || null;
    if ("notes" in body) patch.notes = String(body.notes || "").slice(0, 4000);
    if ("nextFollowUpAt" in body) patch.nextFollowUpAt = body.nextFollowUpAt || null;
    if ("lastContactAt" in body) patch.lastContactAt = body.lastContactAt || null;
    return NextResponse.json({ lead: await updateLead(String(body.id), patch) });
  } catch (error) {
    return apiError(error);
  }
}
