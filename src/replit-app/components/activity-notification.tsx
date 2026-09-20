import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Volume2, VolumeX } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ScheduledActivity } from "@shared/schema";

interface ActivityNotificationProps {
  activity: ScheduledActivity | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

interface NotificationSettings {
  soundType: string;
  emoji: string;
  volume: number;
}

const SOUND_OPTIONS = [
  { id: "bell", name: "Campanitas", emoji: "🔔" },
  { id: "chime", name: "Carillón", emoji: "🎵" },
  { id: "gentle", name: "Suave", emoji: "🎶" },
  { id: "celebration", name: "Celebración", emoji: "🎉" },
];

const EMOJI_OPTIONS = [
  "😊", "😄", "🥳", "💖", "✨", "🌟", "💫", "🎯",
  "🌸", "🌺", "🦋", "🌈", "💕", "😍", "🤗", "😘"
];

export default function ActivityNotification({ 
  activity, 
  onDismiss, 
  onSnooze 
}: ActivityNotificationProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    soundType: "bell",
    emoji: "😊",
    volume: 0.7
  });
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Cargar configuración guardada
    const savedSettings = localStorage.getItem("notification-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    if (activity && !showSettings) {
      playNotificationSound();
    }
  }, [activity, settings.soundType, settings.volume]);

  const playNotificationSound = async () => {
    try {
      if (!audioContext) {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
        
        // Generar sonido de campanitas
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        // Configurar sonido según el tipo seleccionado
        switch (settings.soundType) {
          case "bell":
            oscillator.frequency.setValueAtTime(800, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.5);
            break;
          case "chime":
            oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
            break;
          case "gentle":
            oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
            break;
          case "celebration":
            oscillator.frequency.setValueAtTime(659.25, context.currentTime); // E5
            break;
        }
        
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(settings.volume, context.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 1);
      }
    } catch (error) {
      console.log("No se pudo reproducir el sonido:", error);
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem("notification-settings", JSON.stringify(newSettings));
  };

  const testSound = () => {
    playNotificationSound();
  };

  if (!activity) return null;

  return (
    <>
      {/* Notificación principal */}
      <Dialog open={!!activity && !showSettings} onOpenChange={() => onDismiss()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-center">
              <span className="text-2xl mr-2">{settings.emoji}</span>
              ¡Es hora de tu actividad!
              <Bell className="w-5 h-5 ml-2 text-blue-500" />
            </DialogTitle>
          </DialogHeader>
          
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-blue-800">
                  {activity.title}
                </h3>
                
                <p className="text-blue-700">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-blue-600">
                  <span>
                    📅 {format(new Date(activity.scheduledDate), "dd/MM/yyyy", { locale: es })}
                  </span>
                  <span>
                    🕐 {format(new Date(activity.scheduledDate), "HH:mm")}
                  </span>
                  <span>
                    ⏱️ {activity.duration}min
                  </span>
                </div>
                
                <Badge className="bg-blue-100 text-blue-800">
                  Programada
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => onSnooze(5)}
              variant="outline"
              className="flex-1"
              data-testid="button-snooze-5"
            >
              ⏰ Recordar en 5min
            </Button>
            
            <Button
              onClick={() => onSnooze(15)}
              variant="outline"
              className="flex-1"
              data-testid="button-snooze-15"
            >
              ⏰ Recordar en 15min
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={onDismiss}
              className="flex-1"
              data-testid="button-activity-start"
            >
              ✅ ¡Vamos a hacerlo!
            </Button>
            
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
            >
              ⚙️
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configuración de notificaciones */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Personalizar Notificaciones</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Selección de sonido */}
            <div>
              <label className="text-sm font-medium">Tipo de Sonido</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SOUND_OPTIONS.map((sound) => (
                  <Button
                    key={sound.id}
                    variant={settings.soundType === sound.id ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => saveSettings({ ...settings, soundType: sound.id })}
                  >
                    <span className="mr-2">{sound.emoji}</span>
                    {sound.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selección de emoticono */}
            <div>
              <label className="text-sm font-medium">Emoticono</label>
              <div className="grid grid-cols-8 gap-1 mt-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={settings.emoji === emoji ? "default" : "outline"}
                    className="text-lg p-2 h-auto"
                    onClick={() => saveSettings({ ...settings, emoji })}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Control de volumen */}
            <div>
              <label className="text-sm font-medium flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                Volumen: {Math.round(settings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => saveSettings({ ...settings, volume: parseFloat(e.target.value) })}
                className="w-full mt-2"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={testSound} variant="outline" className="flex-1">
                🔊 Probar Sonido
              </Button>
              <Button onClick={() => setShowSettings(false)} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}