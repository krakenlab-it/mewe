import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import motherDaughterImage from "@assets/image_1754075292233.png";
import silverLegoImage from "@assets/image_1754577635796.png";
import type { LegoPiece } from "@shared/schema";

interface LegoCollectionProps {
  userId: string;
}

// 18 Piezas LEGO virtuales únicas con descripciones específicas
const VIRTUAL_LEGO_PIECES = [
  // Primera Conexión - Para Mamá
  { 
    id: "pc-mama-1", 
    category: "Primera Conexión", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: true,
    description: "Primer abrazo después del nacimiento",
    symbol: "🤗"
  },
  { 
    id: "pc-mama-2", 
    category: "Primera Conexión", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: true,
    description: "Primera sonrisa compartida",
    symbol: "😊"
  },
  { 
    id: "pc-mama-3", 
    category: "Primera Conexión", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Primeras palabras 'mamá' pronunciadas",
    symbol: "💬"
  },
  { 
    id: "pc-mama-4", 
    category: "Primera Conexión", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Primera noche completa de sueño",
    symbol: "🌙"
  },
  { 
    id: "pc-mama-5", 
    category: "Primera Conexión", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Primer día sin lágrimas de separación",
    symbol: "☀️"
  },
  { 
    id: "pc-mama-6", 
    category: "Primera Conexión", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Primera comida preparada juntas",
    symbol: "🍲"
  },
  
  // Primera Conexión - Para Hija
  { 
    id: "pc-hija-1", 
    category: "Primera Conexión", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: true,
    description: "Mi primer recuerdo con mamá",
    symbol: "💝"
  },
  { 
    id: "pc-hija-2", 
    category: "Primera Conexión", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Cuando mamá me enseñó a caminar",
    symbol: "👶"
  },
  { 
    id: "pc-hija-3", 
    category: "Primera Conexión", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Mi primer día de escuela con mamá",
    symbol: "🎒"
  },
  { 
    id: "pc-hija-4", 
    category: "Primera Conexión", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Primera vez que consolé a mamá",
    symbol: "🤝"
  },
  { 
    id: "pc-hija-5", 
    category: "Primera Conexión", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Mi primera carta de amor para mamá",
    symbol: "💌"
  },
  { 
    id: "pc-hija-6", 
    category: "Primera Conexión", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Primera vez que entendí a mamá completamente",
    symbol: "💡"
  },
  
  // Comunicadora - Para Mamá
  { 
    id: "com-mama-1", 
    category: "Comunicadora", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: true,
    description: "Maestra de escucha activa sin interrumpir",
    symbol: "👂"
  },
  { 
    id: "com-mama-2", 
    category: "Comunicadora", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Experta en conversaciones sin juicio",
    symbol: "🗣️"
  },
  { 
    id: "com-mama-3", 
    category: "Comunicadora", 
    targetRole: "madre", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Traductora de emociones adolescentes",
    symbol: "🎭"
  },
  
  // Comunicadora - Para Hija
  { 
    id: "com-hija-1", 
    category: "Comunicadora", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: true,
    description: "Valiente expresando mis verdaderos sentimientos",
    symbol: "💬"
  },
  { 
    id: "com-hija-2", 
    category: "Comunicadora", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: true,
    description: "Curiosa haciendo preguntas profundas",
    symbol: "❓"
  },
  { 
    id: "com-hija-3", 
    category: "Comunicadora", 
    targetRole: "hija", 
    image: motherDaughterImage, 
    unlocked: false,
    description: "Soñadora compartiendo mis aspiraciones más grandes",
    symbol: "💭"
  },
  
  // Pieza Especial Plateada #18 - Desbloqueada al 80% de conexión
  { 
    id: "special-18", 
    category: "Conexión Eterna", 
    targetRole: "ambas", 
    image: silverLegoImage, 
    unlocked: false,
    description: "Conexión Eterna - Logro de 8 meses juntas",
    symbol: "🏆",
    isSpecial: true,
    unlockCondition: "80% de conexión alcanzada",
    specialMessage: "¡Felicitaciones! Esta pieza especial se desbloquea cuando madre e hija han alcanzado el 80% de conexión emocional después de 8 meses de trabajo conjunto en Me We. Representa el momento en que su vínculo se ha fortalecido de manera extraordinaria y duradera."
  }
];

export default function LegoCollection({ userId }: LegoCollectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<"madre" | "hija">("madre");
  const [currentPage, setCurrentPage] = useState(0);
  const [showSpecialMessage, setShowSpecialMessage] = useState(false);

  const { data: legoPieces = [] } = useQuery<LegoPiece[]>({
    queryKey: ["/api/users", userId, "lego-pieces"],
    enabled: !!userId,
  });

  // Simular conexión del 80% para fines de demo (en producción vendría del backend)
  const connectionPercentage = 85; // Ejemplo: 85% de conexión
  
  // Filtrar piezas virtuales basado en el filtro seleccionado
  // La pieza especial siempre aparece al final para ambos filtros
  const normalPieces = VIRTUAL_LEGO_PIECES.filter(piece => {
    return !piece.isSpecial && (piece.targetRole === selectedFilter || piece.targetRole === "ambas");
  });
  
  const specialPiece = VIRTUAL_LEGO_PIECES.find(piece => piece.isSpecial);
  
  const filteredPieces = [...normalPieces, specialPiece].filter(Boolean).map(piece => ({
    ...piece,
    // Desbloquear pieza especial si se alcanza 80% de conexión
    unlocked: piece.isSpecial ? connectionPercentage >= 80 : piece.unlocked
  }));

  // Paginación: 6 piezas por página (2 filas de 3)
  const piecesPerPage = 6;
  const totalPages = Math.ceil(filteredPieces.length / piecesPerPage);
  const startIndex = currentPage * piecesPerPage;
  const currentPieces = filteredPieces.slice(startIndex, startIndex + piecesPerPage);

  // Resetear página cuando cambie el filtro
  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedFilter]);

  const totalPieces = legoPieces.length;
  const maxPieces = 18;

  // Manejar click en pieza especial
  const handleSpecialPieceClick = (piece: any) => {
    if (piece.isSpecial && piece.unlocked) {
      setShowSpecialMessage(true);
    }
  };

  return (
    <section data-testid="lego-collection">
      {/* Header principal con título y contador */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Nuevas piezas que te unen</h2>
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-medium">
          0/17 piezas + 1 especial
        </Badge>
      </div>
      
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-6">
          {/* Header con iconos */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center space-x-2 bg-blue-200 bg-opacity-50 rounded-xl px-4 py-2 mb-4">
              <Heart className="w-5 h-5 text-pink-500" data-testid="heart-icon" />
              <Star className="w-5 h-5 text-purple-500" data-testid="star-icon" />
            </div>
            
            <p className="text-sm text-warm-gray-700 mb-6">
              Cada pieza representa un momento especial compartido entre ustedes
            </p>
            
            {/* Filtros Para Mamá / Para Hija */}
            <div className="flex justify-center space-x-3 mb-6">
              <Button
                variant={selectedFilter === "madre" ? "default" : "outline"}
                className={`flex items-center space-x-2 ${
                  selectedFilter === "madre" 
                    ? "bg-pink-500 hover:bg-pink-600 text-white" 
                    : "border-pink-300 text-pink-600 hover:bg-pink-50"
                }`}
                onClick={() => setSelectedFilter("madre")}
                data-testid="filter-madre"
              >
                <Heart className="w-4 h-4" />
                <span>Para Mamá</span>
              </Button>
              
              <Button
                variant={selectedFilter === "hija" ? "default" : "outline"}
                className={`flex items-center space-x-2 ${
                  selectedFilter === "hija" 
                    ? "bg-purple-500 hover:bg-purple-600 text-white" 
                    : "border-purple-300 text-purple-600 hover:bg-purple-50"
                }`}
                onClick={() => setSelectedFilter("hija")}
                data-testid="filter-hija"
              >
                <Star className="w-4 h-4" />
                <span>Para Hija</span>
              </Button>
            </div>
          </div>

          {/* Navegación de páginas */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                data-testid="prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-gray-500" data-testid="page-indicator">
                Página {currentPage + 1} de {totalPages}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                data-testid="next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Cuadrícula de piezas LEGO 3D - TAMAÑO ORIGINAL GRANDE */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {currentPieces.map((piece, index) => {
              return (
                <div 
                  key={piece.id} 
                  className="relative group cursor-pointer" 
                  data-testid={`lego-piece-${piece.id}`}
                  onClick={() => handleSpecialPieceClick(piece)}
                >
                  {/* PIEZA LEGO 3D GRANDE - Como en la imagen original */}
                  <div className="relative w-40 h-40 mx-auto transform transition-all duration-300 hover:scale-105">
                    {/* Pieza LEGO principal con efecto 3D */}
                    <div className={`w-full h-full rounded-xl shadow-2xl relative overflow-hidden ${
                      piece.isSpecial 
                        ? "bg-gradient-to-br from-gray-300 via-gray-200 to-gray-500 shadow-gray-400/50" 
                        : "bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400"
                    }`}>
                      
                      {/* Stud característico de LEGO en la parte superior */}
                      <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full shadow-inner border-2 ${
                        piece.isSpecial 
                          ? "bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500 shadow-lg" 
                          : "bg-gray-500 border-gray-400"
                      }`}></div>
                      
                      {/* Foto madre e hija dentro del bloque LEGO */}
                      <div className="absolute inset-4 top-12 rounded-lg overflow-hidden bg-white shadow-inner">
                        <img 
                          src={piece.isSpecial ? silverLegoImage : motherDaughterImage}
                          alt={piece.description}
                          className={`w-full h-full object-cover transition-all duration-500 ${
                            piece.unlocked 
                              ? "filter-none group-hover:brightness-110 group-hover:contrast-110" 
                              : "filter grayscale group-hover:filter-none group-hover:grayscale-0"
                          }`}
                        />
                        
                        {/* Marca de agua con candado - FORMATO WATERMARK ORIGINAL */}
                        {!piece.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300">
                            <Lock className="w-8 h-8 text-white opacity-70 drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      
                      {/* Etiqueta de categoría en la parte inferior */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white text-center py-2 px-1">
                        <div className="text-sm font-medium truncate">
                          {piece.category}
                        </div>
                      </div>
                      
                      {/* Badge especial para pieza #18 */}
                      {piece.isSpecial && (
                        <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
                          18
                        </div>
                      )}
                      
                      {/* Efecto de brillo para pieza especial */}
                      {piece.isSpecial && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>
                      )}
                    </div>
                    
                    {/* Comentario personalizado debajo de cada pieza */}
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-600 font-medium px-2 leading-tight">
                        {piece.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Espacios vacíos para completar la cuadrícula */}
            {Array.from({ length: Math.max(0, piecesPerPage - currentPieces.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="w-40 h-40 mx-auto bg-gray-100 rounded-xl opacity-20 border-2 border-dashed border-gray-300" />
            ))}
          </div>

          {/* Resumen de progreso */}
          <div className="text-center">
            <p className="text-xs text-warm-gray-600 mb-2">
              {filteredPieces.filter(p => p.unlocked).length} de {filteredPieces.length} piezas desbloqueadas
            </p>
            <p className="text-xs text-warm-gray-500">
              Completa actividades para desbloquear más piezas de tu colección
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal para mensaje especial de la pieza #18 */}
      {showSpecialMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">🏆</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">¡Pieza Especial Desbloqueada!</h3>
            <p className="text-sm text-gray-600 mb-4">
              {VIRTUAL_LEGO_PIECES.find(p => p.isSpecial)?.specialMessage}
            </p>
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-700">
                <strong>Conexión actual:</strong> {connectionPercentage}%<br />
                <strong>Requisito:</strong> 80% de conexión emocional
              </p>
            </div>
            <Button 
              onClick={() => setShowSpecialMessage(false)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              data-testid="close-special-message"
            >
              ¡Entendido!
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
