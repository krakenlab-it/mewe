import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import type { User } from "@shared/schema";

interface ConnectionProgressProps {
  userId: string;
}

export default function ConnectionProgress({ userId }: ConnectionProgressProps) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: partner } = useQuery<User>({
    queryKey: ["/api/users", user?.partnerId],
    enabled: !!user?.partnerId,
  });

  // Mock connection level based on activities completed
  const connectionLevel = partner ? 3 : 1;
  const progressPercentage = (connectionLevel / 5) * 100;

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-warm-gray-800 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-pink-500" />
            Nuestra Conexión
          </h3>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Nivel {connectionLevel}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          {/* Stage 1: Initial connection */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl">👩‍👧</span>
            </div>
            <span className="text-xs text-warm-gray-600">Inicio</span>
          </div>
          
          {/* Connection Line */}
          <div className="flex-1 h-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mx-3 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Stage 2: Growing connection */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md ${
              connectionLevel < 3 ? 'opacity-50' : ''
            }`}>
              <span className="text-2xl">💕</span>
            </div>
            <span className="text-xs text-warm-gray-600">Crecimiento</span>
          </div>
        </div>
        
        <div className="text-center">
          {partner ? (
            <p className="text-sm text-warm-gray-600">
              Conectadas con <strong>{partner.nombre} {partner.apellido}</strong> - Cada día fortalecemos nuestro vínculo especial
            </p>
          ) : (
            <p className="text-sm text-warm-gray-600">
              Esperando conexión - Tu {user?.role === 'madre' ? 'hija' : 'madre'} se unirá pronto
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
