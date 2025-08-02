// constants/seasonalThemes.ts - TEMAS SAZONAIS ESPECIAIS
import { CyclePhase, ThemeMode } from '../hooks/useAdaptiveTheme';

export type SeasonalTheme = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonalThemeColors {
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
  };
  particles: string;
  border: string;
}

interface SeasonalThemeConfig {
  name: string;
  icon: string;
  emoji: string;
  description: string;
  season: string;
  months: number[];
  specialParticles: string[];
}

// ===== CONFIGURAÇÕES DOS TEMAS SAZONAIS =====
export const SEASONAL_THEME_CONFIGS: Record<SeasonalTheme, SeasonalThemeConfig> = {
  spring: {
    name: 'Primavera Floral',
    icon: '🌸',
    emoji: '🌸',
    description: 'Tons pastéis e flores delicadas da primavera',
    season: 'Primavera',
    months: [3, 4, 5], // Março, Abril, Maio
    specialParticles: ['🌸', '🌺', '🌷', '🌿', '💮', '🌼', '🦋', '✨'],
  },
  summer: {
    name: 'Verão Vibrante',
    icon: '☀️',
    emoji: '☀️',
    description: 'Cores quentes e energéticas do verão',
    season: 'Verão',
    months: [6, 7, 8], // Junho, Julho, Agosto
    specialParticles: ['☀️', '🌻', '🔥', '⭐', '🌞', '🍉', '🏖️', '💛'],
  },
  autumn: {
    name: 'Outono Dourado',
    icon: '🍂',
    emoji: '🍂',
    description: 'Tons terrosos e acolhedores do outono',
    season: 'Outono',
    months: [9, 10, 11], // Setembro, Outubro, Novembro
    specialParticles: ['🍂', '🍁', '🌰', '🎃', '🧡', '🍄', '🌾', '✨'],
  },
  winter: {
    name: 'Inverno Cristalino',
    icon: '❄️',
    emoji: '❄️',
    description: 'Tons frios e serenos do inverno',
    season: 'Inverno',
    months: [12, 1, 2], // Dezembro, Janeiro, Fevereiro
    specialParticles: ['❄️', '⭐', '✨', '💎', '🌨️', '🔮', '💙', '🌟'],
  },
};

// ===== TEMAS SAZONAIS ADAPTATIVOS POR FASE DO CICLO =====
export const SEASONAL_THEMES: Record<SeasonalTheme, Record<ThemeMode, Record<CyclePhase, SeasonalThemeColors>>> = {
  spring: {
    light: {
      menstrual: {
        primary: '#F48FB1',
        secondary: '#FFB3D9',
        accent: '#FCE4EC',
        background: '#FFF8FB',
        surface: '#FFFFFF',
        text: {
          primary: '#2E1065',
          secondary: '#7C3AED',
          tertiary: '#A855F7',
        },
        gradients: {
          primary: ['#FCE4EC', '#F48FB1'],
        },
        particles: '#FFB3D9',
        border: '#F8BBD9',
      },
      postMenstrual: {
        primary: '#81C784',
        secondary: '#A5D6A7',
        accent: '#E8F5E8',
        background: '#F1F8E9',
        surface: '#FFFFFF',
        text: {
          primary: '#1B5E20',
          secondary: '#2E7D32',
          tertiary: '#388E3C',
        },
        gradients: {
          primary: ['#E8F5E8', '#81C784'],
        },
        particles: '#A5D6A7',
        border: '#C8E6C9',
      },
      fertile: {
        primary: '#FFB74D',
        secondary: '#FFCC80',
        accent: '#FFF8E1',
        background: '#FFFEF7',
        surface: '#FFFFFF',
        text: {
          primary: '#E65100',
          secondary: '#F57C00',
          tertiary: '#FF9800',
        },
        gradients: {
          primary: ['#FFF8E1', '#FFB74D'],
        },
        particles: '#FFCC80',
        border: '#FFE0B2',
      },
      ovulation: {
        primary: '#FF7043',
        secondary: '#FF8A65',
        accent: '#FFE0B2',
        background: '#FFF3E0',
        surface: '#FFFFFF',
        text: {
          primary: '#BF360C',
          secondary: '#D84315',
          tertiary: '#FF5722',
        },
        gradients: {
          primary: ['#FFE0B2', '#FF7043'],
        },
        particles: '#FF8A65',
        border: '#FFAB91',
      },
      preMenstrual: {
        primary: '#BA68C8',
        secondary: '#CE93D8',
        accent: '#F3E5F5',
        background: '#FCE4EC',
        surface: '#FFFFFF',
        text: {
          primary: '#4A148C',
          secondary: '#6A1B9A',
          tertiary: '#8E24AA',
        },
        gradients: {
          primary: ['#F3E5F5', '#BA68C8'],
        },
        particles: '#CE93D8',
        border: '#E1BEE7',
      },
    },
    dark: {
      menstrual: {
        primary: '#F48FB1',
        secondary: '#E91E63',
        accent: '#AD1457',
        background: '#0D0A0B',
        surface: '#1A1315',
        text: {
          primary: '#F8BBD9',
          secondary: '#F48FB1',
          tertiary: '#EC407A',
        },
        gradients: {
          primary: ['#AD1457', '#F48FB1'],
        },
        particles: '#E91E63',
        border: '#3D1F2A',
      },
      postMenstrual: {
        primary: '#81C784',
        secondary: '#4CAF50',
        accent: '#2E7D32',
        background: '#0A0F0A',
        surface: '#141F14',
        text: {
          primary: '#C8E6C9',
          secondary: '#A5D6A7',
          tertiary: '#81C784',
        },
        gradients: {
          primary: ['#2E7D32', '#81C784'],
        },
        particles: '#4CAF50',
        border: '#1F4A23',
      },
      fertile: {
        primary: '#FFB74D',
        secondary: '#FF9800',
        accent: '#F57C00',
        background: '#0F0C08',
        surface: '#1F1B14',
        text: {
          primary: '#FFE0B2',
          secondary: '#FFCC80',
          tertiary: '#FFB74D',
        },
        gradients: {
          primary: ['#F57C00', '#FFB74D'],
        },
        particles: '#FF9800',
        border: '#3E2723',
      },
      ovulation: {
        primary: '#FF7043',
        secondary: '#FF5722',
        accent: '#D84315',
        background: '#0F0A0A',
        surface: '#1F1414',
        text: {
          primary: '#FFAB91',
          secondary: '#FF8A65',
          tertiary: '#FF7043',
        },
        gradients: {
          primary: ['#D84315', '#FF7043'],
        },
        particles: '#FF5722',
        border: '#44292A',
      },
      preMenstrual: {
        primary: '#BA68C8',
        secondary: '#9C27B0',
        accent: '#7B1FA2',
        background: '#0B0A0F',
        surface: '#171424',
        text: {
          primary: '#E1BEE7',
          secondary: '#CE93D8',
          tertiary: '#BA68C8',
        },
        gradients: {
          primary: ['#7B1FA2', '#BA68C8'],
        },
        particles: '#9C27B0',
        border: '#2D1F3E',
      },
    },
  },

  summer: {
    light: {
      menstrual: {
        primary: '#FF5722',
        secondary: '#FF8A65',
        accent: '#FFE0B2',
        background: '#FFF8F0',
        surface: '#FFFFFF',
        text: {
          primary: '#BF360C',
          secondary: '#D84315',
          tertiary: '#FF5722',
        },
        gradients: {
          primary: ['#FFE0B2', '#FF5722'],
        },
        particles: '#FF8A65',
        border: '#FFAB91',
      },
      postMenstrual: {
        primary: '#FF9800',
        secondary: '#FFB74D',
        accent: '#FFF8E1',
        background: '#FFFEF7',
        surface: '#FFFFFF',
        text: {
          primary: '#E65100',
          secondary: '#F57C00',
          tertiary: '#FF9800',
        },
        gradients: {
          primary: ['#FFF8E1', '#FF9800'],
        },
        particles: '#FFB74D',
        border: '#FFCC80',
      },
      fertile: {
        primary: '#FFC107',
        secondary: '#FFD54F',
        accent: '#FFFDE7',
        background: '#FFFEF7',
        surface: '#FFFFFF',
        text: {
          primary: '#F57F17',
          secondary: '#F9A825',
          tertiary: '#FBC02D',
        },
        gradients: {
          primary: ['#FFFDE7', '#FFC107'],
        },
        particles: '#FFD54F',
        border: '#FFE082',
      },
      ovulation: {
        primary: '#FFEB3B',
        secondary: '#FFF176',
        accent: '#FFF9C4',
        background: '#FFFEF5',
        surface: '#FFFFFF',
        text: {
          primary: '#F57F17',
          secondary: '#F9A825',
          tertiary: '#FBC02D',
        },
        gradients: {
          primary: ['#FFF9C4', '#FFEB3B'],
        },
        particles: '#FFF176',
        border: '#FFF59D',
      },
      preMenstrual: {
        primary: '#FF6F00',
        secondary: '#FF8F00',
        accent: '#FFCC80',
        background: '#FFF3E0',
        surface: '#FFFFFF',
        text: {
          primary: '#E65100',
          secondary: '#EF6C00',
          tertiary: '#FF6F00',
        },
        gradients: {
          primary: ['#FFCC80', '#FF6F00'],
        },
        particles: '#FF8F00',
        border: '#FFB74D',
      },
    },
    dark: {
      menstrual: {
        primary: '#FF5722',
        secondary: '#D84315',
        accent: '#BF360C',
        background: '#0F0A08',
        surface: '#1F1410',
        text: {
          primary: '#FFAB91',
          secondary: '#FF8A65',
          tertiary: '#FF7043',
        },
        gradients: {
          primary: ['#BF360C', '#FF5722'],
        },
        particles: '#D84315',
        border: '#44292A',
      },
      postMenstrual: {
        primary: '#FF9800',
        secondary: '#F57C00',
        accent: '#E65100',
        background: '#0F0C08',
        surface: '#1F1B14',
        text: {
          primary: '#FFCC80',
          secondary: '#FFB74D',
          tertiary: '#FFA726',
        },
        gradients: {
          primary: ['#E65100', '#FF9800'],
        },
        particles: '#F57C00',
        border: '#3E2723',
      },
      fertile: {
        primary: '#FFC107',
        secondary: '#FFA000',
        accent: '#FF8F00',
        background: '#0F0E08',
        surface: '#1F1C0F',
        text: {
          primary: '#FFF9C4',
          secondary: '#FFF176',
          tertiary: '#FFD54F',
        },
        gradients: {
          primary: ['#FF8F00', '#FFC107'],
        },
        particles: '#FFA000',
        border: '#3D3317',
      },
      ovulation: {
        primary: '#FFEB3B',
        secondary: '#FDD835',
        accent: '#F9A825',
        background: '#0F0F08',
        surface: '#1F1F0F',
        text: {
          primary: '#FFF9C4',
          secondary: '#FFF176',
          tertiary: '#FFD54F',
        },
        gradients: {
          primary: ['#F9A825', '#FFEB3B'],
        },
        particles: '#FDD835',
        border: '#3D3C17',
      },
      preMenstrual: {
        primary: '#FF6F00',
        secondary: '#E65100',
        accent: '#BF360C',
        background: '#0E0B07',
        surface: '#1E1711',
        text: {
          primary: '#FFCC80',
          secondary: '#FFB74D',
          tertiary: '#FFA726',
        },
        gradients: {
          primary: ['#BF360C', '#FF6F00'],
        },
        particles: '#E65100',
        border: '#3C2014',
      },
    },
  },

  autumn: {
    light: {
      menstrual: {
        primary: '#8D6E63',
        secondary: '#A1887F',
        accent: '#D7CCC8',
        background: '#EFEBE9',
        surface: '#FFFFFF',
        text: {
          primary: '#3E2723',
          secondary: '#5D4037',
          tertiary: '#6D4C41',
        },
        gradients: {
          primary: ['#D7CCC8', '#8D6E63'],
        },
        particles: '#A1887F',
        border: '#BCAAA4',
      },
      postMenstrual: {
        primary: '#FF8F00',
        secondary: '#FFB300',
        accent: '#FFECB3',
        background: '#FFF8E1',
        surface: '#FFFFFF',
        text: {
          primary: '#E65100',
          secondary: '#EF6C00',
          tertiary: '#FF6F00',
        },
        gradients: {
          primary: ['#FFECB3', '#FF8F00'],
        },
        particles: '#FFB300',
        border: '#FFD180',
      },
      fertile: {
        primary: '#FF6D00',
        secondary: '#FF8F00',
        accent: '#FFE0B2',
        background: '#FFF3E0',
        surface: '#FFFFFF',
        text: {
          primary: '#BF360C',
          secondary: '#D84315',
          tertiary: '#FF5722',
        },
        gradients: {
          primary: ['#FFE0B2', '#FF6D00'],
        },
        particles: '#FF8F00',
        border: '#FFAB91',
      },
      ovulation: {
        primary: '#D84315',
        secondary: '#FF5722',
        accent: '#FFAB91',
        background: '#FFF3E0',
        surface: '#FFFFFF',
        text: {
          primary: '#BF360C',
          secondary: '#D84315',
          tertiary: '#FF5722',
        },
        gradients: {
          primary: ['#FFAB91', '#D84315'],
        },
        particles: '#FF5722',
        border: '#FF8A65',
      },
      preMenstrual: {
        primary: '#795548',
        secondary: '#8D6E63',
        accent: '#BCAAA4',
        background: '#EFEBE9',
        surface: '#FFFFFF',
        text: {
          primary: '#3E2723',
          secondary: '#5D4037',
          tertiary: '#6D4C41',
        },
        gradients: {
          primary: ['#BCAAA4', '#795548'],
        },
        particles: '#8D6E63',
        border: '#A1887F',
      },
    },
    dark: {
      menstrual: {
        primary: '#8D6E63',
        secondary: '#6D4C41',
        accent: '#5D4037',
        background: '#0B0908',
        surface: '#161211',
        text: {
          primary: '#D7CCC8',
          secondary: '#BCAAA4',
          tertiary: '#A1887F',
        },
        gradients: {
          primary: ['#5D4037', '#8D6E63'],
        },
        particles: '#6D4C41',
        border: '#2D1F1A',
      },
      postMenstrual: {
        primary: '#FF8F00',
        secondary: '#E65100',
        accent: '#BF360C',
        background: '#0F0C08',
        surface: '#1F1B14',
        text: {
          primary: '#FFECB3',
          secondary: '#FFD180',
          tertiary: '#FFB300',
        },
        gradients: {
          primary: ['#BF360C', '#FF8F00'],
        },
        particles: '#E65100',
        border: '#3E2723',
      },
      fertile: {
        primary: '#FF6D00',
        secondary: '#D84315',
        accent: '#BF360C',
        background: '#0F0A0A',
        surface: '#1F1414',
        text: {
          primary: '#FFE0B2',
          secondary: '#FFAB91',
          tertiary: '#FF8A65',
        },
        gradients: {
          primary: ['#BF360C', '#FF6D00'],
        },
        particles: '#D84315',
        border: '#44292A',
      },
      ovulation: {
        primary: '#D84315',
        secondary: '#BF360C',
        accent: '#8D2F00',
        background: '#0E0908',
        surface: '#1D1512',
        text: {
          primary: '#FFAB91',
          secondary: '#FF8A65',
          tertiary: '#FF7043',
        },
        gradients: {
          primary: ['#8D2F00', '#D84315'],
        },
        particles: '#BF360C',
        border: '#3C241F',
      },
      preMenstrual: {
        primary: '#795548',
        secondary: '#5D4037',
        accent: '#4E342E',
        background: '#0A0807',
        surface: '#141110',
        text: {
          primary: '#D7CCC8',
          secondary: '#BCAAA4',
          tertiary: '#A1887F',
        },
        gradients: {
          primary: ['#4E342E', '#795548'],
        },
        particles: '#5D4037',
        border: '#261E1A',
      },
    },
  },

  winter: {
    light: {
      menstrual: {
        primary: '#2196F3',
        secondary: '#64B5F6',
        accent: '#BBDEFB',
        background: '#E3F2FD',
        surface: '#FFFFFF',
        text: {
          primary: '#0D47A1',
          secondary: '#1565C0',
          tertiary: '#1976D2',
        },
        gradients: {
          primary: ['#BBDEFB', '#2196F3'],
        },
        particles: '#64B5F6',
        border: '#90CAF9',
      },
      postMenstrual: {
        primary: '#00BCD4',
        secondary: '#4DD0E1',
        accent: '#B2EBF2',
        background: '#E0F2F1',
        surface: '#FFFFFF',
        text: {
          primary: '#006064',
          secondary: '#00838F',
          tertiary: '#0097A7',
        },
        gradients: {
          primary: ['#B2EBF2', '#00BCD4'],
        },
        particles: '#4DD0E1',
        border: '#80DEEA',
      },
      fertile: {
        primary: '#9C27B0',
        secondary: '#BA68C8',
        accent: '#E1BEE7',
        background: '#F3E5F5',
        surface: '#FFFFFF',
        text: {
          primary: '#4A148C',
          secondary: '#6A1B9A',
          tertiary: '#7B1FA2',
        },
        gradients: {
          primary: ['#E1BEE7', '#9C27B0'],
        },
        particles: '#BA68C8',
        border: '#CE93D8',
      },
      ovulation: {
        primary: '#3F51B5',
        secondary: '#5C6BC0',
        accent: '#C5CAE9',
        background: '#E8EAF6',
        surface: '#FFFFFF',
        text: {
          primary: '#1A237E',
          secondary: '#283593',
          tertiary: '#303F9F',
        },
        gradients: {
          primary: ['#C5CAE9', '#3F51B5'],
        },
        particles: '#5C6BC0',
        border: '#9FA8DA',
      },
      preMenstrual: {
        primary: '#607D8B',
        secondary: '#78909C',
        accent: '#B0BEC5',
        background: '#ECEFF1',
        surface: '#FFFFFF',
        text: {
          primary: '#263238',
          secondary: '#37474F',
          tertiary: '#455A64',
        },
        gradients: {
          primary: ['#B0BEC5', '#607D8B'],
        },
        particles: '#78909C',
        border: '#90A4AE',
      },
    },
    dark: {
      menstrual: {
        primary: '#2196F3',
        secondary: '#1976D2',
        accent: '#1565C0',
        background: '#0A0E12',
        surface: '#141B24',
        text: {
          primary: '#BBDEFB',
          secondary: '#90CAF9',
          tertiary: '#64B5F6',
        },
        gradients: {
          primary: ['#1565C0', '#2196F3'],
        },
        particles: '#1976D2',
        border: '#1F3A48',
      },
      postMenstrual: {
        primary: '#00BCD4',
        secondary: '#0097A7',
        accent: '#00838F',
        background: '#0A1012',
        surface: '#142024',
        text: {
          primary: '#B2EBF2',
          secondary: '#80DEEA',
          tertiary: '#4DD0E1',
        },
        gradients: {
          primary: ['#00838F', '#00BCD4'],
        },
        particles: '#0097A7',
        border: '#1F4044',
      },
      fertile: {
        primary: '#9C27B0',
        secondary: '#7B1FA2',
        accent: '#6A1B9A',
        background: '#0B0A0F',
        surface: '#171424',
        text: {
          primary: '#E1BEE7',
          secondary: '#CE93D8',
          tertiary: '#BA68C8',
        },
        gradients: {
          primary: ['#6A1B9A', '#9C27B0'],
        },
        particles: '#7B1FA2',
        border: '#2D1F3E',
      },
      ovulation: {
        primary: '#3F51B5',
        secondary: '#303F9F',
        accent: '#283593',
        background: '#0A0B0F',
        surface: '#141624',
        text: {
          primary: '#C5CAE9',
          secondary: '#9FA8DA',
          tertiary: '#7986CB',
        },
        gradients: {
          primary: ['#283593', '#3F51B5'],
        },
        particles: '#303F9F',
        border: '#1F2547',
      },
      preMenstrual: {
        primary: '#607D8B',
        secondary: '#455A64',
        accent: '#37474F',
        background: '#090A0B',
        surface: '#13161A',
        text: {
          primary: '#B0BEC5',
          secondary: '#90A4AE',
          tertiary: '#78909C',
        },
        gradients: {
          primary: ['#37474F', '#607D8B'],
        },
        particles: '#455A64',
        border: '#1E2832',
      },
    },
  },
};

// ===== HELPER FUNCTIONS =====
export const getCurrentSeason = (): SeasonalTheme => {
  const currentMonth = new Date().getMonth() + 1; // Janeiro = 1
  
  if ([3, 4, 5].includes(currentMonth)) return 'spring';
  if ([6, 7, 8].includes(currentMonth)) return 'summer';
  if ([9, 10, 11].includes(currentMonth)) return 'autumn';
  return 'winter';
};

export const getSeasonalThemeColors = (
  season: SeasonalTheme,
  mode: ThemeMode,
  phase: CyclePhase
) => {
  return SEASONAL_THEMES[season][mode][phase];
};

export const getSeasonalParticles = (season: SeasonalTheme): string[] => {
  return SEASONAL_THEME_CONFIGS[season].specialParticles;
};

export const getAllSeasons = (): SeasonalTheme[] => {
  return Object.keys(SEASONAL_THEME_CONFIGS) as SeasonalTheme[];
};

export const getSeasonConfig = (season: SeasonalTheme) => {
  return SEASONAL_THEME_CONFIGS[season];
};