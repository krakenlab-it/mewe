import { Shell, TopBar } from "../components/ui";
import { exportDuplasCsv } from "../lib/csvExport";

export function AdminDashboardPage({ duplas, onRefresh, onOpenComparative, onDelete, onLogout }) {
  const completed = duplas.filter((d) => d.madre?.completado && d.hija?.completado).length;

  return (
    <Shell wide>
      <TopBar title="Dashboard Me We · admin" onLogout={onLogout} />
      <div className="stats-grid" aria-label="Resumen del dashboard">
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
      <div className="actions">
        <button type="button" className="secondary" onClick={onRefresh}>Actualizar dashboard</button>
        <button type="button" className="secondary" onClick={() => exportDuplasCsv(duplas)}>Exportar datos a CSV</button>
      </div>
      {duplas.length === 0 ? <p className="muted">No hay duplas registradas.</p> : null}
      <ul className="admin-pair-list">
        {duplas.map((d) => {
          const both = d.madre?.completado && d.hija?.completado;
          const pairLabel = `${d.madre?.nombre || "(sin nombre)"}${d.hija?.nombre ? ` + ${d.hija.nombre}` : ""}`;
          return (
            <li className="row admin-pair-item" key={d.codigo}>
              <div>
                <strong>{pairLabel}</strong>
                <p className="muted">Código: {d.codigo} · Taller: {d.taller || "N/A"}</p>
                <p className="muted">
                  Madre: {d.madre?.completado ? "completo" : "pendiente"} · Hija: {d.hija?.completado ? "completo" : "pendiente"}
                </p>
              </div>
              <div className="actions">
                {both ? (
                  <button type="button" className="small" onClick={() => onOpenComparative(d.codigo)}>
                    Ver comparativo
                  </button>
                ) : null}
                <button type="button" className="ghost small" onClick={() => onDelete(d.codigo)}>
                  Borrar dupla
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
