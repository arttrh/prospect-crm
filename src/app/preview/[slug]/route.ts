import type { NextRequest } from "next/server";
import { getSiteDraftBySlug, listLeads } from "@/lib/db";
import { renderDiegoSite } from "@/lib/diego-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const draft = await getSiteDraftBySlug((await params).slug);
  if (!draft) return new Response("Prévia não encontrada", { status: 404 });
  const lead = (await listLeads()).find((item) => item.id === draft.leadId);
  if (!lead) return new Response("Estabelecimento não encontrado", { status: 404 });
  const html = await renderDiegoSite(lead, draft, request.nextUrl.origin);
  return new Response(html, { headers: {
    "content-type": "text/html; charset=utf-8", "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow, noarchive", "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
  } });
}
