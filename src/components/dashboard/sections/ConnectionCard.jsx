import { getConnectionInfo } from "../../../lib/interactive/state";

export function ConnectionCard({ dupla, rol, codigo }) {
  const conn = getConnectionInfo(dupla);
  const isMother = rol === "madre";

  return (
    <section className="dash-card" aria-labelledby="connection-title">
      <div className="dash-card-header gradient-purple-orange">
        <span aria-hidden="true">👥</span>
        <div>
          <h2 id="connection-title">Estado de Conexión</h2>
          <p>{isMother ? "Conecta con tu hija" : "Conecta con tu mamá"}</p>
        </div>
      </div>
      <div className="dash-card-body">
        {conn.hijaConectada ? (
          <div className="connection-connected">
            <span className="pill done">Conectadas</span>
            <p>Código de dupla: <strong>{codigo}</strong></p>
            <p className="muted">
              {isMother
                ? `${dupla.hija?.nombre || "Tu hija"} ya está conectada contigo.`
                : `${dupla.madre?.nombre || "Tu mamá"} te espera en Me We.`}
            </p>
          </div>
        ) : (
          <>
            <button type="button" className="connection-btn">
              👥 {isMother ? "Generar Conexión con tu Hija" : "Unirme con mi Mamá"}
            </button>
            <p className="muted small-note">
              {isMother
                ? "Crea tu código único de conexión para establecer el vínculo especial"
                : `Usa el código ${codigo} que te compartió tu mamá`}
            </p>
            {isMother ? (
              <div className="code-display" aria-label={`Código de dupla: ${codigo}`}>
                {codigo}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

export function ProgressCard({ dupla }) {
  const conn = getConnectionInfo(dupla);
  const hijaConectada = conn.hijaConectada;

  return (
    <section className="dash-card progress-card" aria-labelledby="progress-title">
      <div className="progress-card-header">
        <h2 id="progress-title">💗 Nuestra Conexión</h2>
        <span className="level-badge">Nivel {conn.nivel}</span>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={conn.totalProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de conexión: ${conn.totalProgress}%`}>
        <div className="progress-track-fill" style={{ width: `${conn.totalProgress}%` }} />
        <div className="progress-endpoints">
          <div className="progress-point start">
            <span className="progress-icon" aria-hidden="true">👤</span>
            <span>Inicio</span>
          </div>
          <div className="progress-point end">
            <span className="progress-icon" aria-hidden="true">✨</span>
            <span>Crecimiento</span>
          </div>
        </div>
      </div>
      <p className="muted progress-status">
        {hijaConectada
          ? `${conn.levelInfo.label} — ${conn.totalProgress}% de progreso`
          : dupla.madre?.nombre
            ? "Esperando conexión — Tu hija se unirá pronto"
            : "Esperando conexión — Tu madre se unirá pronto"}
      </p>
    </section>
  );
}
