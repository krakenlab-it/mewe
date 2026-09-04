import { NAV_ITEMS } from "../../lib/interactive/constants";

export function MobileBottomNav({ section, onNavigate }) {
  const mobileItems = NAV_ITEMS.filter((item) =>
    ["inicio", "actividades", "calendario", "asistente", "ajustes"].includes(item.id),
  );

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
      {mobileItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mobile-nav-btn${section === item.id ? " active" : ""}`}
          onClick={() => onNavigate(item.id)}
          aria-current={section === item.id ? "page" : undefined}
          aria-label={item.label}
        >
          <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
