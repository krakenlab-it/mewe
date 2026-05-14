import { Shell, TopBar } from "../components/ui";
import { PRIVACY_POLICY_SECTIONS } from "../data/content";

export function LegalPage({ onBack }) {
  return (
    <Shell wide>
      <TopBar title="Política de privacidad y términos" onBack={onBack} />
      <p className="muted">Última actualización: enero 2026 · Versión 1.0</p>
      <div className="legal-doc">
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            {section.list ? (
              <ul>
                {section.body.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            )}
            {section.note ? <p><strong>{section.note}</strong></p> : null}
          </section>
        ))}
      </div>
    </Shell>
  );
}
