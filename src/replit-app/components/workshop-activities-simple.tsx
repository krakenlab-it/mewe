import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Image, Upload } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { WorkshopInfoForm } from "@/components/workshop-info-form";
import type { User } from "@shared/schema";

interface WorkshopActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  color: string;
  status: "Disponible" | "Completado" | "Bloqueado";
}

const workshopActivities: WorkshopActivity[] = [
  {
    id: "1",
    title: "Construcción de Torres",
    description: "Construye una torre que represente tu vida usando LEGO",
    duration: "15 min",
    icon: "🏗️",
    color: "bg-orange-500",
    status: "Disponible"
  },
  {
    id: "2", 
    title: "Tiny Monsters",
    description: "Identifica tus miedos y conviértelos en amigos",
    duration: "20 min",
    icon: "⭐",
    color: "bg-purple-500",
    status: "Disponible"
  },
  {
    id: "3",
    title: "Escucho para comprender",
    description: "Comparte cómo te sientes con tu hija/madre",
    duration: "10 min", 
    icon: "💬",
    color: "bg-blue-500",
    status: "Disponible"
  }
];

interface WorkshopActivitiesSimpleProps {
  user: User;
}

export function WorkshopActivitiesSimple({ user }: WorkshopActivitiesSimpleProps) {
  const [activityStates, setActivityStates] = useState<Record<string, "Disponible" | "Cargados">>({
    "1": "Disponible", // Construcción de Torres
    "2": "Disponible", // Tiny Monsters  
    "3": "Disponible"  // Escucho para comprender
  });

  // Fetch user files to check activity status
  const { data: userFiles, refetch: refetchFiles } = useQuery({
    queryKey: [`/api/users/${user.id}/files`],
    enabled: !!user.id,
  });

  // Update activity states based on uploaded files
  useEffect(() => {
    if (userFiles && Array.isArray(userFiles)) {
      const newStates = { ...activityStates };
      
      console.log('🔍 Checking user files for activities:', userFiles);
      
      // Check each activity for uploaded files
      workshopActivities.forEach(activity => {
        const hasFiles = userFiles.some((file: any) => {
          console.log(`🔍 Checking file for activity ${activity.id}:`, file);
          
          // Check multiple ways files could be linked to activities
          const matchesActivityId = file.activityId === activity.id || file.activityId === activity.id.toString();
          
          let matchesMetadata = false;
          if (file.metadata) {
            try {
              const metadata = typeof file.metadata === 'string' ? JSON.parse(file.metadata) : file.metadata;
              matchesMetadata = metadata.activityId === activity.id || metadata.activityId === activity.id.toString();
            } catch (e) {
              console.warn('Error parsing metadata:', e);
            }
          }
          
          // Use fileName or name as fallback
          const fileName = file.fileName || file.name || '';
          const matchesFileName = fileName && 
            fileName.toLowerCase().includes(activity.title.toLowerCase().replace(/\s+/g, '_'));
          
          const isMatch = matchesActivityId || matchesMetadata || matchesFileName;
          console.log(`🔍 File ${fileName} matches activity ${activity.id}:`, isMatch, {
            matchesActivityId,
            matchesMetadata, 
            matchesFileName,
            activityIdFromFile: file.activityId,
            expectedActivityId: activity.id
          });
          
          return isMatch;
        });
        
        console.log(`🔍 Activity ${activity.title} has files:`, hasFiles);
        newStates[activity.id] = hasFiles ? "Cargados" : "Disponible";
      });
      
      console.log('🔍 New activity states:', newStates);
      setActivityStates(newStates);
    }
  }, [userFiles]);

  const handleFileUpload = async (activityId: string, fileType: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/files/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType })
      });
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL
      };
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  };

  const handleUploadComplete = async (activityId: string, result: any) => {
    try {
      console.log('🔍 Upload completed for activity:', activityId, 'Result:', result);
      
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const fileName = uploadedFile.name || uploadedFile.file?.name;
        
        console.log('🔍 Saving file metadata with activityId:', activityId);
        
        // Save file metadata with activity reference
        const response = await fetch(`/api/users/${user.id}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: fileName,
            fileType: uploadedFile.file?.type?.includes('image') ? 'image' : 'document',
            fileSize: uploadedFile.file?.size || 0,
            uploadURL: uploadedFile.uploadURL,
            activityId: activityId, // Link file to specific activity
            metadata: {
              activityId: activityId,
              activityTitle: workshopActivities.find(a => a.id === activityId)?.title
            }
          })
        });

        if (response.ok) {
          const savedFile = await response.json();
          console.log('🔍 File saved successfully:', savedFile);
          
          // Update activity state
          setActivityStates(prev => ({
            ...prev,
            [activityId]: "Cargados"
          }));

          // Refresh files list to get updated data
          refetchFiles();
        } else {
          console.error('Error saving file metadata:', await response.text());
        }
      }
    } catch (error) {
      console.error('Error handling upload completion:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Actividades del taller Me We
        </CardTitle>
        <WorkshopInfoForm 
          userId={user.id}
          userName={user.nombre}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {workshopActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center text-white text-xl`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {activity.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Upload buttons for different file types */}
              <div className="flex items-center space-x-2">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={10485760}
                  allowedFileTypes={['.doc', '.docx', '.xls', '.xlsx']}
                  uploadText="Carga o pega tus documentos"
                  onGetUploadParameters={() => handleFileUpload(activity.id, 'documents')}
                  onComplete={(result) => handleUploadComplete(activity.id, result)}
                  buttonClassName="p-1 h-8 w-8 hover:bg-blue-100"
                >
                  <FileText className="w-4 h-4" />
                </ObjectUploader>
                
                <ObjectUploader
                  maxNumberOfFiles={5}
                  maxFileSize={5242880}
                  allowedFileTypes={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
                  uploadText="Carga o pega tus imágenes"
                  onGetUploadParameters={() => handleFileUpload(activity.id, 'images')}
                  onComplete={(result) => handleUploadComplete(activity.id, result)}
                  buttonClassName="p-1 h-8 w-8 hover:bg-green-100"
                >
                  <Image className="w-4 h-4" />
                </ObjectUploader>
              </div>
              
              <Badge 
                variant="secondary" 
                className={
                  activityStates[activity.id] === "Cargados" 
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                    : "bg-green-100 text-green-800 hover:bg-gren-200"
                }
              >
                {activityStates[activity.id]}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}