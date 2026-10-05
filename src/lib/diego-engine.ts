import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizePhone } from "./contact";
import { SITE_CONTENT_FALLBACK } from "./site-template";
import type { Lead, SiteDraft } from "./types";

export const DIEGO_ENGINE_ID = "diego-astro-original-4b967ad";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function safeUrl(value: string | null | undefined): string | null {
  try { const url = new URL(value || ""); return ["http:", "https:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

export function leadContactUrl(lead: Lead): string {
  const number = normalizePhone(lead.whatsapp || lead.phone);
  if (number && lead.whatsapp) return "https://wa.me/" + number;
  if (lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return "mailto:" + lead.email;
  if (lead.instagram) {
    return safeUrl(lead.instagram) || "https://www.instagram.com/" + encodeURIComponent(lead.instagram.replace(/^@/, "")) + "/";
  }
  if (number) return "tel:+" + number;
  return safeUrl(lead.mapsUrl) || "#localizacao";
}

function brandLogo(lead: Lead): string {
  const label = lead.name.length > 38 ? lead.name.slice(0, 35) + "…" : lead.name;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="100" viewBox="0 0 480 100">' +
    '<text x="0" y="48" fill="#172b49" font-family="Arial,sans-serif" font-weight="700" font-size="23">' + escapeHtml(label) + '</text>' +
    '<text x="0" y="78" fill="#526781" font-family="Arial,sans-serif" font-size="14">' + escapeHtml(lead.category || lead.segment) + '</text></svg>';
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

export async function renderDiegoSite(lead: Lead, draft: SiteDraft, origin: string): Promise<string> {
  let html = await readFile(resolve(process.cwd(), ".generated/diego-template.html"), "utf8");
  const content = draft.templateId === DIEGO_ENGINE_ID ? draft.content : {
    ...SITE_CONTENT_FALLBACK,
    aboutText: lead.name + " é um estabelecimento da categoria " + (lead.category || lead.segment) + (lead.city ? ", em " + lead.city : "") + ". Confira a localização e entre em contato para conhecer os serviços e horários disponíveis.",
    metaTitle: lead.name, metaDescription: "Conheça " + lead.name + " e suas informações de contato.",
  };
  const previewUrl = origin + "/preview/" + encodeURIComponent(draft.slug);
  const heroImage = safeUrl(draft.heroImage || lead.imageUrl) || origin + "/_diego/place-placeholder.svg";
  const aboutImage = safeUrl(draft.galleryImages?.[1]) || heroImage;
  const mapsQuery = [lead.name, lead.address || [lead.neighborhood, lead.city].filter(Boolean).join(", ")].filter(Boolean).join(", ");
  const rating = lead.rating === null ? "—" : lead.rating.toLocaleString("pt-BR");
  const reviews = lead.reviews === null ? "—" : String(lead.reviews);
  const ratingLabel = lead.rating === null ? "Conheça " + lead.name : "Nota " + rating + " no Google" + (lead.reviews !== null ? ", com " + reviews + " avaliações" : "");
  const contactLabel = lead.whatsapp ? "WhatsApp: " + (lead.phone || lead.whatsapp) : lead.email ? "E-mail: " + lead.email : lead.instagram ? "Instagram: " + lead.instagram : "Confira a localização e as opções de contato.";
  const address = lead.address || [lead.neighborhood, lead.city].filter(Boolean).join(" · ") || "Endereço a confirmar";
  const ctaLabel = lead.whatsapp ? "Falar pelo WhatsApp" : lead.email ? "Enviar e-mail" : lead.instagram ? "Abrir Instagram" : "Entrar em contato";
  const cards = [
    { title: lead.category || lead.segment, description: "Entre em contato para conhecer os serviços disponíveis e confirmar os detalhes do atendimento." },
    { title: "Localização", description: address },
    { title: "Avaliações públicas", description: lead.rating === null ? "Consulte o perfil no Google Maps." : ratingLabel },
    { title: "Contato", description: contactLabel },
  ];
  const differences = [cards[1], cards[2], cards[3]];
  const values: Record<string, string> = {
    NAME: lead.name, CATEGORY: lead.category || lead.segment,
    HEADLINE: content.headline, DESCRIPTION: content.description,
    ABOUT_TITLE: content.aboutTitle, ABOUT_TEXT: content.aboutText,
    HERO_IMAGE: heroImage, ABOUT_IMAGE: aboutImage, LOGO: brandLogo(lead),
    ADDRESS: address, CITY: lead.city || "A confirmar", NEIGHBORHOOD: lead.neighborhood || "A confirmar",
    RATING: rating, REVIEWS: reviews, RATING_LABEL: ratingLabel,
    CONTACT_URL: leadContactUrl(lead), CONTACT_LABEL: contactLabel, CTA_LABEL: ctaLabel,
    CTA_TITLE: content.ctaTitle, CTA_TEXT: content.ctaText,
    META_TITLE: content.metaTitle, META_DESCRIPTION: content.metaDescription,
    MAP_QUERY: encodeURIComponent(mapsQuery),
  };
  cards.forEach((card, i) => { values["SERVICE_" + i + "_TITLE"] = card.title; values["SERVICE_" + i + "_DESCRIPTION"] = card.description; });
  differences.forEach((card, i) => { values["DIFFERENTIAL_" + i + "_TITLE"] = card.title; values["DIFFERENTIAL_" + i + "_DESCRIPTION"] = card.description; });

  // The original biography component splits words at build time. Restore its exact word markup for per-lead animation.
  html = html.replace(/<span class="reveal-word" aria-hidden="true">__CRM_ABOUT_TEXT__<\/span>/g,
    content.aboutText.split(/\s+/).map((word) => '<span class="reveal-word" aria-hidden="true">' + escapeHtml(word) + ' </span>').join(""));
  // Replace original profession-specific structured data with accurate LocalBusiness data.
  html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, "");
  for (const key of ["HERO_IMAGE", "ABOUT_IMAGE", "LOGO", "CONTACT_URL"]) {
    html = html.replaceAll("https://crm.invalid/__CRM_" + key + "__", escapeHtml(values[key]));
    html = html.replaceAll("/__CRM_" + key + "__", escapeHtml(values[key]));
  }
  html = html.replaceAll("https://crm.invalid/", escapeHtml(previewUrl)).replaceAll("https://crm.invalid", escapeHtml(previewUrl));
  html = html.replace(/__CRM_([A-Z0-9_]+)__/g, (_, key: string) => {
    if (!(key in values)) throw new Error("Unresolved template field: " + key);
    return escapeHtml(values[key]);
  });
  html = html.replace(/(<meta name="(?:robots|googlebot)" content=")[^"]*"/g, '$1noindex, nofollow, noarchive"');
  html = html.replace(/<link rel="manifest"[^>]*>/g, "");
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    name: lead.name, url: previewUrl, image: heroImage, address, description: content.metaDescription,
    ...(lead.phone ? { telephone: lead.phone } : {}), ...(lead.email ? { email: lead.email } : {}),
    ...(lead.rating !== null && (lead.reviews || 0) > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: lead.rating, reviewCount: lead.reviews } } : {}),
  };
  html = html.replace("</head>", '<meta name="crm-template-engine" content="' + DIEGO_ENGINE_ID + '"><script type="application/ld+json">' + JSON.stringify(schema).replace(/</g, "\\u003c") + "</script></head>");
  if (/__CRM_[A-Z0-9_]+__|crm\.invalid/.test(html)) throw new Error("Incomplete template personalization");
  return html;
}
