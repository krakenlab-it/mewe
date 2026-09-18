import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ReplitApp from "./replit-app/App";
import { installLocalApi } from "./replit-app/lib/local-api";

describe("KAN-90 entry: login → Replit dashboard, no marketing splash", () => {
  beforeEach(() => {
    localStorage.clear();
    window.__meweLocalApiInstalled = false;
    installLocalApi();
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("unauthenticated / is the Replit login, not the assessment cover", () => {
    render(<ReplitApp />);

    expect(screen.getByRole("heading", { name: "Me We" })).toBeInTheDocument();
    expect(screen.getByTestId("tab-login")).toBeInTheDocument();
    expect(screen.getByText("demo@mewe.test")).toBeInTheDocument();
    expect(screen.queryByText("Mapa de Conciencia Relacional")).not.toBeInTheDocument();
    expect(screen.queryByText("Entrar a la plataforma")).not.toBeInTheDocument();
    expect(screen.queryByText("Ir a Perfiles de Prueba")).not.toBeInTheDocument();
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
  });

  it("unauthenticated /activities still shows login immediately", () => {
    window.history.pushState({}, "", "/activities");
    render(<ReplitApp />);
    expect(screen.getByTestId("tab-login")).toBeInTheDocument();
    expect(screen.queryByText("Mis Actividades")).not.toBeInTheDocument();
  });

  it("authenticated / is the Replit home dashboard", async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@mewe.test", password: "MeWeDemo2026!" }),
    });
    const { user, token } = await res.json();
    localStorage.setItem("userToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));

    render(<ReplitApp />);

    expect(await screen.findByText(/¡Hola, María Fernanda!/)).toBeInTheDocument();
    expect(screen.getByText("Construcción de Torres")).toBeInTheDocument();
    expect(screen.getByText("Tiny Monsters")).toBeInTheDocument();
    expect(screen.getByText("Escucho para comprender")).toBeInTheDocument();
    expect(screen.queryByText("Mapa de Conciencia Relacional")).not.toBeInTheDocument();
    expect(screen.queryByText("Ir a Perfiles de Prueba")).not.toBeInTheDocument();
  });
});
