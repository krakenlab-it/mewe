import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { DashboardSidebar } from "./components/dashboard/DashboardSidebar";
import { DASHBOARD_SECTIONS } from "./lib/interactive/constants";
import { nuevaDuplaVacia } from "./lib/scoring";
import { InteractiveDashboardPage } from "./pages/interactive/InteractiveDashboardPage";

describe("interactive dashboard a11y", () => {
  it("sidebar has navigation landmarks and active page", () => {
    const { container, getByRole } = render(
      <DashboardSidebar
        section={DASHBOARD_SECTIONS.INICIO}
        onNavigate={() => {}}
        rol="madre"
      />,
    );
    expect(getByRole("navigation", { name: "Panel principal" })).toBeInTheDocument();
    expect(container.querySelector('[aria-current="page"]')).toBeTruthy();
  });

  it("dashboard inicio has no detectable axe violations", async () => {
    const dupla = nuevaDuplaVacia();
    dupla.madre.nombre = "Ana";
    dupla.codigo = "ABC123";
    const { container } = render(
      <InteractiveDashboardPage
        dupla={dupla}
        rol="madre"
        onSave={async () => {}}
        onLogout={() => {}}
        onStartTest={() => {}}
        onViewReport={() => {}}
        onViewComparative={() => {}}
        onGoCrisis={() => {}}
        onGoPolicy={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
