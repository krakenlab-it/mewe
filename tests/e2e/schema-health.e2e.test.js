import { describe, expect, it } from "vitest";
import { createServiceClient, signInAnonymous } from "./helpers/supabase.js";

async function queryLocal(sql) {
  // Prefer CLI when available; fall back to PostgREST rpc is not enough for catalogs.
  // Service role cannot query pg_catalog via PostgREST, so we shell out when present.
  const { execFileSync } = await import("node:child_process");
  const stdout = execFileSync("supabase", ["db", "query", "--local", sql], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return stdout;
}

describe("schema health on local Supabase", () => {
  it("exposes required public RPC wrappers", async () => {
    const out = await queryLocal(`
      select proname
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and proname in (
          'claim_pair_access',
          'upsert_pair_snapshot',
          'get_pair_snapshot',
          'list_pair_snapshots',
          'admin_delete_pair',
          'seed_question_bank',
          'is_facilitator_admin'
        )
      order by 1;
    `);

    for (const name of [
      "admin_delete_pair",
      "claim_pair_access",
      "get_pair_snapshot",
      "is_facilitator_admin",
      "list_pair_snapshots",
      "seed_question_bank",
      "upsert_pair_snapshot",
    ]) {
      expect(out).toContain(name);
    }
  });

  it("has RLS enabled on core application tables", async () => {
    const out = await queryLocal(`
      select c.relname
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relrowsecurity = true
        and c.relname in (
          'pairs',
          'participants',
          'participant_identities',
          'responses',
          'computed_indices',
          'comparative_reports',
          'pair_access_attempts',
          'admin_actions_audit'
        )
      order by 1;
    `);

    for (const table of [
      "admin_actions_audit",
      "comparative_reports",
      "computed_indices",
      "pair_access_attempts",
      "pairs",
      "participant_identities",
      "participants",
      "responses",
    ]) {
      expect(out).toContain(table);
    }
  });

  it("prevents anonymous users from listing all pairs via direct table access", async () => {
    const { client } = await signInAnonymous();
    const { data, error } = await client.from("pairs").select("id, pair_code");
    // Grants are revoked for authenticated on pairs; expect permission denied or empty failure.
    expect(error).toBeTruthy();
    expect(data == null || data.length === 0).toBe(true);
  });

  it("service role can read pairs for test verification", async () => {
    const service = createServiceClient();
    const { error } = await service.from("pairs").select("id").limit(1);
    expect(error).toBeNull();
  });
});
