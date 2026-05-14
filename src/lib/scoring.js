import { COPY_INDICES, INDICES_INVERTIDOS, INDICES_NOMBRES, PREGUNTAS } from "../data/questions";

export function calcularIndices(rol, respuestas) {
  const preguntas = PREGUNTAS[rol] || [];
  const indices = {};

  for (const dim of Object.keys(INDICES_NOMBRES)) {
    const preguntasDeDim = preguntas.filter((p) => p.dim === dim);
    let suma = 0;
    let pesos = 0;
    for (const p of preguntasDeDim) {
      const resp = respuestas[p.id];
      if (resp == null) continue;
      const v = p.signo === 1 ? resp : 6 - resp;
      suma += v * p.peso;
      pesos += p.peso;
    }
    indices[dim] = pesos === 0 ? null : Math.round(((suma / pesos) - 1) * 25);
  }

  const W = {
    seguridad: 0.20,
    validacion: 0.18,
    apertura: 0.15,
    presencia: 0.12,
    conexion_familiar: 0.10,
    regulacion: 0.10,
    saturacion: 0.08,
    presion_social: 0.07,
  };
  let s = 0;
  let pT = 0;
  for (const d of Object.keys(W)) {
    if (indices[d] == null) continue;
    const v = INDICES_INVERTIDOS.includes(d) ? 100 - indices[d] : indices[d];
    s += v * W[d];
    pT += W[d];
  }
  indices.conciencia_relacional = pT > 0 ? Math.round(s / pT) : null;
  return indices;
}

export function clasificarZona(dim, valor) {
  if (valor == null) return "atencion";
  if (INDICES_INVERTIDOS.includes(dim)) {
    if (valor >= 66) return "cuidado";
    if (valor >= 41) return "atencion";
    return "sostenida";
  }
  if (valor <= 40) return "cuidado";
  if (valor <= 65) return "atencion";
  return "sostenida";
}

export function clasificarCuadrante(indices) {
  const seg = (indices.seguridad + (indices.conexion_familiar || indices.seguridad)) / 2;
  const conex = ((indices.presencia || 50) + (indices.validacion || 50) + (indices.apertura || 50)) / 3;
  const segAlta = seg >= 55;
  const conexAlta = conex >= 55;
  if (segAlta && conexAlta) return { id: "nos_vemos", titulo: "Nos vemos", emoji: "🌻", desc: "Seguridad alta, conexión alta. Hay base y hay conversación. La oportunidad: profundizar." };
  if (segAlta && !conexAlta) return { id: "nos_protegemos", titulo: "Nos protegemos", emoji: "🌱", desc: "Seguridad alta, conexión baja. La oportunidad: abrir el canal." };
  if (!segAlta && conexAlta) return { id: "nos_escuchamos", titulo: "Nos escuchamos", emoji: "🌿", desc: "Seguridad baja, conexión alta. La oportunidad: bajar la activación del sistema." };
  return { id: "nos_necesitamos_comprender_mejor", titulo: "Nos necesitamos comprender mejor", emoji: "🔥", desc: "Seguridad baja, conexión baja. La oportunidad: recordar cuándo sí." };
}

export function calcularBrechas(indicesM, indicesH) {
  const brechas = {};
  const dims = ["seguridad", "regulacion", "presencia", "validacion", "apertura", "saturacion", "presion_social", "conexion_familiar"];
  for (const d of dims) {
    brechas[d] = Math.abs((indicesM[d] || 0) - (indicesH[d] || 0));
  }
  brechas.promedio = Math.round(dims.reduce((s, d) => s + brechas[d], 0) / dims.length);
  return brechas;
}

export function sortDimsByZone(indices) {
  const orden = { cuidado: 0, atencion: 1, sostenida: 2 };
  return Object.keys(INDICES_NOMBRES).sort(
    (a, b) => orden[clasificarZona(a, indices[a])] - orden[clasificarZona(b, indices[b])],
  );
}

export function buildDimCard(dim, indices) {
  const v = indices[dim];
  const zona = clasificarZona(dim, v);
  return {
    key: dim,
    nombre: INDICES_NOMBRES[dim],
    score: v,
    zona,
    texto: COPY_INDICES[dim]?.[zona] || "",
  };
}

export function nuevaDuplaVacia() {
  return {
    codigo: null,
    creadaEn: new Date().toISOString(),
    taller: null,
    madre: {
      nombre: null,
      edadHija: null,
      respuestas: {},
      preguntaIdx: 0,
      completado: false,
      indices: null,
      fechaCompletado: null,
      consentimiento: null,
    },
    hija: {
      nombre: null,
      respuestas: {},
      preguntaIdx: 0,
      completado: false,
      indices: null,
      fechaCompletado: null,
      consentimiento: null,
    },
  };
}

export function generarCodigo() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}
