import { useState, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, FileText, Image, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdvancedFileUploaderProps {
  userId: string;
  fileType: 'document' | 'image';
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => void;
  buttonClassName?: string;
  children?: ReactNode;
  allowCamera?: boolean; // Only for images
}

/**
 * Advanced file upload component with support for documents, images, and camera capture.
 * 
 * Features:
 * - Document upload: Word, PDF, Excel, text files
 * - Image upload: JPG, PNG, GIF, WebP
 * - Camera capture: Direct photo taking for images
 * - File explorer integration: Access computer's file system
 * - AWS S3 storage: Organized by user and file type
 * - AI integration ready: Files accessible to AI for processing
 * 
 * File Organization:
 * - /users/{userId}/documents/{date}/{fileId}
 * - /users/{userId}/images/{date}/{fileId}
 */
export function AdvancedFileUploader({
  userId,
  fileType,
  maxNumberOfFiles = 5,
  maxFileSize = 50485760, // 50MB default
  onComplete,
  buttonClassName,
  children,
  allowCamera = false,
}: AdvancedFileUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // File type restrictions
  const getFileTypeRestrictions = () => {
    if (fileType === 'document') {
      return {
        allowedFileTypes: [
          '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv'
        ]
      };
    } else {
      return {
        allowedFileTypes: [
          '.jpg', '.jpeg', '.png', '.gif', '.webp',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ]
      };
    }
  };

  const getUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          fileType 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      toast({
        title: "Error",
        description: "No se pudo obtener la URL de carga. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleFileComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      // Set ACL policy for uploaded files
      const successful = result.successful || [];
      for (const file of successful) {
        const response = await fetch('/api/objects/acl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileURL: file.uploadURL,
            userId,
            visibility: 'private', // Files are private by default, accessible to family
            fileType,
          }),
        });

        if (!response.ok) {
          console.error('Failed to set ACL policy');
        }
      }

      toast({
        title: "Carga exitosa",
        description: `${successful.length} archivo(s) subido(s) correctamente.`,
      });

      onComplete?.(result);
    } catch (error) {
      console.error('Error processing upload completion:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar los archivos subidos.",
        variant: "destructive",
      });
    }
  };

  const [uppy] = useState(() => {
    const restrictions = getFileTypeRestrictions();
    return new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: restrictions.allowedFileTypes,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters,
      })
      .on("complete", handleFileComplete);
  });

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCameraModal(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        // Create a file from the blob
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Add to uppy
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
          source: 'camera',
        });

        stopCamera();
        setShowModal(true);

        toast({
          title: "Foto capturada",
          description: "La foto se ha añadido para subir.",
        });
      } catch (error) {
        console.error('Error capturing photo:', error);
        toast({
          title: "Error",
          description: "No se pudo capturar la foto.",
          variant: "destructive",
        });
      }
    }, 'image/jpeg', 0.8);
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
      return 'Subir documentos';
    } else {
      return 'Subir imágenes';
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Main upload button */}
        <Button 
          onClick={() => setShowModal(true)} 
          className={buttonClassName}
          size="sm"
        >
          {children || (
            <>
              {getButtonIcon()}
              <span className="ml-2">{getButtonText()}</span>
            </>
          )}
        </Button>

        {/* Camera button for images */}
        {fileType === 'image' && allowCamera && (
          <Button 
            onClick={startCamera}
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Camera className="w-4 h-4" />
            <span className="ml-2">Cámara</span>
          </Button>
        )}
      </div>

      {/* File Upload Modal */}
      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        locale={{
          strings: {
            dropPasteFiles: `Arrastra o pega tus ${fileType === 'document' ? 'documentos' : 'imágenes'} aquí`,
            browseFiles: 'Buscar archivos',
            uploadComplete: 'Carga completada',
            uploadFailed: 'Carga fallida',
            retry: 'Reintentar',
            cancel: 'Cancelar',
            done: 'Listo',
          }
        }}
      />

      {/* Camera Modal */}
      <Dialog open={showCameraModal} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Tomar foto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <canvas 
                ref={canvasRef}
                className="hidden"
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="w-4 h-4 mr-2" />
                Capturar
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}