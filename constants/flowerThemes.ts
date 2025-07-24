// constants/flowerThemes.ts - SISTEMA DE TEMAS FLORAIS COMPLETO
export type CyclePhase = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';
export type ThemeMode = 'light' | 'dark';
export type FlowerTheme = 'rose' | 'lavender' | 'sunset' | 'ocean' | 'cherry' | 'lotus';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  gradients: {
    primary: [string, string];
    secondary: [string, string];
    card: [string, string];
  };
  particles: string;
  border: string;
}

interface FlowerThemeConfig {
  name: string;
  icon: string;
  emoji: string;
  description: string;
  flowerType: string;
  baseColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// ===== CONFIGURAÇÕES DOS TEMAS FLORAIS =====
export const FLOWER_THEME_CONFIGS: Record<FlowerTheme, FlowerThemeConfig> = {
  rose: {
    name: 'Rosa Elegante',
    icon: '🌹',
    emoji: '🌹',
    description: 'Delicado e romântico como pétalas de rosa',
    flowerType: 'rosa',
    baseColors: {
      primary: '#FF6B9D',
      secondary: '#FFB4D6',
      accent: '#FF8FAB',
    },
  },
  lavender: {
    name: 'Lavanda Suave',
    icon: '💜',
    emoji: '🟣',
    description: 'Tranquilo e sereno como campos de lavanda',
    flowerType: 'lavanda',
    baseColors: {
      primary: '#9C88FF',
      secondary: '#C4B5FD',
      accent: '#A78BFA',
    },
  },
  sunset: {
    name: 'Pôr do Sol',
    icon: '🌅',
    emoji: '🧡',
    description: 'Caloroso e vibrante como um pôr do sol',
    flowerType: 'girassol',
    baseColors: {
      primary: '#FF8A65',
      secondary: '#FFAB91',
      accent: '#FF7043',
    },
  },
  ocean: {
    name: 'Oceano Sereno',
    icon: '🌊',
    emoji: '💙',
    description: 'Fresco e calmo como águas cristalinas',
    flowerType: 'lotus_azul',
    baseColors: {
      primary: '#4FC3F7',
      secondary: '#81D4FA',
      accent: '#29B6F6',
    },
  },
  cherry: {
    name: 'Cereja Japonesa',
    icon: '🌸',
    emoji: '🌸',
    description: 'Delicado e puro como sakura em flor',
    flowerType: 'sakura',
    baseColors: {
      primary: '#FFB3D9',
      secondary: '#FFC9E0',
      accent: '#FF99CC',
    },
  },
  lotus: {
    name: 'Lótus Dourada',
    icon: '🪷',
    emoji: '💛',
    description: 'Sereno e iluminado como lótus dourada',
    flowerType: 'lotus',
    baseColors: {
      primary: '#FFD54F',
      secondary: '#FFF176',
      accent: '#FFCC02',
    },
  },
};

// ===== TEMAS ADAPTATIVOS POR FASE DO CICLO =====
export const ADAPTIVE_FLOWER_THEMES: Record<FlowerTheme, Record<ThemeMode, Record<CyclePhase, ThemeColors>>> = {
  rose: {
    light: {
      menstrual: {
        primary: '#D63384',
        secondary: '#F8BBD9',
        accent: '#FFE5F0',
        background: '#FEFBFC',
        surface: '#FFFFFF',
        text: {
          primary: '#2D1B2F',
          secondary: '#6B4C7A',
          tertiary: '#9A7AA8',
        },
        gradients: {
          primary: ['#FFE5F0', '#D63384'],
          secondary: ['#FEFBFC', '#FFE5F0'],
          card: ['#FFFFFF', '#FEFBFC'],
        },
        particles: '#F8BBD9',
        border: '#F0E6EA',
      },
      postMenstrual: {
        primary: '#E91E63',
        secondary: '#F48FB1',
        accent: '#FCE4EC',
        background: '#FEFEFE',
        surface: '#FFFFFF',
        text: {
          primary: '#1B0A0F',
          secondary: '#4A1E2B',
          tertiary: '#7A3F52',
        },
        gradients: {
          primary: ['#FCE4EC', '#E91E63'],
          secondary: ['#FEFEFE', '#FCE4EC'],
          card: ['#FFFFFF', '#FEFEFE'],
        },
        particles: '#F48FB1',
        border: '#F8BBD9',
      },
      fertile: {
        primary: '#FF4081',
        secondary: '#FF80AB',
        accent: '#FF8A95',
        background: '#FFF8F9',
        surface: '#FFFFFF',
        text: {
          primary: '#2C0A0F',
          secondary: '#5D1E29',
          tertiary: '#8E3243',
        },
        gradients: {
          primary: ['#FF8A95', '#FF4081'],
          secondary: ['#FFF8F9', '#FF8A95'],
          card: ['#FFFFFF', '#FFF8F9'],
        },
        particles: '#FF80AB',
        border: '#FFCDD2',
      },
      ovulation: {
        primary: '#EC407A',
        secondary: '#F06292',
        accent: '#F8BBD0',
        background: '#FFFAFE',
        surface: '#FFFFFF',
        text: {
          primary: '#2A0A16',
          secondary: '#551E32',
          tertiary: '#80324E',
        },
        gradients: {
          primary: ['#F8BBD0', '#EC407A'],
          secondary: ['#FFFAFE', '#F8BBD0'],
          card: ['#FFFFFF', '#FFFAFE'],
        },
        particles: '#F06292',
        border: '#F48FB1',
      },
      preMenstrual: {
        primary: '#AD1457',
        secondary: '#E91E63',
        accent: '#F8BBD0',
        background: '#FDF7F9',
        surface: '#FFFFFF',
        text: {
          primary: '#1F0B11',
          secondary: '#4A1E2B',
          tertiary: '#753245',
        },
        gradients: {
          primary: ['#F8BBD0', '#AD1457'],
          secondary: ['#FDF7F9', '#F8BBD0'],
          card: ['#FFFFFF', '#FDF7F9'],
        },
        particles: '#E91E63',
        border: '#F06292',
      },
    },
    dark: {
      menstrual: {
        primary: '#EC4899',
        secondary: '#BE185D',
        accent: '#831843',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: {
          primary: '#FECDD3',
          secondary: '#FDA4AF',
          tertiary: '#FB7185',
        },
        gradients: {
          primary: ['#831843', '#EC4899'],
          secondary: ['#0F0A0D', '#1F1419'],
          card: ['#1F1419', '#2D1B21'],
        },
        particles: '#BE185D',
        border: '#44262F',
      },
      postMenstrual: {
        primary: '#F472B6',
        secondary: '#EC4899',
        accent: '#BE185D',
        background: '#110A0E',
        surface: '#1F141A',
        text: {
          primary: '#FECDD3',
          secondary: '#FDA4AF',
          tertiary: '#FB7185',
        },
        gradients: {
          primary: ['#BE185D', '#F472B6'],
          secondary: ['#110A0E', '#1F141A'],
          card: ['#1F141A', '#2A1821'],
        },
        particles: '#EC4899',
        border: '#451E2A',
      },
      fertile: {
        primary: '#FB7185',
        secondary: '#F472B6',
        accent: '#EC4899',
        background: '#120A0E',
        surface: '#1F141A',
        text: {
          primary: '#FECDD3',
          secondary: '#FDA4AF',
          tertiary: '#FB7185',
        },
        gradients: {
          primary: ['#EC4899', '#FB7185'],
          secondary: ['#120A0E', '#1F141A'],
          card: ['#1F141A', '#2B1822'],
        },
        particles: '#F472B6',
        border: '#4A2128',
      },
      ovulation: {
        primary: '#FDA4AF',
        secondary: '#FB7185',
        accent: '#F472B6',
        background: '#0F0A0C',
        surface: '#1E1317',
        text: {
          primary: '#FECDD3',
          secondary: '#FDA4AF',
          tertiary: '#FB7185',
        },
        gradients: {
          primary: ['#F472B6', '#FDA4AF'],
          secondary: ['#0F0A0C', '#1E1317'],
          card: ['#1E1317', '#2A1A1F'],
        },
        particles: '#FB7185',
        border: '#471F26',
      },
      preMenstrual: {
        primary: '#BE185D',
        secondary: '#9D174D',
        accent: '#831843',
        background: '#0D0A0B',
        surface: '#1C1216',
        text: {
          primary: '#FECDD3',
          secondary: '#FDA4AF',
          tertiary: '#FB7185',
        },
        gradients: {
          primary: ['#831843', '#BE185D'],
          secondary: ['#0D0A0B', '#1C1216'],
          card: ['#1C1216', '#281A1E'],
        },
        particles: '#9D174D',
        border: '#3F1A22',
      },
    },
  },
  
  lavender: {
    light: {
      menstrual: {
        primary: '#7C3AED',
        secondary: '#C4B5FD',
        accent: '#F5F3FF',
        background: '#FDFDFF',
        surface: '#FFFFFF',
        text: {
          primary: '#3C1A78',
          secondary: '#5B21B6',
          tertiary: '#7C3AED',
        },
        gradients: {
          primary: ['#F5F3FF', '#7C3AED'],
          secondary: ['#FDFDFF', '#F5F3FF'],
          card: ['#FFFFFF', '#FDFDFF'],
        },
        particles: '#C4B5FD',
        border: '#E9D5FF',
      },
      postMenstrual: {
        primary: '#8B5CF6',
        secondary: '#A78BFA',
        accent: '#EDE9FE',
        background: '#FEFEFF',
        surface: '#FFFFFF',
        text: {
          primary: '#3C1A78',
          secondary: '#5B21B6',
          tertiary: '#7C3AED',
        },
        gradients: {
          primary: ['#EDE9FE', '#8B5CF6'],
          secondary: ['#FEFEFF', '#EDE9FE'],
          card: ['#FFFFFF', '#FEFEFF'],
        },
        particles: '#A78BFA',
        border: '#DDD6FE',
      },
      fertile: {
        primary: '#A855F7',
        secondary: '#C084FC',
        accent: '#F3E8FF',
        background: '#FEFEFF',
        surface: '#FFFFFF',
        text: {
          primary: '#3C1A78',
          secondary: '#5B21B6',
          tertiary: '#7C3AED',
        },
        gradients: {
          primary: ['#F3E8FF', '#A855F7'],
          secondary: ['#FEFEFF', '#F3E8FF'],
          card: ['#FFFFFF', '#FEFEFF'],
        },
        particles: '#C084FC',
        border: '#E9D5FF',
      },
      ovulation: {
        primary: '#9333EA',
        secondary: '#A855F7',
        accent: '#F3E8FF',
        background: '#FDFEFF',
        surface: '#FFFFFF',
        text: {
          primary: '#3C1A78',
          secondary: '#5B21B6',
          tertiary: '#7C3AED',
        },
        gradients: {
          primary: ['#F3E8FF', '#9333EA'],
          secondary: ['#FDFEFF', '#F3E8FF'],
          card: ['#FFFFFF', '#FDFEFF'],
        },
        particles: '#A855F7',
        border: '#DDD6FE',
      },
      preMenstrual: {
        primary: '#7C3AED',
        secondary: '#8B5CF6',
        accent: '#EDE9FE',
        background: '#FCFCFF',
        surface: '#FFFFFF',
        text: {
          primary: '#3C1A78',
          secondary: '#5B21B6',
          tertiary: '#7C3AED',
        },
        gradients: {
          primary: ['#EDE9FE', '#7C3AED'],
          secondary: ['#FCFCFF', '#EDE9FE'],
          card: ['#FFFFFF', '#FCFCFF'],
        },
        particles: '#8B5CF6',
        border: '#C4B5FD',
      },
    },
    dark: {
      menstrual: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#6D28D9',
        background: '#0A0A0F',
        surface: '#1A1824',
        text: {
          primary: '#DDD6FE',
          secondary: '#C4B5FD',
          tertiary: '#A78BFA',
        },
        gradients: {
          primary: ['#6D28D9', '#8B5CF6'],
          secondary: ['#0A0A0F', '#1A1824'],
          card: ['#1A1824', '#252130'],
        },
        particles: '#7C3AED',
        border: '#2D1F47',
      },
      postMenstrual: {
        primary: '#A78BFA',
        secondary: '#8B5CF6',
        accent: '#7C3AED',
        background: '#0B0B11',
        surface: '#1B1926',
        text: {
          primary: '#DDD6FE',
          secondary: '#C4B5FD',
          tertiary: '#A78BFA',
        },
        gradients: {
          primary: ['#7C3AED', '#A78BFA'],
          secondary: ['#0B0B11', '#1B1926'],
          card: ['#1B1926', '#262233'],
        },
        particles: '#8B5CF6',
        border: '#312048',
      },
      fertile: {
        primary: '#C084FC',
        secondary: '#A78BFA',
        accent: '#8B5CF6',
        background: '#0C0C13',
        surface: '#1C1A28',
        text: {
          primary: '#DDD6FE',
          secondary: '#C4B5FD',
          tertiary: '#A78BFA',
        },
        gradients: {
          primary: ['#8B5CF6', '#C084FC'],
          secondary: ['#0C0C13', '#1C1A28'],
          card: ['#1C1A28', '#27233A'],
        },
        particles: '#A78BFA',
        border: '#33224A',
      },
      ovulation: {
        primary: '#DDD6FE',
        secondary: '#C084FC',
        accent: '#A78BFA',
        background: '#0A0A10',
        surface: '#1A1823',
        text: {
          primary: '#DDD6FE',
          secondary: '#C4B5FD',
          tertiary: '#A78BFA',
        },
        gradients: {
          primary: ['#A78BFA', '#DDD6FE'],
          secondary: ['#0A0A10', '#1A1823'],
          card: ['#1A1823', '#25202F'],
        },
        particles: '#C084FC',
        border: '#2F1E45',
      },
      preMenstrual: {
        primary: '#7C3AED',
        secondary: '#6D28D9',
        accent: '#5B21B6',
        background: '#090A0E',
        surface: '#181622',
        text: {
          primary: '#DDD6FE',
          secondary: '#C4B5FD',
          tertiary: '#A78BFA',
        },
        gradients: {
          primary: ['#5B21B6', '#7C3AED'],
          secondary: ['#090A0E', '#181622'],
          card: ['#181622', '#231E2D'],
        },
        particles: '#6D28D9',
        border: '#2C1B43',
      },
    },
  },

  sunset: {
    light: {
      menstrual: {
        primary: '#F59E0B',
        secondary: '#FDE68A',
        accent: '#FFFBEB',
        background: '#FFFEF7',
        surface: '#FFFFFF',
        text: {
          primary: '#78350F',
          secondary: '#92400E',
          tertiary: '#F59E0B',
        },
        gradients: {
          primary: ['#FFFBEB', '#F59E0B'],
          secondary: ['#FFFEF7', '#FFFBEB'],
          card: ['#FFFFFF', '#FFFEF7'],
        },
        particles: '#FDE68A',
        border: '#FEF3C7',
      },
      postMenstrual: {
        primary: '#F97316',
        secondary: '#FDBA74',
        accent: '#FFF7ED',
        background: '#FFFEFB',
        surface: '#FFFFFF',
        text: {
          primary: '#7C2D12',
          secondary: '#9A3412',
          tertiary: '#C2410C',
        },
        gradients: {
          primary: ['#FFF7ED', '#F97316'],
          secondary: ['#FFFEFB', '#FFF7ED'],
          card: ['#FFFFFF', '#FFFEFB'],
        },
        particles: '#FDBA74',
        border: '#FECA57',
      },
      fertile: {
        primary: '#EA580C',
        secondary: '#FB923C',
        accent: '#FED7AA',
        background: '#FFFBF7',
        surface: '#FFFFFF',
        text: {
          primary: '#7C2D12',
          secondary: '#9A3412',
          tertiary: '#C2410C',
        },
        gradients: {
          primary: ['#FED7AA', '#EA580C'],
          secondary: ['#FFFBF7', '#FED7AA'],
          card: ['#FFFFFF', '#FFFBF7'],
        },
        particles: '#FB923C',
        border: '#FDBA74',
      },
      ovulation: {
        primary: '#DC2626',
        secondary: '#F87171',
        accent: '#FECACA',
        background: '#FFFBFB',
        surface: '#FFFFFF',
        text: {
          primary: '#7F1D1D',
          secondary: '#991B1B',
          tertiary: '#DC2626',
        },
        gradients: {
          primary: ['#FECACA', '#DC2626'],
          secondary: ['#FFFBFB', '#FECACA'],
          card: ['#FFFFFF', '#FFFBFB'],
        },
        particles: '#F87171',
        border: '#FCA5A5',
      },
      preMenstrual: {
        primary: '#B45309',
        secondary: '#D97706',
        accent: '#FDE68A',
        background: '#FFFCF0',
        surface: '#FFFFFF',
        text: {
          primary: '#78350F',
          secondary: '#92400E',
          tertiary: '#B45309',
        },
        gradients: {
          primary: ['#FDE68A', '#B45309'],
          secondary: ['#FFFCF0', '#FDE68A'],
          card: ['#FFFFFF', '#FFFCF0'],
        },
        particles: '#D97706',
        border: '#FBBF24',
      },
    },
    dark: {
      menstrual: {
        primary: '#FBBF24',
        secondary: '#F59E0B',
        accent: '#D97706',
        background: '#0F0E0A',
        surface: '#241F14',
        text: {
          primary: '#FEF3C7',
          secondary: '#FDE68A',
          tertiary: '#FACC15',
        },
        gradients: {
          primary: ['#D97706', '#FBBF24'],
          secondary: ['#0F0E0A', '#241F14'],
          card: ['#241F14', '#2F2A1A'],
        },
        particles: '#F59E0B',
        border: '#44401F',
      },
      postMenstrual: {
        primary: '#FCD34D',
        secondary: '#FBBF24',
        accent: '#F59E0B',
        background: '#100F0B',
        surface: '#252015',
        text: {
          primary: '#FEF3C7',
          secondary: '#FDE68A',
          tertiary: '#FACC15',
        },
        gradients: {
          primary: ['#F59E0B', '#FCD34D'],
          secondary: ['#100F0B', '#252015'],
          card: ['#252015', '#302B1B'],
        },
        particles: '#FBBF24',
        border: '#454020',
      },
      fertile: {
        primary: '#FDE047',
        secondary: '#FCD34D',
        accent: '#FBBF24',
        background: '#11100C',
        surface: '#262117',
        text: {
          primary: '#FEF3C7',
          secondary: '#FDE68A',
          tertiary: '#FACC15',
        },
        gradients: {
          primary: ['#FBBF24', '#FDE047'],
          secondary: ['#11100C', '#262117'],
          card: ['#262117', '#312C1D'],
        },
        particles: '#FCD34D',
        border: '#464121',
      },
      ovulation: {
        primary: '#FACC15',
        secondary: '#EAB308',
        accent: '#CA8A04',
        background: '#0F0E0A',
        surface: '#241F13',
        text: {
          primary: '#FEF3C7',
          secondary: '#FDE68A',
          tertiary: '#FACC15',
        },
        gradients: {
          primary: ['#CA8A04', '#FACC15'],
          secondary: ['#0F0E0A', '#241F13'],
          card: ['#241F13', '#2F2A19'],
        },
        particles: '#EAB308',
        border: '#423F1E',
      },
      preMenstrual: {
        primary: '#D97706',
        secondary: '#B45309',
        accent: '#92400E',
        background: '#0E0C08',
        surface: '#221D12',
        text: {
          primary: '#FEF3C7',
          secondary: '#FDE68A',
          tertiary: '#FACC15',
        },
        gradients: {
          primary: ['#92400E', '#D97706'],
          secondary: ['#0E0C08', '#221D12'],
          card: ['#221D12', '#2D2718'],
        },
        particles: '#B45309',
        border: '#3E3B1C',
      },
    },
  },

  ocean: {
    light: {
      menstrual: {
        primary: '#0891B2',
        secondary: '#67E8F9',
        accent: '#CFFAFE',
        background: '#F0FDFF',
        surface: '#FFFFFF',
        text: {
          primary: '#164E63',
          secondary: '#0891B2',
          tertiary: '#0E7490',
        },
        gradients: {
          primary: ['#CFFAFE', '#0891B2'],
          secondary: ['#F0FDFF', '#CFFAFE'],
          card: ['#FFFFFF', '#F0FDFF'],
        },
        particles: '#67E8F9',
        border: '#A5F3FC',
      },
      postMenstrual: {
        primary: '#0284C7',
        secondary: '#7DD3FC',
        accent: '#E0F2FE',
        background: '#F0F9FF',
        surface: '#FFFFFF',
        text: {
          primary: '#0C4A6E',
          secondary: '#075985',
          tertiary: '#0284C7',
        },
        gradients: {
          primary: ['#E0F2FE', '#0284C7'],
          secondary: ['#F0F9FF', '#E0F2FE'],
          card: ['#FFFFFF', '#F0F9FF'],
        },
        particles: '#7DD3FC',
        border: '#BAE6FD',
      },
      fertile: {
        primary: '#0369A1',
        secondary: '#3B82F6',
        accent: '#DBEAFE',
        background: '#EFF6FF',
        surface: '#FFFFFF',
        text: {
          primary: '#1E3A8A',
          secondary: '#1D4ED8',
          tertiary: '#2563EB',
        },
        gradients: {
          primary: ['#DBEAFE', '#0369A1'],
          secondary: ['#EFF6FF', '#DBEAFE'],
          card: ['#FFFFFF', '#EFF6FF'],
        },
        particles: '#3B82F6',
        border: '#93C5FD',
      },
      ovulation: {
        primary: '#1D4ED8',
        secondary: '#60A5FA',
        accent: '#DBEAFE',
        background: '#EFF6FF',
        surface: '#FFFFFF',
        text: {
          primary: '#1E3A8A',
          secondary: '#1D4ED8',
          tertiary: '#2563EB',
        },
        gradients: {
          primary: ['#DBEAFE', '#1D4ED8'],
          secondary: ['#EFF6FF', '#DBEAFE'],
          card: ['#FFFFFF', '#EFF6FF'],
        },
        particles: '#60A5FA',
        border: '#93C5FD',
      },
      preMenstrual: {
        primary: '#075985',
        secondary: '#0891B2',
        accent: '#A5F3FC',
        background: '#ECFEFF',
        surface: '#FFFFFF',
        text: {
          primary: '#164E63',
          secondary: '#0891B2',
          tertiary: '#0E7490',
        },
        gradients: {
          primary: ['#A5F3FC', '#075985'],
          secondary: ['#ECFEFF', '#A5F3FC'],
          card: ['#FFFFFF', '#ECFEFF'],
        },
        particles: '#0891B2',
        border: '#67E8F9',
      },
    },
    dark: {
      menstrual: {
        primary: '#0EA5E9',
        secondary: '#0284C7',
        accent: '#075985',
        background: '#0A0F14',
        surface: '#141F26',
        text: {
          primary: '#E0F2FE',
          secondary: '#BAE6FD',
          tertiary: '#7DD3FC',
        },
        gradients: {
          primary: ['#075985', '#0EA5E9'],
          secondary: ['#0A0F14', '#141F26'],
          card: ['#141F26', '#1F2A33'],
        },
        particles: '#0284C7',
        border: '#1E3A47',
      },
      postMenstrual: {
        primary: '#38BDF8',
        secondary: '#0EA5E9',
        accent: '#0284C7',
        background: '#0B1015',
        surface: '#152028',
        text: {
          primary: '#E0F2FE',
          secondary: '#BAE6FD',
          tertiary: '#7DD3FC',
        },
        gradients: {
          primary: ['#0284C7', '#38BDF8'],
          secondary: ['#0B1015', '#152028'],
          card: ['#152028', '#202B35'],
        },
        particles: '#0EA5E9',
        border: '#1F3B48',
      },
      fertile: {
        primary: '#7DD3FC',
        secondary: '#38BDF8',
        accent: '#0EA5E9',
        background: '#0C1116',
        surface: '#16212A',
        text: {
          primary: '#E0F2FE',
          secondary: '#BAE6FD',
          tertiary: '#7DD3FC',
        },
        gradients: {
          primary: ['#0EA5E9', '#7DD3FC'],
          secondary: ['#0C1116', '#16212A'],
          card: ['#16212A', '#212C37'],
        },
        particles: '#38BDF8',
        border: '#203C49',
      },
      ovulation: {
        primary: '#BAE6FD',
        secondary: '#7DD3FC',
        accent: '#38BDF8',
        background: '#0A0F13',
        surface: '#141E25',
        text: {
          primary: '#E0F2FE',
          secondary: '#BAE6FD',
          tertiary: '#7DD3FC',
        },
        gradients: {
          primary: ['#38BDF8', '#BAE6FD'],
          secondary: ['#0A0F13', '#141E25'],
          card: ['#141E25', '#1F2932'],
        },
        particles: '#7DD3FC',
        border: '#1E3946',
      },
      preMenstrual: {
        primary: '#0284C7',
        secondary: '#075985',
        accent: '#0C4A6E',
        background: '#090E12',
        surface: '#131D24',
        text: {
          primary: '#E0F2FE',
          secondary: '#BAE6FD',
          tertiary: '#7DD3FC',
        },
        gradients: {
          primary: ['#0C4A6E', '#0284C7'],
          secondary: ['#090E12', '#131D24'],
          card: ['#131D24', '#1E2831'],
        },
        particles: '#075985',
        border: '#1D3744',
      },
    },
  },

  cherry: {
    light: {
      menstrual: {
        primary: '#FFB3D9',
        secondary: '#FFC9E0',
        accent: '#FFEBF4',
        background: '#FFFAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#4A1B2F',
          secondary: '#6B2C44',
          tertiary: '#8C3D59',
        },
        gradients: {
          primary: ['#FFEBF4', '#FFB3D9'],
          secondary: ['#FFFAFC', '#FFEBF4'],
          card: ['#FFFFFF', '#FFFAFC'],
        },
        particles: '#FFC9E0',
        border: '#FFD6EA',
      },
      postMenstrual: {
        primary: '#FF99CC',
        secondary: '#FFADD6',
        accent: '#FFE0F0',
        background: '#FFF9FC',
        surface: '#FFFFFF',
        text: {
          primary: '#4A1B2F',
          secondary: '#6B2C44',
          tertiary: '#8C3D59',
        },
        gradients: {
          primary: ['#FFE0F0', '#FF99CC'],
          secondary: ['#FFF9FC', '#FFE0F0'],
          card: ['#FFFFFF', '#FFF9FC'],
        },
        particles: '#FFADD6',
        border: '#FFC2E0',
      },
      fertile: {
        primary: '#FF80B0',
        secondary: '#FF99CC',
        accent: '#FFCCE5',
        background: '#FFF7FB',
        surface: '#FFFFFF',
        text: {
          primary: '#4A1B2F',
          secondary: '#6B2C44',
          tertiary: '#8C3D59',
        },
        gradients: {
          primary: ['#FFCCE5', '#FF80B0'],
          secondary: ['#FFF7FB', '#FFCCE5'],
          card: ['#FFFFFF', '#FFF7FB'],
        },
        particles: '#FF99CC',
        border: '#FFB3D9',
      },
      ovulation: {
        primary: '#FF6699',
        secondary: '#FF80B0',
        accent: '#FFB8D6',
        background: '#FFF6FA',
        surface: '#FFFFFF',
        text: {
          primary: '#4A1B2F',
          secondary: '#6B2C44',
          tertiary: '#8C3D59',
        },
        gradients: {
          primary: ['#FFB8D6', '#FF6699'],
          secondary: ['#FFF6FA', '#FFB8D6'],
          card: ['#FFFFFF', '#FFF6FA'],
        },
        particles: '#FF80B0',
        border: '#FFA3CC',
      },
      preMenstrual: {
        primary: '#E6527A',
        secondary: '#FF6699',
        accent: '#FFA3CC',
        background: '#FFF4F8',
        surface: '#FFFFFF',
        text: {
          primary: '#4A1B2F',
          secondary: '#6B2C44',
          tertiary: '#8C3D59',
        },
        gradients: {
          primary: ['#FFA3CC', '#E6527A'],
          secondary: ['#FFF4F8', '#FFA3CC'],
          card: ['#FFFFFF', '#FFF4F8'],
        },
        particles: '#FF6699',
        border: '#FF8FB3',
      },
    },
    dark: {
      menstrual: {
        primary: '#FFB3D9',
        secondary: '#FF99CC',
        accent: '#E6527A',
        background: '#0F0A0D',
        surface: '#1A1216',
        text: {
          primary: '#FFE0F0',
          secondary: '#FFC9E0',
          tertiary: '#FFB3D9',
        },
        gradients: {
          primary: ['#E6527A', '#FFB3D9'],
          secondary: ['#0F0A0D', '#1A1216'],
          card: ['#1A1216', '#24181E'],
        },
        particles: '#FF99CC',
        border: '#3D1F2C',
      },
      postMenstrual: {
        primary: '#FFC9E0',
        secondary: '#FFB3D9',
        accent: '#FF99CC',
        background: '#100B0E',
        surface: '#1B1317',
        text: {
          primary: '#FFE0F0',
          secondary: '#FFC9E0',
          tertiary: '#FFB3D9',
        },
        gradients: {
          primary: ['#FF99CC', '#FFC9E0'],
          secondary: ['#100B0E', '#1B1317'],
          card: ['#1B1317', '#25191F'],
        },
        particles: '#FFB3D9',
        border: '#3E202D',
      },
      fertile: {
        primary: '#FFD6EA',
        secondary: '#FFC9E0',
        accent: '#FFB3D9',
        background: '#110C0F',
        surface: '#1C1418',
        text: {
          primary: '#FFE0F0',
          secondary: '#FFC9E0',
          tertiary: '#FFB3D9',
        },
        gradients: {
          primary: ['#FFB3D9', '#FFD6EA'],
          secondary: ['#110C0F', '#1C1418'],
          card: ['#1C1418', '#261A20'],
        },
        particles: '#FFC9E0',
        border: '#3F212E',
      },
      ovulation: {
        primary: '#FFE0F0',
        secondary: '#FFD6EA',
        accent: '#FFC9E0',
        background: '#0F0B0D',
        surface: '#1A1315',
        text: {
          primary: '#FFE0F0',
          secondary: '#FFC9E0',
          tertiary: '#FFB3D9',
        },
        gradients: {
          primary: ['#FFC9E0', '#FFE0F0'],
          secondary: ['#0F0B0D', '#1A1315'],
          card: ['#1A1315', '#24181D'],
        },
        particles: '#FFD6EA',
        border: '#3D1E2B',
      },
      preMenstrual: {
        primary: '#FF99CC',
        secondary: '#E6527A',
        accent: '#CC3366',
        background: '#0E0A0C',
        surface: '#191114',
        text: {
          primary: '#FFE0F0',
          secondary: '#FFC9E0',
          tertiary: '#FFB3D9',
        },
        gradients: {
          primary: ['#CC3366', '#FF99CC'],
          secondary: ['#0E0A0C', '#191114'],
          card: ['#191114', '#23171C'],
        },
        particles: '#E6527A',
        border: '#3C1D29',
      },
    },
  },

  lotus: {
    light: {
      menstrual: {
        primary: '#FFD54F',
        secondary: '#FFF176',
        accent: '#FFFDE7',
        background: '#FFFEF7',
        surface: '#FFFFFF',
        text: {
          primary: '#5D4037',
          secondary: '#8D6E63',
          tertiary: '#A1887F',
        },
        gradients: {
          primary: ['#FFFDE7', '#FFD54F'],
          secondary: ['#FFFEF7', '#FFFDE7'],
          card: ['#FFFFFF', '#FFFEF7'],
        },
        particles: '#FFF176',
        border: '#FFF59D',
      },
      postMenstrual: {
        primary: '#FFCC02',
        secondary: '#FFD54F',
        accent: '#FFF9C4',
        background: '#FFFEF5',
        surface: '#FFFFFF',
        text: {
          primary: '#5D4037',
          secondary: '#8D6E63',
          tertiary: '#A1887F',
        },
        gradients: {
          primary: ['#FFF9C4', '#FFCC02'],
          secondary: ['#FFFEF5', '#FFF9C4'],
          card: ['#FFFFFF', '#FFFEF5'],
        },
        particles: '#FFD54F',
        border: '#FFEB3B',
      },
      fertile: {
        primary: '#FFC107',
        secondary: '#FFCA28',
        accent: '#FFF8E1',
        background: '#FFFEF3',
        surface: '#FFFFFF',
        text: {
          primary: '#5D4037',
          secondary: '#8D6E63',
          tertiary: '#A1887F',
        },
        gradients: {
          primary: ['#FFF8E1', '#FFC107'],
          secondary: ['#FFFEF3', '#FFF8E1'],
          card: ['#FFFFFF', '#FFFEF3'],
        },
        particles: '#FFCA28',
        border: '#FFD54F',
      },
      ovulation: {
        primary: '#FF9800',
        secondary: '#FFB74D',
        accent: '#FFCC80',
        background: '#FFF8F0',
        surface: '#FFFFFF',
        text: {
          primary: '#5D4037',
          secondary: '#8D6E63',
          tertiary: '#A1887F',
        },
        gradients: {
          primary: ['#FFCC80', '#FF9800'],
          secondary: ['#FFF8F0', '#FFCC80'],
          card: ['#FFFFFF', '#FFF8F0'],
        },
        particles: '#FFB74D',
        border: '#FFAB40',
      },
      preMenstrual: {
        primary: '#F57C00',
        secondary: '#FF9800',
        accent: '#FFB74D',
        background: '#FFF6E6',
        surface: '#FFFFFF',
        text: {
          primary: '#5D4037',
          secondary: '#8D6E63',
          tertiary: '#A1887F',
        },
        gradients: {
          primary: ['#FFB74D', '#F57C00'],
          secondary: ['#FFF6E6', '#FFB74D'],
          card: ['#FFFFFF', '#FFF6E6'],
        },
        particles: '#FF9800',
        border: '#FFAB40',
      },
    },
    dark: {
      menstrual: {
        primary: '#FFCA28',
        secondary: '#FFC107',
        accent: '#FF8F00',
        background: '#0F0E08',
        surface: '#1F1C0F',
        text: {
          primary: '#FFF9C4',
          secondary: '#FFF176',
          tertiary: '#FFD54F',
        },
        gradients: {
          primary: ['#FF8F00', '#FFCA28'],
          secondary: ['#0F0E08', '#1F1C0F'],
          card: ['#1F1C0F', '#2A2617'],
        },
        particles: '#FFC107',
        border: '#3D3317',
      },
      postMenstrual: {
        primary: '#FFD54F',
        secondary: '#FFCA28',
        accent: '#FFC107',
        background: '#100F09',
        surface: '#201D10',
        text: {
          primary: '#FFF9C4',
          secondary: '#FFF176',
          tertiary: '#FFD54F',
        },
        gradients: {
          primary: ['#FFC107', '#FFD54F'],
          secondary: ['#100F09', '#201D10'],
          card: ['#201D10', '#2B2718'],
        },
        particles: '#FFCA28',
        border: '#3E3418',
      },
      fertile: {
        primary: '#FFF176',
        secondary: '#FFD54F',
        accent: '#FFCA28',
        background: '#11100A',
        surface: '#211E11',
        text: {
          primary: '#FFF9C4',
          secondary: '#FFF176',
          tertiary: '#FFD54F',
        },
        gradients: {
          primary: ['#FFCA28', '#FFF176'],
          secondary: ['#11100A', '#211E11'],
          card: ['#211E11', '#2C2819'],
        },
        particles: '#FFD54F',
        border: '#3F3519',
      },
      ovulation: {
        primary: '#FFF9C4',
        secondary: '#FFF176',
        accent: '#FFD54F',
        background: '#0F0E08',
        surface: '#1F1C0E',
        text: {
          primary: '#FFF9C4',
          secondary: '#FFF176',
          tertiary: '#FFD54F',
        },
        gradients: {
          primary: ['#FFD54F', '#FFF9C4'],
          secondary: ['#0F0E08', '#1F1C0E'],
          card: ['#1F1C0E', '#2A2616'],
        },
        particles: '#FFF176',
        border: '#3D3216',
      },
      preMenstrual: {
        primary: '#FFC107',
        secondary: '#FF8F00',
        accent: '#E65100',
        background: '#0E0D07',
        surface: '#1E1B0D',
        text: {
          primary: '#FFF9C4',
          secondary: '#FFF176',
          tertiary: '#FFD54F',
        },
        gradients: {
          primary: ['#E65100', '#FFC107'],
          secondary: ['#0E0D07', '#1E1B0D'],
          card: ['#1E1B0D', '#292515'],
        },
        particles: '#FF8F00',
        border: '#3C3015',
      },
    },
  },
};

// ===== MAPAS DE FLORES POR TEMA =====
export const FLOWER_PARTICLES_MAP: Record<FlowerTheme, string[]> = {
  rose: ['🌹', '🥀', '🌺', '💐'],
  lavender: ['💜', '🟣', '🔮', '✨'],
  sunset: ['🌻', '🌼', '🌸', '🍀'],
  ocean: ['🌊', '💙', '🔵', '🌀'],
  cherry: ['🌸', '🌺', '🌷', '💮'],
  lotus: ['🪷', '💛', '🌟', '✨'],
};

// ===== CONFIGURAÇÕES DE ANIMAÇÃO PARA PARTÍCULAS =====
export const FLOWER_ANIMATION_CONFIGS = {
  gentle: {
    duration: 8000,
    swayAmplitude: 30,
    floatSpeed: 1,
  },
  moderate: {
    duration: 6000,
    swayAmplitude: 50,
    floatSpeed: 1.5,
  },
  intense: {
    duration: 4000,
    swayAmplitude: 70,
    floatSpeed: 2,
  },
};

// ===== HELPER FUNCTIONS =====
export const getThemeColors = (
  theme: FlowerTheme,
  mode: ThemeMode,
  phase: CyclePhase
): ThemeColors => {
  return ADAPTIVE_FLOWER_THEMES[theme][mode][phase];
};

export const getFlowerParticles = (theme: FlowerTheme): string[] => {
  return FLOWER_PARTICLES_MAP[theme];
};

export const getAllThemes = (): FlowerTheme[] => {
  return Object.keys(FLOWER_THEME_CONFIGS) as FlowerTheme[];
};

export const getThemeConfig = (theme: FlowerTheme): FlowerThemeConfig => {
  return FLOWER_THEME_CONFIGS[theme];
};