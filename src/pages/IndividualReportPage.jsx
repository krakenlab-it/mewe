import { RadarIndividual } from "../components/RadarChart";
import { IndexCard, Shell, TopBar } from "../components/ui";

export function IndividualReportPage({ persona, rol, cards, cuadrante, onBack, onLogout }) {
  return (
    <Shell wide>
      <TopBar title="Tu mapa Me We" onBack={onBack} onLogout={onLogout} />
      <section className="report-hero">
        <div>
          <span className="eyebrow">Reporte individual</span>
          <h2>{persona.nombre || (rol === "madre" ? "Madre" : "Hija")}</h2>
          <p>Lo que ves no es un diagnóstico. Es una foto del momento.</p>
        </div>
        <div className="score-orb">{persona.indices?.conciencia_relacional ?? "—"}</div>
      </section>
      <div className="card quadrant">
        <h3>{cuadrante.emoji} {cuadrante.titulo}</h3>
        <p>{cuadrante.desc}</p>
      </div>
      <div className="chart">
        <RadarIndividual indices={persona.indices || {}} label={persona.nombre || rol} color={rol === "madre" ? "#C0573C" : "#7A8C5D"} />
      </div>
      {cards.map((dim) => <IndexCard key={dim.key} dim={dim} />)}
      <div className="actions">
        <button onClick={onBack}>Volver</button>
      </div>
    </Shell>
  );
}
