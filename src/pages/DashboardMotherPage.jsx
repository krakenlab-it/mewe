import { Shell, StatusCard, TopBar } from "../components/ui";

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
      <h3>Tu test</h3>
      <StatusCard
        title={m.nombre || "Madre"}
        answered={answeredMother}
        total={96}
        complete={m.completado}
        onAction={m.completado ? onViewReport : onStartTest}
        actionText={m.completado ? "Ver reporte" : answeredMother > 0 ? "Continuar" : "Empezar"}
      />

      <h3>Tu hija</h3>
      {h.nombre ? (
        <StatusCard title={h.nombre} answered={answeredDaughter} total={48} complete={h.completado} />
      ) : (
        <div className="row">
          <p>Tu hija todavía no ha entrado. Compártele el código <strong>{dupla.codigo}</strong>.</p>
        </div>
      )}

      <h3>Mapa de la dupla</h3>
      {(m.completado && h.completado) ? (
        <button onClick={onViewComparative}>Ver mapa comparativo</button>
      ) : (
        <p className="muted">Se desbloquea cuando ambas terminen su test.</p>
      )}

      <div className="actions">
        <button className="ghost" onClick={onGoPolicy}>Política</button>
        <button className="ghost" onClick={onGoCrisis}>Recursos de apoyo</button>
      </div>
    </Shell>
  );
}
