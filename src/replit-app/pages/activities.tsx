import { useState } from "react";
import BottomNavigation from "@/components/bottom-navigation";
import { WorkshopActivitiesSimple } from "@/components/workshop-activities-simple";
import PersonalizedActivities from "@/components/personalized-activities";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";


export default function Activities() {
  const [, setLocation] = useLocation();
  const [currentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

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
          <button
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white hover:bg-opacity-10 p-2 -ml-2 rounded-lg transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Mis Actividades</h1>
        <p className="text-sm opacity-90">
          Fortalece tu vínculo a través de actividades especiales y personalizadas
        </p>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24 space-y-6">
        
        {/* Chat Assistant Section - FIRST */}
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

        {/* Personalized Activities Section - SECOND (AFTER CHAT ASSISTANT) */}
        <PersonalizedActivities 
          userId={currentUser.id} 
          userRole={currentUser.role as "madre" | "hija"} 
        />

        {/* Calendar and Workshop Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-warm-gray-900">Calendario de actividades</h2>
            <span className="text-sm text-warm-gray-600">Talleres Me We</span>
          </div>
          
          <WorkshopActivitiesSimple user={currentUser} />
        </div>

      </main>

      <BottomNavigation />
    </div>
  );
}
