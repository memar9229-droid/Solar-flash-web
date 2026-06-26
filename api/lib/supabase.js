/**
 * api/lib/supabase.js — Supabase REST client
 * No SDK dependency — uses native fetch
 */
import { httpGet, httpPost, log } from "./http.js";

const SB_URL  = () => {
  const u = process.env.SUPABASE_URL;
  if (!u) throw new Error("SUPABASE_URL env var not set");
  return u;
};

const SB_ANON = () => {
  const k = process.env.SUPABASE_ANON_KEY;
  if (!k) throw new Error("SUPABASE_ANON_KEY env var not set");
  return k;
};

const SB_SVC  = () => {
  const k = process.env.SUPABASE_SERVICE_KEY;
  if (!k) throw new Error("SUPABASE_SERVICE_KEY env var not set");
  return k;
};

function sbHeaders(useService = false) {
  const key = useService ? SB_SVC() : SB_ANON();
  return {
    "apikey":        key,
    "Authorization": `Bearer ${key}`,
    "Content-Type":  "application/json",
  };
}

export async function sbSelect(table, query = "", useService = false) {
  const url = `${SB_URL()}/rest/v1/${table}?${query}`;
  const r   = await httpGet(url, { headers: sbHeaders(useService) });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Supabase SELECT ${table} failed: ${r.status} ${body}`);
  }
  return r.json();
}

export async function sbUpsert(table, data, onConflict = "id") {
  const url = `${SB_URL()}/rest/v1/${table}`;
  const r   = await fetch(url, {
    method:  "POST",
    headers: {
      ...sbHeaders(true),
      "Prefer": `resolution=merge-duplicates`,
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    log("error", `Supabase UPSERT ${table} failed`, { status: r.status, body });
    return false;
  }
  return true;
}

export async function sbInsert(table, data, ignoreDuplicates = false) {
  const url = `${SB_URL()}/rest/v1/${table}`;
  const r   = await fetch(url, {
    method:  "POST",
    headers: {
      ...sbHeaders(true),
      ...(ignoreDuplicates ? { "Prefer": "resolution=ignore-duplicates" } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    log("warn", `Supabase INSERT ${table}`, { status: r.status, body: body.slice(0,200) });
    return false;
  }
  return true;
}
