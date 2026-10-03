const OBSERVABILITY_VERSION = "1";

function getConfig() {
  const webhookUrl = import.meta.env.VITE_MEWE_OBSERVABILITY_WEBHOOK_URL || "";
  const enabled = import.meta.env.VITE_MEWE_OBSERVABILITY_ENABLED !== "false";
  const sampleRate = Number(import.meta.env.VITE_MEWE_OBSERVABILITY_SAMPLE_RATE ?? "1");
  return {
    enabled,
    webhookUrl: webhookUrl.trim(),
    sampleRate: Number.isFinite(sampleRate) ? Math.min(1, Math.max(0, sampleRate)) : 1,
  };
}

function shouldSample(sampleRate) {
  if (sampleRate >= 1) return true;
  if (sampleRate <= 0) return false;
  return Math.random() < sampleRate;
}

function buildEvent(name, properties = {}, level = "info") {
  return {
    schema: "mewe.observability.v1",
    version: OBSERVABILITY_VERSION,
    name,
    level,
    timestamp: new Date().toISOString(),
    properties: {
      ...properties,
      backendMode: import.meta.env.VITE_MEWE_BACKEND_MODE || "auto",
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    },
  };
}

function emitConsole(event) {
  const method = event.level === "error" ? "error" : event.level === "warn" ? "warn" : "info";
  console[method](`[mewe:${event.name}]`, event);
}

async function emitWebhook(event, webhookUrl) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true,
    });
  } catch (_error) {
    // Never break user flows for telemetry delivery failures.
  }
}

export function trackEvent(name, properties = {}, options = {}) {
  const { enabled, webhookUrl, sampleRate } = getConfig();
  if (!enabled || !shouldSample(sampleRate)) return;

  const event = buildEvent(name, properties, options.level || "info");
  emitConsole(event);
  void emitWebhook(event, webhookUrl);
}

export function trackError(error, context = {}) {
  const message = error?.message || String(error);
  const properties = {
    ...context,
    message,
    name: error?.name,
    stack: error?.stack,
  };
  trackEvent("client.error", properties, { level: "error" });
}

export function trackAuthFailure(action, details = {}) {
  trackEvent("auth.failure", { action, ...details }, { level: "warn" });
}

export function trackRpcFailure(fn, details = {}) {
  trackEvent("rpc.failure", { fn, ...details }, { level: "warn" });
}

export function trackPairClaimFailure(pairCode, details = {}) {
  trackEvent("pair_claim.failure", {
    pairCode: pairCode ? String(pairCode).slice(0, 2) + "****" : undefined,
    ...details,
  }, { level: "warn" });
}

export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    trackError(event.error || new Error(event.message), {
      source: "window.error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    trackError(reason instanceof Error ? reason : new Error(String(reason)), {
      source: "window.unhandledrejection",
    });
  });
}
