import { Shell, TopBar } from "../components/ui";

export function AdminDashboardPage({ duplas, onRefresh, onOpenComparative, onDelete, onLogout }) {
  const completed = duplas.filter((d) => d.madre?.completado && d.hija?.completado).length;

  return (
    <Shell wide>
      <TopBar title="Dashboard Me We · admin" onLogout={onLogout} />
      <div className="stats-grid">
        <div className="stat">
          <span>Total duplas</span>
          <strong>{duplas.length}</strong>
        </div>
        <div className="stat">
          <span>Comparativos listos</span>
          <strong>{completed}</strong>
        </div>
        <div className="stat">
          <span>Pendientes</span>
          <strong>{Math.max(duplas.length - completed, 0)}</strong>
        </div>
      </div>
      <button className="secondary" onClick={onRefresh}>Actualizar dashboard</button>
      {duplas.length === 0 ? <p className="muted">No hay duplas registradas.</p> : null}
      {duplas.map((d) => {
        const both = d.madre?.completado && d.hija?.completado;
        return (
          <div className="row" key={d.codigo}>
            <strong>{d.madre?.nombre || "(sin nombre)"} {d.hija?.nombre ? `+ ${d.hija.nombre}` : ""}</strong>
            <p className="muted">Código: {d.codigo} · Taller: {d.taller || "N/A"}</p>
            <p className="muted">
              Madre: {d.madre?.completado ? "completo" : "pendiente"} · Hija: {d.hija?.completado ? "completo" : "pendiente"}
            </p>
            <div className="actions">
              {both ? <button className="small" onClick={() => onOpenComparative(d.codigo)}>Ver comparativo</button> : null}
              <button className="ghost small" onClick={() => onDelete(d.codigo)}>Borrar dupla</button>
            </div>
          </div>
        );
      })}
    </Shell>
  );
}
