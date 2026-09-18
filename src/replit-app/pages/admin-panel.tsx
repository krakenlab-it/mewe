import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, RefreshCw, Trash2, Plus, Shield, Database, UserCheck, LogOut, FileText, ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkshopResultsForm from "@/components/workshop-results-form";
import WorkshopResultsList from "@/components/workshop-results-list";

interface Connection {
  connectionCode: string;
  madre: {
    id: string;
    nombre: string;
    edad: number;
    email: string;
  };
  hija: {
    id: string;
    nombre: string;
    edad: number;
    email: string;
  };
}

interface ConnectionsResponse {
  totalConnections: number;
  connections: Connection[];
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showResultForm, setShowResultForm] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin/login");
      return;
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setLocation("/admin/login");
  };

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");

  // Query para obtener conexiones demo
  const { data: connectionsData, isLoading, refetch } = useQuery<ConnectionsResponse>({
    queryKey: ["/api/demo/connections"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/demo/connections");
      return response.json();
    }
  });

  // Mutation para cargar datos demo
  const seedDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/demo/seed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo/connections"] });
      toast({
        title: "Datos demo cargados",
        description: `Se crearon ${data.pairsCreated} nuevos pares madre-hija`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos demo",
        variant: "destructive",
      });
    },
  });

  // Mutation para limpiar datos demo
  const cleanDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/demo/clean");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/demo/connections"] });
      toast({
        title: "Datos demo eliminados",
        description: `Se eliminaron ${data.usersDeleted} usuarios demo`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los datos demo",
        variant: "destructive",
      });
    },
  });

  // Funciones para manejar resultados de talleres
  const handleEditResult = (result: any) => {
    setSelectedResult(result);
    setShowResultForm(true);
  };

  const handleNewResult = () => {
    setSelectedResult(null);
    setShowResultForm(true);
  };

  const handleResultFormSuccess = () => {
    setShowResultForm(false);
    setSelectedResult(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {adminUser && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.nombre}</p>
                <p className="text-xs text-gray-500">{adminUser.email}</p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Gestión de datos de prueba y configuración del sistema Me We
        </p>
        <div className="mt-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg inline-flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700 font-medium">Acceso restringido - Solo administradores</span>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="demo-data" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demo-data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Datos Demo
          </TabsTrigger>
          <TabsTrigger value="workshop-results" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resultados de Talleres
          </TabsTrigger>
        </TabsList>

        {/* Demo Data Tab */}
        <TabsContent value="demo-data" className="space-y-6">
          {/* Demo Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Gestión de Datos Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Herramientas para cargar y gestionar datos de prueba basados en familias ecuatorianas reales
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => seedDataMutation.mutate()}
                    disabled={seedDataMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {seedDataMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Cargar Datos Demo
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Actualizar
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => cleanDataMutation.mutate()}
                    disabled={cleanDataMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {cleanDataMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Limpiar Datos Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {connectionsData && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold">{connectionsData.totalConnections}</span>
                  <span className="text-gray-600">pares demo conectados</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connections Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : connectionsData?.connections.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No hay datos demo cargados</p>
                <Button
                  onClick={() => seedDataMutation.mutate()}
                  disabled={seedDataMutation.isPending}
                >
                  Cargar Datos Demo Iniciales
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Conexiones Demo Activas ({connectionsData?.connections.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectionsData?.connections.map((connection) => (
                  <Card key={connection.connectionCode} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          <Badge variant="secondary" className="font-mono">
                            {connection.connectionCode}
                          </Badge>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Madre */}
                        <div className="bg-pink-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-pink-700">👩 Madre</span>
                          </div>
                          <p className="font-semibold text-gray-900">{connection.madre.nombre}</p>
                          <p className="text-sm text-gray-600">{connection.madre.edad} años</p>
                          <p className="text-xs text-gray-500 break-all">{connection.madre.email}</p>
                        </div>

                        {/* Hija */}
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-purple-700">👧 Hija</span>
                          </div>
                          <p className="font-semibold text-gray-900">{connection.hija.nombre}</p>
                          <p className="text-sm text-gray-600">{connection.hija.edad} años</p>
                          <p className="text-xs text-gray-500 break-all">{connection.hija.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Workshop Results Tab */}
        <TabsContent value="workshop-results" className="space-y-6">
          {showResultForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {selectedResult ? "Editar Resultado de Taller" : "Nuevo Resultado de Taller"}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setShowResultForm(false)}
                  data-testid="button-cancel-form"
                >
                  Cancelar
                </Button>
              </div>
              
              <WorkshopResultsForm
                initialData={selectedResult}
                isEdit={!!selectedResult}
                resultId={selectedResult?.id}
                onSuccess={handleResultFormSuccess}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Gestión de Resultados de Talleres
                </h3>
                <Button
                  onClick={handleNewResult}
                  className="flex items-center gap-2"
                  data-testid="button-new-result"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Resultado
                </Button>
              </div>
              
              <WorkshopResultsList onEdit={handleEditResult} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}