import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const csvEscape = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const asString = String(value);
  return `"${asString.replaceAll('"', '""')}"`;
};

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.rpc("list_pair_snapshots");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = Array.isArray(data) ? data : [];
  const header = [
    "codigo",
    "taller",
    "creada_en",
    "madre_nombre",
    "madre_completado",
    "madre_conciencia",
    "hija_nombre",
    "hija_completado",
    "hija_conciencia",
  ];

  const body = rows.map((row) => [
    csvEscape(row?.codigo),
    csvEscape(row?.taller),
    csvEscape(row?.creadaEn),
    csvEscape(row?.madre?.nombre),
    csvEscape(row?.madre?.completado ? "si" : "no"),
    csvEscape(row?.madre?.indices?.conciencia_relacional),
    csvEscape(row?.hija?.nombre),
    csvEscape(row?.hija?.completado ? "si" : "no"),
    csvEscape(row?.hija?.indices?.conciencia_relacional),
  ].join(","));

  const csv = [header.join(","), ...body].join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mewe_duplas_export.csv"`,
    },
  });
});
