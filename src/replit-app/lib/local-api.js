import { createSupabaseBrowserClient } from "../../lib/supabaseClient.js";
import {
  buildWhatsAppLink,
  deliverViaWebhook,
  generateMotivationalMessage,
} from "./whatsapp.js";

const STORE_KEY = "mewe.replit.store.v1";

const DEMO_PASSWORD = "MeWeDemo2026!";
const DEMO_EMAIL = "demo@mewe.test";

const IDS = {
  maria: "f6ca9c4c-61ed-4814-b754-462c02d29def",
  valentina: "278aac56-b6bf-4cf5-8978-7c04bbb6a22e",
  gabriela: "85d09e1a-2dca-455a-89ba-115d58470a49",
  emilia: "19bb6a82-91f6-408e-a9bd-56be8bf11587",
};

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function seedCharms() {
  const madre = [
    ["Tiempo Presente", "Estar aquí, ahora, con ella.", "💜"],
    ["Escucha sin Juicio", "Oír para comprender, no para corregir.", "👂"],
    ["Guía con Corazón", "Acompañar sin controlar.", "💛"],
    ["Dejo el Miedo", "Soltar la ansiedad que apaga la conexión.", "🌱"],
    ["Límites con Amor", "Cuidar el vínculo con claridad.", "🛡️"],
    ["Suelto el Control", "Confiar en su proceso.", "🕊️"],
    ["Celebro sus Logros", "Verla brillar y decírselo.", "🎉"],
    ["Acepto sus Cambios", "Amarla también cuando cambia.", "🌙"],
    ["Confío en el Proceso", "El taller sigue trabajando en nosotras.", "🔗"],
    ["Paciencia Activa", "Esperar con presencia.", "⏳"],
    ["Humor Compartido", "Reír juntas desbloquea oxitocina.", "😄"],
    ["Ritual de las 7pm", "Un rito corto, todos los días.", "🕖"],
    ["Palabra Amable", "Una frase que cura más que un consejo.", "💬"],
    ["Cuerpo Presente", "Un abrazo de 20 segundos.", "🤗"],
    ["Pregunta Abierta", "¿Cómo se sintió eso para ti?", "❓"],
    ["Disculpa Valiente", "Reparar sin justificarse.", "🤍"],
    ["Orgullo Silencioso", "Dejarla ganar su propia historia.", "⭐"],
  ];
  const hija = [
    ["Mi Voz Importa", "Lo que siento merece ser dicho.", "🗣️"],
    ["Comparto Sentimientos", "Ponerle nombre a lo que siento.", "💗"],
    ["Pido Ayuda", "Pedir no es debilidad.", "🙋"],
    ["Respeto Límites", "Cuidar el espacio de las dos.", "🧭"],
    ["Expreso Gratitud", "Decir gracias cambia el tono del día.", "🙏"],
    ["Acepto Diferencias", "No tenemos que pensar igual.", "🌈"],
    ["Cuido el Vínculo", "Pequeños gestos sostienen la relación.", "🪢"],
    ["Crezco Libre", "Puedo ser yo y seguir cerca.", "🦋"],
    ["Confío en Mamá", "Puedo acercarme cuando lo necesito.", "🏠"],
    ["Juego en Serio", "El juego también es conversación.", "🎲"],
    ["Respiro Antes", "Una pausa antes de reaccionar.", "🌬️"],
    ["Dibujo lo que Siento", "El lápiz dice lo que la voz calla.", "✏️"],
    ["Equipo de Dos", "No estoy sola en esto.", "👯"],
    ["Pregunto con Cariño", "Quiero entenderte, mamá.", "🌷"],
    ["Celebro lo Nuestro", "Guardar un momento lindo.", "📸"],
    ["Perdono y Sigo", "Soltar para volver a jugar.", "🌅"],
    ["Soy Valiente", "Hablar aunque me dé miedo.", "🦁"],
  ];

  const charms = [];
  madre.forEach(([name, description, iconEmoji], index) => {
    charms.push({
      id: `charm-madre-${index + 1}`,
      name,
      description,
      type: "madre",
      color: ["#F9A8D4", "#C4B5FD", "#FDBA74", "#93C5FD", "#FDE68A"][index % 5],
      rarity: index < 8 ? "común" : index < 14 ? "raro" : "épico",
      isSpecial: false,
      iconEmoji,
      isActive: true,
    });
  });
  hija.forEach(([name, description, iconEmoji], index) => {
    charms.push({
      id: `charm-hija-${index + 1}`,
      name,
      description,
      type: "hija",
      color: ["#DDD6FE", "#FBCFE8", "#A5F3FC", "#FDE68A", "#BBF7D0"][index % 5],
      rarity: index < 8 ? "común" : index < 14 ? "raro" : "épico",
      isSpecial: false,
      iconEmoji,
      isActive: true,
    });
  });
  charms.push({
    id: "charm-especial-18",
    name: "Conexión Eterna",
    description: "Logro de 8 meses juntas",
    type: "especial",
    color: "#FFD700",
    rarity: "legendario",
    isSpecial: true,
    iconEmoji: "👑",
    isActive: true,
  });
  charms.push({
    id: "charm-especial-hija",
    name: "Somos Team 🫶",
    description: "Pieza especial del dúo",
    type: "especial_hija",
    color: "#FFD700",
    rarity: "legendario",
    isSpecial: true,
    iconEmoji: "👑",
    isActive: true,
  });
  return charms;
}

function seedSuggested(userId, role) {
  const forMother = role === "madre";
  return [
    {
      id: uid("sug"),
      userId,
      title: forMother ? "Laboratorio de Emociones" : "Mapa de mis emociones",
      description: forMother
        ? "Nombren juntas 3 emociones del día y ubíquenlas en el cuerpo. La neurociencia muestra que etiquetar reduce la intensidad de la amígdala."
        : "Dibuja tres caras: cómo te sentiste hoy, cómo te sentiste con mamá, y cómo quieres sentirte mañana.",
      category: "emociones",
      scientificBacking: "Afect labeling / Lieberman et al. — poner palabras baja la reactividad emocional.",
      duration: 20,
      targetRole: role,
      isNew: true,
      isCompleted: false,
      suggestedAt: nowIso(),
    },
    {
      id: uid("sug"),
      userId,
      title: forMother ? "Cartografía de Sueños" : "El puente de 10 minutos",
      description: forMother
        ? "Pregúntale qué sueño tiene esta semana y construyan un puente LEGO de 10 piezas hacia ese sueño."
        : "Construye un puente de 10 piezas hacia algo que quieres y explícaselo a mamá.",
      category: "juego",
      scientificBacking: "El juego simbólico libera oxitocina y entrena planificación (funciones ejecutivas).",
      duration: 25,
      targetRole: role,
      isNew: true,
      isCompleted: false,
      suggestedAt: nowIso(),
    },
    {
      id: uid("sug"),
      userId,
      title: "Escucha de 3 turnos",
      description: "Cada una habla 90 segundos. La otra solo parafrasea. Sin consejos.",
      category: "comunicacion",
      scientificBacking: "OARS / entrevista motivacional: reflejar antes de aconsejar aumenta la seguridad.",
      duration: 15,
      targetRole: "ambas",
      isNew: true,
      isCompleted: false,
      suggestedAt: nowIso(),
    },
  ];
}

function seedAchievements() {
  return [
    { id: "ach-mood", nombre: "Primer Estado de Ánimo", descripcion: "Registraste tu primer estado de ánimo", iconType: "heart", color: "#A855F7" },
    { id: "ach-activity", nombre: "Primera Actividad", descripcion: "Completaste tu primera actividad del taller", iconType: "star", color: "#F59E0B" },
    { id: "ach-connect", nombre: "Conectadas", descripcion: "Vinculaste tu código madre-hija", iconType: "link", color: "#6366F1" },
    { id: "ach-chat", nombre: "Conversación con Pamela", descripcion: "Hablaste con el asistente Me We", iconType: "message", color: "#EC4899" },
  ];
}

function seedTemplates() {
  return [
    { id: "tpl-cocina", title: "Cocinar juntas", description: "Preparen un snack y cuenten un secreto dulce.", category: "food", emoji: "🍪", defaultDuration: 30, isActive: true },
    { id: "tpl-lego", title: "Torre de la semana", description: "Cada una agrega 5 piezas que representen su día.", category: "bonding", emoji: "🧱", defaultDuration: 20, isActive: true },
    { id: "tpl-paseo", title: "Caminata de preguntas", description: "Una pregunta cada cuadra, sin celulares.", category: "sports", emoji: "🚶", defaultDuration: 25, isActive: true },
    { id: "tpl-dibujo", title: "Retrato de la otra", description: "Dibújense mutuamente y expliquen tres detalles.", category: "entertainment", emoji: "🎨", defaultDuration: 20, isActive: true },
  ];
}

function createUser({ id, firstName, lastName, email, role, edad, partnerId, connectionCode }) {
  return {
    id,
    firstName,
    lastName,
    nombre: firstName,
    apellido: lastName,
    email,
    password: DEMO_PASSWORD,
    role,
    edad,
    partnerId: partnerId || null,
    connectionCode: connectionCode || null,
    fechaTaller: nowIso(),
    isActive: true,
    createdAt: nowIso(),
  };
}

function seedStore() {
  const charms = seedCharms();
  const users = [
    createUser({
      id: IDS.maria,
      firstName: "María Fernanda",
      lastName: "Páez",
      email: DEMO_EMAIL,
      role: "madre",
      edad: 38,
      partnerId: IDS.valentina,
      connectionCode: "MEWE-PAEZ",
    }),
    createUser({
      id: IDS.valentina,
      firstName: "Valentina",
      lastName: "Páez",
      email: "valentina.paez@mewe.test",
      role: "hija",
      edad: 12,
      partnerId: IDS.maria,
      connectionCode: "MEWE-PAEZ",
    }),
    createUser({
      id: IDS.gabriela,
      firstName: "Gabriela",
      lastName: "Torres",
      email: "gabriela.torres@mewe.test",
      role: "madre",
      edad: 41,
      partnerId: IDS.emilia,
      connectionCode: "MEWE-TORRES",
    }),
    createUser({
      id: IDS.emilia,
      firstName: "Emilia",
      lastName: "Torres",
      email: "emilia.torres@mewe.test",
      role: "hija",
      edad: 11,
      partnerId: IDS.gabriela,
      connectionCode: "MEWE-TORRES",
    }),
    createUser({
      id: "sofia-unlinked-demo",
      firstName: "Sofía",
      lastName: "Demo",
      email: "sofia.demo@mewe.test",
      role: "madre",
      edad: 36,
    }),
  ];

  const today = new Date();
  const moodEntries = users.flatMap((user) =>
    [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      return {
        id: uid("mood"),
        userId: user.id,
        rating: 3 + ((offset + user.edad) % 3),
        date: date.toISOString(),
        improvementNote: offset === 0 ? "Quiero un rato juntas sin prisa." : null,
        createdAt: date.toISOString(),
      };
    }),
  );

  const userCharms = [];
  users.forEach((user) => {
    charms
      .filter((charm) => charm.type === user.role)
      .slice(0, 4)
      .forEach((charm, index) => {
        userCharms.push({
          id: uid("ucharm"),
          userId: user.id,
          charmId: charm.id,
          unlockedAt: nowIso(),
          isSelected: index === 0,
        });
      });
  });

  const suggestedActivities = users.flatMap((user) => seedSuggested(user.id, user.role));
  const achievements = seedAchievements();
  const userAchievements = users.map((user) => ({
    id: uid("uach"),
    userId: user.id,
    achievementId: "ach-connect",
    unlockedAt: nowIso(),
  }));

  const scheduledActivities = users.map((user, index) => ({
    id: uid("sch"),
    userId: user.id,
    partnerId: user.partnerId,
    title: index % 2 === 0 ? "Torre de la semana" : "Escucha de 3 turnos",
    description: "Actividad programada del taller Me We",
    scheduledDate: nowIso(),
    duration: 20,
    type: "lego_activity",
    status: "scheduled",
    emoji: "💜",
    reminderSent: false,
    createdAt: nowIso(),
  }));

  return {
    users,
    deactivatedEmails: [],
    tokens: {},
    adminTokens: {},
    moodEntries,
    charms,
    userCharms,
    suggestedActivities,
    scheduledActivities,
    activityTemplates: seedTemplates(),
    achievements,
    userAchievements,
    legoPieces: [
      { id: uid("lego"), userId: IDS.maria, partnerId: IDS.valentina, color: "#6366F1", description: "Primera torre juntas", earnedAt: nowIso() },
    ],
    files: [],
    conversations: [],
    workshopPersonalInfo: [],
    workshopResults: [],
    notificationSettings: [],
    botInteractions: [],
    objects: {},
    whatsappMessages: [],
    consents: users.map((user) => ({
      id: uid("consent"),
      userId: user.id,
      accepted: true,
      acceptedAt: nowIso(),
      version: "lopdp-2026",
      source: "seed",
    })),
  };
}

function ensureStoreShape(store) {
  const listKeys = [
    "users",
    "deactivatedEmails",
    "moodEntries",
    "charms",
    "userCharms",
    "suggestedActivities",
    "scheduledActivities",
    "activityTemplates",
    "achievements",
    "userAchievements",
    "legoPieces",
    "files",
    "conversations",
    "workshopPersonalInfo",
    "workshopResults",
    "notificationSettings",
    "botInteractions",
    "whatsappMessages",
    "consents",
  ];
  listKeys.forEach((key) => {
    if (!Array.isArray(store[key])) store[key] = [];
  });
  if (!store.tokens || typeof store.tokens !== "object") store.tokens = {};
  if (!store.adminTokens || typeof store.adminTokens !== "object") store.adminTokens = {};
  if (!store.objects || typeof store.objects !== "object") store.objects = {};
  return store;
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.users?.length) return ensureStoreShape(parsed);
    }
  } catch {
    // fall through to seed
  }
  const seeded = seedStore();
  saveStore(seeded);
  return seeded;
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  persistStoreToSupabase(store);
}

function persistStoreToSupabase(store) {
  try {
    const client = createSupabaseBrowserClient();
    if (!client) return;
    client.auth.getSession().then(({ data }) => {
      const userId = data?.session?.user?.id;
      if (!userId) return;
      const safeUsers = (store.users || []).map((user) => {
        const { password: _password, ...rest } = user;
        return rest;
      });
      client.from("mewe_replit_store").upsert({
        store_key: userId,
        payload: { ...store, users: safeUsers, tokens: {}, adminTokens: {} },
        updated_at: nowIso(),
      }).then(() => undefined, () => undefined);
    }).catch(() => undefined);
  } catch {
    // Optional production persist — localStorage remains the live store.
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(text, status = 200, contentType = "text/plain") {
  return new Response(text, { status, headers: { "Content-Type": contentType } });
}

function bearerUser(store, headers) {
  const auth = headers.get("Authorization") || headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : localStorage.getItem("userToken");
  if (!token) return null;
  const userId = store.tokens[token];
  if (!userId) return null;
  return store.users.find((user) => user.id === userId) || null;
}

function publicUser(user) {
  if (!user) return null;
  const { password: _password, ...rest } = user;
  return rest;
}

function pamelaReply(message, user) {
  const text = String(message || "").toLowerCase();
  const other = user?.role === "madre" ? "hija" : "mamá";
  if (text.includes("enoj") || text.includes("rabia") || text.includes("ira")) {
    return `Escucho enojo, y el enojo suele tapar una necesidad. Antes de aconsejar a tu ${other}, nombra la emoción en voz alta y luego pregunta: "¿qué necesitabas que yo viera?". Eso baja la alarma del cerebro y abre conversación.`;
  }
  if (text.includes("miedo") || text.includes("ansie") || text.includes("nerv")) {
    return `El miedo pide seguridad, no un discurso. Prueben Tiny Monsters: cada una construye el miedo con 6 piezas y le pone un nombre ridículo. Al nombrarlo, el monstruo deja de ser gigante.`;
  }
  if (text.includes("juego") || text.includes("lego") || text.includes("torre") || text.includes("actividad")) {
    return `Hoy les propongo Construcción de Torres: 15 minutos. Tú construyes "cómo me siento esta semana" y tu ${other} construye "cómo te percibo". Al final, solo una pregunta: ¿qué pieza no nos atrevimos a poner?`;
  }
  if (text.includes("no me escucha") || text.includes("no me entiende") || text.includes("pelea")) {
    return `Cuando sentimos que no nos escuchan, el cerebro busca ganar. Cambien la meta: 3 turnos de 90 segundos. Quien escucha solo parafrasea. Sin "ya, pero". Eso es Escucho para comprender, y es el músculo de la confianza.`;
  }
  return `Soy Pamela Gabela. Estoy aquí para fortalecer el vínculo con tu ${other}, no para dar recetas genéricas. Cuéntame qué pasó hoy en una frase, y armamos juntas una actividad corta (juego, cuerpo o conversación) que sí puedan terminar esta noche.`;
}

function match(path, pattern) {
  const pathParts = path.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

async function handleApi(method, url, init = {}) {
  const parsed = new URL(url, window.location.origin);
  const path = parsed.pathname;
  const store = loadStore();
  let body = {};
  if (init.body) {
    try {
      body = typeof init.body === "string" ? JSON.parse(init.body) : init.body;
    } catch {
      body = {};
    }
  }
  const headers = new Headers(init.headers || {});
  const user = bearerUser(store, headers);

  const route = (pattern) => match(path, pattern);

  if (method === "POST" && path === "/api/auth/login") {
    const found = store.users.find(
      (candidate) => candidate.email?.toLowerCase() === String(body.email || "").toLowerCase(),
    );
    if (!found || found.password !== body.password) {
      return jsonResponse({ message: "Credenciales incorrectas" }, 401);
    }
    if (found.isActive === false) {
      return jsonResponse({ message: "Su cuenta fue desuscrita. Debe crear una nueva cuenta con un correo diferente.", isDeactivated: true }, 403);
    }
    const token = uid("tok");
    store.tokens[token] = found.id;
    saveStore(store);
    return jsonResponse({ user: publicUser(found), token });
  }

  if (method === "POST" && path === "/api/auth/register") {
    if (body.requestUnsubscribe) {
      const existing = store.users.find((candidate) => candidate.email === body.email);
      if (existing) existing.isActive = false;
      store.deactivatedEmails.push(body.email);
      saveStore(store);
      return jsonResponse({ unsubscribed: true });
    }
    if (store.deactivatedEmails.includes(body.email)) {
      return jsonResponse({ message: "Este correo fue usado previamente en una cuenta desactivada. Debe usar un correo diferente.", isDeactivatedEmail: true }, 400);
    }
    if (store.users.some((candidate) => candidate.email === body.email)) {
      return jsonResponse({ message: "Este correo ya está registrado" }, 400);
    }
    const created = createUser({
      id: uid("user"),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role,
      edad: Number(body.edad) || 30,
    });
    created.password = body.password || DEMO_PASSWORD;
    if (body.acceptTerms !== false) {
      created.acceptedTermsAt = nowIso();
      store.consents.push({
        id: uid("consent"),
        userId: created.id,
        accepted: true,
        acceptedAt: nowIso(),
        version: "lopdp-2026",
        source: "register",
      });
    }
    store.users.push(created);
    store.suggestedActivities.push(...seedSuggested(created.id, created.role));
    const token = uid("tok");
    store.tokens[token] = created.id;
    saveStore(store);
    return jsonResponse({ user: publicUser(created), token });
  }

  if (method === "GET" && path === "/api/auth/me") {
    if (!user) return jsonResponse({ message: "No autenticada" }, 401);
    return jsonResponse({ user: publicUser(user) });
  }

  if (method === "POST" && path === "/api/logout") {
    const auth = headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : localStorage.getItem("userToken");
    if (token) delete store.tokens[token];
    saveStore(store);
    return jsonResponse({ ok: true });
  }

  if (method === "GET" && path === "/api/test-users") {
    return jsonResponse(store.users.map(publicUser));
  }

  if (method === "POST" && path === "/api/users") {
    const created = createUser({
      id: uid("user"),
      firstName: body.firstName || body.nombre || "Nueva",
      lastName: body.lastName || body.apellido || "Usuaria",
      email: body.email || `${uid("u")}@mewe.test`,
      role: body.role || "madre",
      edad: Number(body.edad) || 30,
    });
    store.users.push(created);
    saveStore(store);
    return jsonResponse(publicUser(created));
  }

  let params = route("/api/users/:id");
  if (params && method === "GET") {
    const found = store.users.find((candidate) => candidate.id === params.id);
    if (!found) return jsonResponse({ message: "Usuario no encontrado" }, 404);
    return jsonResponse(publicUser(found));
  }
  if (params && method === "PATCH") {
    const found = store.users.find((candidate) => candidate.id === params.id);
    if (!found) return jsonResponse({ message: "Usuario no encontrado" }, 404);
    Object.assign(found, body);
    if (body.firstName) found.nombre = body.firstName;
    if (body.lastName) found.apellido = body.lastName;
    if (body.nombre) found.firstName = body.nombre;
    if (body.apellido) found.lastName = body.apellido;
    saveStore(store);
    return jsonResponse(publicUser(found));
  }

  params = route("/api/users/:id/generate-connection-code");
  if (params && method === "POST") {
    const found = store.users.find((candidate) => candidate.id === params.id);
    if (!found) return jsonResponse({ message: "Usuario no encontrado" }, 404);
    found.connectionCode = `MEWE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    saveStore(store);
    return jsonResponse({ connectionCode: found.connectionCode, user: publicUser(found) });
  }

  params = route("/api/users/:id/connect-by-code");
  if (params && method === "POST") {
    const found = store.users.find((candidate) => candidate.id === params.id);
    const code = String(body.connectionCode || "").trim();
    const partner = store.users.find((candidate) => candidate.connectionCode === code && candidate.id !== found?.id);
    if (!found || !partner) return jsonResponse({ message: "Código inválido" }, 400);
    found.partnerId = partner.id;
    partner.partnerId = found.id;
    found.connectionCode = code;
    saveStore(store);
    return jsonResponse({ user: publicUser(found), partner: publicUser(partner) });
  }

  params = route("/api/users/:id/files");
  if (params && method === "GET") {
    return jsonResponse(store.files.filter((file) => file.userId === params.id));
  }
  if (params && method === "POST") {
    const file = {
      id: uid("file"),
      userId: params.id,
      fileName: body.fileName || body.name || "archivo",
      filePath: body.filePath || body.url || `/local/${uid("obj")}`,
      fileType: body.fileType || "document",
      contentType: body.contentType || "application/octet-stream",
      fileSize: body.fileSize || 0,
      activityId: body.activityId || body.metadata?.activityId || null,
      metadata: body.metadata || {},
      createdAt: nowIso(),
    };
    store.files.push(file);
    saveStore(store);
    return jsonResponse(file);
  }

  params = route("/api/users/:id/files/upload");
  if (params && method === "POST") {
    const file = {
      id: uid("file"),
      userId: params.id,
      fileName: body.fileName || body.name || "upload",
      filePath: `/local/${uid("obj")}`,
      fileType: body.fileType || "image",
      activityId: body.activityId || null,
      metadata: body.metadata || { activityId: body.activityId },
      createdAt: nowIso(),
    };
    store.files.push(file);
    saveStore(store);
    return jsonResponse({ uploadURL: `/api/objects/local-put/${file.id}`, file });
  }

  params = route("/api/users/:id/activities");
  if (params && method === "GET") {
    return jsonResponse([
      { id: "1", nombre: "Construcción de Torres", status: "available", type: "lego_tower" },
      { id: "2", nombre: "Tiny Monsters", status: "available", type: "tiny_monsters" },
      { id: "3", nombre: "Escucho para comprender", status: "available", type: "conversation" },
    ]);
  }

  params = route("/api/users/:id/achievements");
  if (params && method === "GET") {
    const unlocked = store.userAchievements
      .filter((item) => item.userId === params.id)
      .map((item) => ({
        ...item,
        achievement: store.achievements.find((achievement) => achievement.id === item.achievementId),
      }));
    return jsonResponse(unlocked);
  }

  params = route("/api/users/:id/lego-pieces");
  if (params && method === "GET") {
    return jsonResponse(store.legoPieces.filter((piece) => piece.userId === params.id));
  }

  params = route("/api/users/:id/charms");
  if (params && method === "GET") {
    return jsonResponse(store.userCharms.filter((item) => item.userId === params.id));
  }

  params = route("/api/users/:id/charms/:charmId/select");
  if (params && method === "POST") {
    store.userCharms
      .filter((item) => item.userId === params.id)
      .forEach((item) => {
        item.isSelected = item.charmId === params.charmId;
      });
    if (!store.userCharms.some((item) => item.userId === params.id && item.charmId === params.charmId)) {
      store.userCharms.push({
        id: uid("ucharm"),
        userId: params.id,
        charmId: params.charmId,
        unlockedAt: nowIso(),
        isSelected: true,
      });
    }
    saveStore(store);
    return jsonResponse({ ok: true });
  }

  params = route("/api/users/:id/charms/:charmId/unlock");
  if (params && method === "POST") {
    if (!store.userCharms.some((item) => item.userId === params.id && item.charmId === params.charmId)) {
      store.userCharms.push({
        id: uid("ucharm"),
        userId: params.id,
        charmId: params.charmId,
        unlockedAt: nowIso(),
        isSelected: false,
      });
    }
    saveStore(store);
    return jsonResponse({ ok: true, message: "Pieza desbloqueada para el demo" });
  }

  params = route("/api/users/:id/notification-settings");
  if (params && method === "GET") {
    const settings = store.notificationSettings.find((item) => item.userId === params.id) || {
      userId: params.id,
      whatsappNumber: "",
      frequency: "daily",
      preferredTime: "09:00",
      isActive: false,
    };
    return jsonResponse(settings);
  }
  if (params && (method === "POST" || method === "PUT" || method === "PATCH")) {
    const existing = store.notificationSettings.find((item) => item.userId === params.id);
    if (existing) Object.assign(existing, body);
    else store.notificationSettings.push({ id: uid("notif"), userId: params.id, ...body });
    saveStore(store);
    return jsonResponse(existing || store.notificationSettings.at(-1));
  }

  params = route("/api/users/:id/whatsapp-messages");
  if (params && method === "GET") {
    return jsonResponse(
      store.whatsappMessages.filter((item) => item.userId === params.id),
    );
  }

  params = route("/api/users/:id/consent");
  if (params && method === "GET") {
    const latest = [...store.consents].reverse().find((item) => item.userId === params.id);
    return jsonResponse(latest || { userId: params.id, accepted: false });
  }
  if (params && (method === "POST" || method === "PUT" || method === "PATCH")) {
    const record = {
      id: uid("consent"),
      userId: params.id,
      accepted: body.accepted !== false,
      acceptedAt: body.accepted === false ? null : nowIso(),
      revokedAt: body.accepted === false ? nowIso() : null,
      version: body.version || "lopdp-2026",
      source: body.source || "profile",
    };
    store.consents.push(record);
    const found = store.users.find((candidate) => candidate.id === params.id);
    if (found) {
      found.acceptedTermsAt = record.accepted ? record.acceptedAt : null;
    }
    saveStore(store);
    return jsonResponse(record);
  }

  params = route("/api/users/:id/send-motivational-message");
  if (params && method === "POST") {
    const found = store.users.find((candidate) => candidate.id === params.id);
    const settings = store.notificationSettings.find((item) => item.userId === params.id) || {};
    const number = body.whatsappNumber || settings.whatsappNumber || "";
    const messageType = body.messageType || "motivational";
    const preview = generateMotivationalMessage(messageType, found);
    const waMeUrl = buildWhatsAppLink(number, preview);
    const webhookOk = await deliverViaWebhook({
      userId: params.id,
      whatsappNumber: number,
      messageType,
      text: preview,
    });
    const deliveredVia = [];
    if (webhookOk) deliveredVia.push("webhook");
    if (waMeUrl) deliveredVia.push("wa.me");
    const record = {
      id: uid("wa"),
      userId: params.id,
      messageType,
      text: preview,
      whatsappNumber: number,
      waMeUrl,
      deliveredVia,
      createdAt: nowIso(),
    };
    store.whatsappMessages.push(record);
    saveStore(store);
    return jsonResponse({
      ok: true,
      message: webhookOk
        ? "Mensaje enviado por el canal de WhatsApp configurado."
        : "Mensaje listo para WhatsApp.",
      preview,
      waMeUrl,
      deliveredVia,
    });
  }

  params = route("/api/users/:id/generate-weekly-schedule");
  if (params && method === "POST") {
    const templates = store.activityTemplates;
    templates.forEach((template, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      store.scheduledActivities.push({
        id: uid("sch"),
        userId: params.id,
        title: template.title,
        description: template.description,
        scheduledDate: date.toISOString(),
        duration: template.defaultDuration,
        type: template.category,
        status: "scheduled",
        emoji: template.emoji,
        createdAt: nowIso(),
      });
    });
    saveStore(store);
    return jsonResponse({ ok: true, count: templates.length });
  }

  params = route("/api/users/:id/todays-activities");
  if (params && method === "GET") {
    const today = new Date().toISOString().slice(0, 10);
    return jsonResponse(
      store.scheduledActivities.filter(
        (item) => item.userId === params.id && String(item.scheduledDate).slice(0, 10) === today,
      ),
    );
  }

  if (method === "GET" && path === "/api/charms") {
    return jsonResponse(store.charms);
  }

  if (method === "POST" && path === "/api/mood-entries") {
    const entry = {
      id: uid("mood"),
      userId: body.userId || user?.id,
      rating: Number(body.rating) || 3,
      date: body.date || nowIso(),
      improvementNote: body.improvementNote || null,
      createdAt: nowIso(),
    };
    store.moodEntries.push(entry);
    if (!store.userAchievements.some((item) => item.userId === entry.userId && item.achievementId === "ach-mood")) {
      store.userAchievements.push({ id: uid("uach"), userId: entry.userId, achievementId: "ach-mood", unlockedAt: nowIso() });
    }
    saveStore(store);
    return jsonResponse(entry);
  }

  params = route("/api/mood-entries/:userId/generate-demo");
  if (params && method === "POST") {
    const extras = [1, 2, 3].map((offset) => ({
      id: uid("mood"),
      userId: params.userId,
      rating: 2 + (offset % 4),
      date: new Date(Date.now() - offset * 86400000).toISOString(),
      createdAt: nowIso(),
    }));
    store.moodEntries.push(...extras);
    saveStore(store);
    return jsonResponse(extras);
  }

  params = route("/api/mood-entries/:userId");
  if (params && method === "GET") {
    return jsonResponse(store.moodEntries.filter((entry) => entry.userId === params.userId));
  }
  if (method === "GET" && path === "/api/mood-entries") {
    const userId = parsed.searchParams.get("userId") || user?.id;
    return jsonResponse(store.moodEntries.filter((entry) => !userId || entry.userId === userId));
  }

  if (method === "GET" && path === "/api/suggested-activities") {
    const userId = parsed.searchParams.get("userId") || user?.id;
    return jsonResponse(store.suggestedActivities.filter((item) => !userId || item.userId === userId));
  }

  params = route("/api/suggested-activities/:userId/:mood");
  if (params && method === "GET") {
    return jsonResponse(store.suggestedActivities.filter((item) => item.userId === params.userId));
  }

  params = route("/api/suggested-activities/:userId");
  if (params && method === "GET") {
    const asUser = store.suggestedActivities.filter((item) => item.userId === params.userId);
    if (asUser.length) return jsonResponse(asUser);
    const asActivity = store.suggestedActivities.find((item) => item.id === params.userId);
    return jsonResponse(asActivity ? [asActivity] : []);
  }

  params = route("/api/suggested-activities/:activityId/mark-viewed");
  if (params && (method === "PUT" || method === "POST")) {
    const activity = store.suggestedActivities.find((item) => item.id === params.activityId);
    if (activity) activity.isNew = false;
    saveStore(store);
    return jsonResponse(activity || { ok: true });
  }

  if (method === "POST" && path === "/api/scheduled-activities") {
    const item = {
      id: uid("sch"),
      userId: body.userId || user?.id,
      partnerId: body.partnerId || null,
      title: body.title || "Actividad Me We",
      description: body.description || "",
      scheduledDate: body.scheduledDate || nowIso(),
      duration: Number(body.duration) || 20,
      type: body.type || "custom",
      status: body.status || "scheduled",
      emoji: body.emoji || "💜",
      reminderSent: false,
      createdAt: nowIso(),
    };
    store.scheduledActivities.push(item);
    saveStore(store);
    return jsonResponse(item);
  }

  params = route("/api/scheduled-activities/:id/snooze");
  if (params && method === "POST") {
    const item = store.scheduledActivities.find((candidate) => candidate.id === params.id);
    if (!item) return jsonResponse({ message: "No encontrada" }, 404);
    const minutes = Number(body.minutes) || 5;
    const next = new Date(Date.now() + minutes * 60 * 1000);
    item.scheduledDate = next.toISOString();
    item.snoozedUntil = next.toISOString();
    item.status = "scheduled";
    item.reminderSent = false;
    saveStore(store);
    return jsonResponse(item);
  }

  params = route("/api/scheduled-activities/:userId/:start/:end");
  if (params && method === "GET") {
    return jsonResponse(
      store.scheduledActivities.filter((item) => {
        if (item.userId !== params.userId) return false;
        const day = String(item.scheduledDate).slice(0, 10);
        if (params.start && day < params.start) return false;
        if (params.end && day > params.end) return false;
        return true;
      }),
    );
  }

  params = route("/api/scheduled-activities/:id");
  if (params && method === "GET") {
    const startDate = parsed.searchParams.get("startDate");
    const endDate = parsed.searchParams.get("endDate");
    const byUser = store.scheduledActivities.filter((item) => item.userId === params.id);
    if (byUser.length || startDate || endDate) {
      return jsonResponse(
        byUser.filter((item) => {
          const day = String(item.scheduledDate).slice(0, 10);
          if (startDate && day < startDate) return false;
          if (endDate && day > endDate) return false;
          return true;
        }),
      );
    }
    const one = store.scheduledActivities.find((item) => item.id === params.id);
    return jsonResponse(one || []);
  }
  if (params && method === "PATCH") {
    const item = store.scheduledActivities.find((candidate) => candidate.id === params.id);
    if (!item) return jsonResponse({ message: "No encontrada" }, 404);
    Object.assign(item, body);
    if (body.status === "completed") item.completedAt = body.completedAt || nowIso();
    if (body.status === "confirmed") item.reminderSent = true;
    saveStore(store);
    return jsonResponse(item);
  }

  if (method === "GET" && path.startsWith("/api/scheduled-activities/")) {
    return jsonResponse(store.scheduledActivities.filter((item) => path.includes(item.userId)));
  }

  if (method === "GET" && path === "/api/activity-templates") {
    return jsonResponse(store.activityTemplates);
  }

  if (method === "POST" && path === "/api/schedule-from-template") {
    const template = store.activityTemplates.find((item) => item.id === body.templateId) || store.activityTemplates[0];
    const item = {
      id: uid("sch"),
      userId: body.userId || user?.id,
      title: template.title,
      description: template.description,
      scheduledDate: body.scheduledDate || nowIso(),
      duration: template.defaultDuration,
      type: template.category,
      status: "scheduled",
      emoji: template.emoji,
      createdAt: nowIso(),
    };
    store.scheduledActivities.push(item);
    saveStore(store);
    return jsonResponse(item);
  }

  params = route("/api/conversation/:userId/:sessionId");
  if (params && method === "GET") {
    return jsonResponse(
      store.conversations.filter(
        (item) => item.userId === params.userId && item.sessionId === params.sessionId,
      ),
    );
  }

  if (method === "POST" && (path === "/api/bot/conversation" || path === "/api/bot/enhanced-response" || path === "/api/mewe")) {
    const message = body.message || body.question || "";
    const reply = pamelaReply(message, user);
    const sessionId = body.sessionId || "default";
    const record = {
      id: uid("conv"),
      userId: body.userId || user?.id || IDS.maria,
      message,
      sender: "user",
      sessionId,
      createdAt: nowIso(),
    };
    const botRecord = {
      id: uid("conv"),
      userId: record.userId,
      message: reply,
      sender: "bot",
      sessionId,
      createdAt: nowIso(),
    };
    store.conversations.push(record, botRecord);
    store.botInteractions.push({
      id: uid("bot"),
      userId: record.userId,
      question: message,
      response: reply,
      type: "general_chat",
      createdAt: nowIso(),
    });
    if (!store.userAchievements.some((item) => item.userId === record.userId && item.achievementId === "ach-chat")) {
      store.userAchievements.push({ id: uid("uach"), userId: record.userId, achievementId: "ach-chat", unlockedAt: nowIso() });
    }
    saveStore(store);
    return jsonResponse({
      message: reply,
      response: reply,
      metadata: { model: "mewe-local-pamela", timestamp: nowIso() },
      fallback: true,
    });
  }

  if (method === "GET" && path === "/api/mewe/suggestions") {
    return jsonResponse({
      suggestions: [
        "Hoy nos enojamos y no sabemos cómo volver",
        "Quiero una actividad corta de LEGO",
        "¿Cómo escucho sin aconsejar?",
        "Necesito un ritual de 10 minutos",
      ],
    });
  }

  if (method === "GET" && path === "/api/mewe/daily-activity") {
    return jsonResponse({
      activity: {
        title: "Torre de la semana",
        description: "Construyan en 15 minutos cómo se sintieron hoy. Una pregunta al final: ¿qué pieza faltó?",
        duration: "15 min",
        benefit: "El juego simbólico baja la defensividad y abre conversación.",
      },
    });
  }

  if (method === "POST" && path === "/api/workshop/personal-info/verify") {
    const ok = String(body.accessCode || "") === "MEWE-TALLER";
    return jsonResponse({ valid: ok }, ok ? 200 : 401);
  }

  if (method === "POST" && path === "/api/workshop/personal-info") {
    const info = { id: uid("wpi"), ...body, createdAt: nowIso() };
    store.workshopPersonalInfo.push(info);
    saveStore(store);
    return jsonResponse(info);
  }

  if (method === "POST" && path === "/api/objects/upload") {
    const objectId = uid("obj");
    store.objects[objectId] = { id: objectId, createdAt: nowIso() };
    saveStore(store);
    return jsonResponse({ uploadURL: `/api/objects/local-put/${objectId}`, objectId });
  }

  params = route("/api/objects/local-put/:id");
  if (params && (method === "PUT" || method === "POST")) {
    store.objects[params.id] = { id: params.id, uploaded: true, createdAt: nowIso() };
    saveStore(store);
    return jsonResponse({ ok: true, url: `/api/objects/${params.id}` });
  }

  if (method === "POST" && path === "/api/objects/acl") {
    return jsonResponse({ ok: true });
  }

  if (method === "GET" && path === "/api/demo/connections") {
    return jsonResponse([
      { mother: publicUser(store.users[0]), daughter: publicUser(store.users[1]), code: "MEWE-PAEZ" },
      { mother: publicUser(store.users[2]), daughter: publicUser(store.users[3]), code: "MEWE-TORRES" },
    ]);
  }

  if (method === "GET" && path === "/api/demo/users") {
    return jsonResponse(store.users.map(publicUser));
  }

  if (method === "POST" && path === "/api/demo/seed") {
    const seeded = seedStore();
    saveStore(seeded);
    return jsonResponse({ ok: true, users: seeded.users.length });
  }

  if (method === "DELETE" && path === "/api/demo/clean") {
    const seeded = seedStore();
    seeded.moodEntries = [];
    seeded.scheduledActivities = [];
    saveStore(seeded);
    return jsonResponse({ ok: true });
  }

  if (method === "POST" && path === "/api/admin/login") {
    const adminPass = import.meta.env.VITE_MEWE_LOCAL_ADMIN_PASS || "MeWeAdmin2026!";
    const emailOk = String(body.email || "").includes("@");
    const passOk = body.password === adminPass || body.password === DEMO_PASSWORD;
    if (!emailOk || !passOk) return jsonResponse({ message: "Credenciales incorrectas" }, 401);
    const token = uid("adm");
    store.adminTokens[token] = body.email;
    saveStore(store);
    return jsonResponse({ token, admin: { email: body.email, nombre: "Facilitadora" } });
  }

  if (path.startsWith("/api/admin/")) {
    if (method === "GET" && path === "/api/admin/users") return jsonResponse(store.users.map(publicUser));
    if (method === "GET" && path === "/api/admin/mood-entries") return jsonResponse(store.moodEntries);
    if (method === "GET" && path === "/api/admin/bot-interactions") return jsonResponse(store.botInteractions);
    if (method === "GET" && path === "/api/admin/user-activities") return jsonResponse(store.scheduledActivities);
    if (method === "GET" && path === "/api/admin/workshop/results") return jsonResponse(store.workshopResults);
    if (method === "POST" && path === "/api/admin/workshop/results") {
      const result = { id: uid("wr"), ...body, createdAt: nowIso() };
      store.workshopResults.push(result);
      saveStore(store);
      return jsonResponse(result);
    }
    params = route("/api/admin/workshop/results/:id");
    if (params && method === "DELETE") {
      store.workshopResults = store.workshopResults.filter((item) => item.id !== params.id);
      saveStore(store);
      return jsonResponse({ ok: true });
    }
    if (params && (method === "PUT" || method === "PATCH")) {
      const result = store.workshopResults.find((item) => item.id === params.id);
      if (result) Object.assign(result, body);
      saveStore(store);
      return jsonResponse(result || { ok: true });
    }
  }

  return jsonResponse({ message: `Local API: no handler for ${method} ${path}` }, 404);
}

export function installLocalApi() {
  if (typeof window === "undefined" || window.__meweLocalApiInstalled) return;
  window.__meweLocalApiInstalled = true;
  loadStore();
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    if (!url) return nativeFetch(input, init);
    const parsed = new URL(url, window.location.origin);
    if (parsed.pathname.startsWith("/api/")) {
      try {
        return await handleApi((init.method || input?.method || "GET").toUpperCase(), parsed.href, init);
      } catch (error) {
        return jsonResponse({ message: error.message || "Error local API" }, 500);
      }
    }
    return nativeFetch(input, init);
  };
}

export { loadStore, saveStore, seedStore, STORE_KEY, generateMotivationalMessage, buildWhatsAppLink };
