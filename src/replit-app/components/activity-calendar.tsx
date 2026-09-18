import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Check, X, Plus, Heart } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { ScheduledActivity } from "@shared/schema";
import ActivityNotification from "./activity-notification";

interface ActivityCalendarProps {
  userId: string;
  userRole?: string;
}

interface NewActivityForm {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  emoji: string;
  sound: string;
  reminder5min: boolean;
  reminder15min: boolean;
}

export default function ActivityCalendar({ userId, userRole }: ActivityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<ScheduledActivity | null>(null);
  const [notifiedActivities, setNotifiedActivities] = useState<Set<string>>(new Set());
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<ScheduledActivity | null>(null);
  const [newActivity, setNewActivity] = useState<NewActivityForm>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "19:00",
    duration: 20,
    emoji: "😊",
    sound: "default",
    reminder5min: false,
    reminder15min: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current week's activities
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const endDate = addDays(startDate, 6);

  const { data: activities = [], isLoading, refetch } = useQuery<ScheduledActivity[]>({
    queryKey: ["/api/scheduled-activities", userId, format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const url = `/api/scheduled-activities/${userId}?startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(endDate, "yyyy-MM-dd")}`;
      console.log("🔍 Fetching activities from:", url);
      console.log("🔍 User ID:", userId);
      console.log("🔍 Date range:", format(startDate, "yyyy-MM-dd"), "to", format(endDate, "yyyy-MM-dd"));
      
      const response = await fetch(url);
      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log("🔍 Received activities:", data);
      return data;
    },
    enabled: !!userId,
    staleTime: 0, // Siempre refrescar
    gcTime: 0, // No cachear
  });

  // Debug: Log activities data
  useEffect(() => {
    console.log("📅 Activities data:", activities);
    console.log("📅 Week range:", format(startDate, "yyyy-MM-dd"), "to", format(endDate, "yyyy-MM-dd"));
    console.log("📅 Selected date:", format(selectedDate, "yyyy-MM-dd"));
  }, [activities, startDate, endDate, selectedDate]);

  // Sistema de notificaciones - verificar actividades que deben sonar
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const upcomingActivity = activities.find((activity: ScheduledActivity) => {
        const activityTime = new Date(activity.scheduledDate);
        const timeDiff = activityTime.getTime() - now.getTime();
        // Notificar 5 minutos antes y en el momento exacto
        // Y solo si no ha sido notificada antes
        return timeDiff <= 5 * 60 * 1000 && 
               timeDiff >= -1 * 60 * 1000 && 
               activity.status === "scheduled" &&
               !notifiedActivities.has(activity.id);
      });

      if (upcomingActivity && !currentNotification) {
        setCurrentNotification(upcomingActivity);
        // Marcar como notificada
        setNotifiedActivities(prev => new Set(prev).add(upcomingActivity.id));
      }
    };

    // Verificar cada minuto
    const interval = setInterval(checkNotifications, 60000);
    checkNotifications(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [activities, currentNotification, notifiedActivities]);

  // Mutations
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const response = await apiRequest("POST", "/api/scheduled-activities", activityData);
      return response.json();
    },
    onSuccess: () => {
      // Navegar a la semana donde se programó la actividad
      const activityDate = new Date(`${newActivity.date}T${newActivity.time}`);
      setSelectedDate(activityDate);
      
      // Invalidar todas las queries de actividades para este usuario
      queryClient.invalidateQueries({ 
        queryKey: ["/api/scheduled-activities", userId],
        exact: false 
      });
      
      setShowNewActivityDialog(false);
      setNewActivity({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "19:00",
        duration: 20,
        emoji: "😊",
        sound: "default",
        reminder5min: false,
        reminder15min: false
      });
      toast({
        title: "✓ Actividad programada",
        description: "La actividad ha sido agregada a tu calendario.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo programar la actividad.",
        variant: "destructive",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/scheduled-activities/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      // Invalidar todas las queries de actividades para este usuario
      queryClient.invalidateQueries({ 
        queryKey: ["/api/scheduled-activities", userId],
        exact: false 
      });
    },
  });

  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/activity-templates"],
    enabled: showActivityMenu,
  });

  // Mother-specific activities (100 activities)
  const motherActivities = [
    // Primera parte - Actividades 1-50
    { id: "m1", title: "Tiempo Presente", description: "Apagar teléfonos y cocinar un postre juntas mientras conversan", emoji: "🍰", category: "bonding", duration: 60 },
    { id: "m2", title: "Escucha sin Juicio", description: "Hacer el 'espacio del corazón': 10 minutos para que la hija hable y mamá escuche", emoji: "👂", category: "communication", duration: 10 },
    { id: "m3", title: "Guía con Corazón", description: "Escribir juntas una carta a su 'yo del futuro'", emoji: "✉️", category: "creativity", duration: 30 },
    { id: "m4", title: "Dejo el Miedo", description: "Contar una historia de miedo propio y cómo lo enfrentó (madre)", emoji: "💪", category: "communication", duration: 20 },
    { id: "m5", title: "Pongo Límites con Amor", description: "Crear juntas una lista de reglas justas con emojis y colores", emoji: "📝", category: "bonding", duration: 30 },
    { id: "m6", title: "Suelto el Control", description: "Dejar que la hija escoja el plan del día y la madre lo siga con apertura", emoji: "🎯", category: "entertainment", duration: 120 },
    { id: "m7", title: "Me Abro a Aprender", description: "Hacer un tutorial de TikTok enseñado por la hija", emoji: "📱", category: "entertainment", duration: 30 },
    { id: "m8", title: "Valido sus Emociones", description: "Dibujar emociones en hojas y pegarlas en un 'muro de sentimientos'", emoji: "🎨", category: "creativity", duration: 40 },
    { id: "m9", title: "Respeto sus Ritmos", description: "Organizar un día lento sin agenda, solo fluyendo según lo que la hija quiera", emoji: "🌊", category: "bonding", duration: 180 },
    { id: "m10", title: "Me Siento sin Culpa", description: "Escribir juntas una lista de 'cosas que hicimos bien hoy'", emoji: "✨", category: "communication", duration: 15 },
    { id: "m11", title: "Miro con Compasión", description: "Ver juntas una película y luego hablar sobre los personajes sin juzgar", emoji: "🎬", category: "entertainment", duration: 150 },
    { id: "m12", title: "Perdono y Sano", description: "Lanzar globos al cielo con frases de perdón y liberación", emoji: "🎈", category: "bonding", duration: 30 },
    { id: "m13", title: "Agradezco su Confianza", description: "Crear un 'frasco de confianza' y llenarlo con papelitos cada vez que se abren", emoji: "🏺", category: "creativity", duration: 20 },
    { id: "m14", title: "Juego con Ella", description: "Jugar a las escondidas, saltar la cuerda o hacer karaoke", emoji: "🎤", category: "entertainment", duration: 45 },
    { id: "m15", title: "Suelto la Perfección", description: "Hacer manualidades sin preocuparse por el resultado, solo por divertirse", emoji: "✂️", category: "creativity", duration: 60 },
    { id: "m16", title: "Me Muestro Humana", description: "Contarle a su hija una historia donde cometió un error de niña", emoji: "💭", category: "communication", duration: 20 },
    { id: "m17", title: "Confío en su Camino", description: "Escribir una carta con deseos para el futuro de su hija, sin imponer", emoji: "🌟", category: "bonding", duration: 30 },
    { id: "m18", title: "Somos Team", description: "Hacer camisetas personalizadas de 'Team Mami-Hija'", emoji: "👕", category: "creativity", duration: 90 },
    { id: "m19", title: "Día de las travesuras", description: "Cocinar cosas locas juntas (pizza con gomitas, por ejemplo)", emoji: "🍕", category: "food", duration: 60 },
    { id: "m20", title: "Ritual de domingos", description: "Tomar chocolate caliente y hablar sobre la semana que empieza", emoji: "☕", category: "food", duration: 30 },
    { id: "m21", title: "Elige mi ropa", description: "La hija viste a la madre con su estilo por un día", emoji: "👗", category: "entertainment", duration: 30 },
    { id: "m22", title: "Spa casero", description: "Mascarillas, uñas, música y confidencias", emoji: "💅", category: "bonding", duration: 90 },
    { id: "m23", title: "Nuestra canción", description: "Componer una canción o elegir una que las represente y bailarla", emoji: "🎵", category: "creativity", duration: 45 },
    { id: "m24", title: "Diario compartido", description: "Dejarse notas secretas en un cuaderno común", emoji: "📓", category: "communication", duration: 15 },
    { id: "m25", title: "Galería de selfies locas", description: "Tomar las fotos más locas y hacer un collage", emoji: "📸", category: "entertainment", duration: 30 },
    { id: "m26", title: "Noche de cuentos", description: "Leer juntas cuentos y crear finales alternativos", emoji: "📚", category: "creativity", duration: 45 },
    { id: "m27", title: "Caza de tesoro en casa", description: "Hacer pistas con mensajes bonitos para encontrar regalitos o dibujos", emoji: "🗺️", category: "entertainment", duration: 60 },
    { id: "m28", title: "Pintura en piedras", description: "Decorar piedras con palabras importantes para ambas", emoji: "🪨", category: "creativity", duration: 45 },
    { id: "m29", title: "Muro de sueños", description: "Hacer un mural con recortes de sueños y metas de ambas", emoji: "🌈", category: "bonding", duration: 60 },
    { id: "m30", title: "Juego de roles", description: "Intercambiar papeles: la hija hace de mamá y la mamá de hija por 1 hora", emoji: "🎭", category: "entertainment", duration: 60 },
    { id: "m31", title: "Cocinar recetas ancestrales", description: "Preparar un plato que comía la madre con su madre", emoji: "🍲", category: "food", duration: 90 },
    { id: "m32", title: "Álbum del alma", description: "Crear un álbum con fotos + frases que digan 'te admiro porque…'", emoji: "📷", category: "creativity", duration: 60 },
    { id: "m33", title: "Kit de primeros auxilios emocionales", description: "Armar juntas una cajita con frases, snacks y objetos que calmen", emoji: "🏥", category: "bonding", duration: 45 },
    { id: "m34", title: "Playlist emocional", description: "Crear juntas una lista de canciones que usan según su estado de ánimo", emoji: "🎶", category: "entertainment", duration: 30 },
    { id: "m35", title: "Bolsa de abrazos", description: "Una bolsita con papelitos de 'abrázame cuando...'", emoji: "🤗", category: "bonding", duration: 20 },
    { id: "m36", title: "Desfile de disfraces casero", description: "Inventar un show de pasarela con ropa vieja y pelucas", emoji: "👠", category: "entertainment", duration: 45 },
    { id: "m37", title: "Experimento loco de cocina", description: "Crear una receta con ingredientes al azar", emoji: "🧪", category: "food", duration: 60 },
    { id: "m38", title: "Fotohistorias", description: "Tomar fotos por la casa que cuenten una historia inventada", emoji: "📱", category: "creativity", duration: 40 },
    { id: "m39", title: "Paseo sin rumbo", description: "Salir a caminar sin un destino, solo a conversar", emoji: "🚶", category: "sports", duration: 60 },
    { id: "m40", title: "Habla con mi yo niña", description: "Mamá escribe carta a su yo niña y la lee en voz alta", emoji: "💌", category: "communication", duration: 30 },
    { id: "m41", title: "El poder de mi abrazo", description: "Juego de abrazos con distintos estilos: fuerte, de oso, suave, de calma", emoji: "🫂", category: "bonding", duration: 15 },
    { id: "m42", title: "Mi hija me enseña", description: "La hija le enseña algo que sabe hacer (editar un video, hacer slime, etc.)", emoji: "👩‍🏫", category: "creativity", duration: 45 },
    { id: "m43", title: "Charla bajo estrellas", description: "Salir al balcón o patio a hablar mirando el cielo", emoji: "⭐", category: "communication", duration: 30 },
    { id: "m44", title: "Baile sorpresa", description: "Inventar una coreografía secreta madre e hija", emoji: "💃", category: "entertainment", duration: 45 },
    { id: "m45", title: "Juego del silencio", description: "Estar en silencio juntas 2 minutos, luego expresar cómo se sintieron", emoji: "🤫", category: "communication", duration: 10 },
    { id: "m46", title: "Misión secreta", description: "Hacer un acto de bondad juntas para alguien sin decirle", emoji: "🤝", category: "bonding", duration: 30 },
    { id: "m47", title: "Lista de lo que sí puedo", description: "Crear lista de lo que sí pueden lograr juntas este mes", emoji: "✅", category: "bonding", duration: 20 },
    { id: "m48", title: "Teatro de emociones", description: "Actuar emociones y adivinarlas", emoji: "😊", category: "entertainment", duration: 30 },
    { id: "m49", title: "Juego de 'yo soy valiente cuando...'", description: "Escriben y comparten momentos valientes", emoji: "🦁", category: "communication", duration: 25 },
    { id: "m50", title: "Día libre de críticas", description: "Jugar a pasar todo un día sin criticarse ni corregirse", emoji: "🕊️", category: "bonding", duration: 480 },
    
    // Segunda parte - Actividades 51-100
    { id: "m51", title: "Mapa del tesoro familiar", description: "Crear un mapa con los lugares especiales de la familia", emoji: "🗺️", category: "creativity", duration: 45 },
    { id: "m52", title: "Tarde de burbujas", description: "Hacer burbujas gigantes y crear historias con ellas", emoji: "🫧", category: "entertainment", duration: 30 },
    { id: "m53", title: "Cocina con los ojos vendados", description: "Una guía y la otra cocina con los ojos vendados", emoji: "👀", category: "food", duration: 45 },
    { id: "m54", title: "Jardín de gratitud", description: "Plantar algo juntas y cuidarlo como símbolo de su relación", emoji: "🌱", category: "bonding", duration: 30 },
    { id: "m55", title: "Olimpiadas caseras", description: "Crear competencias divertidas en casa", emoji: "🏆", category: "sports", duration: 60 },
    { id: "m56", title: "Cápsula del tiempo", description: "Guardar objetos y cartas para abrir en el futuro", emoji: "⏰", category: "bonding", duration: 45 },
    { id: "m57", title: "Yoga en pareja", description: "Hacer posturas de yoga juntas", emoji: "🧘", category: "sports", duration: 30 },
    { id: "m58", title: "Picnic en la sala", description: "Hacer un picnic dentro de casa con mantas y cojines", emoji: "🧺", category: "food", duration: 45 },
    { id: "m59", title: "Construcción con cartón", description: "Crear un fuerte o castillo con cajas de cartón", emoji: "📦", category: "creativity", duration: 90 },
    { id: "m60", title: "Tarde de origami", description: "Aprender a hacer figuras de papel juntas", emoji: "🦢", category: "creativity", duration: 45 },
    { id: "m61", title: "Búsqueda del arcoíris", description: "Buscar objetos de cada color del arcoíris en casa", emoji: "🌈", category: "entertainment", duration: 30 },
    { id: "m62", title: "Masaje de manos", description: "Darse masajes en las manos mientras conversan", emoji: "🤲", category: "bonding", duration: 20 },
    { id: "m63", title: "Crear un himno familiar", description: "Componer una canción que represente a la familia", emoji: "🎼", category: "creativity", duration: 40 },
    { id: "m64", title: "Tarde de trabalenguas", description: "Competir con trabalenguas y reírse de los errores", emoji: "👅", category: "entertainment", duration: 20 },
    { id: "m65", title: "Collage de valores", description: "Hacer un collage con los valores importantes para ambas", emoji: "💝", category: "bonding", duration: 45 },
    { id: "m66", title: "Tarde de magia", description: "Aprender trucos de magia sencillos y presentarlos", emoji: "🎩", category: "entertainment", duration: 60 },
    { id: "m67", title: "Intercambio de peinados", description: "Peinarse mutuamente con estilos creativos", emoji: "💇", category: "bonding", duration: 30 },
    { id: "m68", title: "Museo de recuerdos", description: "Crear un pequeño museo con objetos especiales", emoji: "🏛️", category: "creativity", duration: 60 },
    { id: "m69", title: "Sesión de chistes", description: "Contarse chistes y crear nuevos juntas", emoji: "😂", category: "entertainment", duration: 20 },
    { id: "m70", title: "Tarde de plastilina", description: "Modelar figuras y crear historias con ellas", emoji: "🎨", category: "creativity", duration: 45 },
    { id: "m71", title: "Carrera de obstáculos", description: "Crear una carrera de obstáculos en casa", emoji: "🏃", category: "sports", duration: 45 },
    { id: "m72", title: "Álbum de texturas", description: "Crear un álbum con diferentes texturas para tocar", emoji: "✋", category: "creativity", duration: 40 },
    { id: "m73", title: "Tarde de adivinanzas", description: "Crear y resolver adivinanzas juntas", emoji: "❓", category: "entertainment", duration: 30 },
    { id: "m74", title: "Pintura con los pies", description: "Pintar un cuadro usando los pies", emoji: "🦶", category: "creativity", duration: 45 },
    { id: "m75", title: "Construir un refugio", description: "Hacer un refugio con mantas y almohadas", emoji: "🏕️", category: "entertainment", duration: 30 },
    { id: "m76", title: "Tarde de mímica", description: "Jugar a las mímicas con temas divertidos", emoji: "🤐", category: "entertainment", duration: 30 },
    { id: "m77", title: "Crear joyas caseras", description: "Hacer pulseras o collares juntas", emoji: "💍", category: "creativity", duration: 60 },
    { id: "m78", title: "Sesión de karate imaginario", description: "Practicar movimientos de karate juntas", emoji: "🥋", category: "sports", duration: 30 },
    { id: "m79", title: "Tarde de títeres", description: "Hacer títeres con calcetines y crear un show", emoji: "🧦", category: "entertainment", duration: 60 },
    { id: "m80", title: "Exploración sensorial", description: "Jugar con diferentes texturas, olores y sonidos", emoji: "👃", category: "bonding", duration: 30 },
    { id: "m81", title: "Crear un código secreto", description: "Inventar un lenguaje o código solo para ustedes", emoji: "🔐", category: "communication", duration: 30 },
    { id: "m82", title: "Tarde de globos", description: "Jugar diferentes juegos con globos", emoji: "🎈", category: "entertainment", duration: 30 },
    { id: "m83", title: "Sesión de estiramientos", description: "Hacer estiramientos juntas mientras conversan", emoji: "🤸", category: "sports", duration: 20 },
    { id: "m84", title: "Crear un libro de chistes", description: "Escribir e ilustrar un libro de chistes propios", emoji: "📖", category: "creativity", duration: 45 },
    { id: "m85", title: "Tarde de sombras chinescas", description: "Crear historias con sombras en la pared", emoji: "👤", category: "entertainment", duration: 30 },
    { id: "m86", title: "Hacer helados caseros", description: "Experimentar con sabores de helados", emoji: "🍦", category: "food", duration: 60 },
    { id: "m87", title: "Sesión de beatbox", description: "Aprender a hacer sonidos de beatbox juntas", emoji: "🎤", category: "entertainment", duration: 30 },
    { id: "m88", title: "Crear un herbario", description: "Recolectar y prensar hojas y flores", emoji: "🍃", category: "creativity", duration: 45 },
    { id: "m89", title: "Tarde de equilibrio", description: "Practicar equilibrio con diferentes objetos", emoji: "⚖️", category: "sports", duration: 25 },
    { id: "m90", title: "Sesión de beatles", description: "Escuchar y bailar música de diferentes épocas", emoji: "🎸", category: "entertainment", duration: 45 },
    { id: "m91", title: "Crear instrumentos musicales", description: "Hacer instrumentos con materiales reciclados", emoji: "🥁", category: "creativity", duration: 60 },
    { id: "m92", title: "Tarde de relajación", description: "Hacer ejercicios de respiración y relajación", emoji: "😌", category: "bonding", duration: 30 },
    { id: "m93", title: "Sesión de malabares", description: "Aprender malabares con pelotas o pañuelos", emoji: "🤹", category: "sports", duration: 30 },
    { id: "m94", title: "Crear un periódico familiar", description: "Escribir noticias divertidas de la familia", emoji: "📰", category: "creativity", duration: 45 },
    { id: "m95", title: "Tarde de experimentos", description: "Hacer experimentos científicos sencillos", emoji: "🔬", category: "creativity", duration: 60 },
    { id: "m96", title: "Sesión de baile libre", description: "Bailar sin coreografía, solo sintiendo la música", emoji: "💃", category: "entertainment", duration: 30 },
    { id: "m97", title: "Crear un jardín zen", description: "Hacer un pequeño jardín zen con arena y piedras", emoji: "🪴", category: "creativity", duration: 45 },
    { id: "m98", title: "Tarde de papiroflexia", description: "Hacer aviones de papel y competir", emoji: "✈️", category: "entertainment", duration: 30 },
    { id: "m99", title: "Sesión de masajes con pelotas", description: "Darse masajes con pelotas de tenis", emoji: "🎾", category: "bonding", duration: 25 },
    { id: "m100", title: "Celebración de logros", description: "Celebrar todos los pequeños y grandes logros del mes", emoji: "🎉", category: "bonding", duration: 45 }
  ];

  // Daughter-specific activities (50 activities)
  const daughterActivities = [
    { id: "d1", title: "Mini Momentos", description: "Tomar un helado juntas en silencio, solo sintiendo el momento", emoji: "🍦", category: "bonding", duration: 20 },
    { id: "d2", title: "Vibra Libre", description: "Crear una coreografía libre y grabarla bailando con mamá", emoji: "💃", category: "entertainment", duration: 30 },
    { id: "d3", title: "Valiente Yo", description: "Hacer algo que le daba miedo, como hablar en público o subirse a algo alto", emoji: "🦸", category: "bonding", duration: 30 },
    { id: "d4", title: "Pregunto Sin Miedo", description: "Entrevistar a su mamá con preguntas curiosas sin filtros", emoji: "🎤", category: "communication", duration: 25 },
    { id: "d5", title: "Soy mi Voz", description: "Escribir un poema sobre quién es ella", emoji: "✍️", category: "creativity", duration: 30 },
    { id: "d6", title: "Elijo Ser Yo", description: "Diseñar su camiseta con frases que la representen", emoji: "👕", category: "creativity", duration: 45 },
    { id: "d7", title: "Abro mi Mundo", description: "Compartirle a su mamá un hobby que nunca le había contado", emoji: "🌟", category: "communication", duration: 30 },
    { id: "d8", title: "Lloro y No Me Apago", description: "Escribir sobre un día triste y leerlo juntas sin juicio", emoji: "💧", category: "communication", duration: 25 },
    { id: "d9", title: "Brillo a mi Ritmo", description: "Armar un 'show de talentos' para mostrar algo que ama hacer", emoji: "⭐", category: "entertainment", duration: 45 },
    { id: "d10", title: "Soy más que Likes", description: "Jugar a pasar todo el día sin redes y hacer un diario de cómo se sintió", emoji: "📱", category: "bonding", duration: 480 },
    { id: "d11", title: "Miro con Otros Ojos", description: "Dibujar a su mamá como una superheroína", emoji: "🦸‍♀️", category: "creativity", duration: 40 },
    { id: "d12", title: "Abro mi Corazón", description: "Hacer el juego del 'corazón abierto': contar algo que nunca dijo", emoji: "❤️", category: "communication", duration: 20 },
    { id: "d13", title: "Confío en Ella", description: "Dejarle a su mamá una nota que diga: 'Confío en ti porque…'", emoji: "💌", category: "bonding", duration: 15 },
    { id: "d14", title: "Risa Real", description: "Ver un video de risa juntas y tratar de no parar de reír", emoji: "😂", category: "entertainment", duration: 20 },
    { id: "d15", title: "Soy Perfectamente Yo", description: "Hacer un autorretrato donde incluya sus imperfecciones", emoji: "🎨", category: "creativity", duration: 45 },
    { id: "d16", title: "Miro a mi Mamá Diferente", description: "Preguntar a mamá cómo era de niña y dibujarla así", emoji: "👧", category: "creativity", duration: 35 },
    { id: "d17", title: "Diseñadora de mi Vida", description: "Dibujar su vida como un videojuego con ella de protagonista", emoji: "🎮", category: "creativity", duration: 40 },
    { id: "d18", title: "Somos Team 💖", description: "Crear un saludo secreto solo entre ustedes", emoji: "🤝", category: "bonding", duration: 15 },
    { id: "d19", title: "Carta sin filtros", description: "Escribirle a mamá lo que nunca se ha atrevido a decir", emoji: "📝", category: "communication", duration: 30 },
    { id: "d20", title: "Día YO", description: "Escoger todo el plan del día y sentirse líder por un rato", emoji: "👑", category: "entertainment", duration: 480 },
    { id: "d21", title: "Mi historia animada", description: "Crear un cómic con una anécdota divertida entre ellas", emoji: "📚", category: "creativity", duration: 60 },
    { id: "d22", title: "Canción de mi vida", description: "Elegir una canción que la represente y contarle a mamá por qué", emoji: "🎵", category: "communication", duration: 20 },
    { id: "d23", title: "Escoge mi apodo", description: "Crear apodos tiernos solo entre ellas", emoji: "💕", category: "bonding", duration: 15 },
    { id: "d24", title: "Pinta tu vida", description: "Pintar un mural o cartel con lo que más ama de su vida", emoji: "🖌️", category: "creativity", duration: 60 },
    { id: "d25", title: "Cuenta tu historia", description: "Hacer un podcast casero de una historia personal", emoji: "🎙️", category: "entertainment", duration: 30 },
    { id: "d26", title: "Entrevista imposible", description: "Jugar a entrevistar a su mamá como si fuera famosa", emoji: "📺", category: "entertainment", duration: 25 },
    { id: "d27", title: "Kit de calma personal", description: "Armar un kit con cosas que la hacen sentir bien", emoji: "🧘", category: "bonding", duration: 30 },
    { id: "d28", title: "Reto sin espejo", description: "Pasar un día sin mirarse al espejo y escribir cómo se sintió", emoji: "🪞", category: "bonding", duration: 480 },
    { id: "d29", title: "Adivina mis emociones", description: "Juego donde mamá adivina cómo se siente por gestos y palabras", emoji: "😊", category: "entertainment", duration: 20 },
    { id: "d30", title: "Pijama party", description: "Dormir en el mismo cuarto contando secretos", emoji: "🛏️", category: "bonding", duration: 480 },
    { id: "d31", title: "Mi caja de recuerdos", description: "Armar una cajita con sus recuerdos favoritos junto a su mamá", emoji: "📦", category: "creativity", duration: 45 },
    { id: "d32", title: "Superpoder del día", description: "Inventar un poder y usarlo todo el día", emoji: "✨", category: "entertainment", duration: 480 },
    { id: "d33", title: "Reto de los 3 cumplidos", description: "Dar 3 cumplidos a su mamá en el día", emoji: "💐", category: "communication", duration: 15 },
    { id: "d34", title: "Diario de sueños", description: "Compartir sus sueños con mamá en una libreta", emoji: "🌙", category: "communication", duration: 20 },
    { id: "d35", title: "Reto sin quejas", description: "Pasar un día sin quejarse, solo viendo lo positivo", emoji: "☀️", category: "bonding", duration: 480 },
    { id: "d36", title: "Película de mi vida", description: "Escribir el guión de una película basada en ella", emoji: "🎬", category: "creativity", duration: 60 },
    { id: "d37", title: "Playlist de mi infancia", description: "Hacer una lista de canciones que le recuerdan su niñez", emoji: "🎶", category: "entertainment", duration: 30 },
    { id: "d38", title: "Mi primer consejo", description: "Darle a su mamá un consejo con cariño", emoji: "💡", category: "communication", duration: 15 },
    { id: "d39", title: "Elijo mis batallas", description: "Decidir no discutir por algo y contarle a mamá por qué", emoji: "🕊️", category: "communication", duration: 20 },
    { id: "d40", title: "Dibujo lo que siento", description: "Dibujar sin pensar, solo desde lo que siente", emoji: "🖍️", category: "creativity", duration: 30 },
    { id: "d41", title: "Libro de mí", description: "Crear un pequeño libro ilustrado sobre quién es ella", emoji: "📖", category: "creativity", duration: 90 },
    { id: "d42", title: "Te regalo mi tiempo", description: "Dedicarle una hora a mamá haciendo lo que a ella le gusta", emoji: "⏰", category: "bonding", duration: 60 },
    { id: "d43", title: "Tu retrato en palabras", description: "Escribir un poema o lista describiendo a su mamá", emoji: "📜", category: "creativity", duration: 25 },
    { id: "d44", title: "Juego del espejo emocional", description: "Copiar gestos y emociones en juego de imitación", emoji: "🪞", category: "entertainment", duration: 20 },
    { id: "d45", title: "5 cosas que amo de ti", description: "Escribirle a mamá 5 cosas que la hacen especial", emoji: "💖", category: "communication", duration: 20 },
    { id: "d46", title: "Yo también cuido", description: "Organizar un día en que la hija cuide de mamá", emoji: "🤲", category: "bonding", duration: 480 },
    { id: "d47", title: "Cuento con mamá", description: "Escribir juntas un cuento donde ambas son heroínas", emoji: "📝", category: "creativity", duration: 45 },
    { id: "d48", title: "Hoy me atreví a...", description: "Escribir qué hizo hoy que antes le daba miedo", emoji: "🦁", category: "communication", duration: 20 },
    { id: "d49", title: "Mi espacio seguro", description: "Decorar un rincón donde ambas puedan ir cuando necesitan paz", emoji: "🏡", category: "bonding", duration: 60 },
    { id: "d50", title: "Carta a mi yo del futuro", description: "Escribirle a su yo de 18 años y compartirlo con mamá", emoji: "💌", category: "communication", duration: 30 }
  ];

  const categories = [
    { id: "all", name: "Todas", emoji: "✨" },
    { id: "food", name: "Comida", emoji: "🍽️" },
    { id: "entertainment", name: "Entretenimiento", emoji: "🎬" },
    { id: "sports", name: "Deportes", emoji: "⚽" },
    { id: "bonding", name: "Conexión", emoji: "💕" },
    { id: "communication", name: "Conversación", emoji: "💬" },
    { id: "creativity", name: "Creatividad", emoji: "🎨" },
  ];

  // Combine API templates with role-specific activities
  const allTemplates = userRole === 'madre' 
    ? [...(templates as any[]), ...motherActivities]
    : userRole === 'hija'
    ? [...(templates as any[]), ...daughterActivities]
    : (templates as any[]);

  // Show all templates without filtering
  const filteredTemplates = allTemplates;

  const scheduleFromTemplateMutation = useMutation({
    mutationFn: async (data: { 
      templateId: string, 
      scheduledDate: string,
      customTitle?: string,
      customDescription?: string 
    }) => {
      // Check if it's a local activity (mother or daughter)
      const localActivity = [...motherActivities, ...daughterActivities].find(a => a.id === data.templateId);
      
      if (localActivity) {
        // For local activities, create directly through the scheduled activities endpoint
        const response = await apiRequest("POST", "/api/scheduled-activities", {
          userId,
          title: data.customTitle || localActivity.title,
          description: data.customDescription || localActivity.description,
          scheduledDate: data.scheduledDate,
          duration: localActivity.duration,
          type: 'activity'
        });
        return response.json();
      } else {
        // For database templates, use the existing endpoint
        const response = await apiRequest("POST", "/api/schedule-from-template", { 
          userId, 
          templateId: data.templateId, 
          scheduledDate: data.scheduledDate,
          customTitle: data.customTitle,
          customDescription: data.customDescription
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/scheduled-activities", userId],
        exact: false 
      });
      toast({
        title: "✓ Actividad programada",
        description: "La actividad se agregó al calendario.",
      });
      setShowActivityMenu(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo programar la actividad.",
        variant: "destructive",
      });
    },
  });

  const generateWeeklyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${userId}/generate-weekly-schedule`);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.showTemplateMenu) {
        setShowActivityMenu(true);
      }
    },
  });

  const handleCreateActivity = () => {
    const scheduledDateTime = new Date(`${newActivity.date}T${newActivity.time}`);
    
    const activityData = {
      userId,
      title: newActivity.title,
      description: newActivity.description,
      scheduledDate: scheduledDateTime.toISOString(),
      duration: newActivity.duration,
      type: "custom",
      emoji: newActivity.emoji
    };
    
    console.log("🎯 Enviando actividad con emoji:", activityData);
    
    createActivityMutation.mutate(activityData);
  };

  const handleCompleteActivity = (activity: ScheduledActivity) => {
    updateActivityMutation.mutate({
      id: activity.id,
      updates: { status: "completed", completedAt: new Date().toISOString() }
    });
  };

  const handleConfirmActivity = (activity: ScheduledActivity) => {
    updateActivityMutation.mutate({
      id: activity.id,
      updates: { status: "confirmed" }
    });
  };

  const getActivitiesForDate = (date: Date) => {
    const dayActivities = activities.filter((activity: ScheduledActivity) => 
      isSameDay(new Date(activity.scheduledDate), date) && activity.status !== "cancelled"
    );
    console.log(`📅 Activities for ${format(date, "yyyy-MM-dd")}:`, dayActivities);
    return dayActivities;
  };

  const handleNotificationDismiss = () => {
    // Limpiar la notificación actual
    setCurrentNotification(null);
  };

  const handleNotificationSnooze = (minutes: number) => {
    // Implementar snooze - reprogramar notificación
    if (currentNotification) {
      setTimeout(() => {
        setCurrentNotification(currentNotification);
      }, minutes * 60 * 1000);
    }
    setCurrentNotification(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-purple-100 text-purple-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled": return "Programada";
      case "confirmed": return "Confirmada";
      case "completed": return "Completada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="card-shadow overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-green-200">
        <CardContent className="p-0">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Calendario de Actividades</h2>
                  <p className="text-white text-opacity-90 text-sm">Planifica momentos especiales</p>
                </div>
              </div>
              <Button
                onClick={() => setShowNewActivityDialog(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nueva
              </Button>
            </div>
          </div>

          {/* Contenido del calendario */}
          <div className="p-6 space-y-4">
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => generateWeeklyMutation.mutate()}
                disabled={generateWeeklyMutation.isPending}
                className="bg-white bg-opacity-70 hover:bg-opacity-90 border-white border-opacity-50 text-warm-gray-700"
              >
                <Heart className="w-4 h-4 mr-2 text-purple-500" />
                <span className="font-medium">{generateWeeklyMutation.isPending ? "Generando..." : "Programa Semanal"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
          
      {/* Botón de prueba de notificación (oculto en producción - solo para desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const testActivity: ScheduledActivity = {
              id: "test-notification",
              userId: userId,
              title: "Actividad de Prueba",
              description: "Esta es una prueba del sistema de notificaciones 😊",
              scheduledDate: new Date(),
              duration: 30,
                type: "custom",
                status: "scheduled",
                partnerId: null,
                emoji: "🔔",
                reminderSent: false,
                createdAt: new Date(),
                completedAt: null
              };
              setCurrentNotification(testActivity);
            }}
            className="hidden"
          >
            🔔 Probar Alarma
          </Button>
        )}

      {/* Diálogo del menú de actividades */}
          <Dialog open={showActivityMenu} onOpenChange={setShowActivityMenu}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">
                  🎯 Menú de Actividades para {userRole === "madre" ? "Madres" : "Hijas"}
                </DialogTitle>
                <p className="text-center text-gray-600">
                  Selecciona una actividad para programar en tu calendario
                </p>
              </DialogHeader>



              {/* Lista de actividades */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template: any) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowActivityDetails(true);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{template.emoji}</span>
                      <h3 className="font-semibold text-sm">{template.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>⏱️ {template.defaultDuration} min</span>
                      <span className="text-blue-600">Clic para programar</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowActivityMenu(false)}>
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Diálogo para detalles de actividad seleccionada */}
          <Dialog open={showActivityDetails} onOpenChange={setShowActivityDetails}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedTemplate?.emoji}</span>
                  {selectedTemplate?.title}
                </DialogTitle>
              </DialogHeader>

              {selectedTemplate && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const date = formData.get('date') as string;
                  const time = formData.get('time') as string;
                  const customTitle = formData.get('customTitle') as string;
                  const customDescription = formData.get('customDescription') as string;
                  
                  const scheduledDateTime = new Date(`${date}T${time}`);
                  
                  scheduleFromTemplateMutation.mutate({
                    templateId: selectedTemplate.id,
                    scheduledDate: scheduledDateTime.toISOString(),
                    customTitle: customTitle || selectedTemplate.title,
                    customDescription: customDescription || selectedTemplate.description
                  });
                  setShowActivityDetails(false);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="customTitle">Título personalizado (opcional)</Label>
                    <Input
                      id="customTitle"
                      name="customTitle"
                      placeholder={selectedTemplate.title}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customDescription">Descripción personalizada (opcional)</Label>
                    <Textarea
                      id="customDescription"
                      name="customDescription"
                      placeholder={selectedTemplate.description}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Fecha 📅</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={format(new Date(), "yyyy-MM-dd")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Hora 🕐</Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        defaultValue="19:00"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowActivityDetails(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={scheduleFromTemplateMutation.isPending}>
                      {scheduleFromTemplateMutation.isPending ? "Programando..." : "Programar Me We"}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={showNewActivityDialog} onOpenChange={setShowNewActivityDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Programar Me We Personalizado</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateActivity();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Título del Me We</Label>
                  <Input
                    id="title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="Ej: Conversación sobre sentimientos"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emoji">Emoticón 😊</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["😊", "❤️", "💕", "💬", "🧱", "✨", "🎯", "🌟", "💖", "🔥", "🎪", "🎨", "🎵"].map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`text-lg ${newActivity.emoji === emoji ? 'bg-blue-100 border-blue-300' : ''}`}
                        onClick={() => setNewActivity({ ...newActivity, emoji })}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Describe la actividad..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="sound">Sonido de notificación 🔔</Label>
                  <select
                    id="sound"
                    className="w-full p-2 border rounded-md"
                    value={newActivity.sound || "default"}
                    onChange={(e) => setNewActivity({ ...newActivity, sound: e.target.value })}
                  >
                    <option value="default">🔔 Sonido por defecto</option>
                    <option value="gentle">🎵 Suave y relajante</option>
                    <option value="energetic">⚡ Energético</option>
                    <option value="nature">🌿 Sonidos de naturaleza</option>
                    <option value="chime">🎶 Campanillas</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha 📅</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newActivity.date}
                      onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora 🕐</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duración (minutos) ⏱️</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) })}
                    min="5"
                    max="300"
                    required
                  />
                </div>

                <div>
                  <Label>Recordatorios ⏰</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={newActivity.reminder5min ? 'bg-blue-100 border-blue-300' : ''}
                      onClick={() => setNewActivity({ ...newActivity, reminder5min: !newActivity.reminder5min })}
                    >
                      5 min antes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={newActivity.reminder15min ? 'bg-blue-100 border-blue-300' : ''}
                      onClick={() => setNewActivity({ ...newActivity, reminder15min: !newActivity.reminder15min })}
                    >
                      15 min antes
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewActivityDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createActivityMutation.isPending}
                  >
                    {createActivityMutation.isPending ? "Programando..." : "Programar Me We"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Week navigation */}
      <div className="space-y-3">
        {/* Rango de fechas centrado */}
        <div className="text-center">
          <span className="text-sm font-medium text-gray-700">
            {format(startDate, "dd MMM", { locale: es })} - {format(endDate, "dd MMM yyyy", { locale: es })}
          </span>
        </div>
        
        {/* Botones de navegación */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            className="h-9 px-4 py-2 whitespace-nowrap min-w-[140px]"
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          >
            ← Semana anterior
          </Button>
          <Button
            variant="outline"
            className="h-9 px-4 py-2 whitespace-nowrap min-w-[140px]"
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          >
            Siguiente semana →
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-warm-gray-600 p-2">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {weekDays.map((date) => {
          const dayActivities = getActivitiesForDate(date);
          const isCurrentDay = isToday(date);
          
          return (
            <Card 
              key={date.toISOString()} 
              className={`min-h-[120px] ${isCurrentDay ? 'ring-2 ring-purple-200' : ''}`}
            >
              <CardContent className="p-2">
                <div className={`text-center text-sm font-medium mb-2 ${
                  isCurrentDay ? 'text-purple-600' : 'text-warm-gray-600'
                }`}>
                  {format(date, "d")}
                </div>
                
                <div className="space-y-1">
                  {dayActivities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className={`text-center cursor-pointer rounded p-2 transition-colors ${
                        activity.partnerActivity 
                          ? 'bg-pink-50 hover:bg-pink-100 border border-pink-200' 
                          : 'hover:bg-warm-gray-100'
                      }`}
                      onClick={() => setSelectedActivityDetail(activity)}
                    >
                      <div className="text-2xl mb-1">
                        {activity.emoji || "😊"}
                      </div>
                      <div className="text-xs text-warm-gray-600">
                        {format(new Date(activity.scheduledDate), "HH:mm")}
                      </div>
                      {activity.partnerActivity && (
                        <div className="text-xs text-pink-600 font-medium">
                          👥 Compartida
                        </div>
                      )}
                      <div className="text-xs font-medium text-warm-gray-700 mt-1">
                        {activity.title.length > 12 ? activity.title.substring(0, 12) + "..." : activity.title}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-pulse">Cargando actividades...</div>
        </div>
      )}

        {/* Diálogo de detalles de actividad */}
        <Dialog open={!!selectedActivityDetail} onOpenChange={() => setSelectedActivityDetail(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">
                  {selectedActivityDetail?.emoji || "😊"}
                </span>
                {selectedActivityDetail?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedActivityDetail && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Descripción</h4>
                  <p className="text-gray-600">{selectedActivityDetail.description || "Sin descripción"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Fecha y Hora</h4>
                    <p className="text-gray-600">
                      {format(new Date(selectedActivityDetail.scheduledDate), "dd/MM/yyyy 'a las' HH:mm")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Duración</h4>
                    <p className="text-gray-600">{selectedActivityDetail.duration} minutos</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Estado</h4>
                  <Badge className={getStatusColor(selectedActivityDetail.status)}>
                    {getStatusLabel(selectedActivityDetail.status)}
                  </Badge>
                </div>
                
                {selectedActivityDetail.status === "scheduled" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        updateActivityMutation.mutate({
                          id: selectedActivityDetail.id,
                          updates: { status: "confirmed" }
                        });
                        setSelectedActivityDetail(null);
                      }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Confirmar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600"
                      onClick={() => {
                        updateActivityMutation.mutate({
                          id: selectedActivityDetail.id,
                          updates: { status: "cancelled" }
                        });
                        setSelectedActivityDetail(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                )}
                
                {selectedActivityDetail.status === "confirmed" && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      updateActivityMutation.mutate({
                        id: selectedActivityDetail.id,
                        updates: { status: "completed", completedAt: new Date() }
                      });
                      setSelectedActivityDetail(null);
                    }}
                  >
                    Completar Actividad
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Sistema de notificaciones */}
        <ActivityNotification
          activity={currentNotification}
          onDismiss={handleNotificationDismiss}
          onSnooze={handleNotificationSnooze}
        />
      </div>
    );
  }