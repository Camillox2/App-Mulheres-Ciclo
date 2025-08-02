// hooks/useAdaptiveTheme.ts - VERSÃO FINAL CORRIGIDA
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

// TEMAS COMPLETOS
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
      border: '#4A1818',
    },
    ovulation: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#92400E',
      background: '#0C0A08',
      surface: '#1F1A13',
      text: {
        primary: '#FED7AA',
        secondary: '#FDBA74',
        tertiary: '#FB923C',
      },
      gradients: { primary: ['#92400E', '#F59E0B'] as [string, string] },
      particles: '#D97706',
      border: '#44351A',
    },
    preMenstrual: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#5B21B6',
      background: '#0A0711',
      surface: '#1A1625',
      text: {
        primary: '#DDD6FE',
        secondary: '#C4B5FD',
        tertiary: '#A78BFA',
      },
      gradients: { primary: ['#5B21B6', '#8B5CF6'] as [string, string] },
      particles: '#7C3AED',
      border: '#3C2A5C',
    },
  },
  light: {
    menstrual: {
      primary: '#EC4899',
      secondary: '#BE185D',
      accent: '#831843',
      background: '#FFF5F8',
      surface: '#FFFFFF',
      text: {
        primary: '#831843',
        secondary: '#BE185D',
        tertiary: '#EC4899',
      },
      gradients: { primary: ['#FDF2F8', '#FCE7F3'] as [string, string] },
      particles: '#BE185D',
      border: '#F9A8D4',
    },
    postMenstrual: {
      primary: '#10B981',
      secondary: '#047857',
      accent: '#064E3B',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: {
        primary: '#064E3B',
        secondary: '#047857',
        tertiary: '#10B981',
      },
      gradients: { primary: ['#ECFDF5', '#D1FAE5'] as [string, string] },
      particles: '#047857',
      border: '#86EFAC',
    },
    fertile: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#991B1B',
      background: '#FEF2F2',
      surface: '#FFFFFF',
      text: {
        primary: '#991B1B',
        secondary: '#DC2626',
        tertiary: '#EF4444',
      },
      gradients: { primary: ['#FEF2F2', '#FEE2E2'] as [string, string] },
      particles: '#DC2626',
      border: '#FCA5A5',
    },
    ovulation: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#92400E',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: {
        primary: '#92400E',
        secondary: '#D97706',
        tertiary: '#F59E0B',
      },
      gradients: { primary: ['#FFFBEB', '#FEF3C7'] as [string, string] },
      particles: '#D97706',
      border: '#FCD34D',
    },
    preMenstrual: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#5B21B6',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      text: {
        primary: '#5B21B6',
        secondary: '#7C3AED',
        tertiary: '#8B5CF6',
      },
      gradients: { primary: ['#FAF5FF', '#F3E8FF'] as [string, string] },
      particles: '#7C3AED',
      border: '#C4B5FD',
    },
  },
};

// CUSTOM THEME VARIANTS
const CUSTOM_VARIANTS = {
  rose: { primary: '#FF6B9D', secondary: '#FFB4D6', accent: '#FF8FAB' },
  lavender: { primary: '#9333EA', secondary: '#C084FC', accent: '#A855F7' },
  sunset: { primary: '#F59E0B', secondary: '#FCD34D', accent: '#FBBF24' },
  ocean: { primary: '#0EA5E9', secondary: '#7DD3FC', accent: '#38BDF8' },
  forest: { primary: '#10B981', secondary: '#6EE7B7', accent: '#34D399' },
  cherry: { primary: '#EF4444', secondary: '#FCA5A5', accent: '#F87171' }
};

function getAdaptiveTheme(mode: ThemeMode, phase: CyclePhase, intensity: number): AdaptiveTheme {
  return { mode, phase, intensity, colors: THEMES[mode][phase] };
}

function getCustomTheme(variant: string, mode: ThemeMode, phase: CyclePhase, intensity: number): AdaptiveTheme {
  const baseTheme = getAdaptiveTheme(mode, phase, intensity);
  const colors = CUSTOM_VARIANTS[variant as keyof typeof CUSTOM_VARIANTS] || CUSTOM_VARIANTS.rose;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      gradients: { primary: [colors.accent, colors.primary] as [string, string] },
      particles: colors.secondary,
    },
  };
}

export const useAdaptiveTheme = () => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [phase, setPhase] = useState<CyclePhase>('menstrual');
  const [intensity] = useState(0.8);
  const [customVariant, setCustomVariant] = useState<string | null>(null);
  const [useCustom, setUseCustom] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const calculateCurrentPhase = async (): Promise<CyclePhase> => {
    try {
      const cycleData = await AsyncStorage.getItem('cycleData');
      if (!cycleData) return 'menstrual';
      const { lastPeriodDate, averageCycleLength, averagePeriodLength } = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const daysSinceLastPeriod = today.diff(lastPeriod, 'days');
      const dayOfCycle = (daysSinceLastPeriod % averageCycleLength) + 1;
      const ovulationDay = averageCycleLength - 14;
      
      if (dayOfCycle <= averagePeriodLength) return 'menstrual';
      if (dayOfCycle < ovulationDay - 2) return 'postMenstrual';
      if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
        return dayOfCycle === ovulationDay ? 'ovulation' : 'fertile';
      }
      return 'preMenstrual';
    } catch {
      return 'menstrual';
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedCustom, savedVariant, savedMode] = await Promise.all([
          AsyncStorage.getItem('useCustomTheme'),
          AsyncStorage.getItem('selectedThemeVariant'),
          AsyncStorage.getItem('themeMode')
        ]);
        
        if (savedCustom === 'true' && savedVariant) {
          setUseCustom(true);
          setCustomVariant(savedVariant);
        }
        if (savedMode === 'light' || savedMode === 'dark') setMode(savedMode);
        setPhase(await calculateCurrentPhase());
        setIsReady(true);
      } catch {
        setIsReady(true);
      }
    };
    loadSettings();
  }, []);

  const theme = useCustom && customVariant ? 
    getCustomTheme(customVariant, mode, phase, intensity) :
    getAdaptiveTheme(mode, phase, intensity);

  return {
    theme: isReady ? theme : getAdaptiveTheme('dark', 'menstrual', 0.8),
    toggleMode: async () => {
      const newMode = mode === 'light' ? 'dark' : 'light';
      setMode(newMode);
      await AsyncStorage.setItem('themeMode', newMode);
    },
    updateTheme: async () => setPhase(await calculateCurrentPhase()),
    isLightMode: mode === 'light',
    isDarkMode: mode === 'dark',
    phaseProgress: intensity,
    selectedVariant: customVariant,
    isReady,
    saveThemeVariant: async (variant: string, persist = true) => {
      setCustomVariant(variant);
      setUseCustom(true);
      if (persist) {
        await AsyncStorage.setItem('selectedThemeVariant', variant);
        await AsyncStorage.setItem('useCustomTheme', 'true');
      }
    },
    getAvailableVariants: () => Object.keys(CUSTOM_VARIANTS),
    previewVariant: (variant: string) => {
      setCustomVariant(variant);
      setUseCustom(true);
    },
    disableCustomTheme: async () => {
      setUseCustom(false);
      setCustomVariant(null);
      await AsyncStorage.removeItem('useCustomTheme');
      await AsyncStorage.removeItem('selectedThemeVariant');
    },
  };
}; 
