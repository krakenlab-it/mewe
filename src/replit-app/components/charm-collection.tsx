import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Sparkles, Heart, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import motherDaughterEmbrace1 from "@assets/image_1754076796918.png";
import motherDaughterEmbrace2 from "@assets/image_1754076805726.png";
import motherDaughterEmbrace3 from "@assets/image_1754076814168.png";
import motherDaughterEmbrace4 from "@assets/image_1754076816519.png";
import motherDaughterSilver from "@assets/image_1754076980508.png";
import type { Charm, UserCharm } from "@shared/schema";

interface CharmCollectionProps {
  userId: string;
  userRole: "madre" | "hija";
}

const CHARM_RARITIES = {
  "común": { bg: "bg-gray-200", text: "text-gray-700", border: "border-gray-300" },
  "raro": { bg: "bg-blue-200", text: "text-blue-700", border: "border-blue-300" },
  "épico": { bg: "bg-purple-200", text: "text-purple-700", border: "border-purple-300" },
  "legendario": { bg: "bg-yellow-200", text: "text-yellow-700", border: "border-yellow-300" },
};

const CHARM_ICONS = {
  "madre": Heart,
  "hija": Sparkles,
  "especial": Crown,
};

export default function CharmCollection({ userId, userRole }: CharmCollectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<"madre" | "hija">("madre");
  const [selectedCharm, setSelectedCharm] = useState<Charm | null>(null);
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: availableCharms = [] } = useQuery<Charm[]>({
    queryKey: ["/api/charms"],
  });

  const { data: userCharms = [] } = useQuery<UserCharm[]>({
    queryKey: [`/api/users/${userId}/charms`],
    enabled: !!userId,
  });

  const selectCharmMutation = useMutation({
    mutationFn: async (charmId: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/charms/${charmId}/select`, {});
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pieza seleccionada",
        description: "Tu pieza ha sido activada exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/charms`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo seleccionar la pieza",
        variant: "destructive"
      });
    }
  });

  const unlockCharmMutation = useMutation({
    mutationFn: async (charmId: string) => {
      const response = await apiRequest("POST", `/api/users/${userId}/charms/${charmId}/unlock`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "¡Pieza desbloqueada!",
        description: data.message
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/charms`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo desbloquear la pieza",
        variant: "destructive"
      });
    }
  });

  let filteredCharms;

  const specialCharm = availableCharms.find(charm => charm.isSpecial);
  const regularCharms = availableCharms.filter(charm => !charm.isSpecial);

  const virtualSpecialCharm = specialCharm || {
    id: "special-18-virtual",
    name: "Conexión Eterna",
    description: "Logro de 8 meses juntas",
    type: "especial",
    rarity: "legendario",
    color: "#FFD700",
    unlockCondition: "80% de conexión alcanzada",
    icon: "👑",
    isSpecial: true,
    isUnlocked: true
  };

  if (selectedTab === "madre") {
    const madreCharms = regularCharms.filter(charm => charm.type === "madre");
    const specialMadreCharm = availableCharms.find(charm => charm.type === "especial" && charm.isSpecial);
    const finalSpecialCharm = specialMadreCharm || virtualSpecialCharm;
    filteredCharms = [...madreCharms.slice(0, 17), finalSpecialCharm];
  } else {
    const hijaCharms = regularCharms.filter(charm => charm.type === "hija");
    const specialHijaCharm = availableCharms.find(charm => charm.type === "especial_hija" && charm.isSpecial);
    const finalSpecialCharm = specialHijaCharm || {
      ...virtualSpecialCharm,
      type: "especial_hija",
      name: "Somos Team 🫶"
    };
    filteredCharms = [...hijaCharms.slice(0, 17), finalSpecialCharm];
  }

  const regularUserCharms = userCharms.filter(uc => {
    const charm = availableCharms.find(c => c.id === uc.charmId);
    return !charm?.isSpecial;
  });
  const unlockedRegularCount = regularUserCharms.length;
  const regularCharmsCount = 17;
  const hasSpecialCharm = userCharms.some(uc => {
    const charm = availableCharms.find(c => c.id === uc.charmId);
    return charm?.isSpecial;
  });

  const charmsPerPage = 6;
  const totalPages = Math.ceil(filteredCharms.length / charmsPerPage);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedTab]);

  const handleCharmClick = (charm: Charm, isDemo?: boolean) => {
    const userCharm = userCharms.find(uc => uc.charmId === charm.id);

    if (!userCharm) {
      if (charm.isSpecial) {
        setShowLockedDialog(true);
        return;
      }

      if (isDemo) {
        unlockCharmMutation.mutate(charm.id);
        return;
      }

      toast({
        title: "Pieza no disponible",
        description: "Completa más actividades para desbloquear esta pieza",
        variant: "destructive"
      });
      return;
    }

    selectCharmMutation.mutate(charm.id);
    setSelectedCharm(charm);
  };

  const getCharmStatus = (charm: Charm) => {
    const userCharm = userCharms.find(uc => uc.charmId === charm.id);
    if (!userCharm) return "locked";
    return userCharm.isSelected ? "selected" : "unlocked";
  };

  const IconComponent = CHARM_ICONS[selectedTab] || Heart;
  void userRole;
  void IconComponent;
  void selectedCharm;

  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg md:text-xl font-semibold text-warm-gray-800">Nuevas piezas que te unen</h3>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-medium text-xs sm:text-sm">
            {unlockedRegularCount}/{regularCharmsCount} piezas + 1 especial
          </Badge>
          {hasSpecialCharm && (
            <div className="flex items-center ml-1">
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
          )}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-3">
            <div className="w-32 h-10 sm:w-40 sm:h-12 md:w-48 md:h-14 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-lg mx-auto flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 ml-2" />
            </div>
          </div>

          <p className="text-sm md:text-base text-warm-gray-700 text-center mb-6">
            Cada pieza representa un momento especial compartido entre ustedes
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <Button
              variant={selectedTab === "madre" ? "default" : "outline"}
              onClick={() => setSelectedTab("madre")}
              className={`px-4 sm:px-6 py-2 rounded-full transition-all duration-300 font-semibold text-sm sm:text-base ${
                selectedTab === "madre"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-105 drop-shadow-sm border-pink-500"
                  : "bg-white text-pink-600 border-pink-300 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-400"
              }`}
            >
              <Heart className="w-4 h-4 mr-2" />
              Para Mamá
            </Button>
            <Button
              variant={selectedTab === "hija" ? "default" : "outline"}
              onClick={() => setSelectedTab("hija")}
              className={`px-4 sm:px-6 py-2 rounded-full transition-all duration-300 font-semibold text-sm sm:text-base ${
                selectedTab === "hija"
                  ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg transform scale-105 drop-shadow-sm border-purple-500"
                  : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-400"
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Para Hija
            </Button>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0 || totalPages <= 1}
                className="p-2 h-8 w-8 rounded-full bg-white shadow-md border-blue-200 hover:bg-blue-50 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-blue-600" />
              </Button>

              <div className="flex flex-col items-center">
                <div className="flex space-x-1 mb-1">
                  {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      disabled={totalPages <= 1}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentPage ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  Página {currentPage + 1} de {Math.max(totalPages, 1)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1 || totalPages <= 1}
                className="p-2 h-8 w-8 rounded-full bg-white shadow-md border-blue-200 hover:bg-blue-50 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {filteredCharms
                .slice(currentPage * charmsPerPage, (currentPage + 1) * charmsPerPage)
                .map((charm) => {
                  const status = getCharmStatus(charm);
                  const rarity = CHARM_RARITIES[charm.rarity as keyof typeof CHARM_RARITIES] || CHARM_RARITIES["común"];

                  return (
                    <div
                      key={charm.id}
                      onClick={() => handleCharmClick(charm)}
                      className={`
                        relative aspect-square rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 group
                        ${status === "locked" ? "opacity-80" : ""}
                        ${status === "selected" ? "ring-2 ring-yellow-400 shadow-lg" : ""}
                        ${rarity.bg} ${rarity.border} border-2
                      `}
                      style={{ backgroundColor: status !== "locked" ? charm.color : charm.isSpecial ? "#e5e7eb" : "#f3f4f6" }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {status === "locked" ? (
                          <div className="w-full h-full rounded-lg overflow-hidden relative group">
                            <img
                              src={charm.isSpecial ? motherDaughterSilver : [motherDaughterEmbrace1, motherDaughterEmbrace2, motherDaughterEmbrace3, motherDaughterEmbrace4][Math.floor(Math.random() * 4)]}
                              alt="Madre e hija abrazándose"
                              className={`w-full h-full object-cover transition-all duration-300 ${
                                charm.isSpecial
                                  ? "filter-none group-hover:brightness-110 group-hover:contrast-110"
                                  : "filter grayscale group-hover:filter-none group-hover:grayscale-0"
                              }`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300">
                              <Lock className="w-6 h-6 text-white opacity-70 drop-shadow-lg" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xl">{charm.iconEmoji || "🧩"}</span>
                        )}
                      </div>

                      {charm.isSpecial && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}

                      {status === "selected" && (
                        <div className="absolute -bottom-1 -right-1">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-lg">
                        <p className="text-center font-medium truncate">{charm.name}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showLockedDialog} onOpenChange={setShowLockedDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <img
                src={motherDaughterSilver}
                alt="Pieza especial madre e hija"
                className="w-20 h-20 rounded-lg object-cover shadow-lg"
              />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">
              Pieza Especial Bloqueada
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 leading-relaxed">
              Esta pieza especial plateada representa el vínculo inquebrantable entre madre e hija.
              <br /><br />
              <strong className="text-purple-600">Solo se la ganan si durante 8 meses interactúan mucho entre ustedes.</strong>
              <br /><br />
              Sigan completando actividades juntas, conversando y fortaleciendo su relación especial.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
