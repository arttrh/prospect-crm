create table if not exists public.crm_v2_leads (
  owner_id text not null,
  id text not null,
  dataset_id text not null,
  place_id text,
  name text not null,
  segment text not null default 'Geral',
  category text,
  address text,
  city text,
  neighborhood text,
  phone text,
  whatsapp text,
  email text,
  instagram text,
  maps_url text,
  image_url text,
  website text,
  rating numeric,
  reviews integer,
  status text not null default 'NEW' check (status in ('NEW','SENT','FOLLOW_UP','REPLIED','SITE_SENT','MEETING','WON','DISQUALIFIED')),
  preferred_channel text check (preferred_channel is null or preferred_channel in ('WHATSAPP','EMAIL','INSTAGRAM')),
  notes text not null default '',
  next_follow_up_at timestamptz,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id),
  check (nullif(trim(coalesce(whatsapp, '')), '') is not null or nullif(trim(coalesce(email, '')), '') is not null or nullif(trim(coalesce(instagram, '')), '') is not null)
);

create table if not exists public.crm_v2_events (
  id bigint generated always as identity primary key,
  owner_id text not null,
  lead_id text not null,
  event_type text not null,
  from_status text,
  to_status text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists crm_v2_leads_status_idx on public.crm_v2_leads(owner_id, status);
create index if not exists crm_v2_leads_segment_idx on public.crm_v2_leads(owner_id, segment);
create index if not exists crm_v2_leads_followup_idx on public.crm_v2_leads(owner_id, next_follow_up_at) where next_follow_up_at is not null;
create index if not exists crm_v2_events_lead_idx on public.crm_v2_events(owner_id, lead_id, created_at desc);

alter table public.crm_v2_leads enable row level security;
alter table public.crm_v2_events enable row level security;
revoke all on public.crm_v2_leads, public.crm_v2_events from anon, authenticated;

create or replace function public.crm_v2_get_leads(p_secret text, p_owner text)
returns jsonb language plpgsql security definer set search_path = public, crm_private, pg_catalog as $$
begin
  if not crm_private.valid_secret(p_secret) then raise exception 'unauthorized'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id', l.id, 'datasetId', l.dataset_id, 'placeId', l.place_id, 'name', l.name, 'segment', l.segment,
    'category', l.category, 'address', l.address, 'city', l.city, 'neighborhood', l.neighborhood,
    'phone', l.phone, 'whatsapp', l.whatsapp, 'email', l.email, 'instagram', l.instagram,
    'mapsUrl', l.maps_url, 'imageUrl', l.image_url, 'website', l.website, 'rating', l.rating,
    'reviews', l.reviews, 'status', l.status, 'preferredChannel', l.preferred_channel, 'notes', l.notes,
    'nextFollowUpAt', l.next_follow_up_at, 'lastContactAt', l.last_contact_at,
    'createdAt', l.created_at, 'updatedAt', l.updated_at
  ) order by l.updated_at desc) from public.crm_v2_leads l where l.owner_id = p_owner), '[]'::jsonb);
end; $$;

create or replace function public.crm_v2_import_leads(p_secret text, p_owner text, p_dataset text, p_segment text, p_leads jsonb)
returns jsonb language plpgsql security definer set search_path = public, crm_private, pg_catalog as $$
declare imported integer := 0;
begin
  if not crm_private.valid_secret(p_secret) then raise exception 'unauthorized'; end if;
  insert into public.crm_v2_leads(owner_id,id,dataset_id,place_id,name,segment,category,address,city,neighborhood,phone,whatsapp,email,instagram,maps_url,image_url,website,rating,reviews,status,preferred_channel,notes,created_at,updated_at)
  select p_owner, item->>'id', p_dataset, item->>'placeId', item->>'name', p_segment, item->>'category', item->>'address', item->>'city', item->>'neighborhood', item->>'phone', item->>'whatsapp', item->>'email', item->>'instagram', item->>'mapsUrl', item->>'imageUrl', item->>'website', nullif(item->>'rating','')::numeric, nullif(item->>'reviews','')::integer, 'NEW', nullif(item->>'preferredChannel',''), '', now(), now()
  from jsonb_array_elements(p_leads) item
  where coalesce(item->>'id','') <> '' and (coalesce(item->>'whatsapp','') <> '' or coalesce(item->>'email','') <> '' or coalesce(item->>'instagram','') <> '')
  on conflict (owner_id,id) do update set dataset_id=excluded.dataset_id, place_id=excluded.place_id, name=excluded.name, segment=excluded.segment, category=excluded.category, address=excluded.address, city=excluded.city, neighborhood=excluded.neighborhood, phone=excluded.phone, whatsapp=excluded.whatsapp, email=excluded.email, instagram=excluded.instagram, maps_url=excluded.maps_url, image_url=excluded.image_url, website=excluded.website, rating=excluded.rating, reviews=excluded.reviews, updated_at=now();
  get diagnostics imported = row_count;
  return jsonb_build_object('imported', imported);
end; $$;

create or replace function public.crm_v2_update_lead(p_secret text, p_owner text, p_lead_id text, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public, crm_private, pg_catalog as $$
declare previous text; l public.crm_v2_leads;
begin
  if not crm_private.valid_secret(p_secret) then raise exception 'unauthorized'; end if;
  select status into previous from public.crm_v2_leads where owner_id=p_owner and id=p_lead_id;
  update public.crm_v2_leads set
    status = coalesce(p_patch->>'status', status),
    preferred_channel = case when p_patch ? 'preferredChannel' then nullif(p_patch->>'preferredChannel','') else preferred_channel end,
    notes = case when p_patch ? 'notes' then coalesce(p_patch->>'notes','') else notes end,
    next_follow_up_at = case when p_patch ? 'nextFollowUpAt' then nullif(p_patch->>'nextFollowUpAt','')::timestamptz else next_follow_up_at end,
    last_contact_at = case when p_patch ? 'lastContactAt' then nullif(p_patch->>'lastContactAt','')::timestamptz else last_contact_at end,
    updated_at = now()
  where owner_id=p_owner and id=p_lead_id returning * into l;
  if l.id is null then raise exception 'lead not found'; end if;
  if previous is distinct from l.status then insert into public.crm_v2_events(owner_id,lead_id,event_type,from_status,to_status) values (p_owner,p_lead_id,'STATUS_CHANGED',previous,l.status); end if;
  return jsonb_build_object('id',l.id,'datasetId',l.dataset_id,'placeId',l.place_id,'name',l.name,'segment',l.segment,'category',l.category,'address',l.address,'city',l.city,'neighborhood',l.neighborhood,'phone',l.phone,'whatsapp',l.whatsapp,'email',l.email,'instagram',l.instagram,'mapsUrl',l.maps_url,'imageUrl',l.image_url,'website',l.website,'rating',l.rating,'reviews',l.reviews,'status',l.status,'preferredChannel',l.preferred_channel,'notes',l.notes,'nextFollowUpAt',l.next_follow_up_at,'lastContactAt',l.last_contact_at,'createdAt',l.created_at,'updatedAt',l.updated_at);
end; $$;

revoke execute on function public.crm_v2_get_leads(text,text) from public;
revoke execute on function public.crm_v2_import_leads(text,text,text,text,jsonb) from public;
revoke execute on function public.crm_v2_update_lead(text,text,text,jsonb) from public;
grant execute on function public.crm_v2_get_leads(text,text) to anon;
grant execute on function public.crm_v2_import_leads(text,text,text,text,jsonb) to anon;
grant execute on function public.crm_v2_update_lead(text,text,text,jsonb) to anon;

-- This administrative helper is not part of the CRM API surface.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
