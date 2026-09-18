import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import Profile from "./replit-app/pages/profile";

describe("Replit profile page", () => {
  beforeEach(() => {
    localStorage.setItem("currentUser", JSON.stringify({
      id: "f6ca9c4c-61ed-4814-b754-462c02d29def",
      firstName: "María Fernanda",
      nombre: "María Fernanda",
      apellido: "Páez",
      role: "madre",
      edad: 38,
      partnerId: "278aac56-b6bf-4cf5-8978-7c04bbb6a22e",
    }));
  });

  it("renders personal info without crashing when fechaTaller is missing", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <Profile />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Información Personal")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("María Fernanda")).toBeInTheDocument();
  });
});
