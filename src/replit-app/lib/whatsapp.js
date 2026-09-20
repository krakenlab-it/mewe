const MESSAGE_TEMPLATES = {
  motivational: (name, other) =>
    `🌟 Hola ${name}, hoy 10 minutos con tu ${other} valen más que una conversación perfecta mañana. Me We te acompaña.`,
  reflective: (name, other) =>
    `🤔 ${name}, ¿qué emoción no nombraste hoy con tu ${other}? Escríbanla juntas esta noche.`,
  bonding: (name, other) =>
    `💖 ${name}, idea Me We: 15 minutos, sin celular, una pregunta cada una. Tú y tu ${other} merecen ese rato.`,
  encouragement: (name, other) =>
    `💪 ${name}, no tienes que hacerlo perfecto. Un gesto pequeño con tu ${other} ya repara el vínculo.`,
};

export function partnerLabel(role) {
  return role === "madre" ? "hija" : "mamá";
}

export function generateMotivationalMessage(messageType, user) {
  const name = user?.nombre || user?.firstName || "tú";
  const other = partnerLabel(user?.role);
  const builder = MESSAGE_TEMPLATES[messageType] || MESSAGE_TEMPLATES.motivational;
  return builder(name, other);
}

export function normalizeWhatsAppNumber(raw) {
  return String(raw || "").replace(/\D/g, "");
}

export function buildWhatsAppLink(number, text) {
  const digits = normalizeWhatsAppNumber(number);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppWebhookUrl() {
  try {
    return import.meta.env.VITE_MEWE_WHATSAPP_WEBHOOK_URL || "";
  } catch {
    return "";
  }
}

export async function deliverViaWebhook(payload) {
  const webhookUrl = getWhatsAppWebhookUrl();
  if (!webhookUrl) return false;
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, source: "mewe" }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
