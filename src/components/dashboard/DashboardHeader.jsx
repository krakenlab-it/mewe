export function DashboardHeader({
  nombre,
  subtitle,
  rol,
  onLogout,
  onStartTest,
  onViewReport,
  onViewComparative,
}) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-info">
        <div className="dashboard-avatar" aria-hidden="true">
          {nombre?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <h1>¡Hola, {nombre || "Me We"}! 💜</h1>
          <p className="muted">{subtitle || "Lista para conectar"}</p>
        </div>
      </div>
      <div className="dashboard-header-actions">
        <button type="button" className="ghost small header-btn-test" onClick={onStartTest}>
          Prueba Vinculación
        </button>
        {rol === "madre" && onViewComparative ? (
          <button type="button" className="ghost small" onClick={onViewComparative}>
            Mapa dupla
          </button>
        ) : null}
        <button type="button" className="ghost small" onClick={onViewReport}>
          Perfil
        </button>
        <button type="button" className="danger small" onClick={onLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
