import { useState } from "react";
import { SUGGESTED_ACTIVITIES } from "../../../lib/interactive/data";

export function SuggestedCarousel() {
  const [index, setIndex] = useState(0);
  const current = SUGGESTED_ACTIVITIES[index];

  function prev() {
    setIndex((i) => (i === 0 ? SUGGESTED_ACTIVITIES.length - 1 : i - 1));
  }

  function next() {
    setIndex((i) => (i === SUGGESTED_ACTIVITIES.length - 1 ? 0 : i + 1));
  }

  return (
    <section className="dash-card" aria-labelledby="suggested-title">
      <div className="section-header-row">
        <h2 id="suggested-title">Actividades Sugeridas</h2>
        <span className="muted">Para ti y tu hija</span>
      </div>
      <div
        className="suggested-carousel"
        style={{ background: current.gradient }}
        aria-roledescription="carrusel"
        aria-label={`Actividad sugerida ${index + 1} de ${SUGGESTED_ACTIVITIES.length}`}
      >
        <div className="suggested-icon-wrap">
          <span className="suggested-icon" aria-hidden="true">⭐</span>
          {current.badge ? (
            <span className="suggested-badge" aria-label={`${current.badge} actividades`}>{current.badge}</span>
          ) : null}
        </div>
        <h3>{current.title}</h3>
        <p>{current.subtitle}</p>
        <div className="carousel-dots" role="tablist" aria-label="Páginas del carrusel">
          {SUGGESTED_ACTIVITIES.map((_, i) => (
            <button
              key={SUGGESTED_ACTIVITIES[i].id}
              type="button"
              role="tab"
              className={`carousel-dot${i === index ? " active" : ""}`}
              aria-selected={i === index}
              aria-label={`Página ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="carousel-nav sr-only-focusable">
          <button type="button" onClick={prev}>Anterior</button>
          <button type="button" onClick={next}>Siguiente</button>
        </div>
      </div>
    </section>
  );
}
