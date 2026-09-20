import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Star, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SuggestedActivity } from "@shared/schema";

interface PersonalizedActivitiesProps {
  userId: string;
  userRole: "madre" | "hija";
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-green-100 text-green-800'
};

export default function PersonalizedActivities({ userId, userRole }: PersonalizedActivitiesProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Obtener actividades personalizadas
  const { data: activities = [], isLoading } = useQuery<SuggestedActivity[]>({
    queryKey: [`/api/suggested-activities/${userId}`],
  });

  // Marcar actividad como vista
  const markAsViewedMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const response = await fetch(`/api/suggested-activities/${activityId}/mark-viewed`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Error al marcar actividad como vista');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suggested-activities/${userId}`] });
    },
  });

  const handleViewActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity?.isNew) {
      markAsViewedMutation.mutate(activityId);
    }
    setSelectedActivity(selectedActivity === activityId ? null : activityId);
  };

  const unviewedCount = activities.filter(a => a.isNew).length;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-warm-gray-900">Actividades Sugeridas</h3>
        <span className="text-sm text-warm-gray-600">Para ti y tu {userRole === "madre" ? "hija" : "mamá"}</span>
      </div>

      {/* Main Card with Gradient - Loading/Preparing State */}
      <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-xl p-6 text-white text-center relative overflow-hidden">
        <div className="relative z-10">
          {/* Circle with star and notification badge */}
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            {(isLoading || activities.length === 0) && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-purple-800">3</span>
              </div>
            )}
            {unviewedCount > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-purple-800">{unviewedCount}</span>
              </div>
            )}
          </div>

          {/* Main text */}
          {isLoading ? (
            <>
              <h4 className="text-xl font-bold mb-2">Preparando actividades personalizadas...</h4>
              <p className="text-white text-opacity-90 text-sm mb-4">Basadas en tu información del taller madre-hija</p>
              
              {/* Loading dots */}
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </>
          ) : activities.length === 0 ? (
            <>
              <h4 className="text-xl font-bold mb-2">¡Descubre Actividades Especiales!</h4>
              <p className="text-white text-opacity-90 text-sm mb-4">Basadas en tu taller madre-hija personalizado</p>
              
              {/* Indicator dots */}
              <div className="flex justify-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-white bg-opacity-40 rounded-full"></div>
                <div className="w-2 h-2 bg-white bg-opacity-60 rounded-full"></div>
                <div className="w-2 h-2 bg-white bg-opacity-40 rounded-full"></div>
              </div>
            </>
          ) : (
            <>
              <h4 className="text-xl font-bold mb-2">¡Actividades Listas para Ti!</h4>
              <p className="text-white text-opacity-90 text-sm mb-4">Nuevas actividades basadas en tus conversaciones</p>
            </>
          )}
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-4 left-4 w-20 h-20 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      </div>

      {/* Activities List - Only show if there are activities */}
      {activities.length > 0 && !isLoading && (
        <Card className="w-full">
          <CardContent className="p-0">
            <div className="space-y-3 p-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg overflow-hidden">
                  <div 
                    className={cn(
                      "p-4 cursor-pointer hover:bg-warm-gray-50 transition-colors",
                      activity.isNew && "bg-blue-50 border-l-4 border-l-blue-500"
                    )}
                    onClick={() => handleViewActivity(activity.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-warm-gray-900">
                            {activity.title}
                          </h4>
                          {activity.isNew && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-warm-gray-600 mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-warm-gray-500">
                          {activity.category && (
                            <span className="flex items-center gap-1">
                              🏷️ {activity.category}
                            </span>
                          )}
                          {activity.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.duration} min
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            {!activity.isNew ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                <span>Vista</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Ver detalles</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          data-testid={`button-view-activity-${activity.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {selectedActivity === activity.id && activity.content && (
                      <div className="mt-4 pt-4 border-t border-warm-gray-200">
                        <div className="prose prose-sm max-w-none text-warm-gray-700">
                          {activity.content.split('\n').map((line, index) => (
                            <p key={index} className="mb-2 last:mb-0">{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}