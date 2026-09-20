export type WhatsAppScheduleSettings = {
  frequency?: string;
  preferredTime?: string;
  isActive?: boolean;
  preview?: string;
};

const TIMER_KEY = "mewe.whatsapp.timer";

function msUntilPreferredTime(preferredTime: string) {
  const [hours, minutes] = String(preferredTime || "09:00").split(":").map(Number);
  const next = new Date();
  next.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  return Math.max(1000, next.getTime() - Date.now());
}

export async function requestNotificationPermission() {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string, tag = "mewe") {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification(title, { body, tag });
  } catch {
    // Some browsers require a service worker for Notification on insecure origins.
  }
}

export function scheduleWhatsAppReminder(settings: WhatsAppScheduleSettings) {
  if (typeof window === "undefined") return;
  const existing = Number(window.sessionStorage.getItem(TIMER_KEY) || 0);
  if (existing) window.clearTimeout(existing);
  if (!settings?.isActive) return;

  const delay = msUntilPreferredTime(settings.preferredTime || "09:00");
  const timerId = window.setTimeout(() => {
    showBrowserNotification(
      "Me We",
      settings.preview || "Es hora de tu mensaje Me We. Ábrelo y envíalo por WhatsApp.",
      "mewe-whatsapp",
    );
    if (settings.frequency === "twice_daily") {
      window.setTimeout(() => {
        showBrowserNotification(
          "Me We",
          "Segundo recordatorio del día: un gesto corto con ella ya cuenta.",
          "mewe-whatsapp-pm",
        );
      }, 12 * 60 * 60 * 1000);
    }
    scheduleWhatsAppReminder(settings);
  }, delay);
  window.sessionStorage.setItem(TIMER_KEY, String(timerId));
}
