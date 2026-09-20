import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { FileText, Image, Users, Upload } from "lucide-react";
import { PhotoUploaderWithCloud } from "@/components/PhotoUploaderWithCloud";
import { DocumentUploaderWithCloud } from "@/components/DocumentUploaderWithCloud";
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
  type?: string;
}

export default function UniversalUploadDemo() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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

  const handleUploadComplete = (files: UploadedFile[], type: 'photo' | 'document') => {
    setUploadedFiles(prev => [...files, ...prev]);
    refetchFiles();
    
    toast({
      title: `¡${type === 'photo' ? 'Fotos' : 'Documentos'} guardados!`,
      description: `${files.length} archivo(s) subido(s) exitosamente al sistema.`,
    });
  };

  const getFileIcon = (fileName?: string, fileType?: string) => {
    if (fileType === 'image') {
      return <Image className="w-4 h-4 text-green-500" />;
    }
    
    // Safely handle undefined fileName
    if (!fileName) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <span className="text-red-500">📄</span>;
      case 'doc':
      case 'docx':
        return <span className="text-blue-500">📝</span>;
      case 'xls':
      case 'xlsx':
        return <span className="text-green-500">📊</span>;
      case 'ppt':
      case 'pptx':
        return <span className="text-orange-500">📋</span>;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  // Detectar dispositivo
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔄 Sistema Universal de Archivos
          </h1>
          <p className="text-gray-600">
            Sube fotos y documentos desde cualquier dispositivo
          </p>
          <div className="text-sm bg-blue-100 text-blue-800 inline-block px-3 py-1 rounded-full">
            {isMobile ? "📱 Dispositivo móvil detectado" : "💻 Computadora detectada"}
          </div>
        </div>

        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Seleccionar Usuario Demo
            </CardTitle>
            <CardDescription>
              Elige un usuario para asociar los archivos subidos
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

        {/* Upload Section */}
        {selectedUserId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Subir Archivos
              </CardTitle>
              <CardDescription>
                Selecciona el tipo de archivo que quieres subir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="photos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photos" className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Fotos
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documentos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="photos" className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">
                      📸 Opciones para fotos:
                    </h4>
                    <div className="text-sm text-green-700 space-y-1">
                      {isMobile ? (
                        <>
                          <div>• Tomar foto con cámara</div>
                          <div>• Seleccionar de galería de fotos</div>
                        </>
                      ) : (
                        <>
                          <div>• Explorar carpetas de la computadora</div>
                          <div>• Usar cámara web</div>
                          <div>• Arrastrar y soltar fotos</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <PhotoUploaderWithCloud
                    userId={selectedUserId}
                    onUploadComplete={(files) => handleUploadComplete(files, 'photo')}
                    buttonText="Carga o pega tus imágenes o busca archivos"
                    buttonClassName="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
                    maxFiles={10}
                  />
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      📄 Opciones para documentos:
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      {isMobile ? (
                        <>
                          <div>• Explorar archivos del dispositivo</div>
                          <div>• Seleccionar desde aplicaciones</div>
                        </>
                      ) : (
                        <>
                          <div>• <strong>Hacer clic en "busca archivos"</strong> para abrir explorador</div>
                          <div>• Arrastrar documentos desde carpetas</div>
                          <div>• PDF, Word, Excel, PowerPoint, texto</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <DocumentUploaderWithCloud
                    userId={selectedUserId}
                    onUploadComplete={(files) => handleUploadComplete(files, 'document')}
                    buttonText="Carga o pega tus documentos"
                    buttonClassName="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    maxFiles={10}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Recently Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Archivos Subidos Recientemente</CardTitle>
              <CardDescription>
                Últimos archivos subidos en esta sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg">
                      {getFileIcon(file.name, file.type || 'document')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(file.size / 1024)} KB • Subido recientemente
                      </p>
                    </div>
                    <div className="text-green-600 text-sm font-medium">
                      ✅ Subido
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
                      {getFileIcon(file.name || file.fileName, file.fileType)}
                      <div>
                        <p className="font-medium">{file.name || file.fileName || 'Archivo sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.fileType} • {file.size || file.fileSize ? `${Math.round((file.size || file.fileSize) / 1024)} KB` : 'Tamaño desconocido'}
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
                <h4 className="font-semibold">Elegir Tipo de Archivo</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Fotos:</strong> JPG, PNG, GIF, WebP desde cámara/galería/carpetas<br/>
                  <strong>Documentos:</strong> PDF, Word, Excel, PowerPoint desde <span className="text-blue-600 font-medium">"busca archivos"</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">3</div>
              <div>
                <h4 className="font-semibold">Subida Automática</h4>
                <p className="text-sm text-muted-foreground">Los archivos se suben automáticamente a la nube y quedan disponibles para la IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}