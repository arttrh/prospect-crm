import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { apifyItemToLead } from "@/lib/apify";
import { isContactable } from "@/lib/contact";
import { importLeads } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    const datasetId = String(body.datasetId || "").trim();
    const segment = String(body.segment || "Geral").trim().slice(0, 80);
    const maxReviews = Math.max(0, Math.min(Number(body.maxReviews ?? 25), 100000));
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(datasetId)) return NextResponse.json({ error: "ID de dataset inválido" }, { status: 400 });

    const params = new URLSearchParams({ format: "json", clean: "true", limit: "1000" });
    if (process.env.APIFY_TOKEN) params.set("token", process.env.APIFY_TOKEN);
    const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?${params}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Apify respondeu ${response.status}. Confira o ID e a permissão do dataset.`);
    const items = (await response.json()) as Record<string, unknown>[];
    const mapped = items.map((item) => apifyItemToLead(item, datasetId, segment));
    const noWebsite = mapped.filter((lead) => !lead.website);
    const eligible = noWebsite.filter((lead) => lead.reviews == null || lead.reviews <= maxReviews);
    const contactable = eligible.filter(isContactable);
    const result = await importLeads(datasetId, segment, contactable, {
      received: items.length,
      discardedNoContact: eligible.length - contactable.length,
      discardedWithWebsite: mapped.length - noWebsite.length,
    });
    return NextResponse.json({ result });
  } catch (error) {
    return apiError(error);
  }
}
