import type { Lead, SiteContent } from "./types";

export const SITE_TEMPLATE = {
  id: "diego-astro-premium-v1",
  name: "Template Premium Astro",
  author: "Diego Genuino",
  stack: "Astro + TypeScript",
  repositoryUrl: "https://github.com/DiegoGenuino/Sheila-Schefer-Advocacia",
  previewUrl: "https://sheilascheferadvocacia.feito.website",
  editablePaths: ["src/config/site.ts", "public/images", "public/fonts"],
  protectedPaths: ["src/components", "src/layouts", "src/pages", "src/styles"],
} as const;

export const SITE_CONTENT_FALLBACK: SiteContent = {
  eyebrow: "Atendimento profissional e próximo",
  headline: "Cuidado, confiança e excelência em cada atendimento.",
  description: "Conheça o espaço, os serviços e as formas de contato.",
  aboutTitle: "Uma experiência pensada para você",
  aboutText: "Informações claras e atendimento próximo para ajudar você a escolher com segurança.",
  services: [],
  differentials: [],
  ctaTitle: "Vamos conversar?",
  ctaText: "Entre em contato para tirar dúvidas e conhecer as opções de atendimento.",
  ctaLabel: "Falar pelo WhatsApp",
  metaTitle: "Atendimento profissional",
  metaDescription: "Conheça os serviços, a localização e as formas de contato.",
};

export function siteGenerationPrompt(lead: Lead): string {
  return `Crie o conteúdo de uma landing page premium em português do Brasil para a empresa abaixo.
Use o padrão estrutural do template Astro autorizado: hero, apresentação, serviços, diferenciais, localização e CTA.
Retorne APENAS JSON válido, sem markdown, exatamente com estas chaves:
{"eyebrow":"","headline":"","description":"","aboutTitle":"","aboutText":"","services":[{"title":"","description":""}],"differentials":[{"title":"","description":""}],"ctaTitle":"","ctaText":"","ctaLabel":"","metaTitle":"","metaDescription":""}

Regras: não invente profissionais, certificações, tempo de mercado, tratamentos, preços, resultados ou avaliações. Use no máximo 4 serviços e 3 diferenciais. Se um dado não estiver disponível, escreva de forma institucional e genérica, sem afirmar fatos. Não mencione IA, template, Google Maps nem prospecção.

Empresa: ${lead.name}
Segmento: ${lead.segment}
Categoria: ${lead.category || "não informada"}
Endereço: ${lead.address || "não informado"}
Cidade: ${lead.city || "não informada"}
Bairro: ${lead.neighborhood || "não informado"}
Nota pública: ${lead.rating ?? "não informada"}
Quantidade de avaliações: ${lead.reviews ?? "não informada"}`;
}
