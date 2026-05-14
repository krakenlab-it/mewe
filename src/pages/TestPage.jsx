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
      <div className="progress">
        <div className="fill" style={{ width: `${percentage}%` }} />
      </div>
      <p className="muted">Pregunta {index + 1} de {total}</p>
      <p className="muted">{mod.tag} · {mod.titulo}</p>
      <div className="question">{pregunta?.txt}</div>
      <ScaleButtons onSelect={onAnswer} />
      <p className="muted">Modo: {rol}</p>
      <button className="ghost" onClick={onPause}>Pausar y volver</button>
    </Shell>
  );
}
