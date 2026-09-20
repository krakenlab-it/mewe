import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import WhatsAppNotifications from "@/components/whatsapp-notifications";
import { ConsentTermsContent, ConsentTermsHeading } from "@/components/consent-terms";
import { User, Settings, Heart, Users, ArrowLeft, Mail } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { es } from "date-fns/locale";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: currentUser?.nombre || "",
    apellido: currentUser?.apellido || "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partner } = useQuery<UserType>({
    queryKey: ["/api/users", currentUser?.partnerId],
    enabled: !!currentUser?.partnerId,
  });

  const { data: consent } = useQuery<{ accepted?: boolean; acceptedAt?: string | null }>({
    queryKey: [`/api/users/${currentUser?.id}/consent`],
    enabled: !!currentUser?.id,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<UserType>) => {
      const response = await apiRequest("PATCH", `/api/users/${currentUser?.id}`, updates);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const revokeConsentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${currentUser?.id}/consent`, {
        accepted: false,
        source: "profile",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser?.id}/consent`] });
      toast({
        title: "Consentimiento revocado",
        description: "Puedes volver a aceptarlo cuando quieras. Tu cuenta sigue activa.",
      });
    },
  });

  const acceptConsentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${currentUser?.id}/consent`, {
        accepted: true,
        source: "profile",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser?.id}/consent`] });
      toast({
        title: "Consentimiento registrado",
        description: "Quedó guardado el acuerdo LOPDP de Me We.",
      });
    },
  });

  const handleSaveProfile = () => {
    updateUserMutation.mutate(editForm);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
    } catch {
      // Still leave the session locally.
    }
    globalQueryClient.clear();
    logout();
  };

  if (!currentUser) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-warm-gray-50">
      {/* Status Bar */}
      <div className="status-bar">
        <span>9:41</span>
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-white rounded-sm"></div>
          <div className="w-1 h-2 bg-white rounded-sm"></div>
          <div className="w-6 h-2 bg-white rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-mood-mid px-6 pt-8 pb-6 text-white">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white hover:bg-opacity-10 p-2 -ml-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl">
              {currentUser.role === "madre" ? "👩" : "👧"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {currentUser.nombre} {currentUser.apellido}
            </h1>
            <p className="text-sm opacity-90 capitalize">
              {currentUser.role}
            </p>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="px-6 py-6 space-y-6 pb-24">
        {/* Personal Information */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warm-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información Personal
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={editForm.apellido}
                    onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateUserMutation.isPending}
                  className="w-full"
                >
                  {updateUserMutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-warm-gray-600">Nombre:</span>
                  <span className="font-medium">{currentUser.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray-600">Apellido:</span>
                  <span className="font-medium">{currentUser.apellido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray-600">Edad:</span>
                  <span className="font-medium">{currentUser.edad} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray-600">Fecha del Taller:</span>
                  <span className="font-medium">
                    {currentUser.fechaTaller
                      ? format(new Date(currentUser.fechaTaller), "PPP", { locale: es })
                      : "Pendiente"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-warm-gray-800 flex items-center mb-4">
              <Heart className="w-5 h-5 mr-2" />
              Estado de Conexión
            </h3>
            
            {partner ? (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span>{partner.role === "madre" ? "👩" : "👧"}</span>
                </div>
                <div>
                  <p className="font-medium text-green-800">
                    Conectada con {partner.nombre}
                  </p>
                  <p className="text-sm text-green-600">
                    {partner.role === "madre" ? "Tu madre" : "Tu hija"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-12 h-12 text-warm-gray-400 mx-auto mb-3" />
                <p className="text-warm-gray-600 mb-4">
                  Aún no estás conectada. Comparte tu código con tu {
                    currentUser.role === "madre" ? "hija" : "madre"
                  }.
                </p>
                <div className="bg-warm-gray-100 rounded-lg p-3">
                  <p className="text-xs text-warm-gray-500 mb-1">Tu código:</p>
                  <p className="font-mono text-lg font-bold text-warm-gray-800">
                    {currentUser.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-warm-gray-800 flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2" />
              Configuración
            </h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowWhatsApp(true)}
                data-testid="button-daily-notifications"
              >
                Notificaciones diarias
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPrivacy(true)}
                data-testid="button-privacy"
              >
                Privacidad y datos
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowHelp(true)}
                data-testid="button-help"
              >
                Ayuda y soporte
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
                data-testid="button-profile-logout"
              >
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <WhatsAppNotifications
        userId={currentUser.id}
        isOpen={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
      />

      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <ConsentTermsHeading />
            </DialogTitle>
            <DialogDescription>
              {consent?.accepted
                ? "Tu consentimiento LOPDP está activo. Puedes leerlo de nuevo o revocarlo."
                : "Aún no hay un consentimiento activo. Léelo y acéptalo para usar notificaciones y WhatsApp."}
            </DialogDescription>
          </DialogHeader>
          <ConsentTermsContent />
          <div className="flex gap-2">
            {consent?.accepted ? (
              <Button
                variant="outline"
                className="flex-1 text-red-600"
                onClick={() => revokeConsentMutation.mutate()}
                disabled={revokeConsentMutation.isPending}
                data-testid="button-revoke-consent"
              >
                Revocar consentimiento
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => acceptConsentMutation.mutate()}
                disabled={acceptConsentMutation.isPending}
                data-testid="button-accept-consent"
              >
                Aceptar acuerdo
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPrivacy(false)}
              data-testid="button-privacy-close"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ayuda y soporte</DialogTitle>
            <DialogDescription>
              Equipo Me We — Pamela Gabela y facilitadoras del taller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-warm-gray-700">
            <p>Si algo no carga o quieres desuscribirte, escríbenos. No pedimos contraseñas por chat.</p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a className="text-purple-700 underline" href="mailto:privacy@mewe.ec">privacy@mewe.ec</a>
            </p>
            <p>WhatsApp y el calendario viven en Inicio. El acuerdo LOPDP está en Privacidad y datos.</p>
          </div>
          <Button onClick={() => setShowHelp(false)} data-testid="button-help-close">Entendido</Button>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}
