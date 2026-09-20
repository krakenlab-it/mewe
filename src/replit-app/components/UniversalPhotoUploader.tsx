import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, FolderOpen, Image, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UniversalPhotoUploaderProps {
  userId: string;
  onPhotoSelect: (files: File[]) => void;
  buttonText?: string;
  buttonClassName?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

export function UniversalPhotoUploader({
  userId,
  onPhotoSelect,
  buttonText = "Subir fotos",
  buttonClassName = "",
  maxFiles = 5,
  maxFileSize = 20971520, // 20MB default
}: UniversalPhotoUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Detectar si es dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validar número de archivos
    if (files.length > maxFiles) {
      toast({
        title: "Demasiados archivos",
        description: `Solo puedes subir máximo ${maxFiles} fotos a la vez.`,
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño de archivos
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Archivos muy grandes",
        description: `Algunos archivos superan el límite de ${Math.round(maxFileSize / 1024 / 1024)}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos JPG, PNG, GIF y WebP.",
        variant: "destructive",
      });
      return;
    }

    onPhotoSelect(files);
    setIsOpen(false);

    toast({
      title: "Fotos seleccionadas",
      description: `${files.length} foto(s) lista(s) para subir.`,
    });

    // Limpiar el input
    if (event.target) {
      event.target.value = '';
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const openFileExplorer = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className={buttonClassName} data-testid="button-upload-photos">
            <Image className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md" data-testid="dialog-photo-upload">
          <DialogHeader>
            <DialogTitle>
              Carga o pega tus imágenes
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isMobile ? (
              // Opciones para dispositivos móviles
              <>
                <Button
                  onClick={openCamera}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-open-camera"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Tomar foto</div>
                    <div className="text-sm opacity-90">Usar cámara del dispositivo</div>
                  </div>
                </Button>

                <Button
                  onClick={openGallery}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-open-gallery"
                >
                  <Image className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Galería de fotos</div>
                    <div className="text-sm opacity-90">Seleccionar de galería</div>
                  </div>
                </Button>
              </>
            ) : (
              // Opciones para computadoras
              <>
                <Button
                  onClick={openFileExplorer}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-browse-files"
                >
                  <FolderOpen className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">
                      <span className="underline cursor-pointer">busca archivos</span>
                    </div>
                    <div className="text-sm opacity-90">Explorar carpetas de la computadora</div>
                  </div>
                </Button>

                {/* Opción de cámara web si está disponible */}
                <Button
                  onClick={openCamera}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-use-webcam"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Cámara web</div>
                    <div className="text-sm opacity-90">Usar cámara de la computadora</div>
                  </div>
                </Button>
              </>
            )}

            {/* Área de arrastrar y soltar para computadoras */}
            {!isMobile && (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  const imageFiles = files.filter(file => file.type.startsWith('image/'));
                  if (imageFiles.length > 0) {
                    onPhotoSelect(imageFiles);
                    setIsOpen(false);
                    toast({
                      title: "Fotos agregadas",
                      description: `${imageFiles.length} foto(s) lista(s) para subir.`,
                    });
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                data-testid="dropzone-photos"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Arrastra y suelta fotos aquí
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  O usa los botones de arriba
                </p>
              </div>
            )}

            {/* Información sobre límites */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Máximo {maxFiles} fotos por vez</div>
              <div>• Tamaño máximo: {Math.round(maxFileSize / 1024 / 1024)}MB por foto</div>
              <div>• Formatos: JPG, PNG, GIF, WebP</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}