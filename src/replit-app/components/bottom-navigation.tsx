import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Activity, TrendingUp, User, MessageCircle } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Inicio" },
    { path: "/activities", icon: Activity, label: "Actividades" },
    { path: "/chat", icon: MessageCircle, label: "Asistente" },
    { path: "/progress", icon: TrendingUp, label: "Progreso" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-sm w-full bg-white border-t border-warm-gray-200 px-2 py-3 bottom-nav-safe md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-2 ${
                isActive ? "text-purple-600" : "text-warm-gray-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
