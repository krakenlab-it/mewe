import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getMoodColor } from "@/lib/mood-colors";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Calendar } from "lucide-react";
import type { MoodEntry } from "@shared/schema";

interface MoodHistoryProps {
  userId: string;
}

export default function MoodHistory({ userId }: MoodHistoryProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  
  const { data: moodEntries = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries", userId],
    enabled: !!userId,
  });

  // Mutation to generate demo mood data
  const generateDemoData = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/mood-entries/${userId}/generate-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to generate demo data");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch mood entries
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries", userId] });
    },
  });

  // Get current week (Monday to Sunday) or custom date range
  const getCurrentWeek = () => {
    if (isCustomRange && startDate && endDate) {
      return getCustomDateRange();
    }
    
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);
    
    // Calculate days to subtract to get to Monday
    const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
    monday.setDate(today.getDate() - daysToSubtract);
    
    // Generate 7 days starting from Monday
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  const getCustomDateRange = () => {
    if (!startDate || !endDate) return [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const handleDateRangeSubmit = () => {
    if (startDate && endDate) {
      setIsCustomRange(true);
    }
  };

  const resetToCurrentWeek = () => {
    setIsCustomRange(false);
    setStartDate("");
    setEndDate("");
  };

  const currentWeek = getCurrentWeek();

  const getDayName = (date: Date) => {
    if (isCustomRange && currentWeek.length > 7) {
      // For custom ranges longer than a week, show day/month format
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
    // For week view, show abbreviated day names
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return days[date.getDay()];
  };

  const getMoodForDate = (date: Date) => {
    const dateStr = date.toDateString();
    const entry = moodEntries.find((entry: MoodEntry) => 
      new Date(entry.date).toDateString() === dateStr
    );
    return entry ? entry.rating : null;
  };

  const calculatePositiveDays = () => {
    if (moodEntries.length === 0) return `0 de ${currentWeek.length}`;
    
    // Filter entries within the current range
    const entriesInRange = moodEntries.filter((entry: MoodEntry) => {
      const entryDate = new Date(entry.date).toDateString();
      return currentWeek.some(date => date.toDateString() === entryDate);
    });
    
    // Count days with positive mood (rating 4 or 5)
    const positiveDays = entriesInRange.filter((entry: MoodEntry) => entry.rating >= 4).length;
    return `${positiveDays} de ${currentWeek.length}`;
  };

  // Helper function to get hex color for mood levels
  const getMoodColorHex = (mood: number): string => {
    const colors = {
      1: "#ef4444", // red-500 - muy triste
      2: "#f97316", // orange-500 - triste
      3: "#eab308", // yellow-500 - neutral
      4: "#3b82f6", // blue-500 - feliz
      5: "#10b981", // emerald-500 - muy feliz
    };
    return colors[mood as keyof typeof colors] || "#9ca3af";
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-warm-gray-800">Mi Estado de Ánimo</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDateModal(true)}
          className="text-purple-600 font-medium"
        >
          Ver historial
        </Button>
      </div>


      
      <Card className="card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-warm-gray-600">
              {isCustomRange && startDate && endDate 
                ? `${new Date(startDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - ${new Date(endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`
                : "Semana actual (Lun-Dom)"
              }
            </span>
            <span className="text-sm font-medium text-warm-gray-800">
              Promedio: {calculatePositiveDays()}
            </span>
          </div>
          
          <div className="relative h-20 mb-8">
            {/* Background gradient bands for mood levels - from top to bottom: 5,4,3,2,1 */}
            <div className="absolute inset-0 flex flex-col">
              <div className="flex-1" style={{backgroundColor: "#10b981", opacity: 0.3}}></div> {/* Mood 5 - Very Happy - emerald-500 */}
              <div className="flex-1" style={{backgroundColor: "#3b82f6", opacity: 0.3}}></div> {/* Mood 4 - Happy - blue-500 */}
              <div className="flex-1" style={{backgroundColor: "#eab308", opacity: 0.3}}></div> {/* Mood 3 - Neutral - yellow-500 */}
              <div className="flex-1" style={{backgroundColor: "#f97316", opacity: 0.3}}></div> {/* Mood 2 - Sad - orange-500 */}
              <div className="flex-1" style={{backgroundColor: "#ef4444", opacity: 0.3}}></div> {/* Mood 1 - Very Sad - red-500 */}
            </div>
            
            {/* Points positioned absolutely in their correct bands */}
            <div className="absolute inset-0">
              {currentWeek.map((date, index) => {
                const mood = getMoodForDate(date);
                // Calculate X position using flexbox logic: spread points evenly across width
                const xPercent = currentWeek.length === 1 ? 50 : (index / (currentWeek.length - 1)) * 100;
                
                // Calculate Y position from top to center point in each mood band
                // Container height is 80px (h-20), each band is 16px high
                // Bands from top: Green(5)=0-16px, Blue(4)=16-32px, Yellow(3)=32-48px, Orange(2)=48-64px, Red(1)=64-80px
                // Center positions from top: Mood 5=8px, Mood 4=24px, Mood 3=40px, Mood 2=56px, Mood 1=72px
                const yFromTop = mood ? ((5 - mood) * 16 + 8) : 40; // Invert mood since bands go 5,4,3,2,1 from top
                
                return (
                  <div
                    key={index}
                    className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-300"
                    style={{
                      backgroundColor: mood ? getMoodColorHex(mood) : '#d1d5db',
                      left: `${xPercent}%`,
                      top: `${yFromTop}px`,
                      transform: 'translate(-50%, -50%)', // Center the point
                      opacity: mood ? 1 : 0.4
                    }}
                  />
                );
              })}
            </div>
            
            {/* Connecting line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 80" preserveAspectRatio="none">
              {(() => {
                const pointsWithMood = currentWeek
                  .map((date, index) => {
                    const mood = getMoodForDate(date);
                    if (!mood) return null;
                    // Calculate X position to match absolute positioning
                    const x = currentWeek.length === 1 ? 50 : (index / (currentWeek.length - 1)) * 100;
                    // Calculate Y position to match absolute positioning: center of each mood band
                    // Bands from top: Green(5)=0-16px, Blue(4)=16-32px, Yellow(3)=32-48px, Orange(2)=48-64px, Red(1)=64-80px
                    // Center positions: Mood 5=8px, Mood 4=24px, Mood 3=40px, Mood 2=56px, Mood 1=72px
                    const y = (5 - mood) * 16 + 8; // Same calculation as points
                    return { x, y, index };
                  })
                  .filter(Boolean) as Array<{x: number, y: number, index: number}>;

                if (pointsWithMood.length < 2) return null;

                return (
                  <path
                    d={pointsWithMood.map((point, i) => 
                      i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
                    ).join(' ')}
                    stroke="#7c3aed"
                    strokeWidth="1.5"
                    fill="none"
                    className="transition-all duration-300"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })()}
            </svg>
          </div>
          
          {/* Day labels */}
          <div className="flex justify-between">
            {currentWeek.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <span 
                  key={index} 
                  className={`text-xs ${isToday ? 'font-medium text-warm-gray-800' : 'text-warm-gray-500'}`}
                >
                  {getDayName(date)}
                </span>
              );
            })}
          </div>
          
          {moodEntries.length === 0 && (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-warm-gray-500">
                Comienza a registrar tu estado de ánimo para ver tu progreso
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateDemoData.mutate()}
                disabled={generateDemoData.isPending}
                className="text-xs"
              >
                {generateDemoData.isPending ? "Generando..." : "Cargar datos de ejemplo"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Selector Modal */}
      <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Seleccionar período
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-gray-700 mb-2">
                Fecha inicio
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
                placeholder="mm/dd/yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-gray-700 mb-2">
                Fecha fin
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                placeholder="mm/dd/yyyy"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  handleDateRangeSubmit();
                  setShowDateModal(false);
                }}
                className="bg-purple-600 text-white hover:bg-purple-700 flex-1"
                disabled={!startDate || !endDate}
              >
                Aplicar fechas
              </Button>
              <Button
                onClick={() => {
                  resetToCurrentWeek();
                  setShowDateModal(false);
                }}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 flex-1"
              >
                Semana actual
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
