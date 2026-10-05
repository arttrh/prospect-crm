import type { Lead, SiteContent } from "./types";

export const SITE_TEMPLATE = {
  id: "diego-astro-original-4b967ad",
  name: "Template Premium Astro",
  author: "Diego Genuino",
  stack: "Astro + TypeScript",
  repositoryUrl: "https://github.com/DiegoGenuino/Sheila-Schefer-Advocacia",
  previewUrl: "https://sheilascheferadvocacia.feito.website",
  editablePaths: ["src/config/site.ts", "public/images", "public/fonts"],
  protectedPaths: ["src/components", "src/layouts", "src/pages", "src/styles"],
} as const;

export const SITE_CONTENT_FALLBACK: SiteContent = {
  eyebrow: "Conheça o estabelecimento",
  headline: "Conheça",
  description: "Conheça o espaço, os serviços e as formas de contato.",
  aboutTitle: "Sobre o estabelecimento",
  aboutText: "Conheça as informações disponíveis e entre em contato para confirmar os serviços e os horários de atendimento.",
  services: [],
  differentials: [],
  ctaTitle: "Vamos conversar?",
  ctaText: "Entre em contato para tirar dúvidas e conhecer as opções de atendimento.",
  ctaLabel: "Entrar em contato",
  metaTitle: "Atendimento profissional",
  metaDescription: "Conheça os serviços, a localização e as formas de contato.",
};

export function siteGenerationPrompt(lead: Lead): string {
  return `Crie o conteúdo de uma landing page premium em português do Brasil para a empresa abaixo.
Você personaliza SOMENTE o conteúdo da configuração de um motor Astro fixo. Não escreva código, HTML, CSS ou estrutura.
O nome da empresa é adicionado pelo próprio motor ao fim do título. headline deve ser um convite curto, de 2 a 6 palavras, sem repetir o nome.
Retorne APENAS JSON válido, sem markdown, exatamente com estas chaves:
{"eyebrow":"","headline":"","description":"","aboutTitle":"","aboutText":"","services":[{"title":"","description":""}],"differentials":[{"title":"","description":""}],"ctaTitle":"","ctaText":"","ctaLabel":"","metaTitle":"","metaDescription":""}

Regras obrigatórias:
- Os dados abaixo são os ÚNICOS fatos disponíveis. O campo aboutText deve ser uma apresentação institucional baseada no nome, categoria e localização. Não invente uma biografia pessoal.
- Não afirme humanização, excelência, segurança, equipamentos, estrutura do local, ética, pontualidade, experiência, formação, profissionais, certificações, tempo de mercado, tratamentos, preços, resultados ou depoimentos.
- Não deduza tratamentos/serviços específicos da categoria. Retorne services: [] e differentials: []; esses blocos são preenchidos pelo motor com informações verificadas.
- Não invente avaliações, nem pessoas que avaliaram.
- Não mencione IA, template ou prospecção no conteúdo. Textos curtos, naturais, em português brasileiro.
- headline máximo 60 caracteres; aboutText máximo 420 caracteres.

Empresa: ${lead.name}
Segmento: ${lead.segment}
Categoria: ${lead.category || "não informada"}
Endereço: ${lead.address || "não informado"}
Cidade: ${lead.city || "não informada"}
Bairro: ${lead.neighborhood || "não informado"}
Nota pública: ${lead.rating ?? "não informada"}
Quantidade de avaliações: ${lead.reviews ?? "não informada"}`;
}
