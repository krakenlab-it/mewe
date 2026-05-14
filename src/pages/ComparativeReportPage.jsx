import { RadarComparativo } from "../components/RadarChart";
import { Shell, TopBar } from "../components/ui";
import { INDICES_NOMBRES } from "../data/questions";

export function ComparativeReportPage({ dupla, brechas, onBack, onLogout }) {
  const m = dupla.madre.indices || {};
  const h = dupla.hija.indices || {};
  return (
    <Shell wide>
      <TopBar title="Mapa de la dupla" onBack={onBack} onLogout={onLogout} />
      <div className="chart">
        <RadarComparativo madre={m} hija={h} />
      </div>
      <h3>Brecha promedio: {brechas.promedio}</h3>
      {Object.keys(INDICES_NOMBRES).map((k) => (
        <p key={k}>
          <strong>{INDICES_NOMBRES[k]}:</strong> ±{brechas[k] || 0}
        </p>
      ))}
      <button onClick={onBack}>Volver</button>
    </Shell>
  );
}
