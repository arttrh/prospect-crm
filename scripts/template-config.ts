// Integration configuration only: components, styles and GSAP remain upstream.
import { siteConfig as original, type SiteConfig } from './site-base';
export * from './site-base';
const token = (key: string) => '__CRM_' + key + '__';
const image = (key: string, width: number, height: number) => ({
  src: '/' + token(key), width, height, alt: token('NAME'),
  srcset: [{ src: '/' + token(key), width }], sizes: '100vw',
});
const contact = { whatsappUrl: 'https://crm.invalid/' + token('CONTACT_URL'), primaryCtaLabel: token('CTA_LABEL') };
export const siteConfig: SiteConfig = {
  ...original,
  identity: {
    siteName: token('NAME'), legalName: token('NAME'), professionalName: token('NAME'),
    professionalRole: token('CATEGORY'), professionalDescription: token('ABOUT_TEXT'),
    professionalImage: '/' + token('ABOUT_IMAGE'), registration: '',
    logo: { src: '/' + token('LOGO'), width: 480, height: 100, alt: token('NAME') },
  },
  contact,
  header: { ...original.header, brandLabel: token('NAME'), links: [
    { href: '#sobre', label: 'Sobre' }, { href: '#especialidades', label: 'Informações' },
    { href: '#diferenciais', label: 'Conheça' }, { href: '#localizacao', label: 'Localização' },
  ] },
  hero: {
    ...original.hero, image: image('HERO_IMAGE', 1672, 942),
    trust: { text: token('RATING_LABEL'), avatars: [] },
    title: [{ text: token('HEADLINE') }, { text: ' ' }, { text: token('NAME'), highlighted: true }],
    description: token('DESCRIPTION'), primaryCtaLabel: token('CTA_LABEL'),
    secondaryCta: { href: '#sobre', label: 'Conheça o estabelecimento' },
  },
  stats: { ...original.stats, label: 'Informações do estabelecimento', items: [
    { value: token('RATING'), label: 'nota no Google Maps' },
    { value: token('REVIEWS'), label: 'avaliações no Google' },
    { value: token('CITY'), label: 'cidade' },
    { value: token('NEIGHBORHOOD'), label: 'bairro' },
  ] },
  about: {
    ...original.about, image: image('ABOUT_IMAGE', 560, 700), cardName: token('NAME'),
    cardDetail: token('CATEGORY'), eyebrow: token('ABOUT_TITLE'),
    credentials: [
      { icon: 'lucide:map-pin', text: token('ADDRESS') },
      { icon: 'lucide:circle-check', text: token('RATING_LABEL') },
      { icon: 'lucide:phone', text: token('CONTACT_LABEL') },
    ],
  },
  practiceSection: {
    id: original.practiceSection.id, title: 'Conheça o estabelecimento', highlightedTitle: 'e entre em contato.',
    description: 'Confira as informações disponíveis. Serviços, equipe e horários devem ser confirmados diretamente com o estabelecimento.',
    items: ['circle-check', 'map-pin', 'star', 'message-circle'].map((icon, index) => ({
      icon: 'lucide:' + icon, title: token('SERVICE_' + index + '_TITLE'), description: token('SERVICE_' + index + '_DESCRIPTION'),
    })),
  },
  urgencySection: {
    ...original.urgencySection, title: 'Antes de sua visita,', highlightedTitle: 'vamos conversar?',
    description: 'Use os canais do estabelecimento para conferir os detalhes e organizar sua visita.',
    closingText: 'Entre em contato e confirme as informações de que você precisa.',
    ctaLabel: token('CTA_LABEL'), listLabel: 'Informações para sua visita',
    items: [
      { title: 'Serviços disponíveis', description: 'Pergunte quais serviços são oferecidos e qual opção atende à sua necessidade.' },
      { title: 'Horários de atendimento', description: 'Confirme os horários diretamente com o estabelecimento.' },
      { title: 'Agendamento', description: 'Consulte a disponibilidade antes de visitar.' },
      { title: 'Como chegar', description: token('ADDRESS') },
    ],
  },
  differentialsSection: {
    ...original.differentialsSection, titlePrefix: 'Conheça', highlightedTitle: token('NAME'),
    titleSuffix: 'e planeje seu contato.', tabsLabel: 'Informações do estabelecimento', ctaLabel: token('CTA_LABEL'),
    items: ['map-pin', 'star', 'message-circle'].map((icon, index) => ({
      icon: 'lucide:' + icon, title: token('DIFFERENTIAL_' + index + '_TITLE'), description: token('DIFFERENTIAL_' + index + '_DESCRIPTION'),
    })),
  },
  processSection: {
    ...original.processSection, title: 'Organize seu', highlightedTitle: 'primeiro contato.',
    description: 'Um caminho simples para encontrar as informações e falar com o estabelecimento.',
    stepsLabel: 'Etapas para entrar em contato', items: [
      { title: 'Conheça', description: 'Confira as informações desta página.', detail: 'Esta é uma prévia demonstrativa, sujeita à confirmação do estabelecimento.' },
      { title: 'Entre em contato', description: 'Fale pelo canal disponível.', detail: 'Apresente sua necessidade e tire suas dúvidas.' },
      { title: 'Confirme os detalhes', description: 'Verifique serviços, horários e disponibilidade.', detail: 'As informações devem ser confirmadas diretamente com a equipe.' },
      { title: 'Planeje sua visita', description: 'Consulte o mapa e o endereço.', detail: token('ADDRESS') },
    ],
  },
  reviewsSection: { ...original.reviewsSection, enabled: false, manualItems: [], google: { placeId: '', limit: 3, reviewsUrl: '' } },
  faqSection: {
    ...original.faqSection, description: 'Informações essenciais para seu primeiro contato.', ctaLabel: token('CTA_LABEL'), items: [
      { question: 'Onde fica o estabelecimento?', answer: token('ADDRESS') },
      { question: 'Como entrar em contato?', answer: token('CONTACT_LABEL') },
      { question: 'Como confirmar serviços e horários?', answer: 'Entre em contato diretamente para confirmar os serviços oferecidos, os horários e a disponibilidade.' },
    ],
  },
  footer: {
    ...original.footer, eyebrow: token('CATEGORY'), title: token('CTA_TITLE'), highlightedTitle: token('NAME'),
    description: token('CTA_TEXT'), links: [
      { href: '#sobre', label: 'Sobre' }, { href: '#localizacao', label: 'Localização' },
      { href: contact.whatsappUrl, label: 'Contato' },
    ], copyrightSuffix: 'Prévia demonstrativa · informações sujeitas à confirmação.',
    whatsapp: { ...original.footer.whatsapp, image: { src: '/' + token('ABOUT_IMAGE'), width: 48, height: 48, alt: token('NAME') },
      regionLabel: 'Contato com o estabelecimento', senderName: token('NAME'), message: 'Olá! Como podemos ajudar?',
      actionLabel: token('CTA_LABEL'), buttonLabel: 'Abrir opções de contato',
    },
  },
  seo: {
    ...original.seo, siteUrl: 'https://crm.invalid', homePageTitle: token('META_TITLE'),
    defaultTitle: token('META_TITLE'), titleTemplate: '%s', defaultDescription: token('META_DESCRIPTION'),
    defaultImage: '/' + token('HERO_IMAGE'), defaultImageAlt: token('NAME'),
    favicon: '/_diego/place-placeholder.svg', keywords: [token('NAME'), token('CATEGORY'), token('CITY')],
    areaServed: token('CITY'), knowsAbout: [token('CATEGORY')],
  },
  videoSection: { ...original.videoSection, enabled: false },
  locationSection: {
    ...original.locationSection, enabled: true, title: 'Encontre o', highlightedTitle: 'estabelecimento.',
    description: 'Veja o endereço no Google Maps. Confirme os horários antes de sua visita.',
    address: token('ADDRESS'), mapQuery: token('MAP_QUERY'), mapTitle: token('NAME'),
  },
  aiDiscovery: { ...original.aiDiscovery, enabled: false, summary: token('DESCRIPTION'), usageNote: 'Prévia demonstrativa.' },
  deployment: { ...original.deployment, projectName: 'prospect-crm', subdomain: 'prospect-crm', baseDomain: 'vercel.app' },
};
