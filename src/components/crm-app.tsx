"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import { Button, Callout, Card, Flex, Heading, Text, TextArea, TextField, Theme } from "@radix-ui/themes";
import {
  AlertTriangle, ArrowRight, BarChart3, Bot, Building2, CalendarClock, CalendarDays, Camera, Check, CheckCircle2, ChevronDown, Code2, ExternalLink, GripVertical,
  Info, LayoutDashboard, List, LoaderCircle, LogOut, Mail, MapPin, MessageCircle, PlugZap, Plus,
  RefreshCw, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, Users, X,
} from "lucide-react";
import { availableChannels, defaultMessage, emailUrl, instagramUrl, whatsappUrl } from "@/lib/contact";
import { DEMO_LEADS } from "@/lib/demo-data";
import { LEAD_STATUSES, STATUS_LABELS, type ContactChannel, type ImportResult, type Lead, type LeadStatus, type SiteDraft } from "@/lib/types";

const KANBAN_STATUSES: LeadStatus[] = ["NEW", "SENT", "FOLLOW_UP", "REPLIED", "SITE_SENT", "MEETING", "WON", "DISQUALIFIED"];
const CHANNEL_LABELS: Record<ContactChannel, string> = { WHATSAPP: "WhatsApp", EMAIL: "E-mail", INSTAGRAM: "Instagram" };
// shortcut: demonstração visual temporária; reativar login antes de operar dados reais.
const UI_PREVIEW_MODE = true;

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, headers: { "content-type": "application/json", ...(options?.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Não foi possível concluir a ação");
  return payload as T;
}

async function initialData() {
  let session: { authenticated: boolean; database: string };
  try {
    session = await api<{ authenticated: boolean; database: string }>("/api/auth/session");
    console.info("[auth] sessão validada", { database: session.database });
  } catch (error) {
    console.error("[auth] validação de sessão falhou", error instanceof Error ? { message: error.message } : {});
    throw error;
  }
  let data: { leads: Lead[] };
  try {
    data = await api<{ leads: Lead[] }>("/api/leads");
    console.info("[auth] leads carregados", { total: data.leads.length });
  } catch (error) {
    console.error("[auth] carregamento de leads falhou", error instanceof Error ? { message: error.message } : {});
    throw error;
  }
  return { session, leads: data.leads };
}

function RadixSelect({ value, onValueChange, options, label }: { value: string; onValueChange: (value: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="select-trigger" aria-label={label}>
        <Select.Value /> <Select.Icon><ChevronDown size={15} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item className="select-item" value={option.value} key={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator><Check size={14} /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function StatusPill({ status }: { status: LeadStatus }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}

function LeadCard({ lead, onOpen, onMove }: { lead: Lead; onOpen: (lead: Lead) => void; onMove: (lead: Lead, status: LeadStatus) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  return (
    <article
      ref={setNodeRef}
      className={`kanban-card ${isDragging ? "dragging" : ""}`}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
    >
      <div className="card-title-row">
        <button className="drag-handle" {...listeners} {...attributes} aria-label={`Mover ${lead.name}`}><GripVertical size={16} /></button>
        <button className="lead-card-open" onClick={() => onOpen(lead)} aria-label={`Abrir ${lead.name}`}><strong>{lead.name}</strong><span>{lead.category || lead.segment}</span></button>
      </div>
      <div className="lead-meta-row">
        {lead.rating != null && <span><Star size={13} /> {lead.rating.toFixed(1)}</span>}
        {lead.neighborhood && <span><MapPin size={13} /> {lead.neighborhood}</span>}
      </div>
      <div className="channel-dots" aria-label="Canais disponíveis">
        {availableChannels(lead).map((item) => <span key={item}>{CHANNEL_LABELS[item]}</span>)}
      </div>
      {lead.nextFollowUpAt && <div className="followup-line"><CalendarClock size={13} /> {new Date(lead.nextFollowUpAt).toLocaleDateString("pt-BR")}</div>}
      <RadixSelect value={lead.status} onValueChange={(status) => onMove(lead, status as LeadStatus)} options={LEAD_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }))} label={`Mover status de ${lead.name}`} />
    </article>
  );
}

function KanbanColumn({ status, leads, onOpen, onMove }: { status: LeadStatus; leads: Lead[]; onOpen: (lead: Lead) => void; onMove: (lead: Lead, status: LeadStatus) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} className={`kanban-column ${isOver ? "is-over" : ""}`}>
      <header><StatusPill status={status} /><span>{leads.length}</span></header>
      <div className="kanban-stack">
        {leads.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={onOpen} onMove={onMove} />)}
        {!leads.length && <div className="empty-column">Arraste um lead para cá</div>}
      </div>
    </section>
  );
}

function LeadDialog({ lead, onClose, onSaved, onCloseAutoFocus }: { lead: Lead | null; onClose: () => void; onSaved: (lead: Lead) => void; onCloseAutoFocus: (event: Event) => void }) {
  const [draft, setDraft] = useState<Lead | null>(lead);
  const [message, setMessage] = useState(lead ? defaultMessage(lead) : "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [siteGenerating, setSiteGenerating] = useState(false);
  const [siteDraft, setSiteDraft] = useState<SiteDraft | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    if (!lead) return;
    api<{ draft: SiteDraft | null }>(`/api/sites/generate?leadId=${encodeURIComponent(lead.id)}`)
      .then((data) => { if (active) setSiteDraft(data.draft); })
      .catch(() => { if (active) setSiteDraft(null); });
    return () => { active = false; };
  }, [lead]);
  if (!draft) return null;

  async function save(extra: Partial<Lead> = {}) {
    setSaving(true);
    try {
      const body = { id: draft!.id, status: draft!.status, preferredChannel: draft!.preferredChannel, notes: draft!.notes, nextFollowUpAt: draft!.nextFollowUpAt, ...extra };
      const data = await api<{ lead: Lead }>("/api/leads", { method: "PATCH", body: JSON.stringify(body) });
      setDraft(data.lead); onSaved(data.lead); setNotice("Alterações salvas");
    } finally { setSaving(false); }
  }
  async function generate() {
    setGenerating(true); setNotice("");
    try {
      const current = draft;
      if (!current) return;
      const data = await api<{ message: string; provider: string }>("/api/ai/message", { method: "POST", body: JSON.stringify({ lead: current, followUp: current.status === "FOLLOW_UP" }) });
      setMessage(data.message); setNotice(data.provider === "modelo-local" ? "Mensagem criada com o modelo local; configure uma nova chave Gemini para personalização por IA." : `Mensagem criada com ${data.provider}.`);
    } catch (err) { setNotice(err instanceof Error ? err.message : "Falha ao gerar mensagem"); }
    finally { setGenerating(false); }
  }
  async function contact(channel: ContactChannel) {
    if (channel === "INSTAGRAM") await navigator.clipboard.writeText(message);
    const nextStatus = draft!.status === "NEW" ? "SENT" : draft!.status;
    await save({ status: nextStatus, preferredChannel: channel, lastContactAt: new Date().toISOString() });
  }
  async function generateSite() {
    setSiteGenerating(true); setNotice("");
    try {
      const data = await api<{ draft: SiteDraft; provider: string }>("/api/sites/generate", { method: "POST", body: JSON.stringify({ leadId: draft!.id }) });
      setSiteDraft(data.draft);
      setNotice(`Prévia criada com ${data.provider} usando os dados deste lead.`);
    } catch (err) { setNotice(err instanceof Error ? err.message : "Não foi possível gerar a prévia"); }
    finally { setSiteGenerating(false); }
  }
  const wa = whatsappUrl(draft, message); const mail = emailUrl(draft, message); const insta = instagramUrl(draft);

  return (
    <Dialog.Root open={Boolean(lead)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Theme className="dialog-theme" accentColor="iris" grayColor="slate" radius="large" scaling="100%" appearance="dark" panelBackground="translucent">
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content" onCloseAutoFocus={onCloseAutoFocus}>
            <div className="dialog-top">
              <div><Text className="dialog-eyebrow" size="2">{draft.segment}</Text><Dialog.Title>{draft.name}</Dialog.Title><Dialog.Description>{draft.address || "Endereço não informado"}</Dialog.Description></div>
              <Dialog.Close className="icon-button"><X size={20} /></Dialog.Close>
            </div>
            <div className="dialog-grid">
              <section className="lead-editor">
                <div className="form-grid">
                  <label className="field-label">Status<RadixSelect value={draft.status} onValueChange={(value) => setDraft({ ...draft, status: value as LeadStatus })} options={LEAD_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))} label="Status" /></label>
                  <label className="field-label">Canal preferido<RadixSelect value={draft.preferredChannel || "NONE"} onValueChange={(value) => setDraft({ ...draft, preferredChannel: value === "NONE" ? null : value as ContactChannel })} options={[{ value: "NONE", label: "Não definido" }, ...availableChannels(draft).map((value) => ({ value, label: CHANNEL_LABELS[value] }))]} label="Canal preferido" /></label>
                  <label className="field-label followup-field">Próximo follow-up<TextField.Root type="datetime-local" value={draft.nextFollowUpAt?.slice(0, 16) || ""} onChange={(event) => setDraft({ ...draft, nextFollowUpAt: event.target.value ? new Date(event.target.value).toISOString() : null })} /></label>
                </div>
                <label className="field-label">Anotações<TextArea rows={4} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Contexto da conversa, objeções e próximo passo..." /></label>
                <Button className="save-lead-button" variant="soft" onClick={() => save()} disabled={saving}>{saving ? <LoaderCircle className="spin" /> : <Check size={16} />} Salvar lead</Button>
                <div className="lead-facts">
                  <span><Star size={15} /> {draft.rating ?? "—"} · {draft.reviews ?? 0} avaliações</span>
                  {draft.mapsUrl && <a href={draft.mapsUrl} target="_blank" rel="noreferrer"><MapPin size={15} /> Abrir no Maps <ExternalLink size={13} /></a>}
                </div>
                <div className="site-template-card">
                  <div className="site-template-heading">
                    <span className="template-icon"><Code2 size={17} /></span>
                    <div><strong>Site personalizado do lead</strong><span>Astro + TypeScript · estrutura protegida</span></div>
                  </div>
                  <p>O Gemini adapta textos e informações; as imagens disponíveis no Google Maps entram na prévia sem alterar o layout-base.</p>
                  <div className="site-template-actions">
                    <Button variant="soft" size="2" onClick={generateSite} disabled={siteGenerating}>{siteGenerating ? <LoaderCircle className="spin" /> : <Sparkles size={14} />} {siteDraft ? "Atualizar prévia" : "Gerar prévia"}</Button>
                    {siteDraft && <Button asChild variant="soft" size="2"><a href={siteDraft.previewUrl} target="_blank" rel="noreferrer">Abrir site <ExternalLink size={14} /></a></Button>}
                  </div>
                  <span className={`template-status ${siteDraft ? "is-ready" : ""}`}>{siteDraft ? "Prévia salva e hospedada na Vercel" : "Nenhum site gerado para este lead"}</span>
                </div>
              </section>
              <section className="message-panel">
                <div className="section-heading"><div><Text className="dialog-eyebrow" size="2">Abordagem manual</Text><Heading size="4">Mensagem</Heading></div><Button variant="soft" onClick={generate} disabled={generating}>{generating ? <LoaderCircle className="spin" /> : <Sparkles size={16} />} Gemini Flash</Button></div>
                <TextArea className="message-textarea" value={message} onChange={(event) => setMessage(event.target.value)} />
                <div className="contact-actions">
                  {wa && <Button asChild className="channel-button whatsapp-button"><a href={wa} target="_blank" rel="noreferrer" onClick={() => contact("WHATSAPP")}><MessageCircle size={16} /> WhatsApp</a></Button>}
                  {mail && <Button asChild className="channel-button email-button"><a href={mail} onClick={() => contact("EMAIL")}><Mail size={16} /> E-mail</a></Button>}
                  {insta && <Button asChild className="channel-button instagram-button"><a href={insta} target="_blank" rel="noreferrer" onClick={() => contact("INSTAGRAM")}><Camera size={16} /> Copiar e abrir</a></Button>}
                </div>
                <Callout.Root className="manual-warning" color="amber" size="1"><Callout.Icon><ShieldCheck size={16} /></Callout.Icon><Callout.Text>Nenhuma mensagem é enviada automaticamente. Revise, personalize e envie você mesmo para reduzir risco de bloqueio.</Callout.Text></Callout.Root>
                {notice && <Text size="2" color="gray">{notice}</Text>}
              </section>
            </div>
          </Dialog.Content>
        </Theme>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CrmApp() {
  const [auth, setAuth] = useState<"loading" | "yes" | "no">(UI_PREVIEW_MODE ? "yes" : "loading");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [view, setView] = useState("overview");
  const [pipelineTab, setPipelineTab] = useState("kanban");
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("ALL"); const [segment, setSegment] = useState("ALL"); const [channel, setChannel] = useState("ALL");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }));

  async function loadLeads() {
    if (UI_PREVIEW_MODE) { setLeads(DEMO_LEADS); return; }
    setLoading(true); setError("");
    try { const data = await api<{ leads: Lead[] }>("/api/leads"); setLeads(data.leads); }
    catch (err) { setError(err instanceof Error ? err.message : "Erro ao carregar"); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    if (UI_PREVIEW_MODE) {
      Promise.resolve().then(() => { if (active) setLeads(DEMO_LEADS); });
      return () => { active = false; };
    }
    initialData().then((data) => {
      if (!active) return;
      setAuth("yes"); setLeads(data.leads);
    }).catch(() => { if (active) setAuth("no"); });
    return () => { active = false; };
  }, []);

  const segments = useMemo(() => Array.from(new Set(leads.map((lead) => lead.segment))).sort(), [leads]);
  const filtered = useMemo(() => leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.category || ""} ${lead.neighborhood || ""} ${lead.email || ""}`.toLocaleLowerCase("pt-BR");
    return (!query || haystack.includes(query.toLocaleLowerCase("pt-BR"))) && (status === "ALL" || lead.status === status) && (segment === "ALL" || lead.segment === segment) && (channel === "ALL" || availableChannels(lead).includes(channel as ContactChannel));
  }), [leads, query, status, segment, channel]);

  const stats = {
    total: leads.length,
    contactados: leads.filter((lead) => lead.status !== "NEW" && lead.status !== "DISQUALIFIED").length,
    followups: leads.filter((lead) => lead.status === "FOLLOW_UP" || (lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) <= new Date())).length,
    reunioes: leads.filter((lead) => lead.status === "MEETING").length,
  };
  const pipelineSnapshot = KANBAN_STATUSES.map((stage) => ({ label: STATUS_LABELS[stage], count: leads.filter((lead) => lead.status === stage).length }));
  const snapshotMax = Math.max(1, ...pipelineSnapshot.map((stage) => stage.count));
  const upcomingFollowUps = leads.filter((lead) => lead.nextFollowUpAt).slice(0, 3);
  function openLead(lead: Lead) {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(lead);
  }
  async function moveLeadTo(lead: Lead, target: LeadStatus) {
    if (!lead || lead.status === target) return;
    const optimistic = { ...lead, status: target };
    setLeads((current) => current.map((item) => item.id === lead.id ? optimistic : item));
    if (UI_PREVIEW_MODE) return;
    try {
      const data = await api<{ lead: Lead }>("/api/leads", { method: "PATCH", body: JSON.stringify({ id: lead.id, status: target }) });
      setLeads((current) => current.map((item) => item.id === lead.id ? data.lead : item));
    } catch (err) { setLeads((current) => current.map((item) => item.id === lead.id ? lead : item)); setError(err instanceof Error ? err.message : "Falha ao mover lead"); }
  }
  async function moveLead(event: DragEndEvent) {
    const target = event.over?.id as LeadStatus | undefined;
    const lead = leads.find((item) => item.id === event.active.id);
    if (!target || !LEAD_STATUSES.includes(target) || !lead) return;
    await moveLeadTo(lead, target);
  }

  if (auth === "loading") return <main className="loading-screen"><LoaderCircle className="spin" /><Text>Preparando seu CRM…</Text></main>;

  return (
    <div className="app-shell pierre-shell">
      <aside className="pierre-sidebar">
        <div className="pierre-brand"><div className="brand-mark small"><Building2 size={19} /></div><strong>prospect</strong></div>
        <span className="pierre-sidebar-label">OPERAÇÃO COMERCIAL</span>
        <nav className="main-nav pierre-nav" aria-label="Navegação principal"><button className={view === "overview" ? "active" : ""} aria-current={view === "overview" ? "page" : undefined} onClick={() => setView("overview")}><LayoutDashboard size={17} /> Visão geral</button><button className={view === "pipeline" ? "active" : ""} aria-current={view === "pipeline" ? "page" : undefined} onClick={() => { setView("pipeline"); setPipelineTab("list"); }}><Users size={17} /> Leads</button><button className={view === "pipeline" && pipelineTab === "kanban" ? "active" : ""} onClick={() => { setView("pipeline"); setPipelineTab("kanban"); }}><ArrowRight size={17} /> Pipeline</button><button className={view === "followups" ? "active" : ""} aria-current={view === "followups" ? "page" : undefined} onClick={() => setView("followups")}><CalendarDays size={17} /> Follow-ups</button><button className={view === "reports" ? "active" : ""} aria-current={view === "reports" ? "page" : undefined} onClick={() => setView("reports")}><BarChart3 size={17} /> Relatórios</button><button className={view === "pierre" ? "active" : ""} aria-current={view === "pierre" ? "page" : undefined} onClick={() => setView("pierre")}><Sparkles size={17} /> Pierre · conceito</button></nav>
        <div className="pierre-demo-note"><Info size={16} /><strong>Dados demonstrativos</strong><span>Visão estática · sem automação</span></div>
      </aside>
      <section className="pierre-workspace">
        <header className="app-header pierre-header">
          <div><span className="pierre-breadcrumb">VISÃO GERAL / PIPELINE</span><h1>O que merece atenção</h1><p>Leituras operacionais para priorizar o próximo passo.</p></div>
          <div className="header-actions"><Button variant="ghost" onClick={loadLeads}><RefreshCw size={16} /> Atualizar</Button>{!UI_PREVIEW_MODE && <Button variant="ghost" color="gray" onClick={async () => { await api("/api/auth/logout", { method: "POST" }); setAuth("no"); }}><LogOut size={16} /> Sair</Button>}</div>
        </header>
      <main className="content pierre-content">
        {view !== "overview" && view !== "pipeline" && <>{view === "reports" && <Reports leads={leads} />}{view === "followups" && <FollowUps leads={leads} onOpen={openLead} />}{view === "pierre" && <PierrePanel />}</>}
        {view === "overview" && <><section className="hero-row pierre-overview-heading"><div><span className="sr-only">Pipeline de prospecção</span><Text color="gray">Dados demonstrativos · indicadores operacionais</Text></div><Button size="3" onClick={() => { setView("pipeline"); setPipelineTab("import"); }}><Plus size={18} /> Importar do Apify</Button></section>
        {error && <Callout.Root color="red"><Callout.Icon><X size={16} /></Callout.Icon><Callout.Text>{error}</Callout.Text></Callout.Root>}
        <section className="stats-grid">
          <Card><Text color="gray">Leads válidos</Text><Heading size="8">{stats.total}</Heading><span className="stat-note">com canal disponível</span></Card>
          <Card><Text color="gray">Contatados</Text><Heading size="8">{stats.contactados}</Heading><span className="stat-note">todos os canais</span></Card>
          <Card><Text color="gray">Follow-ups</Text><Heading size="8">{stats.followups}</Heading><span className="stat-note">pendentes ou vencidos</span></Card>
          <Card><Text color="gray">Reuniões</Text><Heading size="8">{stats.reunioes}</Heading><span className="stat-note">no pipeline</span></Card>
        </section>
        <section className="pierre-dashboard-grid">
          <article className="pierre-funnel"><div className="card-heading"><div><h2>Funil de conversão</h2><span>Dados demonstrativos · distribuição por estágio</span></div><span className="pierre-filter"><SlidersHorizontal size={15} /> Origem: todas</span></div><div className="pierre-funnel-list">{pipelineSnapshot.map((stage) => <div className="pierre-funnel-row" key={stage.label}><span>{stage.label}</span><b>{stage.count}</b><i><em style={{ width: `${Math.max(4, stage.count / snapshotMax * 100)}%` }} /></i></div>)}</div></article>
          <aside className="pierre-sidepanels"><article className="pierre-followups"><div className="card-heading"><div><h2>Follow-ups</h2><span>Dados demonstrativos</span></div></div>{upcomingFollowUps.map((lead) => <button key={lead.id} onClick={() => openLead(lead)}><i /><span><strong>{lead.name}</strong><small>{lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Próximo contato"}</small></span></button>)}{!upcomingFollowUps.length && <p>Nenhum follow-up agendado.</p>}</article><article className="pierre-gmb"><div className="card-heading"><h2>Assistente GMB</h2><span>CONCEITO</span></div><p>Orientação demonstrativa para o pipeline atual.</p><small>Não envia mensagens nem executa ações.</small></article></aside>
        </section>
        <p className="pierre-footer-note">Dados demonstrativos em todo o painel · nenhuma automação de contato, banco ou assistente funcional.</p></>}
        {view === "pipeline" && <><section className="hero-row"><div><Text color="gray">Pipeline de prospecção</Text><Heading size="7">Leads e estágios</Heading><Text color="gray">Só entram empresas com ao menos um canal de contato utilizável.</Text></div><Button size="3" onClick={() => setPipelineTab("import")}><Plus size={18} /> Importar do Apify</Button></section>
        <Tabs.Root className="tabs-root" value={pipelineTab} onValueChange={setPipelineTab}>
          <div className="toolbar-row">
            <Tabs.List className="tabs-list"><Tabs.Trigger value="kanban"><LayoutDashboard size={16} /> Kanban</Tabs.Trigger><Tabs.Trigger value="list"><List size={16} /> Lista</Tabs.Trigger><Tabs.Trigger value="import"><Plus size={16} /> Importar</Tabs.Trigger></Tabs.List>
            <div className="filters">
              <div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa..." /></div>
              <RadixSelect value={status} onValueChange={setStatus} label="Filtrar por status" options={[{ value: "ALL", label: "Todos os status" }, ...LEAD_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))]} />
              <RadixSelect value={segment} onValueChange={setSegment} label="Filtrar por segmento" options={[{ value: "ALL", label: "Todos os segmentos" }, ...segments.map((value) => ({ value, label: value }))]} />
              <RadixSelect value={channel} onValueChange={setChannel} label="Filtrar por canal" options={[{ value: "ALL", label: "Todos os canais" }, ...Object.entries(CHANNEL_LABELS).map(([value, label]) => ({ value, label }))]} />
            </div>
          </div>
          <Tabs.Content value="kanban">
            {loading ? <div className="panel-loading"><LoaderCircle className="spin" /> Carregando leads…</div> : <DndContext sensors={sensors} onDragEnd={moveLead}><div className="kanban-board">{KANBAN_STATUSES.map((item) => <KanbanColumn key={item} status={item} leads={filtered.filter((lead) => lead.status === item)} onOpen={openLead} onMove={moveLeadTo} />)}</div></DndContext>}
          </Tabs.Content>
          <Tabs.Content value="list"><LeadTable leads={filtered} onOpen={openLead} /></Tabs.Content>
          <Tabs.Content value="import"><ImportPanel onImported={loadLeads} /></Tabs.Content>
        </Tabs.Root></>}
      </main>
      </section>
      <LeadDialog key={selected?.id || "none"} lead={selected} onClose={() => setSelected(null)} onCloseAutoFocus={(event) => { event.preventDefault(); opener.current?.focus(); }} onSaved={(saved) => { setLeads((current) => current.map((lead) => lead.id === saved.id ? saved : lead)); setSelected(saved); }} />
    </div>
  );
}

function LeadTable({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>Empresa</th><th>Segmento</th><th>Contato</th><th>Status</th><th>Follow-up</th><th /></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><span>{lead.category || lead.neighborhood || "—"}</span></td><td>{lead.segment}</td><td><div className="table-channels">{availableChannels(lead).map((item) => <span key={item}>{CHANNEL_LABELS[item]}</span>)}</div></td><td><StatusPill status={lead.status} /></td><td>{lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"}</td><td><Button variant="ghost" onClick={() => onOpen(lead)}>Abrir <ArrowRight size={15} /></Button></td></tr>)}</tbody></table>{!leads.length && <div className="empty-table">Nenhum lead encontrado.</div>}</div>;
}

function Reports({ leads }: { leads: Lead[] }) {
  const hasHistory = leads.some((lead) => lead.lastContactAt);
  const stageCounts = KANBAN_STATUSES.map((stage) => ({ stage, label: STATUS_LABELS[stage], count: leads.filter((lead) => lead.status === stage).length }));
  const max = Math.max(1, ...stageCounts.map((item) => item.count));
  return <section className="insights-page" aria-labelledby="reports-title">
    <div className="page-heading"><div><span className="eyebrow">Visão operacional</span><Heading id="reports-title" size="7">Relatórios</Heading><Text color="gray">Acompanhe o funil sem perder o contexto dos contatos.</Text></div><span className="demo-badge">{hasHistory ? "Histórico disponível" : "Dados demonstrativos"}</span></div>
    <div className="kpi-grid"><article className="insight-card"><span>Conversão do funil</span><strong>{leads.length ? `${Math.round((leads.filter((lead) => lead.status === "WON").length / leads.length) * 100)}%` : "0%"}</strong><small>leads ganhos</small></article><article className="insight-card"><span>Em acompanhamento</span><strong>{leads.filter((lead) => lead.status === "FOLLOW_UP").length}</strong><small>follow-ups ativos</small></article><article className="insight-card"><span>Canais ativos</span><strong>{new Set(leads.flatMap((lead) => availableChannels(lead))).size}</strong><small>WhatsApp, e-mail e Instagram</small></article></div>
    <div className="report-grid"><article className="report-card"><div className="card-heading"><div><span className="eyebrow">Distribuição</span><h2>Leads por estágio</h2></div><BarChart3 size={20} /></div><div className="bar-chart" role="img" aria-label="Gráfico de barras com leads por estágio">{stageCounts.map((item) => <div className="bar-item" key={item.stage}><span>{item.label}</span><div><i style={{ height: `${Math.max(8, (item.count / max) * 100)}%` }} /></div><b>{item.count}</b></div>)}</div></article><article className="report-card"><div className="card-heading"><div><span className="eyebrow">Resumo</span><h2>Composição do pipeline</h2></div><span className="donut" aria-hidden="true" /></div><ul className="legend-list">{stageCounts.slice(0, 4).map((item, index) => <li key={item.stage}><span className={`legend-dot dot-${index}`} />{item.label}<b>{item.count}</b></li>)}</ul></article></div>
    <div className="table-wrap report-table"><table><thead><tr><th>Estágio</th><th>Leads</th><th>Participação</th></tr></thead><tbody>{stageCounts.map((item) => <tr key={item.stage}><td><strong>{item.label}</strong></td><td>{item.count}</td><td>{leads.length ? `${Math.round(item.count / leads.length * 100)}%` : "0%"}</td></tr>)}</tbody></table></div>
  </section>;
}

function FollowUps({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  const [now] = useState(() => Date.now()); const followups = leads.filter((lead) => lead.nextFollowUpAt || lead.status === "FOLLOW_UP").sort((a, b) => (a.nextFollowUpAt || "").localeCompare(b.nextFollowUpAt || ""));
  return <section className="insights-page" aria-labelledby="followups-title"><div className="page-heading"><div><span className="eyebrow">Ações manuais</span><Heading id="followups-title" size="7">Follow-ups</Heading><Text color="gray">Revise cada próximo contato antes de agir.</Text></div><span className="demo-badge"><CalendarDays size={15} /> {followups.length} pendentes</span></div><div className="followup-columns"><article className="followup-lane"><div className="lane-heading"><AlertTriangle size={17} /><h2>Atrasados</h2></div>{followups.filter((lead) => lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() < now).map((lead) => <FollowUpItem key={lead.id} lead={lead} onOpen={onOpen} overdue />)}{!followups.some((lead) => lead.nextFollowUpAt && new Date(lead.nextFollowUpAt).getTime() < now) && <p className="empty-state">Nenhum contato atrasado.</p>}</article><article className="followup-lane"><div className="lane-heading"><CalendarClock size={17} /><h2>Hoje e próximos</h2></div>{followups.filter((lead) => !lead.nextFollowUpAt || new Date(lead.nextFollowUpAt).getTime() >= now).map((lead) => <FollowUpItem key={lead.id} lead={lead} onOpen={onOpen} />)}{!followups.length && <p className="empty-state">Nenhum follow-up agendado.</p>}</article></div></section>;
}

function FollowUpItem({ lead, onOpen, overdue }: { lead: Lead; onOpen: (lead: Lead) => void; overdue?: boolean }) { return <button className="followup-item" onClick={() => onOpen(lead)}><span className="followup-item-main"><strong>{lead.name}</strong><small>{lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Hoje · definir horário"}</small></span><span className={`priority ${overdue ? "priority-high" : ""}`}>{overdue ? "Prioridade alta" : "Prioridade normal"}</span><span className="followup-channel">{lead.preferredChannel ? CHANNEL_LABELS[lead.preferredChannel] : "Canal a definir"}</span><ArrowRight size={16} /></button>; }

function PierrePanel() { const states = [{ label: "Desconectado", icon: PlugZap }, { label: "Conectando", icon: LoaderCircle }, { label: "Conectado", icon: CheckCircle2 }, { label: "Erro", icon: AlertTriangle }, { label: "Sincronizando", icon: RefreshCw }]; return <section className="insights-page" aria-labelledby="pierre-title"><div className="page-heading"><div><span className="eyebrow">Camada visual</span><Heading id="pierre-title" size="7">Integração Pierre</Heading><Text color="gray">Status informativo. Nenhuma conexão ou contrato é iniciado nesta tela.</Text></div><Button variant="soft" disabled>Abrir app Pierre <ExternalLink size={15} /></Button></div><div className="pierre-card"><div className="pierre-orb"><PlugZap size={28} /></div><div><h2>Conexão não configurada</h2><p>A integração ficará disponível quando o contrato técnico e a URL oficial forem aprovados.</p></div></div><div className="pierre-states">{states.map(({ label, icon: Icon }) => <div className="pierre-state" key={label}><Icon size={18} /><span>{label}</span></div>)}</div></section>; }

function ImportPanel({ onImported }: { onImported: () => Promise<void> }) {
  const [datasetId, setDatasetId] = useState(""); const [segment, setSegment] = useState("Saúde"); const [maxReviews, setMaxReviews] = useState("25"); const [loading, setLoading] = useState(false); const [result, setResult] = useState<ImportResult | null>(null); const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try { const data = await api<{ result: ImportResult }>("/api/import/apify", { method: "POST", body: JSON.stringify({ datasetId, segment, maxReviews: Number(maxReviews) }) }); setResult(data.result); await onImported(); }
    catch (err) { setError(err instanceof Error ? err.message : "Falha na importação"); }
    finally { setLoading(false); }
  }
  return <div className="import-layout"><Card className="import-card"><Flex direction="column" gap="4"><div><Text color="gray">Fonte de dados</Text><Heading size="6">Importar dataset do Apify</Heading><Text color="gray">O CRM lê um dataset existente. Nenhum Actor é executado, então essa ação não inicia um novo scraping.</Text></div><form onSubmit={submit} className="import-form"><label className="field-label">ID do dataset<TextField.Root value={datasetId} onChange={(event) => setDatasetId(event.target.value)} placeholder="Ex.: apS8sKoXdjfhZtdjg" required /></label><div className="form-grid"><label className="field-label">Segmento<TextField.Root value={segment} onChange={(event) => setSegment(event.target.value)} placeholder="Saúde, beleza, alimentação..." required /></label><label className="field-label">Máximo de avaliações<TextField.Root type="number" min="0" value={maxReviews} onChange={(event) => setMaxReviews(event.target.value)} /></label></div><Button size="3" disabled={loading}>{loading ? <LoaderCircle className="spin" /> : <Plus size={17} />} Filtrar e importar</Button></form>{error && <Callout.Root color="red"><Callout.Text>{error}</Callout.Text></Callout.Root>}{result && <Callout.Root color="iris"><Callout.Icon><Check size={17} /></Callout.Icon><Callout.Text>{result.imported} leads importados. {result.discardedNoContact} descartados por falta de WhatsApp, e-mail ou Instagram; {result.discardedWithWebsite} descartados por já terem site.</Callout.Text></Callout.Root>}</Flex></Card><aside className="rules-card"><Bot size={24} /><Heading size="4">Regras da entrada</Heading><ul><li>Sem site informado no Google Maps</li><li>Dentro do limite de avaliações</li><li>Com WhatsApp provável, e-mail ou Instagram</li><li>Dados brutos do dataset não são expostos ao navegador</li><li>Gemini só cria texto; não raspa o Maps</li></ul></aside></div>;
}
