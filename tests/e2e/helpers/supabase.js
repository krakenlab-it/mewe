import { createClient } from "@supabase/supabase-js";
import { getE2EEnv } from "./env.js";

export function createAnonClient() {
  const { url, anonKey } = getE2EEnv();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createServiceClient() {
  const { url, serviceRoleKey } = getE2EEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function signInAnonymous(client = createAnonClient()) {
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  if (!data.session) throw new Error("Anonymous sign-in did not return a session");
  return { client, user: data.user, session: data.session };
}

export async function ensureAdminUser({
  email = "facilitator.e2e@mewe.test",
  password = "MeWeE2EAdmin!234",
} = {}) {
  const service = createServiceClient();
  const listed = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listed.error) throw listed.error;

  let user = listed.data.users.find((u) => u.email === email);
  if (!user) {
    const created = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { app_role: "facilitator_admin" },
    });
    if (created.error) throw created.error;
    user = created.data.user;
  } else {
    const updated = await service.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      app_metadata: { ...(user.app_metadata || {}), app_role: "facilitator_admin" },
    });
    if (updated.error) throw updated.error;
    user = updated.data.user;
  }

  return { email, password, user };
}

export async function signInAdmin(email, password) {
  const client = createAnonClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, user: data.user, session: data.session };
}

export async function rpc(client, fn, args = {}) {
  const { data, error } = await client.rpc(fn, args);
  if (error) throw error;
  return data;
}

/** Unique pair code that satisfies DB constraint ^[A-HJKMNPQRSTUVWXYZ2-9]{6}$. */
export function uniquePairCode(prefix = "E2") {
  const alphabet = "A23456789BCDEFGHJKMNPQRSTUVWXYZ";
  let out = prefix.slice(0, 2).toUpperCase().replace(/[^A-HJKMNPQRSTUVWXYZ2-9]/g, "A");
  while (out.length < 6) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out.slice(0, 6);
}
