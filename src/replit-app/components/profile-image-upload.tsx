import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Upload, X, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface ProfileImageUploadProps {
  user: User;
}

export default function ProfileImageUpload({ user }: ProfileImageUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    localStorage.getItem(`profileImage_${user.id}`) || null
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato no válido",
          description: "Por favor selecciona una imagen (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = () => {
    if (previewImage) {
      localStorage.setItem(`profileImage_${user.id}`, previewImage);
      setProfileImage(previewImage);
      setPreviewImage(null);
      setIsDialogOpen(false);
      
      toast({
        title: "✓ Foto guardada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });
    }
  };

  const handleRemoveImage = () => {
    localStorage.removeItem(`profileImage_${user.id}`);
    setProfileImage(null);
    setPreviewImage(null);
    setIsDialogOpen(false);
    
    toast({
      title: "✓ Foto eliminada",
      description: "Se ha eliminado tu foto de perfil",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button className="relative group">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-white border-opacity-30 hover:border-opacity-50 transition-all duration-200">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-white" />
              )}
              
              {/* Overlay al hacer hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
            
            {/* Indicador de "agregar foto" si no hay imagen */}
            {!profileImage && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-2 h-2 text-white" />
              </div>
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center space-x-2">
              <Camera className="w-5 h-5 text-purple-600" />
              <span>Foto de Perfil</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Vista previa de la imagen */}
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-purple-200">
                {previewImage || profileImage ? (
                  <img 
                    src={previewImage || profileImage || ""} 
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-purple-400" />
                )}
              </div>
            </div>

            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Botones de acción */}
            <div className="space-y-3">
              {previewImage ? (
                // Botones cuando hay imagen en preview
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveImage}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Guardar Foto
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewImage(null)}
                    className="px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                // Botones cuando no hay preview
                <>
                  <Button
                    onClick={triggerFileInput}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {profileImage ? "Cambiar Foto" : "Subir Foto"}
                  </Button>
                  
                  {profileImage && (
                    <Button
                      variant="outline"
                      onClick={handleRemoveImage}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Eliminar Foto
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Información sobre la funcionalidad */}
            <div className="text-center">
              <p className="text-xs text-warm-gray-500">
                Sube una foto tuya {user.role === "madre" ? "con tu hija" : "con tu madre"} para personalizar tu perfil
              </p>
              <p className="text-xs text-warm-gray-400 mt-1">
                Formato: JPG, PNG • Tamaño máximo: 5MB
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}