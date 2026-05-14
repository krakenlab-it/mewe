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
          <button onClick={onEnter}>Entrar a la plataforma</button>
          <span className="muted">Supabase · Vite · React</span>
        </div>
      </section>

      <div className="feature-grid">
        <Panel>
          <h3>Para madres</h3>
          <p>Un test íntimo, progresivo y guardado por código de dupla.</p>
        </Panel>
        <Panel>
          <h3>Para hijas</h3>
          <p>Lenguaje simple, consentimiento claro y reportes cuidadosos.</p>
        </Panel>
        <Panel>
          <h3>Para facilitadoras</h3>
          <p>Dashboard para revisar duplas, avance y mapas comparativos.</p>
        </Panel>
      </div>
    </Shell>
  );
}
