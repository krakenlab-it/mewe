export const getMoodGradient = (mood: number): string => {
  if (mood <= 2) return "bg-gradient-mood-low";
  if (mood <= 4) return "bg-gradient-mood-mid";
  return "bg-gradient-mood-high";
};

export const getMoodColor = (mood: number): string => {
  switch (mood) {
    case 1: return "bg-mood-1";
    case 2: return "bg-mood-2";
    case 3: return "bg-mood-3";
    case 4: return "bg-mood-4";
    case 5: return "bg-mood-5";
    default: return "bg-mood-3";
  }
};

export const getMoodTextColor = (mood: number): string => {
  switch (mood) {
    case 1: return "text-mood-1";
    case 2: return "text-mood-2";
    case 3: return "text-mood-3";
    case 4: return "text-mood-4";
    case 5: return "text-mood-5";
    default: return "text-mood-3";
  }
};
