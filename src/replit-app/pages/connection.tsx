import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Copy, Link, Users, QrCode, UserCheck, ArrowLeft, Heart, UserPlus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { User } from "@shared/schema";

export default function ConnectionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [connectionCode, setConnectionCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Usuario no encontrado");
      return await apiRequest(`/api/users/${currentUser.id}/generate-connection-code`, "POST");
    },
    onSuccess: (data: any) => {
      setGeneratedCode(data.connectionCode);
      toast({
        title: "Código generado",
        description: "Tu código de conexión único ha sido creado"
      });
      // Update current user with the new connection code
      if (currentUser) {
        const updatedUser = { ...currentUser, connectionCode: data.connectionCode };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el código",
        variant: "destructive"
      });
    }
  });

  const connectMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!currentUser) throw new Error("Usuario no encontrado");
      return await apiRequest(`/api/users/${currentUser.id}/connect-by-code`, "POST", { connectionCode: code });
    },
    onSuccess: (data: any) => {
      toast({
        title: "¡Conexión exitosa!",
        description: `Te has conectado con ${data.partner?.nombre || 'tu compañera'}`,
      });
      setIsDialogOpen(false);
      setConnectionCode("");
      // Refresh user data
      if (currentUser) {
        const connectedUser = { ...currentUser, partnerId: data.partner?.id };
        localStorage.setItem("currentUser", JSON.stringify(connectedUser));
        setCurrentUser(connectedUser);
      }
      setTimeout(() => setLocation("/"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error en la conexión",
        description: error.message || "No se pudo establecer la conexión",
        variant: "destructive"
      });
    }
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-warm-gray-600">Cargando datos del usuario...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the generated code or the user's existing code
  const userConnectionCode = generatedCode || currentUser.connectionCode || "";
  const qrValue = userConnectionCode ? `MEWE:${userConnectionCode}` : "";

  // Auto-generate connection code if user doesn't have one
  useEffect(() => {
    if (currentUser && !currentUser.connectionCode && !generatedCode && !generateCodeMutation.isPending) {
      generateCodeMutation.mutate();
    }
  }, [currentUser, generatedCode, generateCodeMutation]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-warm-gray-600">Cargando datos del usuario...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentUser.partnerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/")}
            className="text-warm-gray-600 hover:text-warm-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Success Content */}
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-r from-gren-50 to-blue-50 border-green-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-green-700 mb-2">
                ¡Ya estás conectada!
              </h2>
              
              <p className="text-green-600 mb-6">
                Tu vínculo especial ya está establecido. Pueden comenzar a compartir actividades y fortalecer su relación.
              </p>

              <div className="flex items-center justify-center space-x-2 p-4 bg-white bg-opacity-60 rounded-lg mb-6">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-medium text-warm-gray-700">
                  Conexión activa con tu {currentUser.role === "madre" ? "hija" : "madre"}
                </span>
              </div>

              <Button 
                onClick={() => setLocation("/")}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
              >
                Ir al Inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
          className="text-warm-gray-600 hover:text-warm-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white border-none shadow-xl">
          <CardContent className="p-6 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-5 rounded-full -ml-8 -mb-8"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-xl font-bold mb-2">Generar Conexión</h1>
              <p className="text-white text-opacity-90 text-sm">
                Conecta con tu {currentUser.role === "madre" ? "hija" : "madre"} usando códigos únicos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Connection Code */}
        <Card className="shadow-lg border-purple-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-warm-gray-800 flex items-center">
              <QrCode className="w-5 h-5 mr-2 text-purple-600" />
              Tu Código de Conexión
            </CardTitle>
            <CardDescription>
              Comparte este código con tu {currentUser.role === "madre" ? "hija" : "madre"} para conectarse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code and Code Display */}
            {userConnectionCode ? (
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex-shrink-0">
                  <QRCodeSVG 
                    value={qrValue}
                    size={80}
                    bgColor="transparent"
                    fgColor="#7C3AED"
                    level="M"
                    className="border-2 border-white rounded-lg shadow-sm"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <code className="text-2xl font-bold text-purple-700 bg-white px-3 py-2 rounded border tracking-wider">
                      {userConnectionCode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(userConnectionCode)}
                      className="border-purple-200 hover:bg-purple-50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                 <p className="text-xs text-warm-gray-500 mt-2">
                    Este es tu código único de conexión
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-center">
                  {generateCodeMutation.isPending ? (
                    <>
                      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-purple-600">Generando tu código único...</p>
                    </>
                  ) : (
                    <Button
                      onClick={() => generateCodeMutation.mutate()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Generar Código de Conexión
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-sm text-warm-gray-600 space-y-2">
              <p className="font-medium">Instrucciones:</p>
              <ul className="space-y-1 text-xs">
                <li>• Comparte este código con tu {currentUser.role === "madre" ? "hija" : "madre"}</li>
                <li>• Puede escanearlo con el código QR o escribir el código manualmente</li>
                <li>• Una vez conectadas, podrán compartir actividades y experiencias</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Connect with Code */}
        <Card className="shadow-lg border-pink-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-warm-gray-800 flex items-center">
              <Link className="w-5 h-5 mr-2 text-pink-600" />
              Conectar con Código
            </CardTitle>
            <CardDescription>
              ¿Tu {currentUser.role === "madre" ? "hija" : "madre"} ya tiene un código? Ingrésalo aquí
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connectionCode" className="text-sm font-medium">
                Código de conexión
              </Label>
              <Input
                id="connectionCode"
                type="text"
                placeholder="Ej: ABC123"
                value={connectionCode}
                onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-wider border-pink-200 focus:border-pink-400"
                maxLength={16}
              />
            </div>

            <Button 
              onClick={handleConnect}
              disabled={connectMutation.isPending || !connectionCode.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
            >
              {connectMutation.isPending ? "Conectando..." : "Establecer Conexión"}
            </Button>

            {connectMutation.isPending && (
              <div className="text-center">
                <div className="inline-flex items-center text-sm text-warm-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                  Verificando código de conexión...
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-orange-700 mb-2">
              <strong>¿Necesitas ayuda?</strong>
            </p>
            <p className="text-xs text-orange-600">
              Asegúrate de que ambas tengan la aplicación instalada y que el código sea correcto. 
              Los códigos de conexión son únicos para cada par madre-hija.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}