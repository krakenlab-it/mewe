import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  installGlobalErrorHandlers,
  trackAuthFailure,
  trackError,
  trackEvent,
  trackPairClaimFailure,
  trackRpcFailure,
} from "./observability";

describe("observability", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MEWE_OBSERVABILITY_ENABLED", "true");
    vi.stubEnv("VITE_MEWE_OBSERVABILITY_SAMPLE_RATE", "1");
    vi.stubEnv("VITE_MEWE_OBSERVABILITY_WEBHOOK_URL", "");
    vi.stubEnv("VITE_MEWE_BACKEND_MODE", "supabase");
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("emits structured client events to console", () => {
    trackEvent("deploy.smoke", { ok: true });
    expect(console.info).toHaveBeenCalledWith(
      "[mewe:deploy.smoke]",
      expect.objectContaining({
        schema: "mewe.observability.v1",
        name: "deploy.smoke",
        properties: expect.objectContaining({ ok: true, backendMode: "supabase" }),
      }),
    );
  });

  it("redacts pair codes in pair claim failure events", () => {
    trackPairClaimFailure("AB12CD", { reason: "invalid" });
    expect(console.warn).toHaveBeenCalledWith(
      "[mewe:pair_claim.failure]",
      expect.objectContaining({
        properties: expect.objectContaining({
          pairCode: "AB****",
          reason: "invalid",
        }),
      }),
    );
  });

  it("tracks auth and rpc failures as warnings", () => {
    trackAuthFailure("loginAdmin", { message: "invalid credentials" });
    trackRpcFailure("upsert_pair_snapshot", { message: "rpc failed" });

    expect(console.warn).toHaveBeenCalledWith(
      "[mewe:auth.failure]",
      expect.objectContaining({ name: "auth.failure" }),
    );
    expect(console.warn).toHaveBeenCalledWith(
      "[mewe:rpc.failure]",
      expect.objectContaining({ name: "rpc.failure" }),
    );
  });

  it("tracks errors with stack metadata", () => {
    const error = new Error("boom");
    trackError(error, { source: "test" });
    expect(console.error).toHaveBeenCalledWith(
      "[mewe:client.error]",
      expect.objectContaining({
        properties: expect.objectContaining({
          message: "boom",
          source: "test",
        }),
      }),
    );
  });

  it("posts events to webhook when configured", async () => {
    vi.stubEnv("VITE_MEWE_OBSERVABILITY_WEBHOOK_URL", "https://hooks.example.test/obs");
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    trackEvent("webhook.test", { ok: true });
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.example.test/obs",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("webhook.test"),
      }),
    );
  });

  it("installs global error handlers without throwing", () => {
    installGlobalErrorHandlers();
    window.dispatchEvent(new ErrorEvent("error", { message: "test error" }));
    expect(console.error).toHaveBeenCalled();
  });
});
