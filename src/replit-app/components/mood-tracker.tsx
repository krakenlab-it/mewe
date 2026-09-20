import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertMoodEntry, MoodEntry } from "@shared/schema";

interface MoodTrackerProps {
  onMoodChange: (mood: number) => void;
  userId: string;
  userName?: string;
}

export default function MoodTracker({ onMoodChange, userId, userName }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showImprovementDialog, setShowImprovementDialog] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    suggestion: string;
    activities: string[];
    message: string;
  } | null>(null);
  const [improvementNote, setImprovementNote] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debug logging
  console.log('MoodTracker rendering with userId:', userId, 'userName:', userName);

  // Query to get today's mood entries
  const { data: moodEntries = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries", userId],
    enabled: !!userId,
  });

  // Check if user already has a mood entry for today
  const getTodayMoodEntry = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    return moodEntries.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === todayStr;
    });
  };

  const todayEntry = getTodayMoodEntry();

  const createMoodEntryMutation = useMutation({
    mutationFn: async (moodData: InsertMoodEntry) => {
      const response = await apiRequest("POST", "/api/mood-entries", moodData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries", userId] });
      toast({
        title: "¡Estado registrado!",
        description: "Tu estado de ánimo ha sido guardado exitosamente.",
      });
      setSelectedMood(null);
      setShowConfirmDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar tu estado de ánimo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleMoodSelect = (mood: number) => {
    // Check if user already has a mood entry for today
    if (todayEntry) {
      toast({
        title: "Ya registraste tu estado",
        description: "Solo puedes registrar tu estado de ánimo una vez por día.",
        variant: "destructive",
      });
      return;
    }

    setSelectedMood(mood);
    setShowConfirmDialog(true);
  };

  const handleConfirmMood = () => {
    if (selectedMood) {
      onMoodChange(selectedMood);
      setShowConfirmDialog(false);
      
      // Save mood entry
      const moodEntry: InsertMoodEntry = {
        userId,
        rating: selectedMood,
        date: new Date(),
        improvementNote: null,
      };

      createMoodEntryMutation.mutate(moodEntry);
    }
  };

  const handleSaveWithNote = () => {
    if (selectedMood) {
      onMoodChange(selectedMood);
      setShowImprovementDialog(false);
      
      // Save mood entry with improvement note
      const moodEntry: InsertMoodEntry = {
        userId,
        rating: selectedMood,
        date: new Date(),
        improvementNote: improvementNote || null,
      };

      createMoodEntryMutation.mutate(moodEntry);
    }
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1: return "😢";
      case 2: return "😔";
      case 3: return "😐";
      case 4: return "😊";
      case 5: return "😄";
      default: return "😐";
    }
  };

  return (
    <>
      <Card className="card-shadow overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-200">
        <CardContent className="p-0">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-3 sm:p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-base sm:text-lg">💝</span>
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg md:text-xl">¿Cómo te sientes hoy?</h2>
                <p className="text-white text-opacity-90 text-xs sm:text-sm">
                  Cómo está tu estado de ánimo {userName ? userName.split(' ').slice(0, 2).join(' ') : "hoy"}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-4 sm:p-6">
            {todayEntry ? (
              /* Ya registró hoy */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">{getMoodEmoji(todayEntry.rating)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-warm-gray-800 mb-1">¡Ya registraste tu estado hoy!</h3>
                  <p className="text-sm text-warm-gray-600">
                    Te sentiste <strong>{todayEntry.rating === 1 ? "muy triste" : todayEntry.rating === 2 ? "triste" : todayEntry.rating === 3 ? "neutral" : todayEntry.rating === 4 ? "feliz" : "muy feliz"}</strong>
                  </p>
                  <p className="text-xs text-warm-gray-500 mt-2">
                    Vuelve mañana para registrar cómo te sientes
                  </p>
                </div>
              </div>
            ) : (
              /* Puede registrar hoy */
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-warm-gray-500 font-medium">Muy triste</span>
                  <span className="text-xs sm:text-sm text-warm-gray-500 font-medium">Muy feliz</span>
                </div>
                <div className="flex justify-center space-x-2 sm:space-x-3 overflow-x-auto pb-2">
                  {[1, 2, 3, 4, 5].map((mood) => (
                    <Button
                      key={mood}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoodSelect(mood)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                        selectedMood === mood
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-300 scale-110 shadow-lg"
                          : "bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200 hover:from-purple-100 hover:to-pink-100"
                      }`}
                      disabled={createMoodEntryMutation.isPending}
                      data-testid={`button-mood-${mood}`}
                    >
                      <span className="text-lg sm:text-xl md:text-2xl">{getMoodEmoji(mood)}</span>
                    </Button>
                  ))}
                </div>
                <div className="text-center mt-3 space-y-2">
                  <span className="text-xs sm:text-sm text-warm-gray-400">Selecciona tu estado de ánimo</span>
                  <p className="text-xs text-warm-gray-500 max-w-xs mx-auto leading-relaxed">
                    <strong>Si te das la oportunidad de identificar cómo te sientes durante varios días, podrás conocerte más y estaremos aquí para apoyarte a mejorar tus estados de ánimo.</strong>
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedMood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">{getMoodEmoji(selectedMood)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-warm-gray-800 mb-2">¿Estás segura?</h3>
                <p className="text-sm text-warm-gray-600">
                  Seleccionaste que te sientes <strong>
                    {selectedMood === 1 ? "muy triste" : 
                     selectedMood === 2 ? "triste" : 
                     selectedMood === 3 ? "neutral" : 
                     selectedMood === 4 ? "feliz" : "muy feliz"}
                  </strong>
                </p>
                <p className="text-xs text-warm-gray-500 mt-1">
                  Solo puedes registrar tu estado una vez por día
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedMood(null);
                  }}
                  className="flex-1"
                  data-testid="button-cancel-mood"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmMood}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  data-testid="button-confirm-mood"
                >
                  Sí, estoy segura
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showImprovementDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              {suggestions ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-warm-gray-800">
                    💡 Sugerencias para ti
                  </h3>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-3">
                      {suggestions.suggestion}
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-blue-700">
                        Actividades recomendadas:
                      </p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {suggestions.activities.map((activity: string, index: number) => (
                          <li key={index}>• {activity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-sm text-warm-gray-600 text-center italic">
                    "{suggestions.message}"
                  </p>
                  
                  <Button
                    onClick={() => {
                      setSuggestions(null);
                      setShowImprovementDialog(false);
                      setSelectedMood(null);
                      toast({
                        title: "¡Estado registrado!",
                        description: "Tu estado de ánimo ha sido guardado exitosamente.",
                      });
                    }}
                    className="w-full"
                  >
                    Entendido
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-warm-gray-800">
                    ¿Qué podrías hacer para sentirte mejor?
                  </h3>
                  
                  <Textarea
                    value={improvementNote}
                    onChange={(e) => setImprovementNote(e.target.value)}
                    placeholder="Escribe algo que te ayude a llegar a 5..."
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowImprovementDialog(false);
                        setSelectedMood(null);
                        setImprovementNote("");
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveWithNote}
                      disabled={createMoodEntryMutation.isPending}
                      className="flex-1"
                    >
                      {createMoodEntryMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
