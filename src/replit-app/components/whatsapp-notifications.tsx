import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Settings, Clock, Phone } from "lucide-react";
import { requestNotificationPermission, scheduleWhatsAppReminder } from "@/lib/browser-notifications";

interface WhatsAppNotificationsProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Una vez al día", description: "Mensaje motivacional diario" },
  { value: "twice_daily", label: "Dos veces al día", description: "Mañana y tarde" },
  { value: "weekly", label: "Una vez por semana", description: "Mensaje semanal de reflexión" }
];

const MESSAGE_TYPES = [
  { value: "motivational", label: "Motivacional", emoji: "🌟", description: "Mensajes que inspiran y motivan" },
  { value: "reflective", label: "Reflexivo", emoji: "🤔", description: "Preguntas para reflexionar" },
  { value: "bonding", label: "Conexión", emoji: "💖", description: "Ideas para fortalecer vínculos" },
  { value: "encouragement", label: "Aliento", emoji: "💪", description: "Palabras de apoyo y fortaleza" }
];

const TIME_OPTIONS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", 
  "19:00", "20:00", "21:00"
];

export default function WhatsAppNotifications({ userId, isOpen, onClose }: WhatsAppNotificationsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    whatsappNumber: "",
    frequency: "daily",
    preferredTime: "09:00",
    isActive: true
  });

  const [testMessageType, setTestMessageType] = useState("motivational");

  // Obtener configuración actual
  const { data: currentSettings } = useQuery({
    queryKey: [`/api/users/${userId}/notification-settings`],
    enabled: isOpen && !!userId,
    retry: false
  });

  const { data: messageLog = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${userId}/whatsapp-messages`],
    enabled: isOpen && !!userId,
    retry: false
  });

  // Mutation para crear/actualizar configuración
  const settingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = `/api/users/${userId}/notification-settings`;
      const method = currentSettings ? "PATCH" : "POST";
      
      const response = await apiRequest(method, url, data);
      return await response.json();
    },
    onSuccess: async () => {
      await requestNotificationPermission();
      scheduleWhatsAppReminder(settings);
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias de WhatsApp y el recordatorio del navegador quedaron activos."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/notification-settings`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración",
        variant: "destructive"
      });
    }
  });

  // Mutation para enviar mensaje de prueba
  const testMessageMutation = useMutation({
    mutationFn: async (messageType: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/send-motivational-message`, { messageType });
      return await response.json();
    },
    onSuccess: (data: any) => {
      const viaWebhook = Array.isArray(data?.deliveredVia) && data.deliveredVia.includes("webhook");
      if (data?.waMeUrl && !viaWebhook) {
        window.open(data.waMeUrl, "_blank", "noopener,noreferrer");
      }
      toast({
        title: viaWebhook ? "Mensaje enviado" : "WhatsApp listo",
        description: data?.preview || "Tu mensaje quedó guardado y listo para enviar."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/whatsapp-messages`] });
    },
    onError: (error: any) => {
      toast({
        title: "No se pudo preparar el mensaje",
        description: error.message || "Revisa el número de WhatsApp e inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  });

  // Actualizar el estado cuando se cargan los datos
  useEffect(() => {
    if (currentSettings) {
      setSettings({
        whatsappNumber: (currentSettings as any).whatsappNumber || "",
        frequency: (currentSettings as any).frequency || "daily",
        preferredTime: (currentSettings as any).preferredTime || "09:00",
        isActive: (currentSettings as any).isActive !== false
      });
    }
  }, [currentSettings]);

  const handleSaveSettings = () => {
    if (!settings.whatsappNumber.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu número de WhatsApp",
        variant: "destructive"
      });
      return;
    }

    settingsMutation.mutate(settings);
  };

  const handleTestMessage = () => {
    if (!settings.whatsappNumber.trim()) {
      toast({
        title: "Error",
        description: "Primero guarda tu número de WhatsApp",
        variant: "destructive"
      });
      return;
    }

    testMessageMutation.mutate(testMessageType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Notificaciones WhatsApp
          </DialogTitle>
          <DialogDescription>
            Configura mensajes motivacionales automáticos para fortalecer tu vínculo madre-hija
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Número de WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Número de WhatsApp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+593987123456"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                whatsappNumber: e.target.value
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Incluye el código de país (ej: +593 para Ecuador)
            </p>
          </div>

          {/* Activar/Desactivar */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Activar notificaciones</Label>
              <p className="text-sm text-muted-foreground">
                Recibe mensajes motivacionales automáticamente
              </p>
            </div>
            <Switch
              checked={settings.isActive}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                isActive: checked
              }))}
            />
          </div>

          {/* Frecuencia */}
          <div className="space-y-2">
            <Label>Frecuencia de mensajes</Label>
            <Select
              value={settings.frequency}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                frequency: value
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hora preferida */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hora preferida
            </Label>
            <Select
              value={settings.preferredTime}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                preferredTime: value
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prueba de mensaje */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Probar mensaje</CardTitle>
              <CardDescription>
                Envía un mensaje de prueba para verificar la configuración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={testMessageType}
                onValueChange={setTestMessageType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleTestMessage}
                disabled={testMessageMutation.isPending || !settings.whatsappNumber}
                className="w-full"
                variant="outline"
                data-testid="button-whatsapp-test"
              >
                <Send className="w-4 h-4 mr-2" />
                {testMessageMutation.isPending ? "Enviando..." : "Enviar mensaje de prueba"}
              </Button>
              {Array.isArray(messageLog) && messageLog.length > 0 && (
                <p className="text-xs text-muted-foreground" data-testid="whatsapp-last-preview">
                  Último: {messageLog[messageLog.length - 1]?.text}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={settingsMutation.isPending}
              className="flex-1"
              data-testid="button-whatsapp-save"
            >
              <Settings className="w-4 h-4 mr-2" />
              {settingsMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WhatsAppReminderHost({ userId }: { userId: string }) {
  const { data: currentSettings } = useQuery({
    queryKey: [`/api/users/${userId}/notification-settings`],
    enabled: !!userId,
    retry: false,
  });

  useEffect(() => {
    const settings = currentSettings as { isActive?: boolean; preferredTime?: string; frequency?: string } | undefined;
    if (settings?.isActive) {
      scheduleWhatsAppReminder({
        isActive: settings.isActive,
        preferredTime: settings.preferredTime,
        frequency: settings.frequency,
      });
    }
  }, [currentSettings]);

  return null;
}