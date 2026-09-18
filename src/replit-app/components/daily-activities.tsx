import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, MessageCircle, Building } from "lucide-react";
import { useLocation } from "wouter";

interface DailyActivitiesProps {
  userId: string;
}

interface ActivityWithStatus {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  type: string;
  status: string;
  completedAt?: Date;
}

export default function DailyActivities({ userId }: DailyActivitiesProps) {
  const [, setLocation] = useLocation();
  
  const { data: activities = [], isLoading } = useQuery<ActivityWithStatus[]>({
    queryKey: ["/api/users", userId, "activities"],
    enabled: !!userId,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lego_tower":
        return <Building className="w-6 h-6" />;
      case "tiny_monsters":
        return <Star className="w-6 h-6" />;
      case "conversation":
        return <MessageCircle className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="status-available text-xs">Disponible</Badge>;
      case "in_progress":
        return <Badge className="status-in-progress text-xs">En progreso</Badge>;
      case "completed":
        return <Badge className="status-completed text-xs">Completada</Badge>;
      case "locked":
        return <Badge className="status-locked text-xs">Bloqueada</Badge>;
      default:
        return <Badge className="status-available text-xs">Disponible</Badge>;
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
      default:
        return "achievement-yellow";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-warm-gray-800">Actividades diarias</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-warm-gray-200 rounded-xl h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show only first 3 activities for home page
  const displayActivities = activities.slice(0, 3);

  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-warm-gray-800">Actividades diarias</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/activities")}
          className="text-purple-600 font-medium text-sm"
        >
          Ver todas
        </Button>
      </div>
      
      <div className="space-y-3">
        {displayActivities.map((activity: ActivityWithStatus) => (
          <Card key={activity.id} className="card-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getActivityGradient(activity.type)} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h4 className="font-medium text-warm-gray-800 text-sm sm:text-base truncate">
                      {activity.nombre}
                    </h4>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs sm:text-sm text-warm-gray-600 mb-2 line-clamp-2">
                    {activity.descripcion}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-warm-gray-500">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{activity.duracion} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {displayActivities.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <Star className="w-10 h-10 sm:w-12 sm:h-12 text-warm-gray-300 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-warm-gray-600">No hay actividades disponibles</p>
          </div>
        )}
      </div>
    </section>
  );
}
