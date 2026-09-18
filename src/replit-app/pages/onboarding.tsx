import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertUser } from "@shared/schema";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    edad: "",
    role: "",
    fechaTaller: undefined as Date | undefined,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "¡Bienvenida!",
        description: `Hola ${user.nombre}, tu perfil ha sido creado exitosamente.`,
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Hubo un problema al crear tu perfil. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.nombre || !formData.apellido || !formData.edad || !formData.role || !formData.fechaTaller) {
      toast({
        title: "Faltan datos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    const userData: InsertUser = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      edad: parseInt(formData.edad),
      role: formData.role,
      fechaTaller: formData.fechaTaller,
    };

    createUserMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👩‍👧</span>
            </div>
            <h1 className="text-2xl font-bold text-warm-gray-800 mb-2">
              Me We
            </h1>
            <p className="text-warm-gray-600">
              Juntas en Conexión, Fuertes en Confianza
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center text-warm-gray-800">
                Crear tu perfil
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Tu apellido"
                  />
                </div>

                <div>
                  <Label htmlFor="edad">Edad</Label>
                  <Input
                    id="edad"
                    type="number"
                    value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                    placeholder="Tu edad"
                  />
                </div>

                <div>
                  <Label>Soy...</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="madre">Madre</SelectItem>
                      <SelectItem value="hija">Hija</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full"
                  disabled={!formData.nombre || !formData.apellido || !formData.edad || !formData.role}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center text-warm-gray-800">
                Fecha del taller
              </h2>
              
              <div>
                <Label>¿Cuándo asististe o asistirás al taller?</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fechaTaller ? (
                        format(formData.fechaTaller, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.fechaTaller}
                      onSelect={(date) => setFormData({ ...formData, fechaTaller: date })}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={createUserMutation.isPending || !formData.fechaTaller}
                >
                  {createUserMutation.isPending ? "Creando..." : "Crear perfil"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
