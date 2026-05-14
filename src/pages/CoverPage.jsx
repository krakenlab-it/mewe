import { Shell } from "../components/ui";

export function CoverPage({ onEnter }) {
  return (
    <Shell>
      <div className="logo-wrap">
        <span className="logo-me">ME</span>
        <br />
        <span className="logo-we">WE</span>
        <p className="muted">Plataforma del Mapa de Conciencia Relacional</p>
        <button onClick={onEnter}>Entrar</button>
      </div>
    </Shell>
  );
}
