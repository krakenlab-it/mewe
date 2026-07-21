import { beforeAll, describe, expect, it } from "vitest";
import {
  getAccessAttempts,
  getComparativeReport,
  getIdentitiesForParticipant,
  getIndices,
  getPairByCode,
  getParticipants,
  getResponses,
} from "./helpers/db.js";
import {
  rpc,
  signInAnonymous,
  uniquePairCode,
} from "./helpers/supabase.js";

describe("pair lifecycle against local Supabase DB", () => {
  let mother;
  let daughter;
  let pairCode;

  beforeAll(async () => {
    pairCode = uniquePairCode("PL");
    mother = await signInAnonymous();
    daughter = await signInAnonymous();
  });

  it("creates a pair snapshot and persists real pair/participant rows", async () => {
    const payload = {
      codigo: pairCode,
      taller: "E2E-WORKSHOP",
      madre: {
        nombre: "Ana Madre",
        edadHija: "11-12",
        respuestas: { "M1-Q01": 4, "M1-Q02": 3 },
        preguntaIdx: 2,
        completado: false,
        indices: null,
        fechaCompletado: null,
        consentimiento: {
          aceptadoEn: new Date().toISOString(),
          version: "1.0",
        },
      },
      hija: {},
    };

    const snapshot = await rpc(mother.client, "upsert_pair_snapshot", {
      p_pair_code: pairCode,
      p_payload: payload,
    });

    expect(snapshot).toBeTruthy();
    expect(snapshot.codigo).toBe(pairCode);
    expect(snapshot.madre.nombre).toBe("Ana Madre");
    expect(snapshot.madre.respuestas["M1-Q01"]).toBe(4);

    const pair = await getPairByCode(pairCode);
    expect(pair).toBeTruthy();
    expect(pair.status).toBe("active");
    expect(pair.deleted_at).toBeNull();

    const participants = await getParticipants(pair.id);
    expect(participants.map((p) => p.role).sort()).toEqual(["daughter", "mother"]);

    const motherRow = participants.find((p) => p.role === "mother");
    expect(motherRow.display_name).toBe("Ana Madre");
    expect(motherRow.daughter_age_range).toBe("11-12");
    expect(motherRow.question_progress).toBe(2);

    const responses = await getResponses(motherRow.id);
    expect(responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ question_code: "M1-Q01", answer: 4 }),
        expect.objectContaining({ question_code: "M1-Q02", answer: 3 }),
      ]),
    );

    const identities = await getIdentitiesForParticipant(motherRow.id);
    expect(identities.some((row) => row.auth_user_id === mother.user.id)).toBe(true);
  });

  it("claims mother access and logs a successful attempt", async () => {
    await rpc(mother.client, "claim_pair_access", {
      p_pair_code: pairCode,
      p_role: "mother",
    });

    const attempts = await getAccessAttempts(pairCode);
    expect(attempts.some((a) => a.success === true && a.role_requested === "mother")).toBe(true);
  });

  it("lets daughter claim/join and update her profile + answers in DB", async () => {
    await rpc(daughter.client, "claim_pair_access", {
      p_pair_code: pairCode,
      p_role: "daughter",
    });

    const daughterPayload = {
      codigo: pairCode,
      taller: "E2E-WORKSHOP",
      madre: {
        nombre: "Ana Madre",
        edadHija: "11-12",
        respuestas: { "M1-Q01": 4, "M1-Q02": 3 },
        preguntaIdx: 2,
        completado: false,
      },
      hija: {
        nombre: "Lia Hija",
        respuestas: { "H1-Q01": 5, "H1-Q02": 2 },
        preguntaIdx: 2,
        completado: false,
        consentimiento: {
          aceptadoEn: new Date().toISOString(),
          version: "1.0",
        },
      },
    };

    const snapshot = await rpc(daughter.client, "upsert_pair_snapshot", {
      p_pair_code: pairCode,
      p_payload: daughterPayload,
    });
    expect(snapshot.hija.nombre).toBe("Lia Hija");
    expect(snapshot.hija.respuestas["H1-Q01"]).toBe(5);

    const pair = await getPairByCode(pairCode);
    const participants = await getParticipants(pair.id);
    const daughterRow = participants.find((p) => p.role === "daughter");
    expect(daughterRow.display_name).toBe("Lia Hija");

    const responses = await getResponses(daughterRow.id);
    expect(responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ question_code: "H1-Q01", answer: 5 }),
        expect.objectContaining({ question_code: "H1-Q02", answer: 2 }),
      ]),
    );

    const identities = await getIdentitiesForParticipant(daughterRow.id);
    expect(identities.some((row) => row.auth_user_id === daughter.user.id)).toBe(true);
  });

  it("persists completion indices and comparative report rows", async () => {
    const motherIndices = {
      seguridad: 70,
      regulacion: 65,
      presencia: 72,
      validacion: 68,
      apertura: 60,
      saturacion: 40,
      presion_social: 35,
      conexion_familiar: 74,
      conciencia_relacional: 66,
    };
    const daughterIndices = {
      seguridad: 55,
      regulacion: 50,
      presencia: 58,
      validacion: 52,
      apertura: 48,
      saturacion: 45,
      presion_social: 40,
      conexion_familiar: 57,
      conciencia_relacional: 53,
    };

    const completedPayload = {
      codigo: pairCode,
      taller: "E2E-WORKSHOP",
      madre: {
        nombre: "Ana Madre",
        edadHija: "11-12",
        respuestas: { "M1-Q01": 4, "M1-Q02": 3 },
        preguntaIdx: 96,
        completado: true,
        indices: motherIndices,
        fechaCompletado: new Date().toISOString(),
      },
      hija: {
        nombre: "Lia Hija",
        respuestas: { "H1-Q01": 5, "H1-Q02": 2 },
        preguntaIdx: 48,
        completado: true,
        indices: daughterIndices,
        fechaCompletado: new Date().toISOString(),
      },
    };

    // Mother session owns the pair for this write.
    const snapshot = await rpc(mother.client, "upsert_pair_snapshot", {
      p_pair_code: pairCode,
      p_payload: completedPayload,
    });
    expect(snapshot.madre.completado).toBe(true);
    expect(snapshot.hija.completado).toBe(true);
    expect(snapshot.madre.indices.seguridad).toBe(70);
    expect(snapshot.hija.indices.seguridad).toBe(55);

    const pair = await getPairByCode(pairCode);
    const participants = await getParticipants(pair.id);
    const motherRow = participants.find((p) => p.role === "mother");
    const daughterRow = participants.find((p) => p.role === "daughter");
    expect(motherRow.is_completed).toBe(true);
    expect(daughterRow.is_completed).toBe(true);

    const motherDbIndices = await getIndices(motherRow.id);
    expect(motherDbIndices.length).toBeGreaterThanOrEqual(8);
    expect(motherDbIndices.find((i) => i.dimension_key === "seguridad")?.value).toBe(70);

    const report = await getComparativeReport(pair.id);
    expect(report).toBeTruthy();
    expect(report.average_gap).toBeTypeOf("number");
    expect(report.report_json?.generatedBy).toBe("db_first_rewrite");
  });

  it("rejects foreign sessions from reading another pair snapshot", async () => {
    const stranger = await signInAnonymous();
    await expect(
      rpc(stranger.client, "get_pair_snapshot", { p_pair_code: pairCode }),
    ).rejects.toThrow(/not authorized|Not authorized/i);
  });

  it("records failed join attempts for invalid codes", async () => {
    const stranger = await signInAnonymous();
    const badCode = uniquePairCode("ZZ");
    await expect(
      rpc(stranger.client, "claim_pair_access", {
        p_pair_code: badCode,
        p_role: "daughter",
      }),
    ).rejects.toThrow(/not found|Pair code/i);

    const attempts = await getAccessAttempts(badCode);
    expect(attempts.length).toBeGreaterThan(0);
    expect(attempts[0].success).toBe(false);
    expect(attempts[0].failure_reason).toBe("pair_not_found");
  });
});
