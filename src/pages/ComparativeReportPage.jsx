import { useState } from "react";
import { RadarComparativo } from "../components/RadarChart";
import { BrandMark, Shell, TopBar } from "../components/ui";
import { INDICES_NOMBRES } from "../data/questions";
import { downloadElementAsPdf } from "../lib/pdfExport";

export function ComparativeReportPage({ dupla, brechas, meta, onBack, onLogout }) {
  const [downloading, setDownloading] = useState(false);
  const m = dupla.madre.indices || {};
  const h = dupla.hija.indices || {};
  const dimsOrdenadas = meta?.dimsOrdenadas || Object.keys(INDICES_NOMBRES);
  const cuadM = meta?.cuadM;
  const cuadH = meta?.cuadH;
  const tallerTexto = cuadM?.id === cuadH?.id
    ? `Las dos perciben el vínculo en el mismo cuadrante (${cuadM?.titulo}). Esto es notable: hay sintonía en la lectura. El taller va a profundizar el patrón compartido.`
    : `Cada una percibe el vínculo en un cuadrante distinto. La madre lo ve como "${cuadM?.titulo}", la hija como "${cuadH?.titulo}". El ejercicio del "espejo borroso" trabaja exactamente esto.`;

  async function handleDownloadPdf(event) {
    setDownloading(true);
    await downloadElementAsPdf(
      "reporte-comparativo-contenido",
      "MeWe_dupla_comparativo.pdf",
      event.currentTarget,
    );
    setDownloading(false);
  }

  return (
    <Shell wide>
      <TopBar title="Mapa de la dupla" onBack={onBack} onLogout={onLogout} />
      <div id="reporte-comparativo-contenido">
        <section className="report-brand center">
          <BrandMark compact />
          <p className="muted">Mapa de la dupla · {dupla.madre.nombre} + {dupla.hija.nombre}</p>
        </section>
        <section className="report-hero">
          <div>
            <span className="eyebrow">Comparativo</span>
            <h2>{dupla.madre.nombre || "Madre"} + {dupla.hija.nombre || "Hija"}</h2>
            <p>Una vista compartida para ubicar acuerdos, diferencias y conversaciones posibles.</p>
          </div>
          <div className="score-orb">{brechas.promedio}</div>
        </section>

        <section className="report-section">
          <h3>Cómo ve cada una el vínculo</h3>
          <div className="quadrant-grid">
            <div className="quadrant-card mother">
              <h4>{dupla.madre.nombre || "Madre"} ve:</h4>
              <p>{cuadM?.emoji} <strong>{cuadM?.titulo}</strong></p>
              <p className="muted">{cuadM?.desc}</p>
            </div>
            <div className="quadrant-card daughter">
              <h4>{dupla.hija.nombre || "Hija"} ve:</h4>
              <p>{cuadH?.emoji} <strong>{cuadH?.titulo}</strong></p>
              <p className="muted">{cuadH?.desc}</p>
            </div>
          </div>
        </section>

        <section className="report-section">
          <h3>Mapa comparativo</h3>
          <p className="muted">{dupla.madre.nombre} (terracota) vs {dupla.hija.nombre} (verde oliva)</p>
          <div className="chart">
            <RadarComparativo madre={m} hija={h} />
          </div>
        </section>

        <section className="report-section">
          <h3>Brechas de percepción</h3>
          <p>Brecha promedio: <strong>{brechas.promedio} puntos</strong>. {meta?.brechaTexto}</p>
          <div className="brecha-list">
            {dimsOrdenadas.map((k) => (
              <div className="brecha-row" key={k}>
                <div className="brecha-label">{INDICES_NOMBRES[k]}</div>
                <div className="brecha-bar-container">
                  <div className="brecha-bar-madre" style={{ width: `${m[k] || 0}%` }} />
                  <div className="brecha-bar-hija" style={{ width: `${h[k] || 0}%` }} />
                </div>
                <div className="brecha-value">±{brechas[k] || 0}</div>
              </div>
            ))}
          </div>
          <p className="muted small-note">Las dimensiones con mayor brecha son material vivo para el taller.</p>
        </section>

        <section className="report-section">
          <h3>En el taller</h3>
          <p>{tallerTexto}</p>
        </section>
      </div>

      <div className="actions">
        <button onClick={handleDownloadPdf} disabled={downloading}>Descargar PDF</button>
        <button onClick={onBack}>Volver al dashboard</button>
      </div>
    </Shell>
  );
}
