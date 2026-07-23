import { INDICES_NOMBRES } from "../data/questions";

export function SkipLink() {
  return (
    <a className="skip-link" href="#main-content">
      Saltar al contenido principal
    </a>
  );
}

export function ScreenAnnouncer({ message }) {
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}

export function Shell({ children, wide = false }) {
  return (
    <div className="app-frame">
      <SkipLink />
      <main
        id="main-content"
        className={wide ? "container wide" : "container"}
        tabIndex={-1}
      >
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
    <header className="top">
      <div>
        <BrandMark compact />
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      <div className="top-actions">
        {onBack ? <button type="button" className="ghost small" onClick={onBack}>Volver</button> : null}
        {onLogout ? <button type="button" className="ghost small" onClick={onLogout}>Salir</button> : null}
      </div>
    </header>
  );
}

export function BrandMark({ compact = false }) {
  return (
    <div className={compact ? "brand compact" : "brand"} role="img" aria-label="Me We">
      <span className="brand-me" aria-hidden="true">ME</span>
      <span className="brand-divider" aria-hidden="true" />
      <span className="brand-we" aria-hidden="true">WE</span>
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
    <button type="button" className="role-card" onClick={onClick}>
      {badge ? <span className="card-badge">{badge}</span> : null}
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="card-arrow" aria-hidden="true">Continuar →</span>
      <span className="sr-only">Continuar como {title}</span>
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
  const progressLabel = complete
    ? `${title}: completado`
    : `${title}: ${answered} de ${total} preguntas respondidas (${progress}%)`;

  return (
    <div className="row">
      <div>
        <div className="row-heading">
          <strong>{title}</strong>
          <span className={complete ? "pill done" : "pill"}>{complete ? "Completado" : "En progreso"}</span>
        </div>
        <p className="muted">{complete ? "Listo para revisar." : `${answered}/${total} preguntas respondidas`}</p>
        <div
          className="mini-progress"
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={complete ? 100 : progress}
        >
          <div style={{ width: `${complete ? 100 : progress}%` }} />
        </div>
        {children}
      </div>
      {onAction ? <button type="button" className="small" onClick={onAction}>{actionText}</button> : null}
    </div>
  );
}

const ZONE_LABELS = {
  cuidado: "Zona de cuidado",
  atencion: "Zona de atención",
  sostenida: "Zona sostenida",
};

export function IndexCard({ dim }) {
  const zoneText = ZONE_LABELS[dim.zona] || dim.zona;
  return (
    <article className={`index ${dim.zona}`} aria-label={`${INDICES_NOMBRES[dim.key]}: ${dim.score ?? "sin puntuación"}, ${zoneText}`}>
      <h3>{INDICES_NOMBRES[dim.key]} <span>{dim.score ?? "—"}</span></h3>
      <span className="zone-label">{zoneText}</span>
      <p>{dim.texto}</p>
    </article>
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
    <div className="scale" role="group" aria-label="Escala de respuesta del 1 al 5">
      {escala.map((item) => (
        <button
          key={item.value}
          type="button"
          className="scale-btn"
          aria-label={`${item.value}, ${item.label}`}
          onClick={() => onSelect(item.value)}
        >
          <b aria-hidden="true">{item.emoji}</b>
          <span aria-hidden="true">{item.value}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </div>
  );
}

export function LoadingState({ title = "Cargando plataforma", text = "Estamos preparando tu experiencia." }) {
  return (
    <Shell>
      <section className="empty-state" aria-busy="true" aria-live="polite">
        <span className="eyebrow">Me We</span>
        <h2>{title}</h2>
        <p className="muted">{text}</p>
      </section>
    </Shell>
  );
}
