import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/bottom-navigation";
import MoodTracker from "@/components/mood-tracker";
import ConnectionProgress from "@/components/connection-progress";
import ConnectionCode from "@/components/connection-code-simple";

import SuggestedDailyActivities from "@/components/suggested-daily-activities";

import { WorkshopActivitiesSimple } from "@/components/workshop-activities-simple";
import MoodHistory from "@/components/mood-history";
import Achievements from "@/components/achievements";
import CharmCollection from "@/components/charm-collection";
import ActivityCalendar from "@/components/activity-calendar";
import ProfileImageUpload from "@/components/profile-image-upload";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, LogOut } from "lucide-react";
import { getMoodGradient } from "@/lib/mood-colors";
import WhatsAppNotifications from "@/components/whatsapp-notifications";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [currentMood, setCurrentMood] = useState(3);
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear all user data
      queryClient.clear();
      localStorage.removeItem("currentUser");
      
      // Force immediate redirect
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      console.error("Error logging out:", error);
      // Even if there's an error, force logout
      queryClient.clear();
      localStorage.removeItem("currentUser");
      window.location.href = "/auth";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-warm-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const currentUser = user;

  if (!currentUser) {
    return null;
  }

  const headerGradient = getMoodGradient(currentMood);

  return (
    <div className="min-h-screen bg-warm-gray-50">
      {/* Status Bar Simulation */}
      <div className="status-bar">
        <span>9:41</span>
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-white rounded-sm"></div>
          <div className="w-1 h-2 bg-white rounded-sm"></div>
          <div className="w-6 h-2 bg-white rounded-sm"></div>
        </div>
      </div>

      {/* Dynamic Header with Mood-Based Gradient */}
      <header className={`${headerGradient} px-4 pt-8 pb-6 text-white relative overflow-hidden md:px-6 lg:px-8`}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16 md:w-48 md:h-48 md:-mr-24 md:-mt-24"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12 md:w-36 md:h-36 md:-ml-18 md:-mb-18"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-semibold">
                ¡Hola, {currentUser.firstName || currentUser.nombre}! 💜
              </h1>
              <p className="text-sm md:text-base opacity-90">
                {currentUser.partnerId ? "Conectada" : "Lista para conectar"}
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <button 
              onClick={() => setLocation("/test-profiles")}
              className="px-4 py-2 bg-yellow-500 bg-opacity-90 rounded-lg hover:bg-opacity-100 transition-colors text-sm font-medium text-white shadow-lg"
            >
              🧪 Prueba Vinculación
            </button>

            <button 
              onClick={() => setLocation("/profile")}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm font-medium"
            >
              Perfil
            </button>
            <button 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="px-4 py-2 bg-red-500 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors text-sm font-medium text-white shadow-lg flex items-center space-x-2"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span>{logoutMutation.isPending ? "Cerrando..." : "Cerrar Sesión"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-6 space-y-6 pb-24 md:pb-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Mood Tracker Section - Prominently placed */}
        <section className="mb-6">
          <MoodTracker 
            onMoodChange={setCurrentMood}
            userId={currentUser.id}
            userName={currentUser.firstName}
          />
        </section>

        {/* Main Components */}
        <div className="space-y-6">
          <ConnectionCode user={currentUser} />
          <ConnectionProgress userId={currentUser.id} />
          <WorkshopActivitiesSimple user={currentUser} />
        </div>

        {/* Chat Assistant Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-warm-gray-900">Conversa con Me We</h2>
          </div>
          
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">PG</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-800 mb-3">
                  Hola, soy Pamela Gabela, fundadora de Me We. Estoy aquí para ayudarte a fortalecer el vínculo con tu {currentUser.role === "madre" ? "hija" : "mamá"} a través de actividades especiales y consejos personalizados.
                </p>
                <button 
                  onClick={() => setLocation('/chat')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  data-testid="button-chat"
                >
                  Iniciar conversación
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Suggested Activities */}
        <SuggestedDailyActivities userId={currentUser.id} currentMood={currentMood} />
        
        {/* Full Width Sections */}
        <div className="space-y-6">
          {/* Calendar Section */}
          <section>
            <ActivityCalendar userId={currentUser.id} userRole={currentUser.role} />
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoodHistory userId={currentUser.id} />
            <Achievements userId={currentUser.id} />
          </div>
          
          <CharmCollection userId={currentUser.id} userRole={currentUser.role as "madre" | "hija"} />
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-10">
        <Button
          className="w-14 h-14 md:hidden rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg"
          onClick={() => setLocation("/test-profiles")}
          title="Ambiente de Prueba de Vinculación"
        >
          🧪
        </Button>
        
        <Button
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
          onClick={() => setShowWhatsAppSettings(true)}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        
        <Button
          className="w-14 h-14 rounded-full shadow-lg"
          size="lg"
          onClick={() => {
            // Trigger mood tracking modal
            document.querySelector('[data-mood-tracker]')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* WhatsApp Notifications Settings */}
      <WhatsAppNotifications
        userId={currentUser.id}
        isOpen={showWhatsAppSettings}
        onClose={() => setShowWhatsAppSettings(false)}
      />

      <BottomNavigation />
    </div>
  );
}
