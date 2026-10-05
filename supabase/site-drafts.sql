-- Per-lead AI site previews. Run after transition.sql.
create table if not exists public.crm_v2_site_drafts (
  owner_id text not null,
  lead_id text not null,
  slug text not null,
  template_id text not null default 'diego-astro-premium-v1',
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  hero_image text,
  gallery_images jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery_images) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, lead_id),
  unique (owner_id, slug),
  foreign key (owner_id, lead_id) references public.crm_v2_leads(owner_id, id) on delete cascade
);

alter table public.crm_v2_site_drafts enable row level security;
revoke all on table public.crm_v2_site_drafts from public, anon, authenticated;

create or replace function public.crm_v2_get_site_draft(p_secret text, p_owner text, p_lead_id text)
returns jsonb language plpgsql security definer set search_path = public, crm_private, pg_catalog as $$
declare d public.crm_v2_site_drafts;
begin
  if not crm_private.valid_secret(p_secret) then raise exception 'unauthorized'; end if;
  select * into d from public.crm_v2_site_drafts where owner_id=p_owner and lead_id=p_lead_id;
  if d.lead_id is null then return null; end if;
  return jsonb_build_object('leadId',d.lead_id,'slug',d.slug,'templateId',d.template_id,'status',d.status,'content',d.content,'heroImage',d.hero_image,'galleryImages',d.gallery_images,'previewUrl','','createdAt',d.created_at,'updatedAt',d.updated_at);
end; $$;

create or replace function public.crm_v2_get_site_draft_by_slug(p_secret text, p_owner text, p_slug text)
returns jsonb language plpgsql security definer set search_path = public, crm_private, pg_catalog as $$
declare d public.crm_v2_site_drafts;
begin
  if not crm_private.valid_secret(p_secret) then raise exception 'unauthorized'; end if;
  select * into d from public.crm_v2_site_drafts where owner_id=p_owner and slug=p_slug;
  if d.lead_id is null then return null; end if;
  return jsonb_build_object('leadId',d.lead_id,'slug',d.slug,'templateId',d.template_id,'status',d.status,'content',d.content,'heroImage',d.hero_image,'galleryImages',d.gallery_images,'previewUrl','','createdAt',d.created_at,'updatedAt',d.updated_at);
end; $$;

create or replace function public.crm_v2_upsert_site_draft(p_secret text,p_owner text,p_lead_id text,p_slug text,p_template_id text,p_content jsonb,p_hero_image text,p_gallery_images jsonb)
returns jsonb language plpgsql security definer set search_path = public, crm_private, pg_catalog as $$
declare d public.crm_v2_site_drafts;
begin
  if not crm_private.valid_secret(p_secret) then raise exception 'unauthorized'; end if;
  if not exists (select 1 from public.crm_v2_leads where owner_id=p_owner and id=p_lead_id) then raise exception 'lead not found'; end if;
  insert into public.crm_v2_site_drafts(owner_id,lead_id,slug,template_id,content,hero_image,gallery_images)
  values (p_owner,p_lead_id,p_slug,p_template_id,p_content,p_hero_image,coalesce(p_gallery_images,'[]'::jsonb))
  on conflict (owner_id,lead_id) do update set slug=excluded.slug,template_id=excluded.template_id,content=excluded.content,hero_image=excluded.hero_image,gallery_images=excluded.gallery_images,updated_at=now()
  returning * into d;
  insert into public.crm_v2_events(owner_id,lead_id,event_type,details) values (p_owner,p_lead_id,'SITE_DRAFT_GENERATED',jsonb_build_object('slug',d.slug,'templateId',d.template_id));
  return jsonb_build_object('leadId',d.lead_id,'slug',d.slug,'templateId',d.template_id,'status',d.status,'content',d.content,'heroImage',d.hero_image,'galleryImages',d.gallery_images,'previewUrl','','createdAt',d.created_at,'updatedAt',d.updated_at);
end; $$;

revoke execute on function public.crm_v2_get_site_draft(text,text,text) from public, authenticated;
revoke execute on function public.crm_v2_get_site_draft_by_slug(text,text,text) from public, authenticated;
revoke execute on function public.crm_v2_upsert_site_draft(text,text,text,text,text,jsonb,text,jsonb) from public, authenticated;
grant execute on function public.crm_v2_get_site_draft(text,text,text) to anon;
grant execute on function public.crm_v2_get_site_draft_by_slug(text,text,text) to anon;
grant execute on function public.crm_v2_upsert_site_draft(text,text,text,text,text,jsonb,text,jsonb) to anon;
