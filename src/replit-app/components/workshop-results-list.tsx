import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  MapPin, 
  Users, 
  Award,
  Clock,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WorkshopResult {
  id: string;
  connectionCode: string;
  madreId: string;
  hijaId: string;
  facilitador: string;
  fechaTaller: string;
  ubicacion: string;
  torresMadre?: string;
  torresHija?: string;
  torresConjuntas?: string;
  temasConversacion?: string;
  momentosEmocionales?: string;
  descubrimientosMutuos?: string;
  actividadesFavoritas?: string;
  compromisosFuturos?: string;
  observacionesFacilitador?: string;
  recomendacionesSeguimiento?: string;
  nivelConexionInicial?: number;
  nivelConexionFinal?: number;
  duracionTaller?: number;
  tipoTaller: string;
  numeroParticipantes: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkshopResultsListProps {
  onEdit?: (result: WorkshopResult) => void;
}

export default function WorkshopResultsList({ onEdit }: WorkshopResultsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Query para obtener todos los resultados de talleres
  const { data: results, isLoading, error } = useQuery<WorkshopResult[]>({
    queryKey: ["/api/admin/workshop/results"],
    queryFn: async () => {
      const response = await fetch("/api/admin/workshop/results");
      if (!response.ok) {
        throw new Error("Error fetching workshop results");
      }
      return response.json();
    }
  });

  // Mutation para eliminar resultados
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/workshop/results/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error deleting workshop result");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/workshop/results"] });
      toast({
        title: "Resultado eliminado",
        description: "El resultado del taller se eliminó correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el resultado del taller",
        variant: "destructive",
      });
    },
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const getConnectionLevel = (inicial?: number, final?: number) => {
    if (!inicial || !final) return null;
    const improvement = final - inicial;
    return { inicial, final, improvement };
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP", { locale: es });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-600">Error cargando resultados de talleres</p>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay resultados de talleres registrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Resultados de Talleres ({results.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {results.map((result) => {
          const isExpanded = expandedCards.has(result.id);
          const connectionLevel = getConnectionLevel(
            result.nivelConexionInicial, 
            result.nivelConexionFinal
          );

          return (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono">
                      {result.connectionCode}
                    </Badge>
                    <Badge variant={result.tipoTaller === "presencial" ? "default" : "outline"}>
                      {result.tipoTaller}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(result.id)}
                      data-testid={`button-toggle-${result.id}`}
                    >
                      <Eye className="h-4 w-4" />
                      {isExpanded ? "Ocultar" : "Ver detalles"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(result)}
                      data-testid={`button-edit-${result.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(result.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${result.id}`}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Información básica (siempre visible) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(result.fechaTaller)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{result.ubicacion}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Facilitador: {result.facilitador}
                    </span>
                  </div>

                  {result.duracionTaller && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {result.duracionTaller} minutos
                      </span>
                    </div>
                  )}

                  {connectionLevel && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Conexión: {connectionLevel.inicial} → {connectionLevel.final}
                        {connectionLevel.improvement > 0 && (
                          <span className="text-green-600 ml-1">
                            (+{connectionLevel.improvement})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detalles expandibles */}
                {isExpanded && (
                  <>
                    <Separator className="my-4" />
                    
                    <div className="space-y-6">
                      {/* Construcción LEGO */}
                      {(result.torresMadre || result.torresHija || result.torresConjuntas) && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            🧱 Construcción de Torres LEGO
                          </h4>
                          <div className="space-y-3 text-sm">
                            {result.torresMadre && (
                              <div>
                                <span className="font-medium text-pink-600">Madre:</span>
                                <p className="text-gray-700 mt-1">{result.torresMadre}</p>
                              </div>
                            )}
                            {result.torresHija && (
                              <div>
                                <span className="font-medium text-purple-600">Hija:</span>
                                <p className="text-gray-700 mt-1">{result.torresHija}</p>
                              </div>
                            )}
                            {result.torresConjuntas && (
                              <div>
                                <span className="font-medium text-blue-600">Conjunto:</span>
                                <p className="text-gray-700 mt-1">{result.torresConjuntas}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Comunicación */}
                      {(result.temasConversacion || result.momentosEmocionales || result.descubrimientosMutuos) && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            💬 Comunicación y Conversación
                          </h4>
                          <div className="space-y-3 text-sm">
                            {result.temasConversacion && (
                              <div>
                                <span className="font-medium">Temas de conversación:</span>
                                <p className="text-gray-700 mt-1">{result.temasConversacion}</p>
                              </div>
                            )}
                            {result.momentosEmocionales && (
                              <div>
                                <span className="font-medium">Momentos emocionales:</span>
                                <p className="text-gray-700 mt-1">{result.momentosEmocionales}</p>
                              </div>
                            )}
                            {result.descubrimientosMutuos && (
                              <div>
                                <span className="font-medium">Descubrimientos mutuos:</span>
                                <p className="text-gray-700 mt-1">{result.descubrimientosMutuos}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actividades de conexión */}
                      {(result.actividadesFavoritas || result.compromisosFuturos) && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Actividades de Conexión
                          </h4>
                          <div className="space-y-3 text-sm">
                            {result.actividadesFavoritas && (
                              <div>
                                <span className="font-medium">Actividades favoritas:</span>
                                <p className="text-gray-700 mt-1">{result.actividadesFavoritas}</p>
                              </div>
                            )}
                            {result.compromisosFuturos && (
                              <div>
                                <span className="font-medium">Compromisos futuros:</span>
                                <p className="text-gray-700 mt-1">{result.compromisosFuturos}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Observaciones del facilitador */}
                      {(result.observacionesFacilitador || result.recomendacionesSeguimiento) && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            👁️ Observaciones del Facilitador
                          </h4>
                          <div className="space-y-3 text-sm">
                            {result.observacionesFacilitador && (
                              <div>
                                <span className="font-medium">Observaciones:</span>
                                <p className="text-gray-700 mt-1">{result.observacionesFacilitador}</p>
                              </div>
                            )}
                            {result.recomendacionesSeguimiento && (
                              <div>
                                <span className="font-medium">Recomendaciones de seguimiento:</span>
                                <p className="text-gray-700 mt-1">{result.recomendacionesSeguimiento}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
