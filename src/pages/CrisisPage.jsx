import { Shell, TopBar } from "../components/ui";
import { CRISIS_INFO } from "../data/content";

export function CrisisPage({ onBack }) {
  return (
    <Shell>
      <TopBar title="Recursos de apoyo" onBack={onBack} />
      <div className="card">
        <p><strong>Si tú o tu hija están en peligro inmediato</strong>, llama a emergencias de tu país. Esta plataforma no monitorea respuestas en tiempo real.</p>
      </div>
      <h3>Ecuador (línea por defecto)</h3>
      <ul>
        {CRISIS_INFO.ecuador.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <h3>Si estás fuera de Ecuador</h3>
      <p>{CRISIS_INFO.global}</p>
      <h3>Acompañamiento profesional</h3>
      <p>{CRISIS_INFO.professional}</p>
    </Shell>
  );
}
