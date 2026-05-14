import { INDICES_NOMBRES } from "../data/questions";

export function Shell({ children, wide = false }) {
  return (
    <div className="app-frame">
      <main className={wide ? "container wide" : "container"}>
        {children}
        <footer>
          Me We v1.0 · Herramienta experiencial · No es diagnóstico clínico ni canal de emergencia
        </footer>
      </main>
    </div>
  );
}

export function TopBar({ title, subtitle, onBack, onLogout }) {
  return (
    <div className="top">
      <div>
        <BrandMark compact />
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

export function BrandMark({ compact = false }) {
  return (
    <div className={compact ? "brand compact" : "brand"}>
      <span className="brand-me">ME</span>
      <span className="brand-divider" />
      <span className="brand-we">WE</span>
    </div>
  );
}

export function PageHeader({ eyebrow, title, text, children }) {
  return (
    <header className="page-header">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {children}
    </header>
  );
}

export function Panel({ children, tone = "" }) {
  return <section className={`panel ${tone}`.trim()}>{children}</section>;
}

export function RoleCard({ title, text, onClick, badge }) {
  return (
    <button className="role-card" onClick={onClick}>
      {badge ? <span className="card-badge">{badge}</span> : null}
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="card-arrow">Continuar →</span>
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
  const progress = total ? Math.min(100, Math.round((answered / total) * 100)) : 0;
  return (
    <div className="row">
      <div>
        <div className="row-heading">
          <strong>{title}</strong>
          <span className={complete ? "pill done" : "pill"}>{complete ? "Completado" : "En progreso"}</span>
        </div>
        <p className="muted">{complete ? "Listo para revisar." : `${answered}/${total} preguntas respondidas`}</p>
        <div className="mini-progress" aria-hidden="true">
          <div style={{ width: `${complete ? 100 : progress}%` }} />
        </div>
        {children}
      </div>
      {onAction ? <button className="small" onClick={onAction}>{actionText}</button> : null}
    </div>
  );
}

export function IndexCard({ dim }) {
  return (
    <div className={`index ${dim.zona}`}>
      <h3>{INDICES_NOMBRES[dim.key]} <span>{dim.score ?? "—"}</span></h3>
      <span className="zone-label">{dim.zona}</span>
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
