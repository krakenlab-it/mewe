import { createSupabaseBrowserClient, backendMode } from "./supabaseClient";
import { hasAdminSession, setAdminSession } from "./session";

const LOCAL_ADMIN_PASS = import.meta.env.VITE_MEWE_LOCAL_ADMIN_PASS || "mewe2026";

function extractErrorMessage(error) {
  if (!error) return "Error backend";
  return error.message || error.error_description || error.description || "Error backend";
}

function createLocalStorageAdapter() {
  return {
    mode: "local",
    guardarDupla: async (codigo, data) => {
      localStorage.setItem(`mewe_dupla_${codigo}`, JSON.stringify(data));
    },
    cargarDupla: async (codigo) => {
      const raw = localStorage.getItem(`mewe_dupla_${codigo}`);
      return raw ? JSON.parse(raw) : null;
    },
    eliminarDupla: async (codigo) => {
      localStorage.removeItem(`mewe_dupla_${codigo}`);
    },
    listarDuplas: async () => {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("mewe_dupla_")) continue;
        try {
          out.push(JSON.parse(localStorage.getItem(k)));
        } catch (_e) {
          // ignore malformed entries
        }
      }
      return out;
    },
    claimPairAccess: async () => {},
    startFreshAnonymousSession: async () => {},
    loginAdmin: async (_email, password) => {
      if (password !== LOCAL_ADMIN_PASS) throw new Error("Contraseña incorrecta");
      setAdminSession(true);
    },
    isAdminSession: async () => hasAdminSession(),
    logout: async () => {},
    seedQuestionBank: async () => 0,
  };
}

async function ensureAnonymousSession(client) {
  const { data } = await client.auth.getSession();
  if (data.session) return;
  const { error } = await client.auth.signInAnonymously();
  if (error) throw error;
}

async function startFreshAnonymousSession(client) {
  await client.auth.signOut();
  const { error } = await client.auth.signInAnonymously();
  if (error) throw error;
}

function createSupabaseStorageAdapter(client) {
  const localFallback = createLocalStorageAdapter();

  const rpc = async (fn, args = {}) => {
    const { data, error } = await client.rpc(fn, args);
    if (error) {
      throw new Error(extractErrorMessage(error));
    }
    return data;
  };

  return {
    mode: "supabase",
    guardarDupla: async (codigo, data) => {
      await rpc("upsert_pair_snapshot", { p_pair_code: codigo, p_payload: data });
      await localFallback.guardarDupla(codigo, data);
    },
    cargarDupla: async (codigo) => {
      try {
        const data = await rpc("get_pair_snapshot", { p_pair_code: codigo });
        if (data) await localFallback.guardarDupla(codigo, data);
        return data || null;
      } catch (_e) {
        return localFallback.cargarDupla(codigo);
      }
    },
    eliminarDupla: async (codigo) => {
      await rpc("admin_delete_pair", { p_pair_code: codigo, p_reason: "admin_ui_delete" });
      await localFallback.eliminarDupla(codigo);
    },
    listarDuplas: async () => {
      try {
        const data = await rpc("list_pair_snapshots");
        return Array.isArray(data) ? data : (data ? [data] : []);
      } catch (_e) {
        return localFallback.listarDuplas();
      }
    },
    claimPairAccess: async (codigo, rol) => {
      const map = { madre: "mother", hija: "daughter" };
      await rpc("claim_pair_access", { p_pair_code: codigo, p_role: map[rol] || rol });
    },
    startFreshAnonymousSession: async () => {
      await startFreshAnonymousSession(client);
    },
    loginAdmin: async (email, password) => {
      if (!email) throw new Error("Falta el email de la facilitadora");
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Credenciales inválidas");
      const admin = await rpc("is_facilitator_admin");
      if (!admin) {
        await client.auth.signOut();
        throw new Error("Este usuario no tiene rol de facilitadora admin.");
      }
      setAdminSession(true);
    },
    isAdminSession: async () => {
      const { data } = await client.auth.getSession();
      if (!data.session) return false;
      const admin = await rpc("is_facilitator_admin");
      if (admin) setAdminSession(true);
      return !!admin;
    },
    logout: async () => {
      await client.auth.signOut();
      await ensureAnonymousSession(client);
    },
    seedQuestionBank: async (code, version, questions) => (
      rpc("seed_question_bank", {
        p_questionnaire_code: code,
        p_version: version,
        p_questions: questions,
      })
    ),
  };
}

export async function createStorageAdapter() {
  const local = createLocalStorageAdapter();
  if (backendMode === "local") {
    return { storage: local, client: null };
  }

  const client = createSupabaseBrowserClient();
  if (!client) {
    return { storage: local, client: null };
  }

  try {
    await ensureAnonymousSession(client);
    return { storage: createSupabaseStorageAdapter(client), client };
  } catch (_e) {
    return { storage: local, client: null };
  }
}
