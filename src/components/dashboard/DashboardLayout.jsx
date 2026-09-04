import { SkipLink } from "../ui";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardLayout({
  section,
  onNavigate,
  rol,
  nombre,
  subtitle,
  onLogout,
  onStartTest,
  onViewReport,
  onViewComparative,
  testProgress,
  children,
}) {
  return (
    <div className="dashboard-app">
      <SkipLink />
      <div className="dashboard-shell">
        <DashboardSidebar
          section={section}
          onNavigate={onNavigate}
          rol={rol}
          testProgress={testProgress}
          onStartTest={onStartTest}
          onViewReport={onViewReport}
        />
        <div className="dashboard-main">
          <DashboardHeader
            nombre={nombre}
            subtitle={subtitle}
            rol={rol}
            onLogout={onLogout}
            onStartTest={onStartTest}
            onViewReport={onViewReport}
            onViewComparative={onViewComparative}
          />
          <main
            id="main-content"
            className="dashboard-content"
            tabIndex={-1}
            aria-label="Contenido del panel"
          >
            {children}
          </main>
          <footer className="dashboard-footer">
            Me We v1.0 · Herramienta experiencial · No es diagnóstico clínico ni canal de emergencia
          </footer>
        </div>
      </div>
      <MobileBottomNav section={section} onNavigate={onNavigate} />
    </div>
  );
}
