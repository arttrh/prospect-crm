import { normalizePhone } from "./contact";
import type { ContactChannel, Lead } from "./types";

type UnknownRecord = Record<string, unknown>;

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    const direct = text(value);
    if (direct) return direct;
    if (Array.isArray(value)) {
      for (const item of value) {
        const nested = text(item) || (item && typeof item === "object" ? text((item as UnknownRecord).url) || text((item as UnknownRecord).value) : null);
        if (nested) return nested;
      }
    }
  }
  return null;
}

function findEmail(item: UnknownRecord): string | null {
  const contact = (item.contactInfo && typeof item.contactInfo === "object" ? item.contactInfo : {}) as UnknownRecord;
  const raw = firstText(item.email, item.emails, contact.email, contact.emails);
  if (!raw) return null;
  const match = raw.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  return match?.[0]?.toLowerCase() || null;
}

function findInstagram(item: UnknownRecord): string | null {
  const contact = (item.contactInfo && typeof item.contactInfo === "object" ? item.contactInfo : {}) as UnknownRecord;
  const candidates = [item.instagram, item.instagramUrl, item.instagrams, contact.instagram, contact.instagrams, item.socialMedia, contact.socialMedia];
  for (const candidate of candidates) {
    const values = Array.isArray(candidate) ? candidate : [candidate];
    for (const value of values) {
      const raw = text(value) || (value && typeof value === "object" ? text((value as UnknownRecord).url) || text((value as UnknownRecord).link) : null);
      if (raw && /instagram\.com|^@?[A-Za-z0-9._]+$/i.test(raw)) return raw;
    }
  }
  return null;
}

export function apifyItemToLead(item: UnknownRecord, datasetId: string, segment: string): Lead {
  const phone = firstText(item.phoneUnformatted, item.phone, item.phoneNumber);
  const normalized = normalizePhone(phone);
  const whatsapp = /^55\d{2}9\d{8}$/.test(normalized) ? normalized : firstText(item.whatsapp, item.whatsappUrl);
  const now = new Date().toISOString();
  const preferredChannel: ContactChannel | null = whatsapp ? "WHATSAPP" : findEmail(item) ? "EMAIL" : findInstagram(item) ? "INSTAGRAM" : null;
  return {
    id: firstText(item.placeId, item.cid, item.id) || "",
    datasetId,
    placeId: firstText(item.placeId, item.cid),
    name: firstText(item.title, item.name) || "Estabelecimento sem nome",
    segment,
    category: firstText(item.categoryName, item.category, item.categories),
    address: firstText(item.address, item.street),
    city: firstText(item.city),
    neighborhood: firstText(item.neighborhood),
    phone,
    whatsapp,
    email: findEmail(item),
    instagram: findInstagram(item),
    mapsUrl: firstText(item.url, item.mapsUrl),
    imageUrl: firstText(item.imageUrl, item.imageUrls, item.images),
    website: firstText(item.website, item.websiteUrl),
    rating: typeof item.totalScore === "number" ? item.totalScore : typeof item.rating === "number" ? item.rating : null,
    reviews: typeof item.reviewsCount === "number" ? item.reviewsCount : typeof item.reviews === "number" ? item.reviews : null,
    status: "NEW",
    preferredChannel,
    notes: "",
    nextFollowUpAt: null,
    lastContactAt: null,
    createdAt: now,
    updatedAt: now,
  };
}
