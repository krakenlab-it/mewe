import { MOOD_OPTIONS } from "../../../lib/interactive/constants";
import { getTodayMood } from "../../../lib/interactive/state";

export function MoodCard({ dupla, rol, onRecordMood, onGoMood }) {
  const todayMood = getTodayMood(dupla, rol);
  const moodInfo = todayMood ? MOOD_OPTIONS.find((m) => m.value === todayMood.value) : null;

  return (
    <section className="dash-card mood-card" aria-labelledby="mood-card-title">
      <div className="dash-card-header gradient-blue-pink">
        <span aria-hidden="true">💜</span>
        <div>
          <h2 id="mood-card-title">¿Cómo te sientes hoy?</h2>
          <p>Cómo está tu estado de ánimo Me We</p>
        </div>
      </div>
      <div className="dash-card-body center">
        {todayMood ? (
          <>
            <span className="mood-emoji-large" aria-hidden="true">{moodInfo?.emoji}</span>
            <p><strong>¡Ya registraste tu estado hoy!</strong></p>
            <p className="muted">Te sentiste {moodInfo?.label?.toLowerCase()}</p>
            <p className="muted">Vuelve mañana para registrar cómo te sientes</p>
            <button type="button" className="ghost small" onClick={onGoMood}>Ver historial</button>
          </>
        ) : (
          <>
            <p>¿Cómo te sientes en este momento?</p>
            <div className="mood-picker" role="group" aria-label="Selecciona tu estado de ánimo">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className="mood-btn"
                  aria-label={m.label}
                  onClick={() => onRecordMood(m.value)}
                >
                  <span aria-hidden="true">{m.emoji}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
