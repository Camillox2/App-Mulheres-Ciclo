// hooks/useAdaptiveTheme.ts - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CyclePhase = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';
export type ThemeMode = 'light' | 'dark';

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
  };
  particles: string;
  border: string;
}

interface AdaptiveTheme {
  mode: ThemeMode;
  phase: CyclePhase;
  colors: ThemeColors;
  intensity: number;
}

// TEMA PADRÃO SEMPRE DISPONÍVEL
const DEFAULT_THEME: AdaptiveTheme = {
  mode: 'dark',
  phase: 'menstrual',
  intensity: 0.8,
  colors: {
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
    },
    particles: '#BE185D',
    border: '#44262F',
  },
};

// TEMAS SIMPLIFICADOS
const THEMES = {
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
      gradients: { primary: ['#831843', '#EC4899'] as [string, string] },
      particles: '#BE185D',
      border: '#44262F',
    },
    postMenstrual: {
      primary: '#10B981',
      secondary: '#047857',
      accent: '#064E3B',
      background: '#0A0F0C',
      surface: '#14241A',
      text: {
        primary: '#A7F3D0',
        secondary: '#6EE7B7',
        tertiary: '#34D399',
      },
      gradients: { primary: ['#064E3B', '#10B981'] as [string, string] },
      particles: '#047857',
      border: '#1F4A37',
    },
    fertile: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#991B1B',
      background: '#0F0A0A',
      surface: '#241818',
      text: {
        primary: '#FECACA',
        secondary: '#FCA5A5',
        tertiary: '#F87171',
      },
      gradients: { primary: ['#991B1B', '#EF4444'] as [string, string] },
      particles: '#DC2626',
      border: '#44292A',
    },
    ovulation: {
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
      gradients: { primary: ['#D97706', '#FBBF24'] as [string, string] },
      particles: '#F59E0B',
      border: '#44401F',
    },
    preMenstrual: {
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
      gradients: { primary: ['#6D28D9', '#8B5CF6'] as [string, string] },
      particles: '#7C3AED',
      border: '#2D1F47',
    },
  },
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
      gradients: { primary: ['#FFE5F0', '#D63384'] as [string, string] },
      particles: '#F8BBD9',
      border: '#F0E6EA',
    },
    postMenstrual: {
      primary: '#059669',
      secondary: '#A7F3D0',
      accent: '#ECFDF5',
      background: '#FEFFFE',
      surface: '#FFFFFF',
      text: {
        primary: '#064E3B',
        secondary: '#047857',
        tertiary: '#10B981',
      },
      gradients: { primary: ['#ECFDF5', '#059669'] as [string, string] },
      particles: '#A7F3D0',
      border: '#D1FAE5',
    },
    fertile: {
      primary: '#DC2626',
      secondary: '#FCA5A5',
      accent: '#FEF2F2',
      background: '#FFFBFB',
      surface: '#FFFFFF',
      text: {
        primary: '#7F1D1D',
        secondary: '#991B1B',
        tertiary: '#DC2626',
      },
      gradients: { primary: ['#FEF2F2', '#DC2626'] as [string, string] },
      particles: '#FCA5A5',
      border: '#FED7D7',
    },
    ovulation: {
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
      gradients: { primary: ['#FFFBEB', '#F59E0B'] as [string, string] },
      particles: '#FDE68A',
      border: '#FEF3C7',
    },
    preMenstrual: {
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
      gradients: { primary: ['#F5F3FF', '#7C3AED'] as [string, string] },
      particles: '#C4B5FD',
      border: '#E9D5FF',
    },
  },
};

export const useAdaptiveTheme = () => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [phase, setPhase] = useState<CyclePhase>('menstrual');
  const [intensity, setIntensity] = useState(0.8);

  // SEMPRE retorna um tema - nunca null
  const theme: AdaptiveTheme = {
    mode,
    phase,
    intensity,
    colors: THEMES[mode][phase],
  };

  const getCurrentPhase = async (): Promise<CyclePhase> => {
    try {
      const cycleData = await AsyncStorage.getItem('cycleData');
      if (!cycleData) return 'menstrual';

      const { lastPeriodDate, averageCycleLength, averagePeriodLength } = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const daysSinceLastPeriod = today.diff(lastPeriod, 'days');
      const dayOfCycle = (daysSinceLastPeriod % averageCycleLength) + 1;
      
      const ovulationDay = averageCycleLength - 14;
      
      if (dayOfCycle <= averagePeriodLength) {
        return 'menstrual';
      } else if (dayOfCycle < ovulationDay - 2) {
        return 'postMenstrual';
      } else if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
        if (dayOfCycle === ovulationDay) return 'ovulation';
        return 'fertile';
      } else {
        return 'preMenstrual';
      }
    } catch (error) {
      console.error('Erro ao calcular fase:', error);
      return 'menstrual';
    }
  };

  const loadSavedMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode === 'light' || savedMode === 'dark') {
        setMode(savedMode);
      }
    } catch (error) {
      console.error('Erro ao carregar modo:', error);
    }
  };

  const updatePhase = async () => {
    const currentPhase = await getCurrentPhase();
    setPhase(currentPhase);
  };

  const toggleMode = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  useEffect(() => {
    loadSavedMode();
    updatePhase();
  }, []);

  return {
    theme,
    toggleMode,
    updateTheme: updatePhase,
    isLightMode: mode === 'light',
    isDarkMode: mode === 'dark',
    phaseProgress: intensity,
  };
};