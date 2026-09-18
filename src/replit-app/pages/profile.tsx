import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Heart, Users, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { es } from "date-fns/locale";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });
  
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSaveProfile = () => {
    updateUserMutation.mutate(editForm);
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
                    {format(new Date(currentUser.fechaTaller), "PPP", { locale: es })}
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
              <Button variant="outline" className="w-full justify-start">
                Notificaciones diarias
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacidad y datos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Ayuda y soporte
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
