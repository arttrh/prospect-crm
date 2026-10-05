import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { renderDiegoSite, DIEGO_ENGINE_ID, leadContactUrl } from "../src/lib/diego-engine";
import { DEMO_LEADS } from "../src/lib/demo-data";
import { SITE_CONTENT_FALLBACK } from "../src/lib/site-template";
import type { SiteDraft } from "../src/lib/types";

const draft: SiteDraft = {
  leadId: "demo-1", slug: "horizonte-teste", templateId: DIEGO_ENGINE_ID, status: "DRAFT",
  content: { ...SITE_CONTENT_FALLBACK, aboutText: "A clínica fica em São Paulo. Confirme os serviços disponíveis." },
  heroImage: "https://lh5.googleusercontent.com/foto-teste", galleryImages: [],
  previewUrl: "", createdAt: "", updatedAt: "",
};

test("todos os componentes, páginas, layout e CSS são os arquivos originais do GitHub", async () => {
  const provenance = JSON.parse(await readFile("vendor/diego-astro/PROVENANCE.json", "utf8"));
  assert.ok(provenance.protectedFiles.length >= 20);
  for (const file of provenance.protectedFiles) {
    const bytes = await readFile("vendor/diego-astro/" + file.path);
    assert.equal(createHash("sha1").update("blob " + bytes.length).update(Buffer.from([0])).update(bytes).digest("hex"), file.sha, file.path);
  }
});
test("personaliza o HTML gerado pelo Astro sem trocar o motor ou vazar a identidade de Sheila", async () => {
  const html = await renderDiegoSite(DEMO_LEADS[0], draft, "https://crm.example.com");
  assert.match(html, /data-hero-headline/);
  assert.match(html, /data-differentials-slider/);
  assert.match(html, /data-whatsapp-contact/);
  assert.match(html, /\/_diego\/_astro\/index/);
  assert.match(html, /Clínica Horizonte/);
  assert.match(html, /lh5.googleusercontent.com\/foto-teste/);
  assert.match(html, /Nota 4,8 no Google, com 18 avaliações/);
  assert.match(html, /wa.me\/5511999990001/);
  assert.match(html, /output=embed/);
  assert.match(html, /noindex, nofollow/);
  assert.doesNotMatch(html, /__CRM_|crm\.invalid|Sheila|OAB\/SC|Blumenau|LegalService|sheila-schefer/i);
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1];
  assert.equal(JSON.parse(json)["@type"], "LocalBusiness");
  assert.equal(JSON.parse(json).aggregateRating.reviewCount, 18);
});
test("escapa textos de lead e Gemini e bloqueia URLs executáveis", async () => {
  const html = await renderDiegoSite({ ...DEMO_LEADS[0], name: '<script>alert("lead")</script>', imageUrl: "javascript:alert(1)" },
    { ...draft, heroImage: "javascript:alert(1)", content: { ...draft.content, aboutText: '<img src=x onerror=alert(1)>' } }, "https://crm.example.com");
  assert.doesNotMatch(html, /<script>alert|<img src=x|src="javascript:/);
  assert.match(html, /place-placeholder.svg/);
});
test("não troca avaliações ausentes por zero nem inventa fotos ou depoimentos", async () => {
  const html = await renderDiegoSite({ ...DEMO_LEADS[0], rating: null, reviews: null, imageUrl: null }, { ...draft, heroImage: null }, "https://crm.example.com");
  assert.match(html, /place-placeholder.svg/);
  assert.doesNotMatch(html, /aggregateRating|Otávio Melo|Francisco Cardoso/);
  assert.match(html, />—</);
});
test("isola os dados de cada cliente e oferece email quando não existe WhatsApp", async () => {
  const html = await renderDiegoSite(DEMO_LEADS[1], { ...draft, leadId: "demo-2", slug: "studio-aurora" }, "https://crm.example.com");
  assert.match(html, /Studio Aurora/);
  assert.doesNotMatch(html, /Clínica Horizonte/);
  assert.equal(leadContactUrl(DEMO_LEADS[1]), "mailto:contato@example.com");
  assert.match(html, /Enviar e-mail/);
});
