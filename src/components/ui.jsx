import { INDICES_NOMBRES } from "../data/questions";

export function Shell({ children, wide = false }) {
  return (
    <main className={wide ? "container wide" : "container"}>
      {children}
      <footer>
        Me We v1.0 · Herramienta experiencial · No es diagnóstico clínico ni canal de emergencia
      </footer>
    </main>
  );
}

export function TopBar({ title, subtitle, onBack, onLogout }) {
  return (
    <div className="top">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      <div className="top-actions">
        {onBack ? <button className="ghost small" onClick={onBack}>Volver</button> : null}
        {onLogout ? <button className="ghost small" onClick={onLogout}>Salir</button> : null}
      </div>
    </div>
  );
}

export function RoleCard({ title, text, onClick }) {
  return (
    <button className="role-card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{text}</p>
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ConsentBox({ children }) {
  return <div className="consent">{children}</div>;
}

export function StatusCard({ title, answered, total, complete, onAction, actionText, children }) {
  return (
    <div className="row">
      <div>
        <strong>{title}</strong>
        <p className="muted">{complete ? "Completado" : `${answered}/${total} preguntas`}</p>
        {children}
      </div>
      {onAction ? <button className="small" onClick={onAction}>{actionText}</button> : null}
    </div>
  );
}

export function IndexCard({ dim }) {
  return (
    <div className={`index ${dim.zona}`}>
      <h3>{INDICES_NOMBRES[dim.key]} <span>{dim.score}</span></h3>
      <p>{dim.texto}</p>
    </div>
  );
}

export function ScaleButtons({ onSelect }) {
  const escala = [
    { value: 1, emoji: "🌱", label: "Casi nunca" },
    { value: 2, emoji: "🌿", label: "Un poquito" },
    { value: 3, emoji: "🌼", label: "A veces" },
    { value: 4, emoji: "🌻", label: "Bastante" },
    { value: 5, emoji: "🔥", label: "Mucho" },
  ];
  return (
    <div className="scale">
      {escala.map((item) => (
        <button key={item.value} className="scale-btn" onClick={() => onSelect(item.value)}>
          <b>{item.emoji}</b>
          <span>{item.value}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </div>
  );
}
