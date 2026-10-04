import { createHash } from "node:crypto";
import { DEMO_LEADS } from "./demo-data";
import { isContactable } from "./contact";
import type { ImportResult, Lead, LeadPatch } from "./types";

type DbProvider = "oracle" | "supabase-transition" | "demo";

declare global {
  var __prospectDemoLeads: Lead[] | undefined;
}

function provider(): DbProvider {
  if (process.env.ORACLE_CONNECT_STRING && process.env.ORACLE_USER && process.env.ORACLE_PASSWORD) return "oracle";
  if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.CRM_SHARED_SECRET) return "supabase-transition";
  return "demo";
}

export function databaseProvider(): DbProvider {
  return provider();
}

function demoLeads(): Lead[] {
  globalThis.__prospectDemoLeads ??= structuredClone(DEMO_LEADS);
  return globalThis.__prospectDemoLeads;
}

function stableId(datasetId: string, placeId: string | null, name: string, phone: string | null): string {
  if (placeId) return placeId;
  return createHash("sha256").update(`${datasetId}|${name}|${phone || ""}`).digest("hex").slice(0, 32);
}

function mapOracle(row: Record<string, unknown>): Lead {
  const value = (key: string) => row[key] ?? row[key.toUpperCase()];
  return {
    id: String(value("id")), datasetId: String(value("dataset_id")), placeId: value("place_id") as string | null,
    name: String(value("name")), segment: String(value("segment")), category: value("category") as string | null,
    address: value("address") as string | null, city: value("city") as string | null, neighborhood: value("neighborhood") as string | null,
    phone: value("phone") as string | null, whatsapp: value("whatsapp") as string | null, email: value("email") as string | null,
    instagram: value("instagram") as string | null, mapsUrl: value("maps_url") as string | null, imageUrl: value("image_url") as string | null,
    website: value("website") as string | null, rating: value("rating") == null ? null : Number(value("rating")),
    reviews: value("reviews") == null ? null : Number(value("reviews")), status: String(value("status")) as Lead["status"],
    preferredChannel: value("preferred_channel") as Lead["preferredChannel"], notes: String(value("notes") || ""),
    nextFollowUpAt: value("next_follow_up_at") ? new Date(String(value("next_follow_up_at"))).toISOString() : null,
    lastContactAt: value("last_contact_at") ? new Date(String(value("last_contact_at"))).toISOString() : null,
    createdAt: new Date(String(value("created_at"))).toISOString(), updatedAt: new Date(String(value("updated_at"))).toISOString(),
  };
}

async function withOracle<T>(fn: (connection: import("oracledb").Connection, oracle: typeof import("oracledb")) => Promise<T>): Promise<T> {
  const oracle = await import("oracledb");
  const connection = await oracle.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
    configDir: process.env.ORACLE_CONFIG_DIR || undefined,
    walletLocation: process.env.ORACLE_WALLET_LOCATION || undefined,
    walletPassword: process.env.ORACLE_WALLET_PASSWORD || undefined,
  });
  try {
    return await fn(connection, oracle);
  } finally {
    await connection.close();
  }
}

async function supabaseRpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_PUBLISHABLE_KEY || "",
      authorization: `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY || ""}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ p_secret: process.env.CRM_SHARED_SECRET, p_owner: process.env.CRM_OWNER_ID || "arthur", ...body }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `Supabase ${response.status}`);
  return payload as T;
}

export async function listLeads(): Promise<Lead[]> {
  if (provider() === "oracle") {
    return withOracle(async (connection, oracle) => {
      const result = await connection.execute<Record<string, unknown>>(
        `select * from crm_leads order by updated_at desc`, {}, { outFormat: oracle.OUT_FORMAT_OBJECT }
      );
      return (result.rows || []).map(mapOracle);
    });
  }
  if (provider() === "supabase-transition") return supabaseRpc<Lead[]>("crm_v2_get_leads", {});
  return demoLeads();
}

export async function updateLead(id: string, patch: LeadPatch): Promise<Lead> {
  if (provider() === "oracle") {
    return withOracle(async (connection, oracle) => {
      const currentResult = await connection.execute<Record<string, unknown>>(
        `select * from crm_leads where id = :id`, { id }, { outFormat: oracle.OUT_FORMAT_OBJECT }
      );
      const current = currentResult.rows?.[0] ? mapOracle(currentResult.rows[0]) : null;
      if (!current) throw new Error("Lead não encontrado");
      const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
      await connection.execute(
        `update crm_leads set status=:status, preferred_channel=:preferredChannel, notes=:notes,
         next_follow_up_at=to_timestamp_tz(:nextFollowUpAt default null on conversion error, 'YYYY-MM-DD\"T\"HH24:MI:SS.FFTZH:TZM'),
         last_contact_at=to_timestamp_tz(:lastContactAt default null on conversion error, 'YYYY-MM-DD\"T\"HH24:MI:SS.FFTZH:TZM'),
         updated_at=systimestamp where id=:id`,
        { id, status: next.status, preferredChannel: next.preferredChannel, notes: next.notes, nextFollowUpAt: next.nextFollowUpAt, lastContactAt: next.lastContactAt },
        { autoCommit: true }
      );
      if (current.status !== next.status) {
        await connection.execute(
          `insert into crm_lead_events (lead_id, event_type, from_status, to_status, created_at)
           values (:id, 'STATUS_CHANGED', :fromStatus, :toStatus, systimestamp)`,
          { id, fromStatus: current.status, toStatus: next.status },
          { autoCommit: true }
        );
      }
      return next;
    });
  }
  if (provider() === "supabase-transition") return supabaseRpc<Lead>("crm_v2_update_lead", { p_lead_id: id, p_patch: patch });
  const leads = demoLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index < 0) throw new Error("Lead não encontrado");
  leads[index] = { ...leads[index], ...patch, updatedAt: new Date().toISOString() };
  return leads[index];
}

export async function importLeads(datasetId: string, segment: string, candidates: Lead[], stats: Omit<ImportResult, "imported">): Promise<ImportResult> {
  const valid = candidates.filter(isContactable).map((lead) => ({
    ...lead,
    id: stableId(datasetId, lead.placeId, lead.name, lead.phone),
    datasetId,
    segment,
  }));

  if (provider() === "oracle") {
    await withOracle(async (connection) => {
      for (const lead of valid) {
        await connection.execute(
          `merge into crm_leads target using (select :id id from dual) source on (target.id = source.id)
           when matched then update set name=:name, segment=:segment, category=:category, address=:address, city=:city,
             neighborhood=:neighborhood, phone=:phone, whatsapp=:whatsapp, email=:email, instagram=:instagram,
             maps_url=:mapsUrl, image_url=:imageUrl, website=:website, rating=:rating, reviews=:reviews, updated_at=systimestamp
           when not matched then insert (id,dataset_id,place_id,name,segment,category,address,city,neighborhood,phone,whatsapp,email,instagram,maps_url,image_url,website,rating,reviews,status,preferred_channel,notes,created_at,updated_at)
             values (:id,:datasetId,:placeId,:name,:segment,:category,:address,:city,:neighborhood,:phone,:whatsapp,:email,:instagram,:mapsUrl,:imageUrl,:website,:rating,:reviews,'NEW',:preferredChannel,'',systimestamp,systimestamp)`,
          lead
        );
      }
      await connection.commit();
    });
  } else if (provider() === "supabase-transition") {
    await supabaseRpc("crm_v2_import_leads", { p_dataset: datasetId, p_segment: segment, p_leads: valid });
  } else {
    const store = demoLeads();
    for (const lead of valid) {
      const index = store.findIndex((item) => item.id === lead.id);
      if (index >= 0) store[index] = { ...store[index], ...lead, status: store[index].status, notes: store[index].notes };
      else store.push(lead);
    }
  }
  return { ...stats, imported: valid.length };
}
