import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { TestCtaBanner } from "./components/TestCtaBanner";
import { TestOnboardingPage } from "./pages/TestOnboardingPage";

describe("test onboarding UI", () => {
  it("onboarding page has primary CTA and secondary dismiss", async () => {
    const onStart = vi.fn();
    const onGo = vi.fn();
    const { container } = render(
      <TestOnboardingPage
        rol="madre"
        nombre="Ana"
        answered={0}
        total={96}
        onStartTest={onStart}
        onGoToDashboard={onGo}
      />,
    );

    const primary = screen.getByRole("button", { name: "Empezar el test" });
    expect(primary).toHaveFocus();
    expect(screen.getByRole("button", { name: /Ir al panel/i })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    await userEvent.click(primary);
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("onboarding shows continue label when partial progress", () => {
    render(
      <TestOnboardingPage
        rol="hija"
        nombre="Luna"
        answered={12}
        total={48}
        onStartTest={() => {}}
        onGoToDashboard={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /Continuar el test/i })).toBeInTheDocument();
    expect(screen.getByText(/12 de 48 preguntas/i)).toBeInTheDocument();
  });

  it("dashboard banner shows progress and start action", async () => {
    const onStart = vi.fn();
    const { container } = render(
      <TestCtaBanner answered={10} total={96} complete={false} onStartTest={onStart} onViewReport={() => {}} />,
    );

    expect(screen.getByText(/10 de 96 preguntas/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
    await userEvent.click(screen.getByRole("button", { name: /Continuar el test/i }));
    expect(onStart).toHaveBeenCalledOnce();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("dashboard banner shows report CTA when complete", () => {
    const onView = vi.fn();
    render(
      <TestCtaBanner answered={96} total={96} complete onStartTest={() => {}} onViewReport={onView} />,
    );

    expect(screen.getByRole("button", { name: /Ver mi reporte/i })).toBeInTheDocument();
  });
});
