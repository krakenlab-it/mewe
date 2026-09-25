import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Users, UserPlus } from "lucide-react";
import type { User } from "@shared/schema";

interface ConnectionCodeProps {
  user: User;
}

export default function ConnectionCode({ user }: ConnectionCodeProps) {
  if (user.partnerId) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-center space-x-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-xs sm:text-sm md:text-base font-medium text-green-700">
              ¡Ya estás conectada!
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-purple-200">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-3 sm:p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-white bg-opacity-10 rounded-full -mr-10 sm:-mr-12 -mt-10 sm:-mt-12"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-5 rounded-full -ml-6 sm:-ml-8 -mb-6 sm:-mb-8"></div>

          <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Link className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base md:text-lg drop-shadow-sm">Estado de Conexión</h3>
              <p className="text-white text-opacity-90 text-xs sm:text-sm flex items-center">
                <span className="w-1 h-1 bg-white bg-opacity-60 rounded-full mr-2"></span>
                Comparte tu código con tu {user.role === "madre" ? "hija" : "madre"} para conectarse
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-4">
          <div className="text-center">
            <Button
              onClick={() => window.location.href = "/connection"}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              size="lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Generar Conexión con tu {user.role === "madre" ? "Hija" : "Madre"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-warm-gray-500">
              Crea tu código único de conexión para establecer el vínculo especial
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
