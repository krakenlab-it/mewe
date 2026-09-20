import { useState } from "react";
import { UniversalDocumentUploader } from "./UniversalDocumentUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploaderWithCloudProps {
  userId: string;
  onUploadComplete?: (uploadedFiles: UploadedFile[]) => void;
  buttonText?: string;
  buttonClassName?: string;
  maxFiles?: number;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export function DocumentUploaderWithCloud({
  userId,
  onUploadComplete,
  buttonText = "Subir documentos",
  buttonClassName = "",
  maxFiles = 5,
}: DocumentUploaderWithCloudProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      case 'txt':
        return '📃';
      case 'csv':
        return '📈';
      default:
        return '📄';
    }
  };

  const handleDocumentSelect = async (files: File[]) => {
    // Crear cola de subida
    const newQueue: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadQueue(newQueue);
    setIsUploading(true);

    const uploadedFiles: UploadedFile[] = [];

    // Subir archivos uno por uno
    for (let i = 0; i < newQueue.length; i++) {
      const item = newQueue[i];
      
      try {
        // Actualizar estado a "subiendo"
        setUploadQueue(prev => prev.map((q, idx) => 
          idx === i ? { ...q, status: 'uploading' } : q
        ));

        // Obtener URL de subida del backend
        const uploadResponse = await fetch(`/api/users/${userId}/files/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileType: 'document' }),
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadURL } = await uploadResponse.json();

        // Subir archivo directamente a AWS
        const uploadToAWS = await fetch(uploadURL, {
          method: 'PUT',
          body: item.file,
          headers: {
            'Content-Type': item.file.type,
          },
        });

        if (!uploadToAWS.ok) {
          throw new Error('Failed to upload to cloud storage');
        }

        // Actualizar metadatos en el backend
        const metadataResponse = await fetch(`/api/users/${userId}/files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: item.file.name,
            fileType: 'document',
            fileSize: item.file.size,
            uploadURL: uploadURL, // Pass the complete upload URL
          }),
        });

        if (!metadataResponse.ok) {
          throw new Error('Failed to save file metadata');
        }

        const savedFile = await metadataResponse.json();

        // Marcar como completado
        setUploadQueue(prev => prev.map((q, idx) => 
          idx === i ? { 
            ...q, 
            status: 'completed', 
            progress: 100,
            url: savedFile.fileUrl 
          } : q
        ));

        uploadedFiles.push({
          name: item.file.name,
          url: savedFile.fileUrl,
          size: item.file.size,
          type: item.file.type,
        });

      } catch (error) {
        console.error('Upload error:', error);
        
        // Marcar como error
        setUploadQueue(prev => prev.map((q, idx) => 
          idx === i ? { 
            ...q, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido'
          } : q
        ));
      }
    }

    setIsUploading(false);

    // Notificar finalización
    if (uploadedFiles.length > 0) {
      toast({
        title: "Documentos subidos exitosamente",
        description: `${uploadedFiles.length} documento(s) subido(s) a la nube.`,
      });

      onUploadComplete?.(uploadedFiles);
    }

    // Limpiar cola después de 3 segundos si todo está completado
    setTimeout(() => {
      setUploadQueue(prev => {
        const hasErrors = prev.some(item => item.status === 'error');
        const allCompleted = prev.every(item => item.status === 'completed' || item.status === 'error');
        return hasErrors || !allCompleted ? prev : [];
      });
    }, 3000);
  };

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
  };

  const retryUpload = (index: number) => {
    const item = uploadQueue[index];
    if (item && item.status === 'error') {
      handleDocumentSelect([item.file]);
    }
  };

  return (
    <div className="space-y-4">
      <UniversalDocumentUploader
        userId={userId}
        onDocumentSelect={handleDocumentSelect}
        buttonText={buttonText}
        buttonClassName={buttonClassName}
        maxFiles={maxFiles}
      />

      {/* Cola de subida */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Subiendo documentos {isUploading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadQueue.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">
                  {getFileIcon(item.file.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {item.file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {item.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                      {item.status === 'error' && (
                        <div className="flex items-center gap-1">
                          <X className="w-4 h-4 text-red-600" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryUpload(index)}
                            className="h-6 px-2 text-xs"
                          >
                            Reintentar
                          </Button>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromQueue(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{Math.round(item.file.size / 1024)} KB</span>
                    {item.status === 'error' && item.error && (
                      <span className="text-red-600">{item.error}</span>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-green-600">Subido exitosamente</span>
                    )}
                    {item.status === 'uploading' && (
                      <span className="text-blue-600">Subiendo...</span>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  {item.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}