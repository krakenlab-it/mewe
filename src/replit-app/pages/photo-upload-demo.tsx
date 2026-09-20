import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Camera, Users, Image } from "lucide-react";
import { PhotoUploaderWithCloud } from "@/components/PhotoUploaderWithCloud";
import { useToast } from "@/hooks/use-toast";

// Type definitions for the demo
interface DemoUser {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  role: string;
  email: string;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

export default function PhotoUploadDemo() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  // Fetch demo users
  const { data: users = [], isLoading: usersLoading } = useQuery<DemoUser[]>({
    queryKey: ["/api/demo/users"],
  });

  // Fetch user files
  const { data: userFiles = [], refetch: refetchFiles } = useQuery<any[]>({
    queryKey: ["/api/users", selectedUserId, "files"],
    enabled: !!selectedUserId,
  });

  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedPhotos(prev => [...files, ...prev]);
    refetchFiles();
    
    toast({
      title: "¡Fotos guardadas!",
      description: `${files.length} foto(s) subida(s) exitosamente al sistema.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            📸 Sistema Universal de Fotos
          </h1>
          <p className="text-gray-600">
            Sube fotos desde galería movil, cámara os carpetas de computadora
          </p>
        </div>

        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Seleccionar Usuario Demo
            </CardTitle>
            <CardDescription>
              Elige un usuario para asociar las fotos subidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un usuario demo..." />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <SelectItem value="loading" disabled>Cargando usuarios...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nombre} {user.apellido} ({user.role}, {user.edad} años)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Photo Upload Section */}
        {selectedUserId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Subir Fotos
              </CardTitle>
              <CardDescription>
                Compatible con móviles (galería/cámara) y computadoras (explorador/cámara web)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Uploader principal */}
                <PhotoUploaderWithCloud
                  userId={selectedUserId}
                  onUploadComplete={handleUploadComplete}
                  buttonText="Carga o pega tus imágenes o busca archivos"
                  buttonClassName="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                  maxFiles={10}
                />

                {/* Información del dispositivo */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Opciones disponibles en tu dispositivo:
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (
                      <>
                        <div>📱 <strong>Móvil detectado:</strong></div>
                        <div>• Tomar foto con cámara</div>
                        <div>• Seleccionar de galería de fotos</div>
                      </>
                    ) : (
                      <>
                        <div>💻 <strong>Computadora detectada:</strong></div>
                        <div>• Explorar carpetas y archivos</div>
                        <div>• Usar cámara web</div>
                        <div>• Arrastrar y soltar fotos</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recently Uploaded Photos */}
        {uploadedPhotos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fotos Subidas Recientemente</CardTitle>
              <CardDescription>
                Últimas fotos subidas en esta sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-medium truncate">{photo.name}</p>
                      <p className="text-gray-500">{Math.round(photo.size / 1024)} KB</p>
                      <p className="text-green-600">✅ Subido</p>
                    </div>
                  </div>
                ))}
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
                Todos los archivos asociados a este usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userFiles.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Image className="w-4 h-4 text-green-500" />
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
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">1</div>
              <div>
                <h4 className="font-semibold">Seleccionar Usuario</h4>
                <p className="text-sm text-muted-foreground">Elige un usuario demo para asociar las fotos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">2</div>
              <div>
                <h4 className="font-semibold">Subir Fotos</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Móvil:</strong> Tomar foto o seleccionar de galería<br/>
                  <strong>Computadora:</strong> Buscar archivos, usar cámara web o arrastrar fotos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">3</div>
              <div>
                <h4 className="font-semibold">Subida Automática</h4>
                <p className="text-sm text-muted-foreground">Las fotos se suben automáticamente a la nube y quedan disponibles para la IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}