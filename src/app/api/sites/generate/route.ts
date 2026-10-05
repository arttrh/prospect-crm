import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { getSiteDraft, listLeads, saveSiteDraft } from "@/lib/db";
import { SITE_CONTENT_FALLBACK, siteGenerationPrompt } from "@/lib/site-template";
import type { SiteContent } from "@/lib/types";

export const runtime = "nodejs";

function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 54);
}

function cleanContent(value: Partial<SiteContent>): SiteContent {
  const text = (candidate: unknown, fallback: string, max = 220) => typeof candidate === "string" && candidate.trim() ? candidate.trim().slice(0, max) : fallback;
  const cards = (candidate: unknown) => Array.isArray(candidate) ? candidate.slice(0, 4).map((item) => ({
    title: text(item?.title, "Atendimento personalizado", 80),
    description: text(item?.description, "Entre em contato para saber mais.", 180),
  })) : [];
  return {
    eyebrow: text(value.eyebrow, SITE_CONTENT_FALLBACK.eyebrow, 90),
    headline: text(value.headline, SITE_CONTENT_FALLBACK.headline, 150),
    description: text(value.description, SITE_CONTENT_FALLBACK.description, 260),
    aboutTitle: text(value.aboutTitle, SITE_CONTENT_FALLBACK.aboutTitle, 110),
    aboutText: text(value.aboutText, SITE_CONTENT_FALLBACK.aboutText, 520),
    services: cards(value.services),
    differentials: cards(value.differentials).slice(0, 3),
    ctaTitle: text(value.ctaTitle, SITE_CONTENT_FALLBACK.ctaTitle, 100),
    ctaText: text(value.ctaText, SITE_CONTENT_FALLBACK.ctaText, 240),
    ctaLabel: text(value.ctaLabel, SITE_CONTENT_FALLBACK.ctaLabel, 60),
    metaTitle: text(value.metaTitle, SITE_CONTENT_FALLBACK.metaTitle, 70),
    metaDescription: text(value.metaDescription, SITE_CONTENT_FALLBACK.metaDescription, 160),
  };
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const leadId = request.nextUrl.searchParams.get("leadId");
    if (!leadId) return NextResponse.json({ error: "Lead não informado" }, { status: 400 });
    const draft = await getSiteDraft(leadId);
    return NextResponse.json({ draft: draft ? { ...draft, previewUrl: `${request.nextUrl.origin}/preview/${draft.slug}` } : null });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;
  try {
    const { leadId } = (await request.json()) as { leadId?: string };
    const lead = (await listLeads()).find((item) => item.id === leadId);
    if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Gemini não está configurado no backend" }, { status: 503 });

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: siteGenerationPrompt(lead) }] }], generationConfig: { temperature: 0.45, maxOutputTokens: 1600, responseMimeType: "application/json" } }),
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || `Gemini respondeu ${response.status}`);
    const raw = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
    const content = cleanContent(raw ? JSON.parse(raw) : {});
    const stableSuffix = Buffer.from(lead.id).toString("base64url").slice(0, 7).toLowerCase();
    const slug = `${slugify(lead.name) || "empresa"}-${stableSuffix}`;
    const draft = await saveSiteDraft({ leadId: lead.id, slug, content, heroImage: lead.imageUrl, galleryImages: lead.imageUrl ? [lead.imageUrl] : [] });
    return NextResponse.json({ draft: { ...draft, previewUrl: `${request.nextUrl.origin}/preview/${draft.slug}` }, provider: model });
  } catch (error) { return apiError(error); }
}
