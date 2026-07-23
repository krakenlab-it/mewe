import { beforeAll, describe, expect, it } from "vitest";
import {
  countQuestions,
  getAdminAuditForPair,
  getPairByCode,
  getParticipants,
  getResponses,
} from "./helpers/db.js";
import {
  ensureAdminUser,
  rpc,
  signInAdmin,
  signInAnonymous,
  uniquePairCode,
} from "./helpers/supabase.js";

describe("admin flows against local Supabase DB", () => {
  let admin;
  let pairCode;
  let pairId;

  beforeAll(async () => {
    const creds = await ensureAdminUser();
    admin = await signInAdmin(creds.email, creds.password);

    const isAdmin = await rpc(admin.client, "is_facilitator_admin");
    expect(isAdmin).toBe(true);

    pairCode = uniquePairCode("AD");
    const mother = await signInAnonymous();
    await rpc(mother.client, "upsert_pair_snapshot", {
      p_pair_code: pairCode,
      p_payload: {
        codigo: pairCode,
        taller: "ADMIN-E2E",
        madre: {
          nombre: "Admin Madre",
          edadHija: "13-14",
          respuestas: { "M1-Q01": 2 },
          preguntaIdx: 1,
          completado: false,
        },
        hija: {
          nombre: "Admin Hija",
          respuestas: { "H1-Q01": 3 },
          preguntaIdx: 1,
          completado: false,
        },
      },
    });
    await rpc(mother.client, "claim_pair_access", {
      p_pair_code: pairCode,
      p_role: "mother",
    });

    const pair = await getPairByCode(pairCode);
    pairId = pair.id;
  });

  it("lists pair snapshots for facilitator admins", async () => {
    const rows = await rpc(admin.client, "list_pair_snapshots");
    const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
    expect(list.some((row) => row.codigo === pairCode)).toBe(true);
  });

  it("seeds question bank rows into the local DB", async () => {
    const before = await countQuestions();
    const inserted = await rpc(admin.client, "seed_question_bank", {
      p_questionnaire_code: "mother_v1",
      p_version: "v1",
      p_questions: [
        {
          id: "M1-Q01",
          mod: "M1",
          txt: "E2E question one",
          dim: "saturacion",
          signo: 1,
          peso: 1,
          sort_order: 1,
        },
        {
          id: "M1-Q02",
          mod: "M1",
          txt: "E2E question two",
          dim: "regulacion",
          signo: -1,
          peso: 1,
          sort_order: 2,
        },
      ],
    });

    expect(Number(inserted)).toBe(2);
    const after = await countQuestions();
    expect(after).toBeGreaterThanOrEqual(Math.max(before, 2));
  });

  it("deletes pair participant data and writes admin audit evidence", async () => {
    const beforeParticipants = await getParticipants(pairId);
    expect(beforeParticipants.length).toBe(2);
    const mother = beforeParticipants.find((p) => p.role === "mother");
    const beforeResponses = await getResponses(mother.id);
    expect(beforeResponses.length).toBeGreaterThan(0);

    await rpc(admin.client, "admin_delete_pair", {
      p_pair_code: pairCode,
      p_reason: "e2e_admin_delete",
    });

    const pair = await getPairByCode(pairCode);
    expect(pair).toBeTruthy();
    expect(pair.status).toBe("deleted");
    expect(pair.deleted_at).toBeTruthy();

    const participants = await getParticipants(pair.id);
    expect(participants.length).toBe(0);

    const audits = await getAdminAuditForPair(pairId);
    expect(audits.length).toBeGreaterThan(0);
    expect(audits[0].action_type).toBe("delete_pair");
    expect(audits[0].metadata?.reason).toBe("e2e_admin_delete");
  });

  it("blocks non-admin users from listing and deleting pairs", async () => {
    const stranger = await signInAnonymous();
    await expect(rpc(stranger.client, "list_pair_snapshots")).rejects.toThrow();
    await expect(
      rpc(stranger.client, "admin_delete_pair", {
        p_pair_code: uniquePairCode("XX"),
        p_reason: "should_fail",
      }),
    ).rejects.toThrow();
  });
});
