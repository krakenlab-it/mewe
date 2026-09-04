export const DASHBOARD_SECTIONS = {
  INICIO: "inicio",
  ANIMO: "animo",
  CONEXION: "conexion",
  ACTIVIDADES: "actividades",
  CALENDARIO: "calendario",
  PIEZAS: "piezas",
  ASISTENTE: "asistente",
  AJUSTES: "ajustes",
};

export const NAV_ITEMS = [
  { id: DASHBOARD_SECTIONS.INICIO, label: "Inicio", icon: "🏠" },
  { id: DASHBOARD_SECTIONS.ANIMO, label: "Estado de ánimo", icon: "💜" },
  { id: DASHBOARD_SECTIONS.CONEXION, label: "Conexión", icon: "🔗" },
  { id: DASHBOARD_SECTIONS.ACTIVIDADES, label: "Actividades", icon: "🎨" },
  { id: DASHBOARD_SECTIONS.CALENDARIO, label: "Calendario", icon: "📅" },
  { id: DASHBOARD_SECTIONS.PIEZAS, label: "Piezas & Logros", icon: "⭐" },
  { id: DASHBOARD_SECTIONS.ASISTENTE, label: "Asistente", icon: "💬" },
  { id: DASHBOARD_SECTIONS.AJUSTES, label: "Ajustes", icon: "⚙️" },
];

export const MOOD_OPTIONS = [
  { value: 5, emoji: "😊", label: "Muy bien" },
  { value: 4, emoji: "🙂", label: "Bien" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 2, emoji: "😔", label: "Triste" },
  { value: 1, emoji: "😢", label: "Muy triste" },
];

export const MOOD_CHART_BANDS = [
  { min: 5, color: "#5BB5A8", label: "Muy bien" },
  { min: 4, color: "#7EC8E3", label: "Bien" },
  { min: 3, color: "#F5D76E", label: "Neutral" },
  { min: 2, color: "#F5A962", label: "Triste" },
  { min: 1, color: "#E88B8B", label: "Muy triste" },
];

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const WHATSAPP_FREQUENCIES = [
  { value: "daily", label: "Una vez al día" },
  { value: "twice_daily", label: "Dos veces al día" },
  { value: "weekly", label: "Una vez a la semana" },
];

export const WHATSAPP_TIMES = [
  "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00",
];

export const WHATSAPP_MESSAGE_TYPES = [
  { value: "motivacional", label: "🌟 Motivacional" },
  { value: "conexion", label: "💜 Conexión" },
  { value: "actividad", label: "🎨 Actividad" },
];

export const CONNECTION_LEVELS = [
  { level: 1, label: "Inicio", progress: 15 },
  { level: 2, label: "Descubrimiento", progress: 35 },
  { level: 3, label: "Crecimiento", progress: 60 },
  { level: 4, label: "Fortaleza", progress: 85 },
  { level: 5, label: "Juntas Fuertes", progress: 100 },
];
