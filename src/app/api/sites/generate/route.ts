import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { getSiteDraft, listLeads, saveSiteDraft } from "@/lib/db";
import { SITE_CONTENT_FALLBACK, siteGenerationPrompt } from "@/lib/site-template";
import type { Lead, SiteContent } from "@/lib/types";

export const runtime = "nodejs";

function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 54);
}

function cleanContent(value: Partial<SiteContent>, lead: Lead): SiteContent {
  const text = (candidate: unknown, fallback: string, max = 220) => typeof candidate === "string" && candidate.trim() ? candidate.trim().slice(0, max) : fallback;
  // Maps supplies category/address, not verified credentials, equipment or treatment lists.
  const unknownClaims = /especializa|profission|estruturad|qualidade|equipament|\b(?:\d+\s+anos|experiência|equipe|tecnologia|tratamentos|implantes|ortodontia|clareamento)\b/i;
  const factualAbout = `${lead.name} é um estabelecimento da categoria ${lead.category || lead.segment}${lead.address ? ", localizado em " + lead.address : ""}. Entre em contato para confirmar serviços, horários e disponibilidade.`;
  const grounded = (candidate: unknown, fallback: string, max: number) => {
    const result = text(candidate, fallback, max);
    return unknownClaims.test(result) ? fallback : result;
  };
  return {
    eyebrow: text(value.eyebrow, SITE_CONTENT_FALLBACK.eyebrow, 90),
    headline: text(value.headline, SITE_CONTENT_FALLBACK.headline, 150),
    description: grounded(value.description, `${lead.category || lead.segment}. Conheça a localização e entre em contato.`, 260),
    aboutTitle: text(value.aboutTitle, SITE_CONTENT_FALLBACK.aboutTitle, 110),
    aboutText: grounded(value.aboutText, factualAbout, 520),
    services: [],
    differentials: [],
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

    let model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    let payload;
    const models = [...new Set([model, "gemini-flash-lite-latest"])];
    for (let index = 0; index < models.length; index++) {
      model = models[index];
      let response: Response;
      try { response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: siteGenerationPrompt(lead) }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 2400, responseMimeType: "application/json" } }),
        signal: AbortSignal.timeout(22000), cache: "no-store",
      }); } catch {
        if (index + 1 < models.length) continue;
        return NextResponse.json({ error: "Gemini temporariamente indisponível. Sua prévia anterior foi preservada." }, { status: 503 });
      }
      payload = await response.json();
      if (response.ok) break;
      if ([429, 503].includes(response.status) && index + 1 < models.length) continue;
      return NextResponse.json({ error: payload?.error?.message || `Gemini respondeu ${response.status}` }, { status: response.status === 429 ? 429 : 503 });
    }
    const raw = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
    if (!raw || payload?.candidates?.[0]?.finishReason === "MAX_TOKENS") throw new Error("Gemini não retornou conteúdo completo. Tente novamente.");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Resposta inválida do Gemini.");
    const content = cleanContent(parsed, lead);
    const stableSuffix = Buffer.from(lead.id).toString("base64url").slice(0, 7).toLowerCase();
    const slug = `${slugify(lead.name) || "empresa"}-${stableSuffix}`;
    const draft = await saveSiteDraft({ leadId: lead.id, slug, content, heroImage: lead.imageUrl, galleryImages: lead.imageUrl ? [lead.imageUrl] : [] });
    return NextResponse.json({ draft: { ...draft, previewUrl: `${request.nextUrl.origin}/preview/${draft.slug}` }, provider: model });
  } catch (error) { return apiError(error); }
}
