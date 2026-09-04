import { useEffect, useRef } from "react";
import { Shell } from "../components/ui";
import { getTestCtaLabel } from "../lib/onboarding";

const COPY = {
  madre: {
    headline: "Tu test Me We es el primer paso",
    description:
      "Responde el cuestionario para fortalecer vuestro vínculo y obtener tu reporte personalizado. Reserva unos minutos; puedes pausar cuando quieras.",
    tip: "Cuando termines, desbloquearás tu mapa individual y el comparativo con tu hija.",
  },
  hija: {
    headline: "Tu test Me We te espera",
    description:
      "Responde el cuestionario para conoceros mejor y obtener tu reporte Me We. Puedes hacerlo a tu ritmo y pausar cuando quieras.",
    tip: "Al terminar verás tu mapa personal y podréis comparar perspectivas con tu mamá.",
  },
};

export function TestOnboardingPage({
  rol,
  nombre,
  answered,
  total,
  onStartTest,
  onGoToDashboard,
}) {
  const primaryRef = useRef(null);
  const copy = COPY[rol] || COPY.madre;
  const ctaLabel = getTestCtaLabel(answered, false);
  const progressLabel = `${answered} de ${total} preguntas respondidas`;

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  return (
    <Shell>
      <section
        className="test-onboarding"
        aria-labelledby="test-onboarding-title"
        aria-describedby="test-onboarding-desc"
      >
        <span className="eyebrow">Bienvenida a Me We</span>
        <h1 id="test-onboarding-title">
          {copy.headline}
          {nombre ? `, ${nombre}` : ""}
        </h1>
        <p id="test-onboarding-desc" className="test-onboarding-lead">
          {copy.description}
        </p>
        {answered > 0 ? (
          <p className="test-onboarding-progress" aria-live="polite">
            Llevas <strong>{progressLabel}</strong>.
          </p>
        ) : null}
        <p className="muted test-onboarding-tip">{copy.tip}</p>

        <div className="test-onboarding-actions">
          <button
            ref={primaryRef}
            type="button"
            className="test-onboarding-primary"
            onClick={onStartTest}
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </button>
          <button
            type="button"
            className="ghost test-onboarding-secondary"
            onClick={onGoToDashboard}
            aria-label="Ir al panel por ahora"
          >
            Ir al panel
          </button>
        </div>
      </section>
    </Shell>
  );
}
