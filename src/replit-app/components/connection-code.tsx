import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Link, Users, QrCode, UserCheck, UserPlus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { User } from "@shared/schema";

interface ConnectionCodeProps {
  user: User;
}

export default function ConnectionCode({ user }: ConnectionCodeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [connectionCode, setConnectionCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use the connection code from user data or fallback to ID prefix
  const userConnectionCode = user.connectionCode || user.id.toUpperCase().substring(0, 8);

  const connectMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest(`/api/users/${user.id}/connect-by-code`, "POST", { connectionCode: code });
    },
    onSuccess: (data: any) => {
      toast({
        title: "¡Conexión exitosa!",
        description: `Te has conectado con ${data.partner?.nombre || 'tu compañera'}`,
      });
      setIsDialogOpen(false);
      setConnectionCode("");
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      // Refresh the current user in localStorage
      const connectedUser = { ...user, partnerId: data.partner?.id };
      localStorage.setItem("currentUser", JSON.stringify(connectedUser));
      window.location.reload(); // Simple refresh to update all components
    },
    onError: (error: any) => {
      toast({
        title: "Error en la conexión",
        description: error.message || "No se pudo establecer la conexión",
        variant: "destructive"
      });
    }
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userConnectionCode);
      toast({
        title: "Código copiado",
        description: "El código ha sido copiado al portapapeles"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive"
      });
    }
  };

  const handleConnect = () => {
    if (!connectionCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de conexión",
        variant: "destructive"
      });
      return;
    }

    connectMutation.mutate(connectionCode.trim());
  };

  if (user.partnerId) {
    return (
      <Card className="bg-gradient-to-r from-gren-50 to-blue-50 border-green-200">
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

  const qrValue = `MEWE:${userConnectionCode}`;

  return (
    <Card className="card-shadow overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-purple-200">
      <CardContent className="p-0">
        {/* Header con gradiente y efectos */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-3 sm:p-4 text-white relative overflow-hidden">
          {/* Elementos decorativos */}
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

        {/* Contenido principal */}
        <div className="p-3 sm:p-4 space-y-4">
          {/* Botón principal para generar conexión */}
          <div className="text-center">
            <Button 
              onClick={() => window.location.href = '/connection'}
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
          <div>
            <label className="text-xs sm:text-sm font-semibold text-warm-gray-800 mb-3 block flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Tu código:
            </label>
            <div className="relative">
              <div className="bg-white border-2 border-dashed border-purple-300 rounded-2xl p-3 sm:p-4 text-center shadow-inner relative overflow-hidden">
                {/* Elementos decorativos de fondo */}
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-200 to-purple-200 rounded-full  opacity-20 -ml-4 sm:-ml-6 -mb-4 sm:-mb-6"></div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 relative z-10">
                  {/* QR Code con efectos */}
                  <div className="flex-shrink-0">
                    <div className="inline-flex p-1.5 sm:p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-200">
                      <QRCodeSVG 
                        value={qrValue}
                        size={35}
                        className="sm:w-[45px] sm:h-[45px] mx-auto"
                        fgColor="#9333ea"
                        bgColor="transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Código y descripción con efectos */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="font-mono text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 tracking-wider drop-shadow-sm">
                      {userConnectionCode}
                    </div>
                    <div className="text-xs sm:text-sm text-warm-gray-500 mt-1 flex items-center justify-center sm:justify-start">
                      <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
                      Código único de conexión
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-600 shadow-md w-8 h-8 p-0"
                onClick={copyToClipboard}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Botón de conectar con más impacto visual */}
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-xl p-3 shadow-md border border-purple-200 relative overflow-hidden">
            {/* Elemento decorativo de fondo */}
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-pink-200 to-transparent opacity-30"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-warm-gray-800 block">
                    Conectar con código
                  </span>
                  <span className="text-xs text-warm-gray-600 flex items-center">
                    <span className="w-1 h-1 bg-purple-400 rounded-full mr-1"></span>
                    Ingresa el código de tu {user.role === "madre" ? "hija" : "madre"}
                  </span>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl px-4 py-2 text-sm transform hover:scale-105 transition-all duration-200">
                    Conectar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Conectar con código
                    </DialogTitle>
                    <DialogDescription className="text-center">
                      Ingresa el código de conexión de tu {user.role === "madre" ? "hija" : "madre"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div>
                      <label className="text-sm font-semibold text-warm-gray-800 block mb-2">
                        Código de conexión
                      </label>
                      <Input
                        value={connectionCode}
                        onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
                        placeholder="Ej: ABC123"
                        className="font-mono text-center tracking-widest text-xl font-bold border-2 border-purple-200 focus:border-purple-400 rounded-xl h-14"
                        maxLength={8}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleConnect}
                        disabled={connectMutation.isPending || connectionCode.length < 6}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                      >
                        {connectMutation.isPending ? "Conectando..." : "Conectar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}