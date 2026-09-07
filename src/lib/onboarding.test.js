import { beforeEach, describe, expect, it } from "vitest";
import {
  dismissOnboarding,
  getOnboardingDismissKey,
  getTestCtaLabel,
  getTestProgress,
  isOnboardingDismissed,
  shouldShowOnboarding,
} from "./onboarding";
import { nuevaDuplaVacia } from "./scoring";

describe("onboarding helpers", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("computes test progress from respuestas", () => {
    const dupla = nuevaDuplaVacia();
    dupla.madre.respuestas = { m1: 3, m2: 4 };
    const progress = getTestProgress(dupla.madre, "madre");
    expect(progress.answered).toBe(2);
    expect(progress.total).toBeGreaterThan(0);
    expect(progress.complete).toBe(false);
  });

  it("returns correct CTA labels", () => {
    expect(getTestCtaLabel(0, false)).toBe("Empezar el test");
    expect(getTestCtaLabel(5, false)).toBe("Continuar el test");
    expect(getTestCtaLabel(96, true)).toBe("Ver mi reporte");
  });

  it("tracks session dismiss state per pair and role", () => {
    expect(isOnboardingDismissed("ABC123", "madre")).toBe(false);
    dismissOnboarding("ABC123", "madre");
    expect(sessionStorage.getItem(getOnboardingDismissKey("ABC123", "madre"))).toBe("1");
    expect(isOnboardingDismissed("ABC123", "madre")).toBe(true);
    expect(isOnboardingDismissed("ABC123", "hija")).toBe(false);
  });

  it("should show onboarding when incomplete and not dismissed", () => {
    const persona = { completado: false, respuestas: {} };
    expect(shouldShowOnboarding("XYZ789", "hija", persona)).toBe(true);
    dismissOnboarding("XYZ789", "hija");
    expect(shouldShowOnboarding("XYZ789", "hija", persona)).toBe(false);
  });

  it("should not show onboarding when test is complete", () => {
    const persona = { completado: true, respuestas: { h1: 5 } };
    expect(shouldShowOnboarding("XYZ789", "hija", persona)).toBe(false);
  });
});
