import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import MoodHistory from "@/components/mood-history";
import Achievements from "@/components/achievements";
import { TrendingUp, Calendar, Target, Award, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import type { User, MoodEntry } from "@shared/schema";

export default function ProgressPage() {
  const [, setLocation] = useLocation();
  const [currentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  const { data: moodEntries = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: userAchievements = [] } = useQuery<any[]>({
    queryKey: ["/api/users", currentUser?.id, "achievements"],
    enabled: !!currentUser?.id,
  });

  // Calculate statistics
  const totalEntries = moodEntries.length;
  const averageMood = totalEntries > 0 
    ? moodEntries.reduce((sum: number, entry: MoodEntry) => sum + entry.rating, 0) / totalEntries
    : 0;
  
  const currentStreak = calculateStreak(moodEntries);
  const unlockedAchievements = userAchievements.filter((a: any) => a.isUnlocked).length;
  const totalAchievements = userAchievements.length;

  if (!currentUser) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-warm-gray-50">
      {/* Status Bar */}
      <div className="status-bar">
        <span>9:41</span>
        <div className="flex space-x-1">
          <div className="w-4 h-2 bg-white rounded-sm"></div>
          <div className="w-1 h-2 bg-white rounded-sm"></div>
          <div className="w-6 h-2 bg-white rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-mood-mid px-6 pt-8 pb-6 text-white">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white hover:bg-opacity-10 p-2 -ml-2 rounded-lg transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Mi Progreso</h1>
        <p className="text-sm opacity-90">
          Observa cómo creces día a día
        </p>
      </header>

      {/* Progress Stats */}
      <main className="px-6 py-6 space-y-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-warm-gray-800">
                {averageMood.toFixed(1)}
              </div>
              <p className="text-sm text-warm-gray-600">Promedio de ánimo</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-warm-gray-800">
                {currentStreak}
              </div>
              <p className="text-sm text-warm-gray-600">Días seguidos</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-warm-gray-800">
                {totalEntries}
              </div>
              <p className="text-sm text-warm-gray-600">Registros totales</p>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-warm-gray-800">
                {unlockedAchievements}/{totalAchievements}
              </div>
              <p className="text-sm text-warm-gray-600">Logros</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-warm-gray-800">Progreso de logros</h3>
              <span className="text-sm text-warm-gray-600">
                {totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0} 
              className="w-full h-2"
            />
          </CardContent>
        </Card>

        {/* Mood History Section */}
        <MoodHistory userId={currentUser.id} />

        {/* Achievements Section */}
        <Achievements userId={currentUser.id} />
      </main>

      <BottomNavigation />
    </div>
  );
}

function calculateStreak(moodEntries: MoodEntry[]): number {
  if (moodEntries.length === 0) return 0;
  
  // Sort entries by date descending
  const sortedEntries = [...moodEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
