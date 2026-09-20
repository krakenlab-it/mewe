import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installLocalApi, STORE_KEY } from "./replit-app/lib/local-api";
import { buildWhatsAppLink, generateMotivationalMessage } from "./replit-app/lib/whatsapp";

async function loginDemo() {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@mewe.test", password: "MeWeDemo2026!" }),
  });
  return res.json();
}

describe("Production feature APIs: WhatsApp, timer, calendar, user, contracts", () => {
  beforeEach(() => {
    localStorage.clear();
    window.__meweLocalApiInstalled = false;
    installLocalApi();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("builds typed WhatsApp messages and a wa.me link", () => {
    const text = generateMotivationalMessage("bonding", { firstName: "María", role: "madre" });
    expect(text).toContain("María");
    expect(text).toContain("hija");
    expect(buildWhatsAppLink("+593987123456", text)).toBe(
      `https://wa.me/593987123456?text=${encodeURIComponent(text)}`,
    );
  });

  it("persists notification settings and logs a real WhatsApp send payload", async () => {
    const { user } = await loginDemo();
    const saved = await fetch(`/api/users/${user.id}/notification-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whatsappNumber: "+593987123456",
        frequency: "daily",
        preferredTime: "19:00",
        isActive: true,
      }),
    });
    expect(saved.ok).toBe(true);
    const settings = await (await fetch(`/api/users/${user.id}/notification-settings`)).json();
    expect(settings.whatsappNumber).toBe("+593987123456");
    expect(settings.isActive).toBe(true);

    const sent = await fetch(`/api/users/${user.id}/send-motivational-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageType: "encouragement" }),
    });
    const payload = await sent.json();
    expect(payload.ok).toBe(true);
    expect(payload.preview).toMatch(/María Fernanda|vínculo|hija/i);
    expect(payload.waMeUrl).toMatch(/^https:\/\/wa\.me\/593987123456\?text=/);
    expect(payload.deliveredVia).toContain("wa.me");
    expect(payload.message).not.toMatch(/demo local/i);

    const log = await (await fetch(`/api/users/${user.id}/whatsapp-messages`)).json();
    expect(log.length).toBe(1);
    expect(log[0].text).toBe(payload.preview);
  });

  it("registers LOPDP consent and lets profile revoke it", async () => {
    const created = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Ana",
        lastName: "López",
        email: "ana.nueva@mewe.test",
        password: "MeWeDemo2026!",
        role: "madre",
        edad: 34,
        acceptTerms: true,
      }),
    });
    const { user } = await created.json();
    const consent = await (await fetch(`/api/users/${user.id}/consent`)).json();
    expect(consent.accepted).toBe(true);

    const revoked = await fetch(`/api/users/${user.id}/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted: false, source: "profile" }),
    });
    expect((await revoked.json()).accepted).toBe(false);
  });

  it("creates, snoozes, and completes calendar activities", async () => {
    const { user } = await loginDemo();
    const created = await fetch("/api/scheduled-activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        title: "Torre de prueba",
        description: "Timer de producción",
        scheduledDate: new Date().toISOString(),
        duration: 20,
      }),
    });
    const activity = await created.json();
    expect(activity.id).toBeTruthy();
    expect(activity.status).toBe("scheduled");

    const before = Date.now();
    const snoozed = await (await fetch(`/api/scheduled-activities/${activity.id}/snooze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: 15 }),
    })).json();
    expect(new Date(snoozed.scheduledDate).getTime()).toBeGreaterThan(before + 10 * 60 * 1000);
    expect(snoozed.status).toBe("scheduled");

    const completed = await (await fetch(`/api/scheduled-activities/${activity.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    })).json();
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toBeTruthy();
  });

  it("updates the user profile and logs out the token", async () => {
    const { user, token } = await loginDemo();
    localStorage.setItem("userToken", token);
    const patched = await (await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "María Editada", apellido: "Páez" }),
    })).json();
    expect(patched.nombre).toBe("María Editada");
    expect(patched.firstName).toBe("María Editada");

    const logout = await fetch("/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(logout.ok).toBe(true);
    const store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    expect(store.tokens[token]).toBeFalsy();
  });
});
