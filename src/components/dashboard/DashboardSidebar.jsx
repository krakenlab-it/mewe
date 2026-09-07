import { NAV_ITEMS } from "../../lib/interactive/constants";
import { TestCtaBanner } from "../TestCtaBanner";

export function DashboardSidebar({
  section,
  onNavigate,
  rol,
  testProgress,
  onStartTest,
  onViewReport,
}) {
  const showTestCta = testProgress && !testProgress.complete;

  return (
    <nav className="dashboard-sidebar" aria-label="Panel principal">
      <div className="sidebar-brand" role="img" aria-label="Me We">
        <span className="brand-me" aria-hidden="true">ME</span>
        <span className="brand-divider" aria-hidden="true" />
        <span className="brand-we" aria-hidden="true">WE</span>
      </div>
      <p className="sidebar-role">
        {rol === "madre" ? "Panel de mamá" : "Panel de hija"}
      </p>
      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`sidebar-link${section === item.id ? " active" : ""}`}
              onClick={() => onNavigate(item.id)}
              aria-current={section === item.id ? "page" : undefined}
            >
              <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {showTestCta ? (
        <TestCtaBanner
          variant="sidebar"
          answered={testProgress.answered}
          total={testProgress.total}
          complete={testProgress.complete}
          onStartTest={onStartTest}
          onViewReport={onViewReport}
        />
      ) : null}
    </nav>
  );
}
