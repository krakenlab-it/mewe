import { ACHIEVEMENTS } from "./data";
import { CONNECTION_LEVELS } from "./constants";

export function createEmptyInteractivo() {
  return {
    mood: { entries: [] },
    connection: { nivel: 1, progress: 0, hijaConectada: false },
    activities: { completed: [], uploads: {} },
    calendar: { events: [] },
    achievements: [],
    pieces: { unlockedMadre: [], unlockedHija: [], unlockedSpecial: false },
    whatsapp: {
      phone: "",
      enabled: false,
      frequency: "daily",
      preferredTime: "09:00",
      lastTestSentAt: null,
    },
    chat: { messages: [] },
  };
}

export function ensureInteractivo(dupla) {
  if (!dupla.interactivo) {
    dupla.interactivo = createEmptyInteractivo();
  }
  return dupla.interactivo;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayMood(dupla, rol) {
  const interactivo = ensureInteractivo(dupla);
  const today = todayKey();
  return interactivo.mood.entries.find((e) => e.date === today && e.rol === rol) || null;
}

export function setTodayMood(dupla, rol, value) {
  const interactivo = ensureInteractivo(dupla);
  const today = todayKey();
  const existing = interactivo.mood.entries.findIndex((e) => e.date === today && e.rol === rol);
  const entry = { date: today, rol, value, recordedAt: new Date().toISOString() };
  if (existing >= 0) {
    interactivo.mood.entries[existing] = entry;
  } else {
    interactivo.mood.entries.push(entry);
    if (!interactivo.achievements.includes("primer-animo")) {
      interactivo.achievements.push("primer-animo");
    }
  }
  return entry;
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getWeekMoodData(dupla, rol, weekStart) {
  const interactivo = ensureInteractivo(dupla);
  const dates = getWeekDates(weekStart);
  return dates.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const entry = interactivo.mood.entries.find((e) => e.date === key && e.rol === rol);
    return { date: d, value: entry?.value ?? null };
  });
}

export function getConnectionInfo(dupla) {
  const interactivo = ensureInteractivo(dupla);
  const hijaConectada = Boolean(dupla.hija?.nombre);
  if (hijaConectada && !interactivo.connection.hijaConectada) {
    interactivo.connection.hijaConectada = true;
    if (!interactivo.achievements.includes("conexion-iniciada")) {
      interactivo.achievements.push("conexion-iniciada");
    }
  }
  const completedCount = interactivo.activities.completed.length;
  const moodCount = interactivo.mood.entries.length;
  const piecesCount =
    interactivo.pieces.unlockedMadre.length + interactivo.pieces.unlockedHija.length;
  const baseProgress = hijaConectada ? 15 : 5;
  const activityProgress = Math.min(40, completedCount * 10);
  const moodProgress = Math.min(25, moodCount * 3);
  const piecesProgress = Math.min(20, piecesCount * 4);
  const testProgress = (dupla.madre?.completado ? 10 : 0) + (dupla.hija?.completado ? 10 : 0);
  const totalProgress = Math.min(100, baseProgress + activityProgress + moodProgress + piecesProgress + testProgress);
  interactivo.connection.progress = totalProgress;

  let nivel = 1;
  for (const level of CONNECTION_LEVELS) {
    if (totalProgress >= level.progress) nivel = level.level;
  }
  interactivo.connection.nivel = nivel;

  const levelInfo = CONNECTION_LEVELS.find((l) => l.level === nivel) || CONNECTION_LEVELS[0];
  return { ...interactivo.connection, hijaConectada, levelInfo, totalProgress };
}

export function completeActivity(dupla, activityId) {
  const interactivo = ensureInteractivo(dupla);
  if (!interactivo.activities.completed.includes(activityId)) {
    interactivo.activities.completed.push(activityId);
    if (!interactivo.achievements.includes("primera-actividad")) {
      interactivo.achievements.push("primera-actividad");
    }
    maybeUnlockPiece(dupla);
  }
}

export function addCalendarEvent(dupla, event) {
  const interactivo = ensureInteractivo(dupla);
  const id = `evt-${Date.now()}`;
  interactivo.calendar.events.push({ id, ...event, createdAt: new Date().toISOString() });
  return id;
}

export function removeCalendarEvent(dupla, eventId) {
  const interactivo = ensureInteractivo(dupla);
  interactivo.calendar.events = interactivo.calendar.events.filter((e) => e.id !== eventId);
}

export function getEventsForDate(dupla, dateKey) {
  const interactivo = ensureInteractivo(dupla);
  return interactivo.calendar.events.filter((e) => e.date === dateKey);
}

export function unlockPiece(dupla, pieceId, role) {
  const interactivo = ensureInteractivo(dupla);
  const key = role === "madre" ? "unlockedMadre" : "unlockedHija";
  if (!interactivo.pieces[key].includes(pieceId)) {
    interactivo.pieces[key].push(pieceId);
    if (!interactivo.achievements.includes("primera-pieza")) {
      interactivo.achievements.push("primera-pieza");
    }
  }
}

function maybeUnlockPiece(dupla) {
  const interactivo = ensureInteractivo(dupla);
  const completed = interactivo.activities.completed.length;
  if (completed >= 1 && !interactivo.pieces.unlockedMadre.includes("escucha-sin-juicio")) {
    unlockPiece(dupla, "escucha-sin-juicio", "madre");
    unlockPiece(dupla, "comparto-sentimientos", "hija");
  }
  if (completed >= 2) {
    unlockPiece(dupla, "tiempo-presente", "madre");
    unlockPiece(dupla, "mi-voz", "hija");
  }
  if (completed >= 3 && !interactivo.pieces.unlockedSpecial) {
    interactivo.pieces.unlockedSpecial = true;
  }
}

export function checkTestAchievements(dupla) {
  const interactivo = ensureInteractivo(dupla);
  if (dupla.madre?.completado || dupla.hija?.completado) {
    if (!interactivo.achievements.includes("test-completado")) {
      interactivo.achievements.push("test-completado");
    }
  }
}

export function getUnlockedAchievements(dupla) {
  const interactivo = ensureInteractivo(dupla);
  checkTestAchievements(dupla);
  return ACHIEVEMENTS.filter((a) => interactivo.achievements.includes(a.id));
}

export function updateWhatsappPrefs(dupla, prefs) {
  const interactivo = ensureInteractivo(dupla);
  interactivo.whatsapp = { ...interactivo.whatsapp, ...prefs };
}

export function addChatMessage(dupla, message) {
  const interactivo = ensureInteractivo(dupla);
  interactivo.chat.messages.push({ ...message, id: `msg-${Date.now()}`, at: new Date().toISOString() });
}

export function setActivityUpload(dupla, activityId, fileMeta) {
  const interactivo = ensureInteractivo(dupla);
  if (!interactivo.activities.uploads[activityId]) {
    interactivo.activities.uploads[activityId] = [];
  }
  interactivo.activities.uploads[activityId].push({
    ...fileMeta,
    uploadedAt: new Date().toISOString(),
  });
}

export function formatWeekRange(weekStart) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" });
  const startStr = weekStart.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  const endStr = fmt(end);
  return `${startStr} - ${endStr}`;
}
