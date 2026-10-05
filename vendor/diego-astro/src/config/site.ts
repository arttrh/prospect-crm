export type VideoProvider = 'youtube' | 'file';

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface NavigationLink {
  href: string;
  label: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface IdentityConfig {
  siteName: string;
  legalName: string;
  professionalName: string;
  professionalRole: string;
  professionalDescription: string;
  professionalImage: string;
  logo?: ImageAsset;
  registration: string;
}

export interface ContactConfig {
  whatsappUrl: string;
  primaryCtaLabel: string;
}

export interface HeaderConfig {
  brandHref: string;
  brandLabel: string;
  primaryNavigationLabel: string;
  mobileNavigationLabel: string;
  menuOpenLabel: string;
  links: NavigationLink[];
}

export interface HeroConfig {
  id: string;
  image: ImageAsset & {
    srcset: Array<{ src: string; width: number }>;
    sizes: string;
  };
  trust: {
    text: string;
    avatars: string[];
  };
  title: Array<{ text: string; highlighted?: boolean }>;
  description: string;
  primaryCtaLabel: string;
  secondaryCta: NavigationLink;
  scrollTarget: string;
  scrollLabel: string;
}

export interface StatsConfig {
  id: string;
  label: string;
  items: Array<{ value: string; label: string }>;
}

export interface AboutConfig {
  id: string;
  image: ImageAsset & {
    srcset: Array<{ src: string; width: number }>;
    sizes: string;
  };
  cardName: string;
  cardDetail: string;
  eyebrow: string;
  credentials: Array<{ icon: string; text: string }>;
}

export interface PracticeSectionConfig {
  id: string;
  title: string;
  highlightedTitle: string;
  description: string;
  items: Array<{ icon: string; title: string; description: string }>;
}

export interface UrgencySectionConfig {
  id: string;
  title: string;
  highlightedTitle: string;
  description: string;
  closingText: string;
  ctaLabel: string;
  listLabel: string;
  items: Array<{ title: string; description: string }>;
}

export interface ProcessSectionConfig {
  id: string;
  title: string;
  highlightedTitle: string;
  description: string;
  stepsLabel: string;
  stepLabel: string;
  items: Array<{ title: string; description: string; detail: string }>;
}

export interface DifferentialsSectionConfig {
  id: string;
  titlePrefix: string;
  highlightedTitle: string;
  titleSuffix: string;
  tabsLabel: string;
  ctaLabel: string;
  items: Array<{ icon: string; title: string; description: string }>;
}

export type ReviewsSource = 'google' | 'manual';

export interface ReviewItem {
  quote: string;
  name: string;
  details: string;
  rating: number | null;
  avatar: string;
  avatarPosition: string;
  publishedAt: string | null;
  publishedAtLabel: string;
  googleMapsUrl: string;
  authorProfileUrl: string;
  source: 'google' | 'manual';
}

export type ManualReviewItem = Pick<
  ReviewItem,
  'quote' | 'name' | 'details' | 'rating' | 'avatar' | 'avatarPosition'
> & Partial<Pick<ReviewItem, 'publishedAt' | 'publishedAtLabel' | 'googleMapsUrl' | 'authorProfileUrl'>>;

export interface ReviewsSectionConfig {
  enabled: boolean;
  id: string;
  title: string;
  highlightedTitle: string;
  platformLogo: ImageAsset;
  source: ReviewsSource;
  maxRating: number;
  ratingUnavailableLabel: string;
  orderingNotice: string;
  google: {
    placeId: string;
    limit: number;
    reviewsUrl: string;
  };
  fallbacks: {
    quote: string;
    name: string;
    details: string;
    avatar: string;
    avatarPosition: string;
    publishedAtLabel: string;
  };
  manualItems: ManualReviewItem[];
}

export interface FaqSectionConfig {
  id: string;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  description: string;
  ctaLabel: string;
  items: FaqItem[];
}

export interface FooterConfig {
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  description: string;
  links: NavigationLink[];
  copyrightSuffix: string;
  backToTopLabel: string;
  backToTopHref: string;
  whatsapp: {
    regionLabel: string;
    closeLabel: string;
    image: ImageAsset;
    senderName: string;
    message: string;
    actionLabel: string;
    buttonLabel: string;
  };
}

export interface VideoSectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  description: string;
  provider: VideoProvider;
  videoId: string;
  videoUrl: string;
  poster: string;
  posterAlt: string;
  playLabel: string;
  caption: string;
}

export interface LocationSectionConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  description: string;
  address: string;
  mapQuery: string;
  mapTitle: string;
  directionsLabel: string;
}

export interface AiDiscoveryConfig {
  enabled: boolean;
  llmsPath: string;
  markdownPath: string;
  summary: string;
  usageNote: string;
}

export interface SeoConfig {
  siteUrl: string;
  locale: string;
  language: string;
  homePageTitle: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultImage: string;
  defaultImageAlt: string;
  defaultImageWidth: number;
  defaultImageHeight: number;
  themeColor: string;
  favicon: string;
  keywords: string[];
  areaServed: string;
  knowsAbout: string[];
  sitemap: Array<{
    path: string;
    changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: number;
  }>;
}

export type DeploymentMode = 'auto' | 'git' | 'upload';

export interface DeploymentConfig {
  mode: DeploymentMode;
  projectName: string;
  subdomain: string;
  baseDomain: string;
  cnameTarget: string;
}

export interface SiteConfig {
  identity: IdentityConfig;
  contact: ContactConfig;
  header: HeaderConfig;
  hero: HeroConfig;
  stats: StatsConfig;
  about: AboutConfig;
  practiceSection: PracticeSectionConfig;
  urgencySection: UrgencySectionConfig;
  differentialsSection: DifferentialsSectionConfig;
  processSection: ProcessSectionConfig;
  reviewsSection: ReviewsSectionConfig;
  faqSection: FaqSectionConfig;
  footer: FooterConfig;
  seo: SeoConfig;
  videoSection: VideoSectionConfig;
  locationSection: LocationSectionConfig;
  aiDiscovery: AiDiscoveryConfig;
  deployment: DeploymentConfig;
}

export const siteConfig = {
  identity: {
    siteName: 'Sheila Schefer Advocacia',
    legalName: 'Sheila Schefer Advocacia E Consultoria Juridica',
    professionalName: 'Dra. Sheila Cristina Loos Schefer',
    professionalRole: 'Advogada especialista em Direito do Trabalho',
    professionalDescription: 'Advogada especialista em Direito do Trabalho, com atuação na defesa dos direitos de trabalhadores e na assessoria consultiva e preventiva para empresas. Oferece atendimento humanizado presencial em Blumenau/SC e online para todo o Brasil.',
    professionalImage: '/images/sheila-schefer-portrait-560.webp',
    logo: {
      src: '/images/sheila-schefer-logo.png',
      width: 480,
      height: 100,
      alt: 'Sheila Schefer Advocacia e Consultoria Jurídica',
    },
    registration: 'OAB/SC 53.229',
  },
  contact: {
    whatsappUrl: 'https://wa.me/5547988372175',
    primaryCtaLabel: 'Falar com especialista',
  },
  header: {
    brandHref: '#inicio',
    brandLabel: 'Sheila Schefer Advocacia — início',
    primaryNavigationLabel: 'Navegação principal',
    mobileNavigationLabel: 'Navegação mobile',
    menuOpenLabel: 'Abrir menu',
    links: [
      { href: '#sobre', label: 'Sobre' },
      { href: '#especialidades', label: 'Áreas de atuação' },
      { href: '#diferenciais', label: 'Diferenciais' },
      { href: '#faq', label: 'Dúvidas' },
    ],
  },
  hero: {
    id: 'inicio',
    image: {
      src: '/images/sheila-schefer-hero-1672.webp',
      width: 1672,
      height: 942,
      alt: '',
      srcset: [
        { src: '/images/sheila-schefer-hero-960.webp', width: 960 },
        { src: '/images/sheila-schefer-hero-1672.webp', width: 1672 },
      ],
      sizes: '100vw',
    },
    trust: {
      text: 'Nota 5.0 no Google, com 34 avaliações',
      avatars: ['/images/sheila-avatar-1.webp', '/images/review-otavio-melo.webp', '/images/review-francisco-cardoso.webp'],
    },
    title: [
      { text: 'Seus ' },
      { text: 'direitos', highlighted: true },
      { text: ' ' },
      { text: 'trabalhistas', highlighted: true },
      { text: ' com atendimento ' },
      { text: 'humano', highlighted: true },
      { text: ' e ' },
      { text: 'especializado', highlighted: true },
    ],
    description: 'Assessoria jurídica transparente em Direito do Trabalho para trabalhadores e empresas, presencialmente em Blumenau/SC e online em todo o Brasil.',
    primaryCtaLabel: 'Falar com a Dra. Sheila',
    secondaryCta: { href: '#especialidades', label: 'Conheça as áreas de atuação' },
    scrollTarget: '#numeros',
    scrollLabel: 'Ir para os números',
  },
  stats: {
    id: 'numeros',
    label: 'Informações do escritório',
    items: [
      { value: '5.0', label: 'nota no Google Maps' },
      { value: '34', label: 'avaliações no Google' },
      { value: 'Blumenau', label: 'atendimento presencial em SC' },
      { value: 'Brasil', label: 'atendimento jurídico online' },
    ],
  },
  about: {
    id: 'sobre',
    image: {
      src: '/images/sheila-schefer-portrait-560.webp',
      width: 560,
      height: 700,
      alt: 'Dra. Sheila Cristina Loos Schefer em seu escritório',
      srcset: [
        { src: '/images/sheila-schefer-portrait-560.webp', width: 560 },
        { src: '/images/sheila-schefer-portrait-1122.webp', width: 1122 },
      ],
      sizes: '(max-width: 780px) calc(100vw - 34px), 392px',
    },
    cardName: 'Dra. Sheila Schefer',
    cardDetail: 'Advogada | OAB/SC 53.229',
    eyebrow: 'Dra. Sheila Cristina Loos Schefer',
    credentials: [
      { icon: 'lucide:circle-check', text: 'Inscrita na Ordem dos Advogados do Brasil — OAB/SC 53.229' },
      { icon: 'lucide:circle-check', text: 'Especialista em Direito do Trabalho' },
      { icon: 'lucide:circle-check', text: 'Atendimento presencial em Blumenau e online em todo o Brasil' },
    ],
  },
  practiceSection: {
    id: 'especialidades',
    title: 'Áreas de atuação com',
    highlightedTitle: 'orientação clara',
    description: 'Atuação jurídica para pessoas e empresas, com análise individual de cada situação e comunicação acessível em todas as etapas.',
    items: [
      { icon: 'lucide:briefcase-business', title: 'Direito do Trabalho para trabalhadores', description: 'Orientação e atuação em verbas rescisórias, horas extras, adicionais, rescisão indireta, reversão de justa causa, acidente de trabalho e reconhecimento de vínculo.' },
      { icon: 'lucide:building-2', title: 'Assessoria trabalhista para empresas', description: 'Consultoria preventiva, revisão de contratos, regimento interno, LGPD nas relações de trabalho e defesa em ações judiciais e administrativas.' },
      { icon: 'lucide:calculator', title: 'Cálculos trabalhistas e rescisórios', description: 'Análise de rescisões, simulação e conferência de valores, folhas de pagamento, cartões de ponto e punições trabalhistas.' },
      { icon: 'lucide:shield-check', title: 'Direito Previdenciário', description: 'Orientação e acompanhamento em pedidos de aposentadorias, auxílios e benefícios previdenciários junto ao INSS.' },
      { icon: 'lucide:users-round', title: 'Direito Civil, Consumidor, Bancário e Família', description: 'Suporte jurídico em demandas familiares, contratos bancários, relações de consumo e questões de Direito Imobiliário.' },
    ],
  },
  urgencySection: {
    id: 'quando-buscar-ajuda',
    title: 'Dúvidas trabalhistas pedem',
    highlightedTitle: 'análise cuidadosa.',
    description: 'Uma rescisão, uma alteração no contrato ou uma rotina interna da empresa pode gerar dúvidas importantes. Com orientação técnica, fica mais fácil compreender o cenário e os próximos passos possíveis.',
    closingText: 'Se alguma destas situações faz parte do seu momento, reúna as informações disponíveis e converse com uma profissional.',
    ctaLabel: 'Conversar sobre minha situação',
    listLabel: 'Situações em que a orientação jurídica pode ajudar',
    items: [
      { title: 'Minha rescisão está correta?', description: 'Verbas, prazos e documentos podem ser conferidos para identificar eventuais diferenças.' },
      { title: 'Tenho horas extras ou adicionais a receber?', description: 'Jornada, atividades exercidas e registros precisam ser analisados em conjunto.' },
      { title: 'A justa causa pode ser questionada?', description: 'Os fatos, as provas e a proporcionalidade da medida devem ser avaliados individualmente.' },
      { title: 'Como reduzir riscos trabalhistas na empresa?', description: 'Contratos, rotinas e políticas internas podem ser revisados de forma preventiva.' },
      { title: 'Preciso pedir um benefício ao INSS?', description: 'Documentos e requisitos do benefício devem ser verificados antes do protocolo.' },
    ],
  },
  differentialsSection: {
    id: 'diferenciais',
    titlePrefix: 'Por que a',
    highlightedTitle: 'Sheila Schefer Advocacia',
    titleSuffix: 'pode orientar você?',
    tabsLabel: 'Diferenciais da Sheila Schefer Advocacia',
    ctaLabel: 'Solicitar atendimento',
    items: [
      { icon: 'lucide:heart-handshake', title: 'Atendimento humanizado e acolhedor', description: 'Escuta atenta e orientação clara para que cada cliente compreenda sua situação e as etapas do atendimento.' },
      { icon: 'lucide:monitor-smartphone', title: 'Atendimento presencial e online', description: 'Atendimento na sede em Blumenau/SC e por meios digitais para clientes em todo o Brasil.' },
      { icon: 'lucide:star', title: 'Reputação 5.0 no Google', description: 'Nota máxima baseada em 34 avaliações publicadas no perfil do escritório no Google Maps.' },
      { icon: 'lucide:scale', title: 'Visão ampla das relações de trabalho', description: 'Atuação voltada tanto à defesa de trabalhadores quanto à assessoria preventiva de empresas.' },
    ],
  },
  processSection: {
    id: 'como-funciona',
    title: 'Um atendimento que organiza',
    highlightedTitle: 'informações e próximos passos.',
    description: 'Cada situação é analisada individualmente. Estas etapas ajudam a tornar o atendimento jurídico mais claro desde o primeiro contato.',
    stepsLabel: 'Etapas do atendimento jurídico',
    stepLabel: 'Etapa',
    items: [
      { title: 'Primeiro contato', description: 'Você apresenta sua situação e as principais dúvidas pelo WhatsApp.', detail: 'O contato inicial ajuda a identificar o tema e a organizar as informações necessárias para o atendimento.' },
      { title: 'Análise dos documentos', description: 'Contratos, recibos, registros e demais documentos relevantes são examinados de acordo com o caso.', detail: 'Quando necessário, podem ser solicitados documentos adicionais antes da orientação.' },
      { title: 'Orientação sobre os caminhos possíveis', description: 'As alternativas jurídicas aplicáveis são apresentadas em linguagem clara.', detail: 'Cada orientação considera as particularidades da situação e não representa promessa de resultado.' },
      { title: 'Acompanhamento', description: 'O cliente recebe informações relevantes durante a condução do trabalho contratado.', detail: 'A comunicação próxima ajuda a tornar cada etapa mais compreensível.' },
    ],
  },
  reviewsSection: {
    enabled: true,
    id: 'avaliacoes',
    title: 'O que nossos clientes',
    highlightedTitle: 'dizem',
    platformLogo: { src: '/images/google-icon.png', width: 41, height: 41, alt: 'Google' },
    source: 'google',
    maxRating: 5,
    ratingUnavailableLabel: 'Avaliação não disponível',
    orderingNotice: 'Avaliações selecionadas por relevância.',
    google: {
      // O Place ID é público. A chave secreta fica em GOOGLE_PLACES_API_KEY.
      placeId: 'ChIJubrNMbIZ35QRBXO0rWgPJvc',
      limit: 3,
      reviewsUrl: 'https://maps.google.com/?cid=17808938718748504837',
    },
    fallbacks: {
      quote: 'Comentário não disponível',
      name: 'Usuário do Google',
      details: 'Não disponível',
      avatar: '/images/google-icon.png',
      avatarPosition: 'center',
      publishedAtLabel: 'Data não disponível',
    },
    manualItems: [
      { quote: 'Muito profissional e humana. Super indico.', name: 'Otávio Melo', details: 'Avaliação pública no Google', rating: 5, avatar: '/images/review-otavio-melo.webp', avatarPosition: 'center' },
      { quote: 'Fui muito bem instruído e orientado.', name: 'Francisco Cardoso', details: 'Avaliação pública no Google', rating: 5, avatar: '/images/review-francisco-cardoso.webp', avatarPosition: 'center' },
      { quote: 'Explica tudo de forma muito clara.', name: 'Elisete Ana Amorim', details: 'Avaliação pública no Google', rating: 5, avatar: '/images/review-elisete-amorim.webp', avatarPosition: 'center' },
    ],
  },
  faqSection: {
    id: 'faq',
    eyebrow: 'Dúvidas frequentes',
    title: 'Informação clara desde o',
    highlightedTitle: 'primeiro contato',
    description: 'Cada situação exige análise individual. Estas respostas ajudam a orientar os primeiros passos.',
    ctaLabel: 'Falar sobre meu caso',
    items: [
      { question: 'Como funciona o atendimento online?', answer: 'O atendimento pode ser realizado por videochamada e WhatsApp, com envio digital de documentos. Assim, o escritório atende clientes de diferentes regiões do Brasil sem exigir deslocamento até Blumenau.' },
      { question: 'Como posso conferir minhas verbas rescisórias?', answer: 'A conferência considera documentos como o termo de rescisão, holerites, registros de jornada e extrato do FGTS. A conclusão depende da análise individual do contrato e dos documentos disponíveis.' },
      { question: 'O escritório atende trabalhadores e empresas?', answer: 'Sim. O atendimento abrange a orientação e defesa de trabalhadores, além de consultoria preventiva e atuação em demandas trabalhistas de empresas.' },
      { question: 'Quais documentos levar à primeira consulta trabalhista?', answer: 'Em geral, ajudam na análise: documento de identificação, Carteira de Trabalho, contrato, holerites, termo de rescisão, extrato do FGTS e comprovantes de jornada. Outros documentos podem ser solicitados conforme a situação.' },
      { question: 'Quais outras áreas do Direito são atendidas?', answer: 'O escritório também atua em Direito Previdenciário, do Consumidor, Bancário, de Família e Imobiliário. A viabilidade do atendimento é avaliada de acordo com cada demanda.' },
    ],
  },
  footer: {
    eyebrow: 'Atendimento presencial e online',
    title: 'Entenda seus direitos e',
    highlightedTitle: 'os caminhos possíveis.',
    description: 'Atuação em Direito do Trabalho para trabalhadores e empresas, com atendimento humanizado em Blumenau/SC e online em todo o Brasil.',
    links: [
      { href: '#sobre', label: 'Sobre' },
      { href: '#especialidades', label: 'Áreas de atuação' },
      { href: '#diferenciais', label: 'Diferenciais' },
      { href: '#faq', label: 'Dúvidas' },
      { href: 'tel:+554733089528', label: 'Ligar' },
      { href: 'mailto:sheila@sheilaschefer.adv.br', label: 'E-mail' },
    ],
    copyrightSuffix: 'Todos os direitos reservados.',
    backToTopLabel: 'Voltar ao topo',
    backToTopHref: '#inicio',
    whatsapp: {
      regionLabel: 'Atendimento pelo WhatsApp',
      closeLabel: 'Fechar convite',
      image: { src: '/images/sheila-avatar-1.webp', width: 48, height: 48, alt: '' },
      senderName: 'Sheila Schefer Advocacia',
      message: 'Olá! Precisa de orientação jurídica? Fale conosco pelo WhatsApp.',
      actionLabel: 'Iniciar conversa',
      buttonLabel: 'Abrir atendimento pelo WhatsApp',
    },
  },
  seo: {
    siteUrl: 'https://sheilascheferadvocacia.feito.website',
    locale: 'pt_BR',
    language: 'pt-BR',
    homePageTitle: 'Advogada Trabalhista em Blumenau - SC',
    defaultTitle: 'Sheila Schefer Advocacia | Advogada Trabalhista em Blumenau - SC',
    titleTemplate: '%s | Sheila Schefer Advocacia',
    defaultDescription: 'Advocacia especializada em Direito do Trabalho em Blumenau/SC. Atendimento humanizado presencial e online para todo o Brasil.',
    defaultImage: '/images/sheila-schefer-hero-1672.webp',
    defaultImageAlt: 'Dra. Sheila Schefer no escritório Sheila Schefer Advocacia',
    defaultImageWidth: 1672,
    defaultImageHeight: 942,
    themeColor: '#7c2134',
    favicon: '/images/sheila-schefer-favicon.png',
    keywords: ['advogada trabalhista Blumenau', 'Sheila Schefer Advocacia', 'Direito do Trabalho Blumenau SC', 'cálculos rescisórios Blumenau', 'rescisão indireta Blumenau', 'consultoria trabalhista para empresas'],
    areaServed: 'Blumenau - SC e atendimento online para todo o Brasil',
    knowsAbout: ['Direito do Trabalho', 'Compliance Trabalhista', 'Cálculos Trabalhistas e Rescisórios', 'Direito Previdenciário', 'Direito do Consumidor', 'Direito de Família'],
    sitemap: [{ path: '/', changeFrequency: 'monthly', priority: 1 }],
  },
  videoSection: {
    // Use videoId para YouTube ou videoUrl para um arquivo local.
    enabled: false,
    eyebrow: 'Apresentação institucional',
    title: 'Conheça nossa atuação',
    highlightedTitle: 'de perto.',
    description: 'Conteúdo institucional do escritório.',
    provider: 'youtube',
    videoId: '',
    videoUrl: '',
    poster: '',
    posterAlt: 'Capa do vídeo institucional',
    playLabel: 'Assistir apresentação',
    caption: 'Vídeo institucional',
  },
  locationSection: {
    // Substitua address e mapQuery pelo endereço completo de cada novo projeto.
    enabled: true,
    eyebrow: 'Localização',
    title: 'Encontre nosso',
    highlightedTitle: 'escritório.',
    description: 'Consulte nossa localização e planeje sua visita. Para atendimento presencial, entre em contato para confirmar o horário.',
    address: 'R. Belo Horizonte, 180 - Sala 1 - Glória, Blumenau - SC, 89025-000',
    mapQuery: 'Sheila Schefer Advocacia, Blumenau - SC',
    mapTitle: 'Localização da Sheila Schefer Advocacia em Blumenau',
    directionsLabel: 'Abrir no Google Maps',
  },
  aiDiscovery: {
    // Desative apenas se este projeto não puder ser descoberto por agentes.
    enabled: true,
    llmsPath: '/llms.txt',
    markdownPath: '/index.md',
    summary: 'Escritório de advocacia em Blumenau/SC, liderado pela Dra. Sheila Cristina Loos Schefer, OAB/SC 53.229, com especialização em Direito do Trabalho e atendimento presencial e online.',
    usageNote: 'O conteúdo é institucional e informativo. Não substitui análise jurídica individual e não deve ser interpretado como promessa de resultado.',
  },
  deployment: {
    // auto conecta o GitHub quando possível e usa upload direto quando o repositório pertence a outra conta.
    mode: 'auto',
    // O resultado será https://sheilascheferadvocacia.feito.website.
    projectName: 'sheila-schefer-advocacia',
    subdomain: 'sheilascheferadvocacia',
    baseDomain: 'feito.website',
    // Pode ser sobrescrito pela variável VERCEL_CNAME_TARGET.
    cnameTarget: 'cname.vercel-dns-0.com',
  },
} satisfies SiteConfig;
