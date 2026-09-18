import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, MessageCircle, Compass, Lock } from "lucide-react";
import { useLocation } from "wouter";

interface AchievementWithStatus {
  id: string;
  nombre: string;
  descripcion: string;
  iconType: string;
  color: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

interface AchievementsProps {
  userId: string;
}

export default function Achievements({ userId }: AchievementsProps) {
  const [, setLocation] = useLocation();
  
  const { data: achievements = [] } = useQuery<AchievementWithStatus[]>({
    queryKey: ["/api/users", userId, "achievements"],
    enabled: !!userId,
  });

  const getAchievementIcon = (iconType: string) => {
    switch (iconType) {
      case "star":
        return <Star className="w-6 h-6" />;
      case "heart":
        return <Heart className="w-6 h-6" />;
      case "message":
        return <MessageCircle className="w-6 h-6" />;
      case "compass":
        return <Compass className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getAchievementGradient = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) return "from-gray-300 to-gray-400";
    
    switch (color) {
      case "yellow":
        return "from-yellow-400 to-orange-500";
      case "purple":
        return "from-purple-400 to-purple-600";
      case "blue":
        return "from-blue-400 to-blue-600";
      case "green":
        return "from-green-400 to-green-600";
      case "red":
        return "from-red-400 to-red-600";
      case "pink":
        return "from-pink-400 to-pink-600";
      default:
        return "from-yellow-400 to-orange-500";
    }
  };

  // Show only first 4 achievements for home view
  const displayAchievements = achievements.slice(0, 4);

  return (
    <Card className="card-shadow overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-yellow-200">
      <CardContent className="p-0">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-3 sm:p-4 text-white relative overflow-hidden">
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-white bg-opacity-10 rounded-full -mr-10 sm:-mr-12 -mt-10 sm:-mt-12"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-5 rounded-full -ml-6 sm:-ml-8 -mb-6 sm:-mb-8"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base drop-shadow-sm">Logros Compartidos</h3>
                <p className="text-white text-opacity-90 text-xs flex items-center">
                  <span className="w-1 h-1 bg-white bg-opacity-60 rounded-full mr-2"></span>
                  Celebra tus logros juntas
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/progress")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30 text-sm px-3 py-1"
            >
              Ver todos
            </Button>
          </div>
        </div>

        {/* Contenido de logros */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {displayAchievements.map((achievement: AchievementWithStatus) => (
              <div 
                key={achievement.id} 
                className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${
                  achievement.isUnlocked 
                    ? 'bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200 shadow-md' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 opacity-75'
                }`}
              >
                {/* Elementos decorativos para logros desbloqueados */}
                {achievement.isUnlocked && (
                  <>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 -mr-4 -mt-4"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 bg-gradient-to-br from-orange-300 to-red-300 rounded-full opacity-15 -ml-3 -mb-3"></div>
                  </>
                )}

                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg relative z-10 ${
                  achievement.isUnlocked 
                    ? `bg-gradient-to-br ${getAchievementGradient(achievement.color, achievement.isUnlocked)}`
                    : 'bg-gradient-to-br from-gray-300 to-gray-400'
                }`}>
                  {achievement.isUnlocked ? (
                    <span className="text-white drop-shadow-sm">
                      {getAchievementIcon(achievement.iconType)}
                    </span>
                  ) : (
                    <Lock className="w-5 h-5 text-white" />
                  )}
                </div>

                <h4 className={`font-semibold text-sm mb-1 relative z-10 ${
                  achievement.isUnlocked ? 'text-warm-gray-800' : 'text-warm-gray-600'
                }`}>
                  {achievement.nombre}
                </h4>
                
                <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                  achievement.isUnlocked 
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {achievement.isUnlocked ? "✓ Completado" : "🔒 Bloqueado"}
                </p>
              </div>
            ))}

            {displayAchievements.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-warm-gray-600 font-medium">¡Pronto tendrás logros increíbles!</p>
                <p className="text-warm-gray-500 text-xs mt-1">Completa actividades para desbloquear medallas</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
