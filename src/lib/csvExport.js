const CSV_HEADER = [
  "codigo",
  "taller",
  "creada_en",
  "madre_nombre",
  "madre_completado",
  "madre_seguridad",
  "madre_regulacion",
  "madre_presencia",
  "madre_validacion",
  "madre_apertura",
  "madre_saturacion",
  "madre_presion_social",
  "madre_conexion_familiar",
  "madre_conciencia",
  "hija_nombre",
  "hija_completado",
  "hija_seguridad",
  "hija_regulacion",
  "hija_presencia",
  "hija_validacion",
  "hija_apertura",
  "hija_saturacion",
  "hija_presion_social",
  "hija_conexion_familiar",
  "hija_conciencia",
].join(",");

export function csvEscape(value) {
  if (value == null) return "";
  if (typeof value === "string") {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return String(value);
}

export function buildDuplasCsv(duplas) {
  const rows = [CSV_HEADER];

  for (const d of duplas || []) {
    const m = d.madre || {};
    const h = d.hija || {};
    const mI = m.indices || {};
    const hI = h.indices || {};

    rows.push([
      csvEscape(d.codigo),
      csvEscape(d.taller),
      csvEscape(d.creadaEn),
      csvEscape(m.nombre),
      m.completado ? "si" : "no",
      csvEscape(mI.seguridad),
      csvEscape(mI.regulacion),
      csvEscape(mI.presencia),
      csvEscape(mI.validacion),
      csvEscape(mI.apertura),
      csvEscape(mI.saturacion),
      csvEscape(mI.presion_social),
      csvEscape(mI.conexion_familiar),
      csvEscape(mI.conciencia_relacional),
      csvEscape(h.nombre),
      h.completado ? "si" : "no",
      csvEscape(hI.seguridad),
      csvEscape(hI.regulacion),
      csvEscape(hI.presencia),
      csvEscape(hI.validacion),
      csvEscape(hI.apertura),
      csvEscape(hI.saturacion),
      csvEscape(hI.presion_social),
      csvEscape(hI.conexion_familiar),
      csvEscape(hI.conciencia_relacional),
    ].join(","));
  }

  return rows.join("\n");
}

export function exportDuplasCsv(duplas) {
  const csv = buildDuplasCsv(duplas);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `mewe_duplas_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
