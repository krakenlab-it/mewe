import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, MessageCircle, Building, Calendar, Heart, Puzzle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface SuggestedActivity {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: "lego_tower" | "tiny_monsters" | "conversation" | "bonding" | "creativity" | "communication";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  isScheduled?: boolean;
}

interface SuggestedDailyActivitiesProps {
  userId: string;
  currentMood?: number;
}

export default function SuggestedDailyActivities({ userId, currentMood }: SuggestedDailyActivitiesProps) {
  const [currentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [showActivities, setShowActivities] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestedActivities = [], isLoading } = useQuery<SuggestedActivity[]>({
    queryKey: ["/api/suggested-activities", userId, currentMood],
    enabled: !!userId,
  });

  const scheduleActivityMutation = useMutation({
    mutationFn: async ({ activityId, scheduledDate }: { activityId: string; scheduledDate: Date }) => {
      const activity = suggestedActivities.find((item) => item.id === activityId);
      if (!activity) throw new Error("Activity not found");

      const response = await apiRequest("/api/scheduled-activities", "POST", {
        userId,
        title: activity.title,
        description: activity.description,
        duration: activity.duration,
        type: activity.type,
        scheduledDate: scheduledDate.toISOString(),
        status: "confirmed",
        emoji: "??",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-activities", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/suggested-activities", userId] });
      toast({
        title: "¡Actividad programada!",
        description: "La actividad se ha agregado a tu calendario y al de tu compañera.",
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lego_tower":
        return <Building className="w-6 h-6" />;
      case "tiny_monsters":
        return <Star className="w-6 h-6" />;
      case "conversation":
        return <MessageCircle className="w-6 h-6" />;
      case "bonding":
        return <Heart className="w-6 h-6" />;
      case "creativity":
        return <Puzzle className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getActivityGradient = (type: string) => {
    switch (type) {
      case "lego_tower":
        return "achievement-yellow";
      case "tiny_monsters":
        return "achievement-purple";
      case "conversation":
        return "achievement-blue";
      case "bonding":
        return "achievement-pink";
      case "creativity":
        return "achievement-green";
      default:
        return "achievement-yellow";
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge className="bg-green-100 text-green-700 text-xs">Fácil</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 text-xs">Intermedio</Badge>;
      case "hard":
        return <Badge className="bg-red-100 text-red-700 text-xs">Avanzado</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700 text-xs">Fácil</Badge>;
    }
  };

  const handleScheduleActivity = (activityId: string) => {
    const today = new Date();
    today.setHours(18, 0, 0, 0);
    scheduleActivityMutation.mutate({
      activityId,
      scheduledDate: today,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-warm-gray-800">Actividades Sugeridas</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-warm-gray-200 rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-warm-gray-800">Actividades Sugeridas</h3>
        <div className="text-xs text-warm-gray-500">
          {currentUser?.role === "madre" ? "Para ti y tu hija" : "Para ti y tu madre"}
        </div>
      </div>

      {!showActivities ? (
        <Card
          className="card-shadow cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
          onClick={() => setShowActivities(true)}
        >
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-700">{suggestedActivities.length || 3}</span>
                </div>
              </div>

              <div className="text-white">
                <h4 className="font-bold text-lg mb-1">¡Descubre Actividades Especiales!</h4>
                <p className="text-sm text-white text-opacity-90">
                  Basadas en tu taller madre-hija personalizado
                </p>
              </div>

              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span className="text-sm font-medium text-warm-gray-700">
                {suggestedActivities.length} actividades listas
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowActivities(false)}>
              Ocultar
            </Button>
          </div>

          {suggestedActivities.map((activity) => (
            <Card key={activity.id} className="card-shadow overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 rounded-xl ${getActivityGradient(activity.type)} flex items-center justify-center text-white`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-warm-gray-900">{activity.title}</h4>
                      {getDifficultyBadge(activity.difficulty || "easy")}
                    </div>
                    <p className="text-sm text-warm-gray-600 mb-3">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-warm-gray-500 space-x-3">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.duration || 20} min
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {activity.category || "taller"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleScheduleActivity(activity.id)}
                        disabled={scheduleActivityMutation.isPending}
                      >
                        Programar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
