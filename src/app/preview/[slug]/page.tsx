/* eslint-disable @next/next/no-img-element -- Apify can return authorized Google Maps images from variable hosts. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteDraftBySlug, listLeads } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

async function data(slug: string) {
  const draft = await getSiteDraftBySlug(slug);
  if (!draft) return null;
  const lead = (await listLeads()).find((item) => item.id === draft.leadId);
  return lead ? { draft, lead } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await data((await params).slug);
  return item ? { title: item.draft.content.metaTitle, description: item.draft.content.metaDescription, robots: { index: false, follow: false } } : {};
}

export default async function LeadPreview({ params }: Props) {
  const item = await data((await params).slug);
  if (!item) notFound();
  const { draft, lead } = item;
  const phone = (lead.whatsapp || lead.phone || "").replace(/\D/g, "");
  const whatsapp = phone ? `https://wa.me/${phone}` : null;
  return <main className="client-site">
    <nav className="client-nav"><strong>{lead.name}</strong><span>{lead.category || lead.segment}</span>{whatsapp && <a href={whatsapp}>Entrar em contato</a>}</nav>
    <section className="client-hero">
      <div className="client-hero-copy"><span>{draft.content.eyebrow}</span><h1>{draft.content.headline}</h1><p>{draft.content.description}</p><div className="client-hero-actions">{whatsapp && <a className="client-primary" href={whatsapp}>{draft.content.ctaLabel}</a>}{lead.mapsUrl && <a className="client-secondary" href={lead.mapsUrl}>Ver localização</a>}</div><small>Prévia personalizada · informações sujeitas à confirmação do estabelecimento</small></div>
      <div className={`client-hero-media ${draft.heroImage ? "has-image" : ""}`}>{draft.heroImage ? <img src={draft.heroImage} alt={`Espaço de ${lead.name}`} /> : <div><span>{lead.name.slice(0,1)}</span></div>}</div>
    </section>
    <section className="client-proof"><div><strong>{lead.rating ?? "—"}</strong><span>Avaliação pública</span></div><div><strong>{lead.reviews ?? "—"}</strong><span>Avaliações</span></div><div><strong>{lead.neighborhood || lead.city || "Local"}</strong><span>Localização</span></div></section>
    <section className="client-section client-about"><span>Sobre</span><h2>{draft.content.aboutTitle}</h2><p>{draft.content.aboutText}</p></section>
    {!!draft.content.services.length && <section className="client-section"><span>Serviços</span><h2>Como podemos ajudar</h2><div className="client-cards">{draft.content.services.map((service, index) => <article key={service.title}><b>0{index + 1}</b><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></section>}
    {!!draft.content.differentials.length && <section className="client-section client-differentials"><span>Diferenciais</span><h2>Atendimento feito com atenção aos detalhes</h2><div className="client-cards">{draft.content.differentials.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>}
    <section className="client-cta"><span>{lead.name}</span><h2>{draft.content.ctaTitle}</h2><p>{draft.content.ctaText}</p>{whatsapp && <a className="client-primary" href={whatsapp}>{draft.content.ctaLabel}</a>}</section>
    <footer className="client-footer"><strong>{lead.name}</strong><p>{lead.address || [lead.neighborhood, lead.city].filter(Boolean).join(" · ")}</p><small>Prévia demonstrativa criada por Arthur Lucas</small></footer>
  </main>;
}
