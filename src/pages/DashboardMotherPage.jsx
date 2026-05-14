import { Panel, Shell, StatusCard, TopBar } from "../components/ui";

export function DashboardMotherPage({
  dupla,
  onLogout,
  onStartTest,
  onViewReport,
  onViewComparative,
  onGoCrisis,
  onGoPolicy,
}) {
  const m = dupla.madre;
  const h = dupla.hija;
  const answeredMother = Object.keys(m.respuestas || {}).length;
  const answeredDaughter = Object.keys(h.respuestas || {}).length;

  return (
    <Shell>
      <TopBar title={`Hola, ${m.nombre || ""} 🌿`} subtitle={`Tu código de dupla: ${dupla.codigo}`} onLogout={onLogout} />
      <div className="dashboard-grid">
        <Panel>
          <span className="eyebrow">Tu test</span>
          <StatusCard
            title={m.nombre || "Madre"}
            answered={answeredMother}
            total={96}
            complete={m.completado}
            onAction={m.completado ? onViewReport : onStartTest}
            actionText={m.completado ? "Ver reporte" : answeredMother > 0 ? "Continuar" : "Empezar"}
          />
        </Panel>

        <Panel>
          <span className="eyebrow">Tu hija</span>
          {h.nombre ? (
            <StatusCard title={h.nombre} answered={answeredDaughter} total={48} complete={h.completado} />
          ) : (
            <div className="empty-state">
              <p>Tu hija todavía no ha entrado.</p>
              <strong>Compártele el código {dupla.codigo}</strong>
            </div>
          )}
        </Panel>

        <Panel tone="highlight">
          <span className="eyebrow">Mapa de la dupla</span>
          <h3>Comparativo madre-hija</h3>
          {(m.completado && h.completado) ? (
            <button onClick={onViewComparative}>Ver mapa comparativo</button>
          ) : (
            <p className="muted">Se desbloquea cuando ambas terminen su test.</p>
          )}
        </Panel>
      </div>

      <div className="actions">
        <button className="ghost" onClick={onGoPolicy}>Política</button>
        <button className="ghost" onClick={onGoCrisis}>Recursos de apoyo</button>
      </div>
    </Shell>
  );
}
