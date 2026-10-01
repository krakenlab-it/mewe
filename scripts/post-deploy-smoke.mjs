#!/usr/bin/env node
/**
 * Post-deploy validation for MeWe.
 * Checks frontend availability and Supabase auth/RPC health.
 *
 * Required env:
 *   DEPLOY_URL
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function checkFrontend(deployUrl) {
  const response = await fetch(deployUrl, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Frontend check failed: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  if (!html.includes("root")) {
    throw new Error("Frontend HTML does not include app root container");
  }
  console.log(`[smoke] frontend ok: ${deployUrl}`);
}

async function checkSupabase(url, anonKey) {
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error: authError } = await client.auth.signInAnonymously();
  if (authError) {
    throw new Error(`Anonymous auth failed: ${authError.message}`);
  }

  const { error: rpcError } = await client.rpc("is_facilitator_admin");
  if (rpcError) {
    throw new Error(`RPC health check failed: ${rpcError.message}`);
  }

  console.log("[smoke] supabase auth + rpc ok");
}

async function main() {
  const deployUrl = required("DEPLOY_URL");
  const supabaseUrl = required("SUPABASE_URL");
  const supabaseAnonKey = required("SUPABASE_ANON_KEY");

  await checkFrontend(deployUrl);
  await checkSupabase(supabaseUrl, supabaseAnonKey);
  console.log("[smoke] all checks passed");
}

main().catch((error) => {
  console.error(`[smoke] failed: ${error.message}`);
  process.exit(1);
});
