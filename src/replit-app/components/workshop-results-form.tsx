import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { adminAuthHeaders } from "@/lib/queryClient";
import { Loader2, Save, FileText, Users, Calendar, MapPin } from "lucide-react";

// Esquema de validación para resultados de talleres
const workshopResultSchema = z.object({
  connectionCode: z.string().min(1, "Código de conexión es requerido"),
  madreId: z.string().min(1, "ID de madre es requerido"),
  hijaId: z.string().min(1, "ID de hija es requerido"),
  facilitador: z.string().min(1, "Nombre del facilitador es requerido"),
  fechaTaller: z.string().min(1, "Fecha del taller es requerida"),
  ubicacion: z.string().min(1, "Ubicación es requerida"),
  
  // Resultados de construcción LEGO
  torresMadre: z.string().optional(),
  torresHija: z.string().optional(),
  torresConjuntas: z.string().optional(),
  
  // Resultados de comunicación
  temasConversacion: z.string().optional(),
  momentosEmocionales: z.string().optional(),
  descubrimientosMutuos: z.string().optional(),
  
  // Actividades de conexión
  actividadesFavoritas: z.string().optional(),
  compromisosFuturos: z.string().optional(),
  
  // Observaciones del facilitador
  observacionesFacilitador: z.string().optional(),
  recomendacionesSeguimiento: z.string().optional(),
  nivelConexionInicial: z.number().min(1).max(10).optional(),
  nivelConexionFinal: z.number().min(1).max(10).optional(),
  
  // Metadata
  duracionTaller: z.number().min(1, "Duración debe ser mayor a 0").optional(),
  tipoTaller: z.string().default("presencial"),
  numeroParticipantes: z.number().default(2),
});

type WorkshopResultFormData = z.infer<typeof workshopResultSchema>;

interface WorkshopResultsFormProps {
  onSuccess?: () => void;
  initialData?: Partial<WorkshopResultFormData>;
  isEdit?: boolean;
  resultId?: string;
}

export default function WorkshopResultsForm({ 
  onSuccess, 
  initialData, 
  isEdit = false, 
  resultId 
}: WorkshopResultsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<WorkshopResultFormData>({
    resolver: zodResolver(workshopResultSchema),
    defaultValues: {
      tipoTaller: "presencial",
      numeroParticipantes: 2,
      ...initialData,
    }
  });

  // Mutation para crear/actualizar resultados de talleres
  const workshopResultMutation = useMutation({
    mutationFn: async (data: WorkshopResultFormData) => {
      const url = isEdit && resultId 
        ? `/api/admin/workshop/results/${resultId}`
        : "/api/admin/workshop/results";
      
      const method = isEdit ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: adminAuthHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${isEdit ? 'actualizando' : 'creando'} resultado de taller`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workshop/results"] });
      toast({
        title: "Éxito",
        description: `Resultado de taller ${isEdit ? 'actualizado' : 'creado'} correctamente`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkshopResultFormData) => {
    workshopResultMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {isEdit ? "Editar Resultado de Taller" : "Nuevo Resultado de Taller"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información General */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Información General del Taller
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="connectionCode">Código de Conexión</Label>
                <Input
                  id="connectionCode"
                  data-testid="input-connection-code"
                  placeholder="Ej: RYAK65"
                  {...form.register("connectionCode")}
                />
                {form.formState.errors.connectionCode && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.connectionCode.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="facilitador">Facilitador</Label>
                <Input
                  id="facilitador"
                  data-testid="input-facilitador"
                  placeholder="Nombre del facilitador"
                  {...form.register("facilitador")}
                />
                {form.formState.errors.facilitador && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.facilitador.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fechaTaller">Fecha del Taller</Label>
                <Input
                  id="fechaTaller"
                  data-testid="input-fecha-taller"
                  type="datetime-local"
                  {...form.register("fechaTaller")}
                />
                {form.formState.errors.fechaTaller && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.fechaTaller.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  data-testid="input-ubicacion"
                  placeholder="Lugar donde se realizó el taller"
                  {...form.register("ubicacion")}
                />
                {form.formState.errors.ubicacion && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.ubicacion.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="madreId">ID de la Madre</Label>
                <Input
                  id="madreId"
                  data-testid="input-madre-id"
                  placeholder="ID único de la madre"
                  {...form.register("madreId")}
                />
              </div>

              <div>
                <Label htmlFor="hijaId">ID de la Hija</Label>
                <Input
                  id="hijaId"
                  data-testid="input-hija-id"
                  placeholder="ID único de la hija"
                  {...form.register("hijaId")}
                />
              </div>

              <div>
                <Label htmlFor="duracionTaller">Duración (minutos)</Label>
                <Input
                  id="duracionTaller"
                  data-testid="input-duracion"
                  type="number"
                  min="1"
                  placeholder="120"
                  {...form.register("duracionTaller", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="tipoTaller">Tipo de Taller</Label>
                <Select
                  value={form.watch("tipoTaller")}
                  onValueChange={(value) => form.setValue("tipoTaller", value)}
                >
                  <SelectTrigger data-testid="select-tipo-taller">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resultados de Construcción LEGO */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🧱 Construcción de Torres LEGO
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="torresMadre">Torres construidas por la Madre</Label>
                <Textarea
                  id="torresMadre"
                  data-testid="textarea-torres-madre"
                  placeholder="Describe las torres LEGO que construyó la madre..."
                  rows={3}
                  {...form.register("torresMadre")}
                />
              </div>

              <div>
                <Label htmlFor="torresHija">Torres construidas por la Hija</Label>
                <Textarea
                  id="torresHija"
                  data-testid="textarea-torres-hija"
                  placeholder="Describe las torres LEGO que construyó la hija..."
                  rows={3}
                  {...form.register("torresHija")}
                />
              </div>

              <div>
                <Label htmlFor="torresConjuntas">Torres construidas en conjunto</Label>
                <Textarea
                  id="torresConjuntas"
                  data-testid="textarea-torres-conjuntas"
                  placeholder="Describe las torres LEGO que construyeron juntas..."
                  rows={3}
                  {...form.register("torresConjuntas")}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Resultados de Comunicación */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              💬 Comunicación y Conversación
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="temasConversacion">Temas principales de conversación</Label>
                <Textarea
                  id="temasConversacion"
                  data-testid="textarea-temas-conversacion"
                  placeholder="¿De qué hablaron madre e hija durante el taller?"
                  rows={3}
                  {...form.register("temasConversacion")}
                />
              </div>

              <div>
                <Label htmlFor="momentosEmocionales">Momentos emocionales destacados</Label>
                <Textarea
                  id="momentosEmocionales"
                  data-testid="textarea-momentos-emocionales"
                  placeholder="Describe momentos emotivos o significativos durante el taller..."
                  rows={3}
                  {...form.register("momentosEmocionales")}
                />
              </div>

              <div>
                <Label htmlFor="descubrimientosMutuos">Descubrimientos mutuos</Label>
                <Textarea
                  id="descubrimientosMutuos"
                  data-testid="textarea-descubrimientos"
                  placeholder="¿Qué descubrieron una de la otra durante el taller?"
                  rows={3}
                  {...form.register("descubrimientosMutuos")}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actividades de Conexión */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Actividades de Conexión
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="actividadesFavoritas">Actividades que más disfrutaron</Label>
                <Textarea
                  id="actividadesFavoritas"
                  data-testid="textarea-actividades-favoritas"
                  placeholder="¿Cuáles fueron las actividades preferidas durante el taller?"
                  rows={3}
                  {...form.register("actividadesFavoritas")}
                />
              </div>

              <div>
                <Label htmlFor="compromisosFuturos">Compromisos establecidos para el futuro</Label>
                <Textarea
                  id="compromisosFuturos"
                  data-testid="textarea-compromisos"
                  placeholder="¿Qué compromisos establecieron para continuar fortaleciendo su relación?"
                  rows={3}
                  {...form.register("compromisosFuturos")}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Observaciones del Facilitador */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              👁️ Observaciones del Facilitador
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nivelConexionInicial">Nivel de conexión inicial (1-10)</Label>
                  <Input
                    id="nivelConexionInicial"
                    data-testid="input-conexion-inicial"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="5"
                    {...form.register("nivelConexionInicial", { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="nivelConexionFinal">Nivel de conexión final (1-10)</Label>
                  <Input
                    id="nivelConexionFinal"
                    data-testid="input-conexion-final"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="8"
                    {...form.register("nivelConexionFinal", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacionesFacilitador">Observaciones generales</Label>
                <Textarea
                  id="observacionesFacilitador"
                  data-testid="textarea-observaciones"
                  placeholder="Observaciones profesionales del facilitador sobre el desarrollo del taller..."
                  rows={4}
                  {...form.register("observacionesFacilitador")}
                />
              </div>

              <div>
                <Label htmlFor="recomendacionesSeguimiento">Recomendaciones de seguimiento</Label>
                <Textarea
                  id="recomendacionesSeguimiento"
                  data-testid="textarea-recomendaciones"
                  placeholder="Recomendaciones para fortalecer la relación madre-hija después del taller..."
                  rows={4}
                  {...form.register("recomendacionesSeguimiento")}
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="submit"
              disabled={workshopResultMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-save-result"
            >
              {workshopResultMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? "Actualizar Resultado" : "Guardar Resultado"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
