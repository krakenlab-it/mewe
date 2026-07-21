import { execFileSync } from "node:child_process";
import { createServiceClient } from "./supabase.js";

function sqlLiteral(value) {
  if (value == null) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function querySql(sql) {
  const stdout = execFileSync(
    "supabase",
    ["db", "query", "--local", "--output-format", "json", sql],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const trimmed = stdout.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.rows)) return parsed.rows;
  if (Array.isArray(parsed?.result)) return parsed.result;
  if (Array.isArray(parsed?.data)) return parsed.data;
  return [];
}

async function selectRows(table, applyFilters, sql) {
  const client = createServiceClient();
  let query = client.from(table).select("*");
  query = applyFilters(query);
  const { data, error } = await query;
  if (!error) return Array.isArray(data) ? data : data ? [data] : [];

  if (error.code === "42501" || /permission denied/i.test(error.message || "")) {
    return querySql(sql);
  }
  throw error;
}

export async function getPairByCode(pairCode) {
  const code = pairCode.toUpperCase();
  const rows = await selectRows(
    "pairs",
    (q) => q.eq("pair_code", code).limit(1),
    `select * from public.pairs where pair_code = ${sqlLiteral(code)} limit 1;`,
  );
  return rows[0] || null;
}

export async function getParticipants(pairId) {
  return selectRows(
    "participants",
    (q) => q.eq("pair_id", pairId).order("role", { ascending: true }),
    `
      select *
      from public.participants
      where pair_id = ${sqlLiteral(pairId)}::uuid
      order by role asc;
    `,
  );
}

export async function getResponses(participantId) {
  return selectRows(
    "responses",
    (q) => q.eq("participant_id", participantId),
    `
      select *
      from public.responses
      where participant_id = ${sqlLiteral(participantId)}::uuid;
    `,
  );
}

export async function getIndices(participantId) {
  return selectRows(
    "computed_indices",
    (q) => q.eq("participant_id", participantId),
    `
      select *
      from public.computed_indices
      where participant_id = ${sqlLiteral(participantId)}::uuid;
    `,
  );
}

export async function getComparativeReport(pairId) {
  const rows = await selectRows(
    "comparative_reports",
    (q) => q.eq("pair_id", pairId).limit(1),
    `
      select *
      from public.comparative_reports
      where pair_id = ${sqlLiteral(pairId)}::uuid
      limit 1;
    `,
  );
  return rows[0] || null;
}

export async function getIdentitiesForParticipant(participantId) {
  return selectRows(
    "participant_identities",
    (q) => q.eq("participant_id", participantId),
    `
      select *
      from public.participant_identities
      where participant_id = ${sqlLiteral(participantId)}::uuid;
    `,
  );
}

export async function getAccessAttempts(pairCode) {
  const code = pairCode.toUpperCase();
  return selectRows(
    "pair_access_attempts",
    (q) => q.eq("pair_code", code).order("attempted_at", { ascending: false }),
    `
      select *
      from public.pair_access_attempts
      where pair_code = ${sqlLiteral(code)}
      order by attempted_at desc;
    `,
  );
}

export async function getAdminAuditForPair(pairId) {
  return selectRows(
    "admin_actions_audit",
    (q) => q.eq("pair_id", pairId).order("created_at", { ascending: false }),
    `
      select *
      from public.admin_actions_audit
      where pair_id = ${sqlLiteral(pairId)}::uuid
      order by created_at desc;
    `,
  );
}

export async function countQuestions() {
  const { count, error } = await createServiceClient()
    .from("questions")
    .select("*", { count: "exact", head: true });
  if (!error) return count || 0;

  if (error.code === "42501" || /permission denied/i.test(error.message || "")) {
    const rows = querySql("select count(*)::int as count from public.questions;");
    return Number(rows[0]?.count || 0);
  }
  throw error;
}
