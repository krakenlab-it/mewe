import { getTestCtaLabel } from "../lib/onboarding";

export function TestCtaBanner({
  answered,
  total,
  complete,
  onStartTest,
  onViewReport,
  variant = "banner",
}) {
  const progress = total ? Math.min(100, Math.round((answered / total) * 100)) : 0;
  const actionLabel = getTestCtaLabel(answered, complete);
  const onAction = complete ? onViewReport : onStartTest;

  if (variant === "sidebar") {
    return (
      <aside className="test-cta-sidebar" aria-label="Estado del test Me We">
        <p className="test-cta-sidebar-label">
          {complete ? "Test completado" : `${answered} de ${total} preguntas`}
        </p>
        <button type="button" className="test-cta-sidebar-btn" onClick={onAction}>
          {actionLabel}
        </button>
      </aside>
    );
  }

  const headline = complete
    ? "Tu reporte Me We está listo"
    : answered > 0
      ? "Continúa tu test Me We"
      : "Completa tu test Me We";

  const description = complete
    ? "Revisa tu mapa personal y compártelo en el taller cuando quieras."
    : "El cuestionario es la base de tu reporte y fortalece el vínculo madre-hija. Puedes pausar cuando quieras.";

  const progressLabel = complete
    ? "Test completado"
    : `${answered} de ${total} preguntas respondidas (${progress}%)`;

  return (
    <section
      className={`test-cta-banner${complete ? " test-cta-banner--complete" : ""}`}
      aria-labelledby="test-cta-banner-title"
    >
      <div className="test-cta-banner-content">
        <span className="eyebrow">{complete ? "Listo" : "Paso esencial"}</span>
        <h2 id="test-cta-banner-title">{headline}</h2>
        <p className="test-cta-banner-desc">{description}</p>
        {!complete ? (
          <div
            className="test-cta-banner-progress"
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="test-cta-banner-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
        <p className="test-cta-banner-meta" aria-live="polite">
          {complete ? "100% completado" : `${answered} de ${total} preguntas`}
        </p>
      </div>
      <button
        type="button"
        className="test-cta-banner-action"
        onClick={onAction}
        aria-label={actionLabel}
      >
        {actionLabel}
      </button>
    </section>
  );
}
