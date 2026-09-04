import { describe, expect, it } from "vitest";
import { nuevaDuplaVacia } from "../scoring";
import {
  createEmptyInteractivo,
  ensureInteractivo,
  getTodayMood,
  setTodayMood,
  getConnectionInfo,
  completeActivity,
  getUnlockedAchievements,
  updateWhatsappPrefs,
} from "./state";

describe("interactive state", () => {
  it("creates empty interactivo with expected shape", () => {
    const state = createEmptyInteractivo();
    expect(state.mood.entries).toEqual([]);
    expect(state.connection.nivel).toBe(1);
    expect(state.whatsapp.enabled).toBe(false);
  });

  it("records daily mood once per role per day", () => {
    const dupla = nuevaDuplaVacia();
    ensureInteractivo(dupla);
    setTodayMood(dupla, "madre", 3);
    setTodayMood(dupla, "madre", 4);
    const mood = getTodayMood(dupla, "madre");
    expect(mood.value).toBe(4);
  });

  it("unlocks achievements when completing activities", () => {
    const dupla = nuevaDuplaVacia();
    dupla.hija.nombre = "Luna";
    ensureInteractivo(dupla);
    completeActivity(dupla, "torres");
    const achievements = getUnlockedAchievements(dupla);
    expect(achievements.some((a) => a.id === "primera-actividad")).toBe(true);
    expect(dupla.interactivo.pieces.unlockedMadre).toContain("escucha-sin-juicio");
  });

  it("computes connection progress when daughter joins", () => {
    const dupla = nuevaDuplaVacia();
    dupla.hija.nombre = "Luna";
    const conn = getConnectionInfo(dupla);
    expect(conn.hijaConectada).toBe(true);
    expect(conn.nivel).toBeGreaterThanOrEqual(1);
  });

  it("persists whatsapp preferences", () => {
    const dupla = nuevaDuplaVacia();
    ensureInteractivo(dupla);
    updateWhatsappPrefs(dupla, { phone: "+593987123456", enabled: true });
    expect(dupla.interactivo.whatsapp.phone).toBe("+593987123456");
    expect(dupla.interactivo.whatsapp.enabled).toBe(true);
  });
});
