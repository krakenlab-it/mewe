import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installLocalApi, STORE_KEY } from "./replit-app/lib/local-api";

describe("Replit local API adapter", () => {
  beforeEach(() => {
    localStorage.clear();
    window.__meweLocalApiInstalled = false;
    installLocalApi();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("logs in the seeded demo mother and returns a token", async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@mewe.test", password: "MeWeDemo2026!" }),
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.user.firstName).toBe("María Fernanda");
    expect(data.user.role).toBe("madre");
    expect(data.user.partnerId).toBe("278aac56-b6bf-4cf5-8978-7c04bbb6a22e");
    expect(data.token).toBeTruthy();
  });

  it("seeds the full Replit catalog: pairs, charms, suggested activities", () => {
    const store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    expect(store.users.length).toBe(5);
    expect(store.charms.length).toBeGreaterThanOrEqual(36);
    expect(store.suggestedActivities.length).toBeGreaterThanOrEqual(8);
  });

  it("returns workshop activities, charms, and connection codes", async () => {
    const login = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@mewe.test", password: "MeWeDemo2026!" }),
    });
    const { user, token } = await login.json();
    const headers = { Authorization: `Bearer ${token}` };

    const activities = await (await fetch(`/api/users/${user.id}/activities`, { headers })).json();
    expect(activities.map((item) => item.nombre)).toEqual([
      "Construcción de Torres",
      "Tiny Monsters",
      "Escucho para comprender",
    ]);

    const charms = await (await fetch("/api/charms", { headers })).json();
    expect(charms.some((charm) => charm.isSpecial)).toBe(true);

    const generated = await (await fetch(`/api/users/${user.id}/generate-connection-code`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
    })).json();
    expect(generated.connectionCode).toMatch(/^MEWE-/);
  });

  it("answers Pamela chat without an OpenAI secret", async () => {
    const res = await fetch("/api/mewe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "quiero un juego de lego" }),
    });
    const data = await res.json();
    expect(data.message.toLowerCase()).toContain("torre");
    expect(data.fallback).toBe(true);
  });

  it("returns connection payloads as both JSON fields and response.json()", async () => {
    const { apiRequest } = await import("./replit-app/lib/queryClient");
    const login = await apiRequest("POST", "/api/auth/login", {
      email: "sofia.demo@mewe.test",
      password: "MeWeDemo2026!",
    });
    expect(login.user.firstName).toBe("Sofía");
    expect(login.user.partnerId).toBeFalsy();
    const body = await login.json();
    expect(body.token).toBeTruthy();

    const generated = await apiRequest("POST", `/api/users/${login.user.id}/generate-connection-code`);
    expect(generated.connectionCode).toMatch(/^MEWE-/);
    expect((await generated.json()).connectionCode).toBe(generated.connectionCode);
  });
});
