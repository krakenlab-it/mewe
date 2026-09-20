import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider } from "./replit-app/hooks/use-auth";
import { installLocalApi } from "./replit-app/lib/local-api";
import { queryClient as appQueryClient } from "./replit-app/lib/queryClient";
import Profile from "./replit-app/pages/profile";

function renderProfile() {
  appQueryClient.clear();
  return render(
    <QueryClientProvider client={appQueryClient}>
      <AuthProvider>
        <Profile />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("Replit profile page", () => {
  beforeEach(async () => {
    localStorage.clear();
    window.__meweLocalApiInstalled = false;
    installLocalApi();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@mewe.test", password: "MeWeDemo2026!" }),
    });
    const { user, token } = await res.json();
    const { fechaTaller: _fechaTaller, ...withoutWorkshopDate } = user;
    localStorage.setItem("userToken", token);
    localStorage.setItem("currentUser", JSON.stringify(withoutWorkshopDate));
  });

  it("renders personal info without crashing when fechaTaller is missing", () => {
    renderProfile();
    expect(screen.getByText("Información Personal")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("María Fernanda")).toBeInTheDocument();
  });

  it("wires settings buttons to WhatsApp, LOPDP, help, and logout", async () => {
    const user = userEvent.setup();
    renderProfile();

    expect(screen.getByTestId("button-daily-notifications")).toBeInTheDocument();
    expect(screen.getByTestId("button-privacy")).toBeInTheDocument();
    expect(screen.getByTestId("button-help")).toBeInTheDocument();
    expect(screen.getByTestId("button-profile-logout")).toBeInTheDocument();

    await user.click(screen.getByTestId("button-privacy"));
    expect(await screen.findByTestId("consent-terms-content")).toBeInTheDocument();
    expect(screen.getByTestId("consent-terms-content")).toHaveTextContent("LOPDP");
    await user.click(screen.getByRole("button", { name: "Cerrar" }));

    await user.click(screen.getByTestId("button-profile-logout"));
    expect(localStorage.getItem("userToken")).toBeNull();
    expect(localStorage.getItem("currentUser")).toBeNull();
  });
});
