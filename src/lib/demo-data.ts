import type { Lead } from "./types";

const now = new Date().toISOString();

export const DEMO_LEADS: Lead[] = [
  {
    id: "demo-1", datasetId: "demo", placeId: "demo-1", name: "Clínica Horizonte", segment: "Saúde",
    category: "Clínica odontológica", address: "São Paulo - SP", city: "São Paulo", neighborhood: "São Mateus",
    phone: "+55 11 99999-0001", whatsapp: "+55 11 99999-0001", email: null, instagram: "@clinicahorizonte",
    mapsUrl: "https://maps.google.com", imageUrl: null, website: null, rating: 4.8, reviews: 18,
    status: "NEW", preferredChannel: "WHATSAPP", notes: "", nextFollowUpAt: null, lastContactAt: null,
    createdAt: now, updatedAt: now,
  },
  {
    id: "demo-2", datasetId: "demo", placeId: "demo-2", name: "Studio Aurora", segment: "Beleza",
    category: "Salão de beleza", address: "Guarulhos - SP", city: "Guarulhos", neighborhood: "Centro",
    phone: null, whatsapp: null, email: "contato@example.com", instagram: "@studioaurora",
    mapsUrl: "https://maps.google.com", imageUrl: null, website: null, rating: 4.6, reviews: 9,
    status: "FOLLOW_UP", preferredChannel: "EMAIL", notes: "Retomar na próxima semana", nextFollowUpAt: now, lastContactAt: now,
    createdAt: now, updatedAt: now,
  },
];
