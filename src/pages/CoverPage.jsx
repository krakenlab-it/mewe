import { BrandMark, Panel, Shell } from "../components/ui";

export function CoverPage({ onEnter }) {
  return (
    <Shell>
      <section className="hero">
        <BrandMark />
        <span className="eyebrow">Mapa de Conciencia Relacional</span>
        <h1>Una lectura clara del vínculo madre-hija.</h1>
        <p>
          Una experiencia guiada para reconocer seguridad, presencia, apertura y
          conversación emocional sin convertirlo en diagnóstico.
        </p>
        <div className="hero-actions">
          <button type="button" onClick={onEnter}>Entrar a la plataforma</button>
        </div>
      </section>

      <div className="feature-grid">
        <Panel>
          <h2 className="feature-title">Para madres</h2>
          <p>Un test íntimo, progresivo y guardado por código de dupla.</p>
        </Panel>
        <Panel>
          <h2 className="feature-title">Para hijas</h2>
          <p>Lenguaje simple, consentimiento claro y reportes cuidadosos.</p>
        </Panel>
        <Panel>
          <h2 className="feature-title">Para facilitadoras</h2>
          <p>Dashboard para revisar duplas, avance y mapas comparativos.</p>
        </Panel>
      </div>
    </Shell>
  );
}
