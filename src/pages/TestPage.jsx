import { MODULOS } from "../data/questions";
import { ScaleButtons, Shell, TopBar } from "../components/ui";

export function TestPage({
  rol,
  pregunta,
  index,
  total,
  onAnswer,
  onPause,
  onBack,
}) {
  const mod = MODULOS[pregunta?.mod] || {};
  const percentage = Math.round(((index + 1) / total) * 100);
  const progressLabel = `Progreso del test: pregunta ${index + 1} de ${total}`;

  return (
    <Shell>
      <TopBar title="Test Me We" onBack={onBack} />
      <div className="test-shell">
        <div
          className="progress"
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div className="fill" style={{ width: `${percentage}%` }} />
        </div>
        <div className="test-meta">
          <span className="pill">Pregunta {index + 1} de {total}</span>
          <span className="eyebrow">{mod.tag} · {mod.titulo}</span>
        </div>
        <p className="question" aria-live="polite">{pregunta?.txt}</p>
        <ScaleButtons onSelect={onAnswer} />
        <p className="muted">Modo: {rol}</p>
        <button type="button" className="ghost" onClick={onPause}>Pausar y volver</button>
      </div>
    </Shell>
  );
}
