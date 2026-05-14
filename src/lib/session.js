const SESSION_KEY = "mewe_session";
const ADMIN_KEY = "mewe_admin";

export function getSavedSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}

export function saveSession(rol, codigo) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ rol, codigo }));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
}

export function setAdminSession(value = true) {
  if (value) sessionStorage.setItem(ADMIN_KEY, "1");
  else sessionStorage.removeItem(ADMIN_KEY);
}

export function hasAdminSession() {
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}
