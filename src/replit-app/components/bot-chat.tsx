import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Calendar, Heart, Plus, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import type { User, ConversationHistory } from "@shared/schema";
import { nanoid } from "nanoid";
import { useMeWeAssistant } from "@/hooks/use-mewe-assistant";

interface BotChatProps {
  userId: string;
  currentMood?: number;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestedActivities?: string[];
  moodSupport?: string;
  schedulingPrompt?: boolean;
  innovativeActivities?: string[];
  scientificBacking?: string;
  personalizedTip?: string;
  nextLevelQuestion?: string;
  creativeChallenge?: string;
  hasNewActivities?: boolean;
  activitiesCount?: number;
}

interface NewActivityForm {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
}

export default function BotChat({ userId, currentMood }: BotChatProps) {
  const [sessionId] = useState(() => nanoid());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [newActivity, setNewActivity] = useState<NewActivityForm>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "19:00",
    duration: 30,
  });
  const [useEnhancedAssistant, setUseEnhancedAssistant] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Hook para el asistente Me We mejorado
  const meWeAssistant = useMeWeAssistant();

  // Get user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  // Get conversation history
  const { data: conversationHistory = [] } = useQuery<ConversationHistory[]>({
    queryKey: ["/api/conversation", userId, sessionId],
    enabled: !!userId && !!sessionId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      try {
        const response = await fetch("/api/bot/conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId,
            sessionId,
            message,
            currentMood
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Bot conversation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Verificar si se generaron nuevas actividades automáticamente
      const hasGeneratedActivities = data.activitiesGenerated && data.activitiesGenerated.length > 0;
      
      // Si hay actividades generadas, modificar el mensaje del bot para indicar esto
      let botResponseMessage = data.botResponse?.message || data.message || "Gracias por tu mensaje.";
      
      if (hasGeneratedActivities) {
        botResponseMessage = botResponseMessage + `\n\n✨ He preparado ${data.activitiesGenerated.length} actividad${data.activitiesGenerated.length > 1 ? 'es' : ''} personalizada${data.activitiesGenerated.length > 1 ? 's' : ''} especialmente para ti basada en nuestra conversación.`;
      }
      
      // Add bot response to messages
      const botMessage: ChatMessage = {
        id: nanoid(),
        message: botResponseMessage,
        sender: "bot",
        timestamp: new Date(),
        suggestedActivities: data.botResponse?.suggestedActivities || data.suggestedActivities,
        moodSupport: data.botResponse?.moodSupport || data.moodSupport,
        schedulingPrompt: data.botResponse?.schedulingPrompt || data.schedulingPrompt,
        innovativeActivities: data.botResponse?.innovativeActivities,
        scientificBacking: data.botResponse?.scientificBacking,
        personalizedTip: data.botResponse?.personalizedTip,
        nextLevelQuestion: data.botResponse?.nextLevelQuestion,
        creativeChallenge: data.botResponse?.creativeChallenge,
        hasNewActivities: hasGeneratedActivities,
        activitiesCount: hasGeneratedActivities ? data.activitiesGenerated.length : 0
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Invalidar queries para actualizar las actividades personalizadas
      queryClient.invalidateQueries({ queryKey: ["/api/conversation", userId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ["/api/suggested-activities", userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      const response = await apiRequest("POST", "/api/scheduled-activities", activityData);
      return response.json();
    },
    onSuccess: () => {
      setShowScheduleDialog(false);
      setSelectedActivity("");
      setNewActivity({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "19:00",
        duration: 30,
      });
      toast({
        title: "✓ Actividad programada",
        description: "La actividad ha sido agregada a tu calendario.",
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/scheduled-activities", userId],
        exact: false 
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

  // Initialize chat with welcome message
  useEffect(() => {
    if (user && !isInitialized) {
      // Mensaje personalizado de Pamela segón el rol
      const pamelaGreeting = user.role === "madre" 
        ? `¡Hola ${user.nombre}! Soy Pamela Gabela, fundadora y directora de Me We. Soy madre como tú y entiendo los desafíos de conectar profundamente con nuestras hijas. He dedicado años a investigar cómo fortalecer estos vínculos preciosos. ¿Cómo estás hoy? Cuéntame, ¿cómo estuvo tu día?`
        : `¡Hola ${user.nombre}! Soy Pamela Gabela, fundadora de Me We. Fui hija como tú y sé lo importante que es sentirse comprendida y valorada. Estoy aquí para ayudarte a fortalecer la conexión con tu mamá. ¿Cómo estás hoy? Cuéntame, ¿cómo estuvo tu día?`;
      
      const welcomeMessage: ChatMessage = {
        id: nanoid(),
        message: pamelaGreeting,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for external events (Quick Actions)
  useEffect(() => {
    const handleOpenScheduleDialog = () => {
      openScheduleDialog();
    };

    const handleSuggestConversation = () => {
      const conversationTopics = [
        "¿Cuál fue lo mejor de tu día hoy?",
        "¿Hay algo que te preocupe en estos días?",
        "¿Qué es lo que más te gusta de nuestra relación?",
        "¿Cómo te sientes cuando hablamos juntas?",
        "¿Hay algo nuevo que te gustaría probar juntas?"
      ];
      const randomTopic = conversationTopics[Math.floor(Math.random() * conversationTopics.length)];
      setInputMessage(randomTopic);
    };

    window.addEventListener('openScheduleDialog', handleOpenScheduleDialog);
    window.addEventListener('suggestConversation', handleSuggestConversation);

    return () => {
      window.removeEventListener('openScheduleDialog', handleOpenScheduleDialog);
      window.removeEventListener('suggestConversation', handleSuggestConversation);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: nanoid(),
      message: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Detectar palabras clave para activar el asistente mejorado
    const enhancedKeywords = ['confianza', 'comunicación', 'conflicto', 'pelea', 'emoción', 'sentir', 'ayuda', 'consejo', 'neurociencia', 'actividad innovadora'];
    const shouldUseEnhanced = enhancedKeywords.some(keyword => 
      inputMessage.toLowerCase().includes(keyword)
    );
    
    if (shouldUseEnhanced && meWeAssistant) {
      // Usar el asistente Me We mejorado
      try {
        meWeAssistant.sendMessage(inputMessage, {
          onSuccess: (data) => {
            const botMessage: ChatMessage = {
              id: nanoid(),
              message: data.message,
              sender: "bot",
              timestamp: new Date(),
              scientificBacking: data.metadata?.enrichedTopics?.join(', '),
            };
            setMessages(prev => [...prev, botMessage]);
          },
          onError: () => {
            // Fallback al sistema original
            sendMessageMutation.mutate({ message: inputMessage });
          }
        });
      } catch {
        // Fallback al sistema original
        sendMessageMutation.mutate({ message: inputMessage });
      }
    } else {
      // Usar el sistema original
      sendMessageMutation.mutate({ message: inputMessage });
    }
    
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScheduleActivity = (activityText: string) => {
    setSelectedActivity(activityText);
    setNewActivity(prev => ({
      ...prev,
      title: activityText,
      description: `Actividad sugerida: ${activityText}`
    }));
    setShowScheduleDialog(true);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newActivity.title.trim() || !newActivity.description.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa el título y descripción de la actividad.",
        variant: "destructive",
      });
      return;
    }

    const activityData = {
      userId,
      title: newActivity.title,
      description: newActivity.description,
      scheduledDate: `${newActivity.date}T${newActivity.time}:00.000Z`,
      duration: newActivity.duration,
      type: "custom",
      status: "scheduled",
      emoji: "💝"
    };

    createActivityMutation.mutate(activityData);
  };

  const openScheduleDialog = () => {
    setNewActivity({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "19:00",
      duration: 30,
    });
    setSelectedActivity("");
    setShowScheduleDialog(true);
  };

  return (
    <Card className="w-full h-96 flex flex-col">
      <div className="flex items-center space-x-2 p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-warm-gray-800">Asistente Me We</h3>
          <p className="text-xs text-warm-gray-600">Siempre aquí para ayudarte</p>
        </div>
      </div>

      {/* Messages area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              msg.sender === "user" 
                ? "bg-purple-500 text-white" 
                : "bg-warm-gray-100 text-warm-gray-800"
            }`}>
              <p className="text-sm">{msg.message}</p>
              
              {/* Mood support message */}
              {msg.moodSupport && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <Heart className="w-3 h-3 inline mr-1" />
                  {msg.moodSupport}
                </div>
              )}
              
              {/* Suggested activities */}
              {msg.suggestedActivities && msg.suggestedActivities.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium opacity-75">Actividades sugeridas:</p>
                  {msg.suggestedActivities.map((activity, index) => (
                    <button
                      key={index}
                      onClick={() => handleScheduleActivity(activity)}
                      className="block w-full text-left text-xs p-2 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                    >
                      • {activity}
                    </button>
                  ))}
                </div>
              )}

              {/* Innovative Activities - Sistema Avanzado */}
              {msg.innovativeActivities && msg.innovativeActivities.length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <p className="text-xs font-semibold text-purple-800 mb-2">🧠 Actividades Innovadoras</p>
                  <div className="space-y-2">
                    {msg.innovativeActivities.map((activity, index) => (
                      <div key={index} className="text-xs text-purple-700 leading-relaxed">
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific Backing */}
              {msg.scientificBacking && (
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-2">🔬 Fundamento Científico</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    {msg.scientificBacking === 'comunicacion, conflictos, confianza, emociones' 
                      ? '✨ Respuesta mejorada con IA avanzada - Temas detectados: ' + msg.scientificBacking
                      : msg.scientificBacking}
                  </p>
                  {msg.scientificBacking && msg.scientificBacking.includes(',') && (
                    <span className="inline-block mt-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold rounded-full">
                      GPT-4o Enhanced
                    </span>
                  )}
                </div>
              )}

              {/* Personalized Tip */}
              {msg.personalizedTip && (
                <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-800 mb-2">💡 Consejo Personalizado</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{msg.personalizedTip}</p>
                </div>
              )}

              {/* Next Level Question */}
              {msg.nextLevelQuestion && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-800 mb-2">💭 Reflexión Transformadora</p>
                  <p className="text-xs text-green-700 leading-relaxed">{msg.nextLevelQuestion}</p>
                </div>
              )}

              {/* Creative Challenge */}
              {msg.creativeChallenge && (
                <div className="mt-3 p-3 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-lg">
                  <p className="text-xs font-semibold text-rose-800 mb-2">🎯 Desafío Creativo</p>
                  <p className="text-xs text-rose-700 leading-relaxed">{msg.creativeChallenge}</p>
                </div>
              )}

              {/* New Activities Generated Button */}
              {msg.hasNewActivities && (
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                  <p className="text-xs font-semibold text-purple-800 mb-2">✨ Nuevas actividades disponibles</p>
                  <p className="text-xs text-purple-600 mb-3">
                    Hemos agregado {msg.activitiesCount} actividad{+msg.activitiesCount && msg.activitiesCount > 1 ? 'es' : ''} personalizada{+msg.activitiesCount && msg.activitiesCount > 1 ? 's' : ''} en la sección Actividades Sugeridas.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => setLocation('/activities')}
                  >
                    <Activity className="w-3 h-3 mr-1" />
                    Ver actividades sugeridas
                  </Button>
                </div>
              )}
              
              {/* Scheduling prompt */}
              {msg.schedulingPrompt && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={openScheduleDialog}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Programar actividad
                  </Button>
                </div>
              )}
              
              <p className="text-xs opacity-50 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-warm-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Schedule Activity Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Programar Actividad
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateActivity} className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la actividad</Label>
              <Input
                id="title"
                value={newActivity.title}
                onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Conversación sobre sentimientos"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe qué van a hacer juntas..."
                rows={3}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Fecha 📅</Label>
                <Input
                  id="date"
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Hora 🕐</Label>
                <Input
                  id="time"
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duración (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={newActivity.duration}
                onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                min="15"
                max="120"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? "Programando..." : "Programar Actividad"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
        