import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Clock, Tag, Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';

interface SuggestedActivity {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  targetRole: 'madre' | 'hija';
  estimatedTime: number;
  source: string;
  priority: 'high' | 'medium' | 'low';
  viewed: boolean;
  viewedAt?: Date;
  createdAt: Date;
}

interface SpecialActivitiesDiscoveryProps {
  userId: string;
  userRole: 'madre' | 'hija';
}

const categoryColors = {
  comunicacion: 'bg-blue-100 text-blue-800',
  empatia: 'bg-green-100 text-green-800',
  neurociencia: 'bg-purple-100 text-purple-800',
  conexion: 'bg-pink-100 text-pink-800',
  autoconocimiento: 'bg-yellow-100 text-yellow-800',
  default: 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-green-100 text-green-800'
};

export default function SpecialActivitiesDiscovery({ userId, userRole }: SpecialActivitiesDiscoveryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Obtener actividades sugeridas
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['suggested-activities', userId],
    queryFn: async () => {
      const response = await fetch(`/api/suggested-activities/${userId}`);
      if (!response.ok) throw new Error('Error fetching suggested activities');
      return response.json();
    },
    refetchInterval: 30000, // Refetch cada 30 segundos para detectar nuevas actividades
  });

  // Marcar actividad como vista
  const markAsViewedMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const response = await apiRequest('PUT', `/api/suggested-activities/${activityId}/mark-viewed`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggested-activities', userId] });
    },
  });

  const unviewedCount = activities.filter((activity: SuggestedActivity) => !activity.viewed).length;
  const recentActivities = activities.slice(0, 5); // Mostrar las 5 más recientes

  const handleActivityClick = (activity: SuggestedActivity) => {
    if (!activity.viewed) {
      markAsViewedMutation.mutate(activity.id);
    }
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
  };

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Descubre Actividades Especiales</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Star className="h-5 w-5 text-yellow-500" />
              {unviewedCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unviewedCount}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">Descubre Actividades Especiales</CardTitle>
          </div>
          <ChevronRight 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
        <CardDescription>
          {activities.length === 0 
            ? "Las actividades aparecerán aquí basándose en tus conversaciones con Me We"
            : `${activities.length} actividades personalizadas disponibles`
          }
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <ScrollArea className="h-64 w-full">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Aún no tienes actividades sugeridas.</p>
                <p className="text-sm mt-1">
                  Habla con el asistente Me We para descubrir actividades personalizadas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity: SuggestedActivity, index: number) => (
                  <Card 
                    key={activity.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      !activity.viewed ? 'border-yellow-200 bg-yellow-50/30' : ''
                    }`}
                    onClick={() => handleActivityClick(activity)}
                    data-testid={`suggested-activity-${index}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm">{activity.title}</h4>
                            {!activity.viewed && (
                              <Badge variant="outline" className="text-xs">
                                Nuevo
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getCategoryColor(activity.category)}`}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {activity.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(activity.priority)}`}
                            >
                              {activity.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.estimatedTime} min
                            </Badge>
                          </div>
                        </div>
                        {activity.viewed && (
                          <Eye className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {activities.length > 5 && (
                  <div className="text-center pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs"
                      data-testid="view-all-activities"
                    >
                      Ver todas las actividades ({activities.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}