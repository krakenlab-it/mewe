import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import BotChat from "@/components/bot-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar, Clock, Heart } from "lucide-react";
import type { User, ScheduledActivity } from "@shared/schema";

export default function ChatPage() {
  const [currentUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    }
    return null;
  });

  const { data: todaysActivities = [] } = useQuery<ScheduledActivity[]>({
    queryKey: ["/api/users", currentUser?.id, "todays-activities"],
    enabled: !!currentUser?.id,
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
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chat con Asistente</h1>
            <p className="text-sm opacity-90">
              Tu compañera para fortalecer vínculos
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6 pb-24 md:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Today's Activities Summary */}
        {todaysActivities.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-warm-gray-800 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Actividades de Hoy
              </h3>
              <div className="space-y-2">
                {todaysActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-warm-gray-800">{activity.title}</p>
                      <div className="flex items-center text-xs text-warm-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(activity.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-1">•</span>
                        <span>{activity.duration} min</span>
                      </div>
                    </div>
                    <Badge className={`text-xs ${
                      activity.status === "confirmed" ? "bg-green-100 text-green-800" :
                      activity.status === "completed" ? "bg-purple-100 text-purple-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {activity.status === "confirmed" ? "Confirmada" :
                       activity.status === "completed" ? "Completada" :
                       "Programada"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-warm-gray-800">Conversación</h3>
            <div className="flex items-center space-x-2 text-sm text-warm-gray-600">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Siempre aquí para ti</span>
            </div>
          </div>
          
          <BotChat userId={currentUser.id} />
        </div>

        {/* Quick Actions */}
        <Card className="border-warm-gray-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-warm-gray-800 mb-3">Acciones Rápidas</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={() => {
                  // Trigger the schedule dialog in the BotChat component
                  const event = new CustomEvent('openScheduleDialog');
                  window.dispatchEvent(event);
                }}
              >
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Programar Actividad</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-3 flex flex-col items-center space-y-2"
                onClick={() => {
                  // Trigger suggestion for conversation topics
                  const event = new CustomEvent('suggestConversation');
                  window.dispatchEvent(event);
                }}
              >
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Sugerir Conversación</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}