#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const root = process.cwd();
const htmlPath = path.join(root, "me_we_plataforma.html");
const html = fs.readFileSync(htmlPath, "utf8");

const start = html.indexOf("const PREGUNTAS = {");
const end = html.indexOf("const MODULOS = {");
if (start === -1 || end === -1 || end <= start) {
  throw new Error("Could not locate PREGUNTAS constant in me_we_plataforma.html");
}

const preguntasSrc = html.slice(start, end).replace("const PREGUNTAS =", "return");
const PREGUNTAS = new Function(preguntasSrc)();

const postRpc = async (fn, payload) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${fn} failed (${res.status}): ${text}`);
  }
  return res.json();
};

const withOrder = (questions) => questions.map((q, idx) => ({ ...q, sort_order: idx + 1 }));

await postRpc("seed_question_bank", {
  p_questionnaire_code: "mother_v1",
  p_version: "v1",
  p_questions: withOrder(PREGUNTAS.madre),
});

await postRpc("seed_question_bank", {
  p_questionnaire_code: "daughter_v1",
  p_version: "v1",
  p_questions: withOrder(PREGUNTAS.hija),
});

console.log("Question bank seeded successfully.");
