import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import AuthLogin from "./replit-app/pages/auth-login";

vi.mock("./replit-app/hooks/use-auth", () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
  }),
}));

function renderLogin() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AuthLogin />
    </QueryClientProvider>,
  );
}

describe("Auth login / terms parity", () => {
  it("shows Me We branding, demo credentials, and Ecuador terms checkbox", async () => {
    const user = userEvent.setup();
    renderLogin();

    expect(screen.getByRole("heading", { name: "Me We" })).toBeInTheDocument();
    expect(screen.getByText("Juntas en Conexión, Fuertes en Confianza")).toBeInTheDocument();
    expect(screen.getByText("demo@mewe.test")).toBeInTheDocument();
    expect(screen.getByText(/MeWeDemo2026!/)).toBeInTheDocument();

    await user.click(screen.getByTestId("tab-register"));
    expect(screen.getByTestId("checkbox-accept-terms")).toBeInTheDocument();
    expect(screen.getByText(/Ley de Protección de Datos de Ecuador/)).toBeInTheDocument();
    expect(screen.getByTestId("button-register")).toBeDisabled();
    expect(screen.getByTestId("button-view-terms")).toBeInTheDocument();
  });
});
