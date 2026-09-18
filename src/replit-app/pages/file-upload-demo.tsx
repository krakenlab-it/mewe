import { useState } from "react";
import { FileSystemUploader } from "@/components/FileSystemUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { FileText, Image, Upload, Users, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type definitions for the demo
interface DemoUser {
  id: string;
  nombre: string;
  apellido: string;
  role: string;
  email: string;
  edad: number;
}

interface UserFile {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  createdAt: string;
  aiProcessingStatus: string;
}

export default function FileUploadDemo() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { toast } = useToast();

  // Fetch demo users
  const { data: users = [], isLoading: usersLoading } = useQuery<DemoUser[]>({
    queryKey: ["/api/demo/users"],
  });

  // Fetch user files when user is selected
  const { data: userFiles = [], refetch: refetchFiles } = useQuery<UserFile[]>({
    queryKey: ["/api/users", selectedUserId, "files"],
    enabled: !!selectedUserId,
  });



  const testEnhancedAI = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Selecciona un usuario primero.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/bot/enhanced-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          message: "¿Qué actividades me recomiendas basándote en mis archivos?",
          includeFiles: true
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      
      const data = await response.json();
      
      toast({
        title: "Respuesta de IA mejorada",
        description: `La IA procesó ${data.filesUsed} archivos para generar una respuesta personalizada.`,
      });

      console.log('AI Response:', data.response);
      console.log('Files Used:', data.filesUsed);
      console.log('Has File Context:', data.hasFileContext);
    } catch (error) {
      console.error('Error testing enhanced AI:', error);
      toast({
        title: "Error",
        description: "No se pudo obtener respuesta de IA mejorada.",
        variant: "destructive",
      });
    }
  };

  const selectedUser = users.find((u: DemoUser) => u.id === selectedUserId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sistema Avanzado de Carga de Archivos</h1>
        <p className="text-muted-foreground">
          Demuestra la carga de documentos e imágenes con integración IA para actividades personalizadas
        </p>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Seleccionar Usuario de Demostración
          </CardTitle>
          <CardDescription>
            Elige un usuario demo para probar la funcionalidad de carga de archivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un usuario..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: DemoUser) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.nombre} {user.apellido} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedUser && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Usuario seleccionado:</strong> {selectedUser.nombre} {selectedUser.apellido}
              </p>
              <p className="text-sm text-muted-foreground">
                Rol: {selectedUser.role} | Edad: {selectedUser.edad} años
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Section */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Carga de Archivos
            </CardTitle>
            <CardDescription>
              Sube documentos e imágenes que serán accesibles para la IA para generar actividades personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Upload */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documentos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sube documentos Word, PDF, Excel, texto
                </p>
                <FileSystemUploader
                  userId={selectedUserId}
                  fileType="document"
                  maxFiles={3}
                  onFileSelect={() => refetchFiles()}
                  buttonClassName="w-full bg-blue-600 hover:bg-blue-700"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Imágenes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sube fotos JPG, PNG, GIF con cámara
                </p>
                <FileSystemUploader
                  userId={selectedUserId}
                  fileType="image"
                  maxFiles={5}
                  onFileSelect={() => refetchFiles()}
                  buttonClassName="w-full bg-green-600 hover:bg-green-700"
                />
              </div>
            </div>

            {/* AI Test Button */}
            <div className="mt-6 pt-4 border-t">
              <Button 
                onClick={testEnhancedAI}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Bot className="w-4 h-4 mr-2" />
                Probar IA con archivos subidos
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                La IA analizará los archivos subidos para generar actividades personalizadas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Files List */}
      {selectedUserId && userFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archivos del Usuario</CardTitle>
            <CardDescription>
              Lista de archivos subidos disponibles para procesamiento de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userFiles.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {file.fileType === 'document' ? (
                      <FileText className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Image className="w-4 h-4 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.fileType} • {file.fileSize ? `${Math.round(file.fileSize / 1024)} KB` : 'Tamaño desconocido'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {file.aiProcessingStatus === 'processed' ? '✅ Procesado' : '⏳ Pendiente'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}



      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">1</div>
            <div>
              <h4 className="font-semibold">Seleccionar Usuario</h4>
              <p className="text-sm text-muted-foreground">Elige un usuario demo para asociar los archivos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">2</div>
            <div>
              <h4 className="font-semibold">Subir Archivos</h4>
              <p className="text-sm text-muted-foreground">Usa los botones para subir documentos o imágenes. Las imágenes incluyen opción de cámara</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">3</div>
            <div>
              <h4 className="font-semibold">Probar IA</h4>
              <p className="text-sm text-muted-foreground">Haz clic en "Probar IA" para ver cómo los archivos mejoran las respuestas personalizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}