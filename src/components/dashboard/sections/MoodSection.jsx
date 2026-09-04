import { useState } from "react";
import { MOOD_CHART_BANDS, MOOD_OPTIONS, WEEKDAY_LABELS } from "../../../lib/interactive/constants";
import { getTodayMood, getWeekMoodData, getWeekStart, setTodayMood } from "../../../lib/interactive/state";

export function MoodSection({ dupla, rol, onSave }) {
  const [weekStart] = useState(() => getWeekStart());
  const todayMood = getTodayMood(dupla, rol);
  const weekData = getWeekMoodData(dupla, rol, weekStart);
  const recorded = weekData.filter((d) => d.value !== null).length;
  const average = recorded
    ? (weekData.reduce((s, d) => s + (d.value || 0), 0) / recorded).toFixed(1)
    : "0";

  function handleMood(value) {
    setTodayMood(dupla, rol, value);
    onSave(structuredClone(dupla));
  }

  return (
    <div className="section-page">
      <header className="page-header">
        <span className="eyebrow">Bienestar</span>
        <h2>Mi Estado de Ánimo</h2>
        <p>Registra y observa cómo te sientes a lo largo de la semana.</p>
      </header>

      <section className="dash-card mood-card" aria-labelledby="daily-mood-title">
        <div className="dash-card-header gradient-blue-pink">
          <span aria-hidden="true">💜</span>
          <div>
            <h3 id="daily-mood-title">¿Cómo te sientes hoy?</h3>
          </div>
        </div>
        <div className="dash-card-body center">
          {todayMood ? (
            <>
              <span className="mood-emoji-large" aria-hidden="true">
                {MOOD_OPTIONS.find((m) => m.value === todayMood.value)?.emoji}
              </span>
              <p><strong>¡Ya registraste tu estado hoy!</strong></p>
              <p className="muted">Vuelve mañana para registrar cómo te sientes</p>
            </>
          ) : (
            <div className="mood-picker" role="group" aria-label="Selecciona tu estado de ánimo de hoy">
              {MOOD_OPTIONS.map((m) => (
                <button key={m.value} type="button" className="mood-btn" aria-label={m.label} onClick={() => handleMood(m.value)}>
                  <span aria-hidden="true">{m.emoji}</span>
                  <small>{m.label}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dash-card" aria-labelledby="mood-chart-title">
        <div className="mood-chart-header">
          <h3 id="mood-chart-title">Semana actual (Lun-Dom)</h3>
          <span className="muted">Promedio: {average} de 7</span>
        </div>
        <div className="mood-chart" role="img" aria-label={`Gráfico de ánimo semanal. Promedio ${average} de 7 días registrados.`}>
          <div className="mood-chart-bands" aria-hidden="true">
            {MOOD_CHART_BANDS.map((band) => (
              <div key={band.min} className="mood-band" style={{ background: band.color }} title={band.label} />
            ))}
          </div>
          <div className="mood-chart-points" aria-hidden="true">
            {weekData.map((d, i) => {
              const top = d.value ? `${(5 - d.value) * 20}%` : "50%";
              const color = d.value ? MOOD_CHART_BANDS.find((b) => b.min === d.value)?.color : "#ccc";
              return (
                <div key={WEEKDAY_LABELS[i]} className="mood-point-col">
                  <div
                    className={`mood-point${d.value ? " filled" : ""}`}
                    style={{ top, background: color }}
                  />
                  <span className="mood-day-label">{WEEKDAY_LABELS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="sr-only">
          {weekData.map((d, i) => `${WEEKDAY_LABELS[i]}: ${d.value ? MOOD_OPTIONS.find((m) => m.value === d.value)?.label : "sin registro"}`).join(". ")}
        </p>
      </section>
    </div>
  );
}

export function MoodChartWidget({ dupla, rol, onGoMood }) {
  const weekStart = getWeekStart();
  const weekData = getWeekMoodData(dupla, rol, weekStart);
  const recorded = weekData.filter((d) => d.value !== null).length;
  const average = recorded
    ? (weekData.reduce((s, d) => s + (d.value || 0), 0) / recorded).toFixed(1)
    : "0";

  return (
    <section className="dash-card" aria-labelledby="widget-mood-title">
      <div className="section-header-row">
        <h3 id="widget-mood-title">Mi Estado de Ánimo</h3>
        <button type="button" className="link-btn" onClick={onGoMood}>Ver historial</button>
      </div>
      <div className="mood-chart-header">
        <span className="muted">Semana actual (Lun-Dom)</span>
        <span className="muted">Promedio: {average} de 7</span>
      </div>
      <div className="mood-chart compact" role="img" aria-label={`Gráfico de ánimo. Promedio ${average}.`}>
        <div className="mood-chart-bands" aria-hidden="true">
          {MOOD_CHART_BANDS.map((band) => (
            <div key={band.min} className="mood-band" style={{ background: band.color }} />
          ))}
        </div>
        <div className="mood-chart-points" aria-hidden="true">
          {weekData.map((d, i) => {
            const top = d.value ? `${(5 - d.value) * 20}%` : "50%";
            const color = d.value ? MOOD_CHART_BANDS.find((b) => b.min === d.value)?.color : "#ccc";
            return (
              <div key={WEEKDAY_LABELS[i]} className="mood-point-col">
                <div className={`mood-point${d.value ? " filled" : ""}`} style={{ top, background: color }} />
                <span className="mood-day-label">{WEEKDAY_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
