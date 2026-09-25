import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installLocalApi, STORE_KEY } from "./replit-app/lib/local-api";

describe("Replit local API adapter", () => {
  beforeEach(() => {
    localStorage.clear();
    window.__meweLocalApiInstalled = false;
    installLocalApi();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
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

  it("refuses admin data, built-in passwords, and cross-user profile edits", async () => {
    const openAdmin = await fetch("/api/admin/users");
    expect(openAdmin.status).toBe(401);

    for (const password of ["MeWeDemo2026!", "MeWeAdmin2026!", "mewe2026"]) {
      const rejected = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "facilitadora@mewe.test", password }),
      });
      expect(rejected.status).toBe(401);
    }

    const wiped = await fetch("/api/demo/clean", { method: "DELETE" });
    expect(wiped.status).toBe(401);

    vi.stubEnv("VITE_MEWE_LOCAL_ADMIN_PASS", "local-admin-secret");
    const login = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "facilitadora@mewe.test", password: "local-admin-secret" }),
    });
    expect(login.status).toBe(200);
    const { token } = await login.json();
    const users = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(users.ok).toBe(true);

    const seed = await fetch("/api/demo/seed", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(seed.ok).toBe(true);
    const stillAdmin = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(stillAdmin.ok).toBe(true);

    const demo = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@mewe.test", password: "MeWeDemo2026!" }),
    });
    const { user, token: userToken } = await demo.json();
    const otherId = "278aac56-b6bf-4cf5-8978-7c04bbb6a22e";
    const cross = await fetch(`/api/users/${otherId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ nombre: "Hack" }),
    });
    expect(cross.status).toBe(401);

    const escalate = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        nombre: "María Segura",
        role: "hija",
        password: "stolen",
        isActive: false,
      }),
    });
    expect(escalate.ok).toBe(true);
    const store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    const saved = store.users.find((candidate) => candidate.id === user.id);
    expect(saved.nombre).toBe("María Segura");
    expect(saved.role).toBe("madre");
    expect(saved.password).toBe("MeWeDemo2026!");
    expect(saved.isActive).not.toBe(false);

    await fetch("/api/admin/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const afterLogout = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(afterLogout.status).toBe(401);
    vi.unstubAllEnvs();
  });
});
