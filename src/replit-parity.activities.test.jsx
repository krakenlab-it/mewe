import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { WorkshopActivitiesSimple } from "./replit-app/components/workshop-activities-simple";
import BottomNavigation from "./replit-app/components/bottom-navigation";

function renderWithQuery(ui) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("Replit workshop activities + nav parity", () => {
  it("renders Torres, Tiny Monsters, and Escucho", () => {
    renderWithQuery(
      <WorkshopActivitiesSimple
        user={{
          id: "f6ca9c4c-61ed-4814-b754-462c02d29def",
          firstName: "María Fernanda",
          nombre: "María Fernanda",
          role: "madre",
        }}
      />,
    );

    expect(screen.getByText("Construcción de Torres")).toBeInTheDocument();
    expect(screen.getByText("Tiny Monsters")).toBeInTheDocument();
    expect(screen.getByText("Escucho para comprender")).toBeInTheDocument();
  });

  it("exposes Inicio, Actividades, Asistente, Progreso, and Perfil", () => {
    renderWithQuery(<BottomNavigation />);
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Actividades")).toBeInTheDocument();
    expect(screen.getByText("Asistente")).toBeInTheDocument();
    expect(screen.getByText("Progreso")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });
});
