import { BrandMark, Shell } from "../components/ui";

const FEATURES = [
  {
    num: "01",
    tone: "coral",
    title: "Para madres",
    text: "Un test íntimo, progresivo y guardado por código de dupla.",
  },
  {
    num: "02",
    tone: "teal",
    title: "Para hijas",
    text: "Lenguaje simple, consentimiento claro y reportes cuidadosos.",
  },
  {
    num: "03",
    tone: "blue",
    title: "Para facilitadoras",
    text: "Dashboard para revisar duplas, avance y mapas comparativos.",
  },
];

export function CoverPage({ onEnter }) {
  return (
    <Shell variant="landing">
      <div className="landing-layout">
        <header className="landing-chrome">
          <BrandMark />
          <span className="preview-badge">Look &amp; feel de prueba</span>
        </header>

        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <span className="eyebrow eyebrow--gold">Mapa de Conciencia Relacional</span>
            <h1 id="landing-title">Una lectura clara del vínculo madre-hija.</h1>
            <p>
              Una experiencia guiada para reconocer seguridad, presencia, apertura y
              conversación emocional sin convertirlo en diagnóstico.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn-primary" onClick={onEnter}>
                Entrar a la plataforma
              </button>
            </div>
          </div>

          <aside className="landing-hero-visual" aria-hidden="true">
            <div className="hero-mosaic">
              <span className="hero-mosaic__block hero-mosaic__block--navy" />
              <span className="hero-mosaic__block hero-mosaic__block--teal" />
              <span className="hero-mosaic__block hero-mosaic__block--gold" />
              <span className="hero-mosaic__block hero-mosaic__block--coral" />
              <span className="hero-mosaic__block hero-mosaic__block--blue" />
            </div>
          </aside>
        </section>

        <section className="feature-strip" aria-label="Públicos de la plataforma">
          {FEATURES.map((feature) => (
            <article key={feature.num} className={`feature-card feature-card--${feature.tone}`}>
              <span className="feature-card__num">{feature.num}</span>
              <div className="feature-card__body">
                <h2 className="feature-title">{feature.title}</h2>
                <p>{feature.text}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </Shell>
  );
}
