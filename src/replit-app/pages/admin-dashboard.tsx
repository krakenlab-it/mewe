import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Users, Heart, MessageCircle, Calendar, Database } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check admin authentication
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    setLocation("/admin/login");
    return null;
  }

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    }
  });

  const { data: moodEntries, isLoading: moodLoading } = useQuery({
    queryKey: ["/api/admin/mood-entries"],
    queryFn: async () => {
      const response = await fetch("/api/admin/mood-entries", {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar registros de humor");
      return response.json();
    }
  });

  const { data: botInteractions, isLoading: botLoading } = useQuery({
    queryKey: ["/api/admin/bot-interactions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/bot-interactions", {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar interacciones del bot");
      return response.json();
    }
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/admin/user-activities"],
    queryFn: async () => {
      const response = await fetch("/api/admin/user-activities", {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      if (!response.ok) throw new Error("Error al cargar actividades");
      return response.json();
    }
  });

  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }
    localStorage.removeItem("adminToken");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión del panel de administrador"
    });
    setLocation("/admin/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "madre" ? "default" : "secondary"}>
        {role === "madre" ? "Madre" : "Hija"}
      </Badge>
    );
  };

  const getMoodEmoji = (rating: number) => {
    const moodEmojis = ["😢", "😞", "😐", "😊", "😄"];
    return moodEmojis[rating - 1] || "😐";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Panel de Administrador - Me We
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              data-testid="button-admin-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registros de Humor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {moodEntries?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interacciones Bot</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {botInteractions?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Actividades</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activities?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="mood">Registros de Humor</TabsTrigger>
            <TabsTrigger value="bot">Interacciones Bot</TabsTrigger>
            <TabsTrigger value="activities">Actividades</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-center py-4">Cargando usuarios...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Edad</TableHead>
                        <TableHead>Código de Conexión</TableHead>
                        <TableHead>Fecha de Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.edad}</TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {user.connectionCode}
                            </code>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mood">
            <Card>
              <CardHeader>
                <CardTitle>Registros de Estado de Ánimo</CardTitle>
              </CardHeader>
              <CardContent>
                {moodLoading ? (
                  <p className="text-center py-4">Cargando registros...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Puntuación</TableHead>
                        <TableHead>Nota de Mejora</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {moodEntries?.map((entry: any) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.user?.firstName} {entry.user?.lastName}</TableCell>
                          <TableCell className="text-2xl">
                            {getMoodEmoji(entry.rating)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {entry.rating}/5
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {entry.improvementNote || "Sin nota"}
                          </TableCell>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bot">
            <Card>
              <CardHeader>
                <CardTitle>Interacciones con el Bot</CardTitle>
              </CardHeader>
              <CardContent>
                {botLoading ? (
                  <p className="text-center py-4">Cargando interacciones...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Mensaje</TableHead>
                        <TableHead>Respuesta</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {botInteractions?.map((interaction: any) => (
                        <TableRow key={interaction.id}>
                          <TableCell>{interaction.user?.firstName} {interaction.user?.lastName}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {interaction.userMessage}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {interaction.botResponse}
                          </TableCell>
                          <TableCell>{formatDate(interaction.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Actividades de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <p className="text-center py-4">Cargando actividades...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Actividad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Inicio</TableHead>
                        <TableHead>Fecha de Completado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities?.map((activity: any) => (
                        <TableRow key={activity.id}>
                          <TableCell>{activity.user?.firstName} {activity.user?.lastName}</TableCell>
                          <TableCell>{activity.activity?.nombre}</TableCell>
                          <TableCell>
                            <Badge variant={activity.status === "completed" ? "default" : "outline"}>
                              {activity.status === "completed" ? "Completada" : 
                               activity.status === "in_progress" ? "En Progreso" : 
                               "Disponible"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(activity.createdAt)}</TableCell>
                          <TableCell>
                            {activity.completedAt ? formatDate(activity.completedAt) : "No completada"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}