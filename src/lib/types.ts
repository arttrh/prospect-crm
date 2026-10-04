export const LEAD_STATUSES = [
  "NEW",
  "SENT",
  "FOLLOW_UP",
  "REPLIED",
  "SITE_SENT",
  "MEETING",
  "WON",
  "DISQUALIFIED",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type ContactChannel = "WHATSAPP" | "EMAIL" | "INSTAGRAM";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Novo",
  SENT: "Enviado",
  FOLLOW_UP: "Follow-up",
  REPLIED: "Respondeu",
  SITE_SENT: "Site enviado",
  MEETING: "Reunião",
  WON: "Fechado",
  DISQUALIFIED: "Desqualificado",
};

export interface Lead {
  id: string;
  datasetId: string;
  placeId: string | null;
  name: string;
  segment: string;
  category: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  mapsUrl: string | null;
  imageUrl: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  status: LeadStatus;
  preferredChannel: ContactChannel | null;
  notes: string;
  nextFollowUpAt: string | null;
  lastContactAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadPatch {
  status?: LeadStatus;
  preferredChannel?: ContactChannel | null;
  notes?: string;
  nextFollowUpAt?: string | null;
  lastContactAt?: string | null;
}

export interface ImportResult {
  received: number;
  imported: number;
  discardedNoContact: number;
  discardedWithWebsite: number;
}
