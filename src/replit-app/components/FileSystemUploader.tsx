import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Image, Upload, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileSystemUploaderProps {
  userId: string;
  fileType: 'document' | 'image';
  onFileSelect?: (files: File[]) => void;
  buttonClassName?: string;
  maxFiles?: number;
}

/**
 * Simple file system uploader that opens the computer's file explorer
 * to select files from folders and directories.
 */
export function FileSystemUploader({
  userId,
  fileType,
  onFileSelect,
  buttonClassName,
  maxFiles = 5
}: FileSystemUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // File type restrictions based on type
  const getAcceptedTypes = () => {
    if (fileType === 'document') {
      return '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv';
    } else {
      return '.jpg,.jpeg,.png,.gif,.webp';
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      toast({
        title: "Demasiados archivos",
        description: `Solo puedes seleccionar hasta ${maxFiles} archivos a la vez.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload each file
      for (const file of files) {
        await uploadFile(file);
      }

      toast({
        title: "Archivos cargados exitosamente",
        description: `${files.length} archivo(s) subido(s) desde tu computadora.`,
      });

      // Notify parent component
      onFileSelect?.(files);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar los archivos.",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File) => {
    // Get upload URL
    const uploadResponse = await fetch(`/api/users/${userId}/files/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileType }),
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadURL } = await uploadResponse.json();

    // Upload file to S3
    const uploadFileResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadFileResponse.ok) {
      throw new Error('Failed to upload file');
    }

    // Save file metadata
    const metadataResponse = await fetch(`/api/users/${userId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadURL,
      }),
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to save file metadata');
    }

    return metadataResponse.json();
  };

  const getButtonIcon = () => {
    if (fileType === 'document') {
      return <FileText className="w-4 h-4" />;
    } else {
      return <Image className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    if (fileType === 'document') {
      return 'Buscar documentos';
    } else {
      return 'Buscar imágenes';
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptedTypes()}
        onChange={handleFileChange}
        className="hidden"
        data-testid={`file-input-${fileType}`}
      />

      {/* Upload button */}
      <Button 
        onClick={handleFileClick}
        className={buttonClassName}
        size="sm"
        data-testid={`button-upload-${fileType}`}
      >
        {getButtonIcon()}
        <FolderOpen className="w-4 h-4 ml-1" />
        <span className="ml-2">{getButtonText()}</span>
      </Button>
    </>
  );
}