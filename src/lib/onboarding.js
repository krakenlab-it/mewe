import { PREGUNTAS } from "../data/questions";

const DISMISS_PREFIX = "mewe_onboarding_dismissed";

export function getTestProgress(persona, rol) {
  const roleKey = rol === "madre" ? "madre" : "hija";
  const total = PREGUNTAS[roleKey].length;
  const answered = Object.keys(persona?.respuestas || {}).length;
  const complete = Boolean(persona?.completado);

  return { answered, total, complete };
}

export function getTestCtaLabel(answered, complete) {
  if (complete) return "Ver mi reporte";
  if (answered > 0) return "Continuar el test";
  return "Empezar el test";
}

export function getOnboardingDismissKey(codigo, rol) {
  return `${DISMISS_PREFIX}_${codigo}_${rol}`;
}

export function isOnboardingDismissed(codigo, rol) {
  if (!codigo || !rol) return false;
  return sessionStorage.getItem(getOnboardingDismissKey(codigo, rol)) === "1";
}

export function dismissOnboarding(codigo, rol) {
  if (!codigo || !rol) return;
  sessionStorage.setItem(getOnboardingDismissKey(codigo, rol), "1");
}

export function shouldShowOnboarding(codigo, rol, persona) {
  if (!persona || persona.completado) return false;
  return !isOnboardingDismissed(codigo, rol);
}
