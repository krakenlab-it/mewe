import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ClaimPayload = {
  pairCode?: string;
  role?: "mother" | "daughter";
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const body = (await req.json()) as ClaimPayload;
  const pairCode = (body.pairCode ?? "").trim().toUpperCase();
  const role = body.role;

  if (!pairCode || !role) {
    return new Response(JSON.stringify({ error: "pairCode and role are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.rpc("claim_pair_access", {
    p_pair_code: pairCode,
    p_role: role,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
