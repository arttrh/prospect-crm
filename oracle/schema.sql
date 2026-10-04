create table crm_leads (
  id varchar2(64 char) primary key,
  dataset_id varchar2(100 char) not null,
  place_id varchar2(255 char),
  name varchar2(500 char) not null,
  segment varchar2(100 char) not null,
  category varchar2(255 char),
  address varchar2(1000 char),
  city varchar2(255 char),
  neighborhood varchar2(255 char),
  phone varchar2(80 char),
  whatsapp varchar2(500 char),
  email varchar2(320 char),
  instagram varchar2(500 char),
  maps_url varchar2(2000 char),
  image_url varchar2(2000 char),
  website varchar2(2000 char),
  rating number(3,2),
  reviews number(10),
  status varchar2(30 char) default 'NEW' not null,
  preferred_channel varchar2(20 char),
  notes clob default empty_clob() not null,
  next_follow_up_at timestamp with time zone,
  last_contact_at timestamp with time zone,
  created_at timestamp with time zone default systimestamp not null,
  updated_at timestamp with time zone default systimestamp not null,
  constraint crm_leads_status_ck check (status in ('NEW','SENT','FOLLOW_UP','REPLIED','SITE_SENT','MEETING','WON','DISQUALIFIED')),
  constraint crm_leads_channel_ck check (preferred_channel is null or preferred_channel in ('WHATSAPP','EMAIL','INSTAGRAM')),
  constraint crm_leads_contact_ck check (whatsapp is not null or email is not null or instagram is not null)
);

create table crm_lead_events (
  id number generated always as identity primary key,
  lead_id varchar2(64 char) not null,
  event_type varchar2(60 char) not null,
  from_status varchar2(30 char),
  to_status varchar2(30 char),
  details clob,
  created_at timestamp with time zone default systimestamp not null,
  constraint crm_events_lead_fk foreign key (lead_id) references crm_leads(id) on delete cascade
);

create index crm_leads_status_idx on crm_leads(status);
create index crm_leads_segment_idx on crm_leads(segment);
create index crm_leads_followup_idx on crm_leads(next_follow_up_at);
create index crm_events_lead_idx on crm_lead_events(lead_id, created_at desc);

comment on table crm_leads is 'CRM single-user: only lead and contact information.';
comment on table crm_lead_events is 'Audit trail tied exclusively to CRM leads.';
