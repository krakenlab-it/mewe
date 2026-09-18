import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Users, Clock, CheckCircle, Heart, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import type { User, ScheduledActivity } from "@shared/schema";

export default function TestProfilesPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedProfile, setSelectedProfile] = useState<"madre" | "hija" | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [partnerInfo, setPartnerInfo] = useState<User | null>(null);
  const [testProfiles, setTestProfiles] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch test users from database on component mount
  useEffect(() => {
    // Clear any old invalid user data on page load
    localStorage.removeItem('currentUser');
    
    async function loadTestUsers() {
      try {
        const response = await fetch('/api/test-users');
        if (response.ok) {
          const users = await response.json();
          setTestProfiles(users);
        } else {
          toast({
            title: "Error",
            description: "No se pudieron cargar los perfiles de prueba",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading test users:", error);
        toast({
          title: "Error",
          description: "Error al cargar los perfiles de prueba",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    loadTestUsers();
  }, [toast]);

  const switchProfile = (profile: "madre" | "hija") => {
    if (!testProfiles) return;
    
    const user = testProfiles[profile];
    const partner = testProfiles[profile === "madre" ? "hija" : "madre"];
    
    setSelectedProfile(profile);
    setCurrentUser(user);
    setPartnerInfo(partner);
    
    // Clear ALL localStorage data to prevent old IDs from being used
    localStorage.clear();
    sessionStorage.clear();
    
    // Save new profile with correct current ID
    localStorage.setItem("currentUser", JSON.stringify(user));
    
    toast({
      title: `Perfil cambiado a ${profile}`,
      description: `Ahora estás viendo como ${user.nombre} (${user.role})`,
    });

    // Recargar actividades
    loadActivities(user.id);
  };

  const loadActivities = async (userId: string) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 3);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await fetch(
        `/api/scheduled-activities/${userId}?startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(endDate, "yyyy-MM-dd")}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const createTestActivity = async () => {
    if (!currentUser) return;

    const testActivity = {
      userId: currentUser.id,
      title: `Actividad de ${currentUser.nombre}`,
      description: `Actividad creada por ${currentUser.nombre} para compartir con ${partnerInfo?.nombre}`,
      scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // En 2 horas
      duration: 30,
      type: "bonding",
      status: "scheduled",
      emoji: currentUser.role === "madre" ? "💕" : "🌟"
    };

    try {
      const response = await fetch("/api/scheduled-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testActivity)
      });

      if (response.ok) {
        toast({
          title: "¡Actividad creada!",
          description: `La actividad aparecerá en el calendario de ${currentUser.nombre} y ${partnerInfo?.nombre}`,
        });
        loadActivities(currentUser.id);
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la actividad de prueba",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadActivities(currentUser.id);
    }
  }, [currentUser]);

  const getActivityTypeColor = (isPartner: boolean, role: string) => {
    if (isPartner) {
      return "bg-pink-100 border-pink-300 text-pink-700";
    }
    return role === "madre" 
      ? "bg-purple-100 border-purple-300 text-purple-700"
      : "bg-blue-100 border-blue-300 text-blue-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700">Cargando perfiles de prueba...</p>
        </div>
      </div>
    );
  }

  if (!testProfiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No se pudieron cargar los perfiles de prueba</p>
          <Button onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Users className="w-8 h-8" />
                  Ambiente de Prueba - Perfiles Vinculados
                </CardTitle>
                <p className="text-purple-100 mt-2">
                  Prueba la funcionalidad de actividades compartidas entre madre e hija
                </p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-white text-purple-600 hover:bg-gray-100"
                size="sm"
              >
                🔄 Recargar Datos
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedProfile === "madre" 
                ? "ring-2 ring-purple-500 bg-purple-50" 
                : "hover:bg-purple-25"
            }`}
            onClick={() => switchProfile("madre")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl">
                  👩
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-800">Perfil Madre</h3>
                  <p className="text-purple-600">María Fernanda Páez (38 años)</p>
                  <Badge variant="outline" className="mt-2 border-purple-300 text-purple-700">
                    ID: {testProfiles?.madre?.id}
                  </Badge>
                </div>
                {selectedProfile === "madre" && (
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedProfile === "hija" 
                ? "ring-2 ring-blue-500 bg-blue-50" 
                : "hover:bg-blue-25"
            }`}
            onClick={() => switchProfile("hija")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl">
                  👧
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800">Perfil Hija</h3>
                  <p className="text-blue-600">Valentina Páez (11 años)</p>
                  <Badge variant="outline" className="mt-2 border-blue-300 text-blue-700">
                    ID: {testProfiles?.hija?.id}
                  </Badge>
                </div>
                {selectedProfile === "hija" && (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Profile Info */}
        {currentUser && (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                    currentUser.role === "madre" 
                      ? "bg-gradient-to-br from-purple-500 to-purple-700" 
                      : "bg-gradient-to-br from-blue-500 to-blue-700"
                  }`}>
                    {currentUser.role === "madre" ? "👩" : "👧"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Sesión activa: {currentUser.nombre} ({currentUser.role})
                    </h3>
                    <p className="text-gray-600">
                      Conectada con: {partnerInfo?.nombre} ({partnerInfo?.role})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">Vícculo activo</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={createTestActivity}
                  className={`${
                    currentUser.role === "madre"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-blue-600 hover:bg-blue-700" 
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Crear Actividad de Prueba
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Ensure the current user is properly stored
                    if (currentUser) {
                      localStorage.setItem("currentUser", JSON.stringify(currentUser));
                      // Force complete page reload to ensure fresh data
                      window.location.href = "/";
                    }
                  }}
                  className="border-gray-300"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir a la App Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activities List */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Actividades Programadas ({activities.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay actividades programadas</p>
                  <p className="text-sm">Crea una actividad de prueba para ver la funcionalidad</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity: any) => (
                    <div 
                      key={activity.id}
                      className={`p-4 rounded-lg border-2 ${getActivityTypeColor(activity.partnerActivity, currentUser.role)}`}
                    >
                      <div className="flex items-start justify-betwen">
                         <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{activity.emoji || "😊"}</span>
                            <h4 className="font-semibold">{activity.title}</h4>
                            {activity.partnerActivity && (
                              <Badge variant="secondary" className="bg-pink-200 text-pink-800">
                                👥 Compartida
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{activity.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(activity.scheduledDate), "PPp", { locale: es })}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>⏱️ {activity.duration} min</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              📋 Instrucciones de Prueba
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600">1.</span>
                <span>Selecciona un perfil (Madre o Hija) para activar la sesión</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">2.</span>
                <span>Crea una actividad de prueba con el botón correspondiente</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">3.</span>
                <span>Cambia al otro perfil y verifica que la actividad aparece marcada como "👥 Compartida"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">4.</span>
                <span>Ve a la app principal para probar el calendario completo con las actividades vinculadas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}