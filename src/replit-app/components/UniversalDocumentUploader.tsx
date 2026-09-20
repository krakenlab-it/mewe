import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, FolderOpen, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UniversalDocumentUploaderProps {
  userId: string;
  onDocumentSelect: (files: File[]) => void;
  buttonText?: string;
  buttonClassName?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

export function UniversalDocumentUploader({
  userId,
  onDocumentSelect,
  buttonText = "Subir documentos",
  buttonClassName = "",
  maxFiles = 5,
  maxFileSize = 10485760, // 10MB default
}: UniversalDocumentUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        description: `Solo puedes subir máximo ${maxFiles} documentos a la vez.`,
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

    // Validar tipos de archivo para documentos
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf'
    ];
    
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos PDF, Word, Excel, PowerPoint, texto y CSV.",
        variant: "destructive",
      });
      return;
    }

    onDocumentSelect(files);
    setIsOpen(false);

    toast({
      title: "Documentos seleccionados",
      description: `${files.length} documento(s) listo(s) para subir.`,
    });

    // Limpiar el input
    if (event.target) {
      event.target.value = '';
    }
  };

  const openFileExplorer = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className={buttonClassName} data-testid="button-upload-documents">
            <FileText className="w-4 h-4 mr-2" />
            {buttonText}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md" data-testid="dialog-document-upload">
          <DialogHeader>
            <DialogTitle>
              Carga o pega tus documentos o{" "}
              <span 
                className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                onClick={openFileExplorer}
              >
                busca archivos
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Botón principal para explorar archivos */}
            <Button
              onClick={openFileExplorer}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-browse-documents"
            >
              <FolderOpen className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">
                  <span className="underline">busca archivos</span>
                </div>
                <div className="text-sm opacity-90">
                  {isMobile 
                    ? "Explorar archivos del dispositivo" 
                    : "Explorar carpetas de la computadora"
                  }
                </div>
              </div>
            </Button>

            {/* Área de arrastrar y soltar solo para computadoras */}
            {!isMobile && (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={openFileExplorer}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  const documentFiles = files.filter(file => {
                    const validTypes = [
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                      'text/plain',
                      'text/csv',
                      'application/rtf'
                    ];
                    return validTypes.includes(file.type);
                  });
                  
                  if (documentFiles.length > 0) {
                    onDocumentSelect(documentFiles);
                    setIsOpen(false);
                    toast({
                      title: "Documentos agregados",
                      description: `${documentFiles.length} documento(s) listo(s) para subir.`,
                    });
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                data-testid="dropzone-documents"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Arrastra y suelta documentos aquí
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  O haz clic para buscar archivos
                </p>
              </div>
            )}

            {/* Información sobre tipos de archivo y límites */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Tipos de archivo permitidos:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>📄 <strong>Documentos:</strong> PDF, Word (.doc, .docx)</div>
                <div>📊 <strong>Hojas de cálculo:</strong> Excel (.xls, .xlsx)</div>
                <div>📋 <strong>Presentaciones:</strong> PowerPoint (.ppt, .pptx)</div>
                <div>📝 <strong>Texto:</strong> TXT, CSV, RTF</div>
              </div>
            </div>

            {/* Información sobre límites */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>• Máximo {maxFiles} documentos por vez</div>
              <div>• Tamaño máximo: {Math.round(maxFileSize / 1024 / 1024)}MB por archivo</div>
              <div>• Los documentos se procesan automáticamente para la IA</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}