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
  return (
    <Shell>
      <TopBar title="Test Me We" onBack={onBack} />
      <div className="test-shell">
      <div className="progress">
        <div className="fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="test-meta">
        <span className="pill">Pregunta {index + 1} de {total}</span>
        <span className="eyebrow">{mod.tag} · {mod.titulo}</span>
      </div>
      <div className="question">{pregunta?.txt}</div>
      <ScaleButtons onSelect={onAnswer} />
      <p className="muted">Modo: {rol}</p>
      <button className="ghost" onClick={onPause}>Pausar y volver</button>
      </div>
    </Shell>
  );
}
