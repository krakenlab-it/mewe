import { Panel, Shell, StatusCard, TopBar } from "../components/ui";

export function DashboardDaughterPage({ dupla, onLogout, onStartTest, onViewReport, onGoCrisis, onGoPolicy }) {
  const h = dupla.hija;
  const answered = Object.keys(h.respuestas || {}).length;
  return (
    <Shell>
      <TopBar title={`Hola, ${h.nombre || ""} 🌱`} onLogout={onLogout} />
      <Panel tone="highlight">
        <span className="eyebrow">Tu espacio</span>
        <StatusCard
          title={h.nombre || "Hija"}
          answered={answered}
          total={48}
          complete={h.completado}
          onAction={h.completado ? onViewReport : onStartTest}
          actionText={h.completado ? "Ver reporte" : answered > 0 ? "Continuar" : "Empezar"}
        />
      </Panel>
      <div className="actions">
        <button className="ghost" onClick={onGoPolicy}>Política</button>
        <button className="ghost" onClick={onGoCrisis}>Recursos de apoyo</button>
      </div>
    </Shell>
  );
}
