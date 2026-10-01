import { BrandMark, Shell } from "../components/ui";

const ROLES = [
  {
    badge: "01",
    tone: "coral",
    title: "Soy mamá",
    text: "Crear cuenta o retomar con código.",
    action: "onMother",
  },
  {
    badge: "02",
    tone: "teal",
    title: "Soy hija",
    text: "Entrar con el código de mamá.",
    action: "onDaughter",
  },
  {
    badge: "03",
    tone: "navy",
    title: "Soy facilitadora / admin",
    text: "Dashboard de duplas y métricas.",
    action: "onAdmin",
  },
];

export function RolePage({ onMother, onDaughter, onAdmin, onBack }) {
  const handlers = { onMother, onDaughter, onAdmin };

  return (
    <Shell variant="access" onBack={onBack}>
      <div className="access-layout">
        <header className="access-header">
          <BrandMark compact />
          <div className="access-header__copy">
            <span className="eyebrow">Acceso</span>
            <h1>¿Quién entra?</h1>
            <p>
              Cada rol tiene una experiencia distinta, con el mismo código de dupla como hilo conductor.
            </p>
          </div>
        </header>

        <div className="role-list">
          {ROLES.map((role) => (
            <button
              key={role.badge}
              type="button"
              className={`role-row role-row--${role.tone}`}
              onClick={handlers[role.action]}
            >
              <span className="role-row__badge">{role.badge}</span>
              <span className="role-row__content">
                <strong>{role.title}</strong>
                <span>{role.text}</span>
              </span>
              <span className="role-row__cta" aria-hidden="true">Continuar</span>
              <span className="sr-only">Continuar como {role.title}</span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
