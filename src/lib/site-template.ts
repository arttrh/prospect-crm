import type { Lead } from "./types";

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

export function clientSiteBrief(lead: Lead): string {
  const contact = {
    phone: lead.phone,
    whatsapp: lead.whatsapp,
    email: lead.email,
    instagram: lead.instagram,
  };

  return `Adapte o template ${SITE_TEMPLATE.repositoryUrl} para este cliente.

REGRA OBRIGATÓRIA
Edite somente src/config/site.ts e substitua os assets necessários em public/images.
Não altere componentes, páginas, estilos, classes CSS, breakpoints, animações ou estrutura visual.
Use imagens próprias ou autorizadas pelo cliente. Não reutilize nome, textos, fotos, avaliações ou identidade da demonstração original.

DADOS DO LEAD
${JSON.stringify({
  name: lead.name,
  segment: lead.segment,
  category: lead.category,
  address: lead.address,
  city: lead.city,
  neighborhood: lead.neighborhood,
  contact,
  mapsUrl: lead.mapsUrl,
  imageReference: lead.imageUrl,
  rating: lead.rating,
  reviews: lead.reviews,
}, null, 2)}

Atualize identidade, contato, hero, serviços, apresentação, diferenciais, localização, SEO, JSON-LD, textos alternativos e dados de descoberta por IA.
Desative por feature flag qualquer seção sem dados confiáveis. Não invente profissionais, certificações, serviços, avaliações ou resultados.
Ao terminar, execute pnpm build, pnpm test:reviews e pnpm test:deploy e informe os dados ainda ausentes.`;
}
