import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAuth } from "@/lib/api";
import { defaultMessage } from "@/lib/contact";
import type { Lead } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const unauthorized = requireAuth(request);
  if (unauthorized) return unauthorized;
  let body: { lead: Lead; followUp?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  try {
    const { lead, followUp = false } = body;
    if (!lead?.name) return NextResponse.json({ error: "Lead inválido" }, { status: 400 });
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: defaultMessage(lead, followUp), provider: "modelo-local" });
    }
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const prompt = `Escreva uma mensagem curta e natural de prospecção B2B em português do Brasil. O remetente é Arthur, desenvolvedor de sites. Não invente fatos, não use pressão, não prometa resultados e não diga que é IA. ${followUp ? "É um follow-up cordial." : "É o primeiro contato."}\nEmpresa: ${lead.name}\nSegmento: ${lead.segment}\nCategoria: ${lead.category || "não informada"}\nCidade/bairro: ${lead.neighborhood || lead.city || "não informado"}\nNota: ${lead.rating ?? "não informada"}\nCanal: ${lead.preferredChannel || "não informado"}\nTermine perguntando se pode enviar uma prévia sem compromisso.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 450 } }),
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || `Gemini respondeu ${response.status}`);
    const message = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
    return NextResponse.json({ message: message || defaultMessage(lead, followUp), provider: model });
  } catch (error) {
    return apiError(error);
  }
}
