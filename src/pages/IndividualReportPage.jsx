import { useState } from "react";
import { RadarIndividual } from "../components/RadarChart";
import { IndexCard, Shell, TopBar } from "../components/ui";
import { downloadElementAsPdf } from "../lib/pdfExport";

export function IndividualReportPage({ persona, rol, cards, cuadrante, onBack, onLogout, onError }) {
  const [downloading, setDownloading] = useState(false);

  if (!persona) {
    return (
      <Shell wide>
        <TopBar title="Tu mapa Me We" onBack={onBack} onLogout={onLogout} />
        <div className="empty-state">
          <h3>No encontramos este reporte</h3>
          <p className="muted">Vuelve al dashboard para cargar la dupla nuevamente.</p>
          <button type="button" onClick={onBack}>Volver</button>
        </div>
      </Shell>
    );
  }

  const safeCuadrante = cuadrante || {
    emoji: "🌿",
    titulo: "Mapa en preparación",
    desc: "Todavía falta información para clasificar este reporte.",
  };
  const safeCards = Array.isArray(cards) ? cards : [];

  async function handleDownloadPdf(event) {
    setDownloading(true);
    await downloadElementAsPdf(
      "reporte-individual-contenido",
      `MeWe_${rol}_individual.pdf`,
      event.currentTarget,
      { onError },
    );
    setDownloading(false);
  }

  return (
    <Shell wide>
      <TopBar title="Tu mapa Me We" onBack={onBack} onLogout={onLogout} />
      <div id="reporte-individual-contenido">
        <section className="report-hero">
          <div>
            <span className="eyebrow">Reporte individual</span>
            <h2>{persona.nombre || (rol === "madre" ? "Madre" : "Hija")}</h2>
            <p>Lo que ves no es un diagnóstico. Es una foto del momento.</p>
          </div>
          <div className="score-orb">{persona.indices?.conciencia_relacional ?? "—"}</div>
        </section>
        <div className="card quadrant">
          <h3>{safeCuadrante.emoji} {safeCuadrante.titulo}</h3>
          <p>{safeCuadrante.desc}</p>
        </div>
        <div className="chart">
          <RadarIndividual indices={persona.indices || {}} label={persona.nombre || rol} color={rol === "madre" ? "#C0573C" : "#7A8C5D"} />
        </div>
        {safeCards.map((dim) => <IndexCard key={dim.key} dim={dim} />)}
      </div>
      <div className="actions">
        <button type="button" onClick={handleDownloadPdf} disabled={downloading} aria-busy={downloading}>
          {downloading ? "Generando PDF..." : "Descargar PDF"}
        </button>
        <button type="button" onClick={onBack}>Volver</button>
      </div>
    </Shell>
  );
}
