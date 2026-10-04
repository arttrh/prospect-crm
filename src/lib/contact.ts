import type { ContactChannel, Lead } from "./types";

export function normalizePhone(value: unknown): string {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits;
}

export function whatsappUrl(lead: Lead, message: string): string | null {
  const phone = normalizePhone(lead.whatsapp || lead.phone);
  if (!/^55\d{2}9\d{8}$/.test(phone)) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function emailUrl(lead: Lead, message: string): string | null {
  if (!lead.email) return null;
  const subject = `Uma ideia para ${lead.name}`;
  return `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export function instagramUrl(lead: Lead): string | null {
  if (!lead.instagram) return null;
  if (/^https?:\/\//i.test(lead.instagram)) return lead.instagram;
  return `https://instagram.com/${lead.instagram.replace(/^@/, "")}`;
}

export function availableChannels(lead: Lead): ContactChannel[] {
  const channels: ContactChannel[] = [];
  if (whatsappUrl(lead, "")) channels.push("WHATSAPP");
  if (lead.email) channels.push("EMAIL");
  if (lead.instagram) channels.push("INSTAGRAM");
  return channels;
}

export function isContactable(lead: Pick<Lead, "phone" | "whatsapp" | "email" | "instagram">): boolean {
  return Boolean(/^55\d{2}9\d{8}$/.test(normalizePhone(lead.whatsapp || lead.phone)) || lead.email || lead.instagram);
}

export function defaultMessage(lead: Lead, followUp = false): string {
  const location = lead.neighborhood || lead.city;
  if (followUp) {
    return `Olá! Passando para confirmar se conseguiu ver minha mensagem sobre a ideia de um site para a ${lead.name}. Posso enviar uma prévia para você avaliar, sem compromisso?`;
  }
  const rating = lead.rating ? ` e vi a nota ${lead.rating.toFixed(1).replace(".", ",")} de vocês` : "";
  const where = location ? ` em ${location}` : " na região";
  return `Olá, tudo bem? Me chamo Arthur, sou desenvolvedor e trabalho com criação de sites para empresas.\n\nEncontrei a ${lead.name} no Google${rating}. Pensei em uma oportunidade para fortalecer a apresentação de vocês na internet.\n\nA ideia é criar um site com a identidade da empresa, reunindo serviços, fotos, localização e formas fáceis de contato. Assim, quem estiver procurando esse tipo de serviço${where} poderá conhecer melhor o trabalho de vocês.\n\nPosso enviar uma prévia para vocês avaliarem, sem compromisso?`;
}
