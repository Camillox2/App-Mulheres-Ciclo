// hooks/useThemeSystem.ts - SISTEMA DE TEMAS PERSONALIZADO
import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FlowerTheme,
  ThemeMode,
  CyclePhase,
  getThemeColors,
  getFlowerParticles,
  getThemeConfig,
  FLOWER_THEME_CONFIGS,
} from '../constants/flowerThemes';

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

interface AdaptiveTheme {
  // Configurações básicas
  mode: ThemeMode;
  phase: CyclePhase;
  flowerTheme: FlowerTheme;
  intensity: number;
  
  // Cores atuais
  colors: ThemeColors;
  
  // Configuração do tema floral
  themeConfig: {
    name: string;
    icon: string;
    emoji: string;
    description: string;
    flowerType: string;
  };
  
  // Partículas para o tema atual
  flowerParticles: string[];
}

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

const STORAGE_KEYS = {
  THEME_MODE: 'themeMode',
  FLOWER_THEME: 'flowerTheme',
  CYCLE_DATA: 'cycleData',
} as const;

const DEFAULT_SETTINGS = {
  mode: 'dark' as ThemeMode,
  flowerTheme: 'rose' as FlowerTheme,
  phase: 'menstrual' as CyclePhase,
  intensity: 0.8,
};

export const useThemeSystem = () => {
  // Estados principais
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_SETTINGS.mode);
  const [flowerTheme, setFlowerTheme] = useState<FlowerTheme>(DEFAULT_SETTINGS.flowerTheme);
  const [phase, setPhase] = useState<CyclePhase>(DEFAULT_SETTINGS.phase);
  const [intensity, setIntensity] = useState(DEFAULT_SETTINGS.intensity);
  const [isLoading, setIsLoading] = useState(true);

  // ===== CÁLCULO DA FASE ATUAL =====
  const getCurrentPhase = useCallback(async (): Promise<{
    phase: CyclePhase;
    intensity: number;
  }> => {
    try {
      const cycleData = await AsyncStorage.getItem(STORAGE_KEYS.CYCLE_DATA);
      if (!cycleData) {
        return { phase: DEFAULT_SETTINGS.phase, intensity: DEFAULT_SETTINGS.intensity };
      }

      const { lastPeriodDate, averageCycleLength, averagePeriodLength }: CycleData = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const daysSinceLastPeriod = today.diff(lastPeriod, 'days');
      
      // Normaliza para o ciclo atual
      const dayOfCycle = (daysSinceLastPeriod % averageCycleLength) + 1;
      const ovulationDay = averageCycleLength - 14;
      
      let currentPhase: CyclePhase;
      let phaseIntensity: number;

      // Determina a fase atual
      if (dayOfCycle <= averagePeriodLength) {
        currentPhase = 'menstrual';
        // Intensidade máxima no meio da menstruação
        const midPeriod = Math.ceil(averagePeriodLength / 2);
        const distanceFromMid = Math.abs(dayOfCycle - midPeriod);
        phaseIntensity = Math.max(0.4, 1 - (distanceFromMid / midPeriod) * 0.6);
      } else if (dayOfCycle < ovulationDay - 2) {
        currentPhase = 'postMenstrual';
        // Intensidade cresce gradualmente
        const phaseDay = dayOfCycle - averagePeriodLength;
        const phaseLength = (ovulationDay - 2) - averagePeriodLength;
        phaseIntensity = Math.min(1, 0.3 + (phaseDay / phaseLength) * 0.7);
      } else if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
        if (dayOfCycle === ovulationDay) {
          currentPhase = 'ovulation';
          phaseIntensity = 1; // Intensidade máxima na ovulação
        } else {
          currentPhase = 'fertile';
          // Alta intensidade próximo à ovulação
          const distanceFromOvulation = Math.abs(dayOfCycle - ovulationDay);
          phaseIntensity = Math.max(0.7, 1 - distanceFromOvulation * 0.15);
        }
      } else {
        currentPhase = 'preMenstrual';
        // Intensidade varia conforme proximidade da menstruação
        const daysUntilNextPeriod = averageCycleLength - dayOfCycle + 1;
        phaseIntensity = Math.max(0.3, Math.min(0.9, (7 - daysUntilNextPeriod) / 7));
      }

      return { phase: currentPhase, intensity: Math.round(phaseIntensity * 100) / 100 };
    } catch (error) {
      console.error('Erro ao calcular fase atual:', error);
      return { phase: DEFAULT_SETTINGS.phase, intensity: DEFAULT_SETTINGS.intensity };
    }
  }, []);

  // ===== CARREGAMENTO DE CONFIGURAÇÕES =====
  const loadSavedSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [savedMode, savedFlowerTheme, phaseData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.FLOWER_THEME),
        getCurrentPhase(),
      ]);

      // Aplica configurações salvas ou usa padrões
      if (savedMode === 'light' || savedMode === 'dark') {
        setMode(savedMode);
      }
      
      if (savedFlowerTheme && FLOWER_THEME_CONFIGS[savedFlowerTheme as FlowerTheme]) {
        setFlowerTheme(savedFlowerTheme as FlowerTheme);
      }

      // Aplica fase e intensidade calculadas
      setPhase(phaseData.phase);
      setIntensity(phaseData.intensity);
      
    } catch (error) {
      console.error('Erro ao carregar configurações de tema:', error);
      // Usa configurações padrão em caso de erro
      setMode(DEFAULT_SETTINGS.mode);
      setFlowerTheme(DEFAULT_SETTINGS.flowerTheme);
      setPhase(DEFAULT_SETTINGS.phase);
      setIntensity(DEFAULT_SETTINGS.intensity);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentPhase]);

  // ===== ATUALIZAÇÃO DE CONFIGURAÇÕES =====
  const updateThemeMode = useCallback(async (newMode: ThemeMode) => {
    try {
      setMode(newMode);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
    } catch (error) {
      console.error('Erro ao salvar modo do tema:', error);
    }
  }, []);

  const updateFlowerTheme = useCallback(async (newFlowerTheme: FlowerTheme) => {
    try {
      setFlowerTheme(newFlowerTheme);
      await AsyncStorage.setItem(STORAGE_KEYS.FLOWER_THEME, newFlowerTheme);
    } catch (error) {
      console.error('Erro ao salvar tema floral:', error);
    }
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    updateThemeMode(newMode);
  }, [mode, updateThemeMode]);

  const refreshPhase = useCallback(async () => {
    try {
      const phaseData = await getCurrentPhase();
      setPhase(phaseData.phase);
      setIntensity(phaseData.intensity);
    } catch (error) {
      console.error('Erro ao atualizar fase:', error);
    }
  }, [getCurrentPhase]);

  // ===== CONSTRUÇÃO DO TEMA ATUAL =====
  const buildCurrentTheme = useCallback((): AdaptiveTheme => {
    const colors = getThemeColors(flowerTheme, mode, phase);
    const themeConfig = getThemeConfig(flowerTheme);
    const flowerParticles = getFlowerParticles(flowerTheme);

    return {
      mode,
      phase,
      flowerTheme,
      intensity,
      colors,
      themeConfig,
      flowerParticles,
    };
  }, [mode, phase, flowerTheme, intensity]);

  // ===== EFEITOS =====
  useEffect(() => {
    loadSavedSettings();
  }, [loadSavedSettings]);

  // Atualiza fase automaticamente a cada hora
  useEffect(() => {
    const interval = setInterval(refreshPhase, 60 * 60 * 1000); // 1 hora
    return () => clearInterval(interval);
  }, [refreshPhase]);

  // ===== TEMA ATUAL =====
  const theme = buildCurrentTheme();

  // ===== FUNÇÕES AUXILIARES =====
  const getAvailableThemes = useCallback(() => {
    return Object.entries(FLOWER_THEME_CONFIGS).map(([key, config]) => ({
      key: key as FlowerTheme,
      ...config,
    }));
  }, []);

  const getThemePreview = useCallback((previewTheme: FlowerTheme, previewMode?: ThemeMode) => {
    const targetMode = previewMode || mode;
    const colors = getThemeColors(previewTheme, targetMode, phase);
    const config = getThemeConfig(previewTheme);
    
    return {
      colors,
      config,
      flowerParticles: getFlowerParticles(previewTheme),
    };
  }, [mode, phase]);

  const getPhaseInfo = useCallback(() => {
    const phaseDescriptions = {
      menstrual: {
        name: 'Menstruação',
        emoji: '🌸',
        description: 'Período de renovação e autocuidado',
      },
      postMenstrual: {
        name: 'Pós-Menstrual',
        emoji: '🌱',
        description: 'Energia renovada e disposição',
      },
      fertile: {
        name: 'Período Fértil',
        emoji: '🔥',
        description: 'Alta energia e criatividade',
      },
      ovulation: {
        name: 'Ovulação',
        emoji: '⭐',
        description: 'Pico de energia e fertilidade',
      },
      preMenstrual: {
        name: 'Pré-Menstrual',
        emoji: '💜',
        description: 'Preparação e introspecção',
      },
    };

    return phaseDescriptions[phase];
  }, [phase]);

  const getDaysUntilNextPhase = useCallback(async () => {
    try {
      const cycleData = await AsyncStorage.getItem(STORAGE_KEYS.CYCLE_DATA);
      if (!cycleData) return null;

      const { lastPeriodDate, averageCycleLength }: CycleData = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const dayOfCycle = (today.diff(lastPeriod, 'days') % averageCycleLength) + 1;

      switch (phase) {
        case 'menstrual':
          // Próxima fase: pós-menstrual
          const periodEndDay = Math.min(5, averageCycleLength / 6);
          return Math.max(0, periodEndDay - dayOfCycle + 1);
        
        case 'postMenstrual':
          // Próxima fase: período fértil
          const fertileStartDay = averageCycleLength - 16;
          return Math.max(0, fertileStartDay - dayOfCycle);
        
        case 'fertile':
        case 'ovulation':
          // Próxima fase: pré-menstrual
          const preMenstrualStartDay = averageCycleLength - 11;
          return Math.max(0, preMenstrualStartDay - dayOfCycle);
        
        case 'preMenstrual':
          // Próxima fase: menstruação
          return Math.max(0, averageCycleLength - dayOfCycle + 1);
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Erro ao calcular dias até próxima fase:', error);
      return null;
    }
  }, [phase]);

  // ===== RETORNO DO HOOK =====
  return {
    // Estado atual
    theme: isLoading ? null : theme,
    isLoading,
    
    // Configurações
    mode,
    flowerTheme,
    phase,
    intensity,
    
    // Funções de controle
    toggleMode,
    updateThemeMode,
    updateFlowerTheme,
    refreshPhase,
    
    // Informações auxiliares
    getAvailableThemes,
    getThemePreview,
    getPhaseInfo,
    getDaysUntilNextPhase,
    
    // Estados derivados
    isLightMode: mode === 'light',
    isDarkMode: mode === 'dark',
    phaseProgress: intensity,
    currentPhaseEmoji: getPhaseInfo().emoji,
    currentPhaseName: getPhaseInfo().name,
    
    // Compatibilidade com useAdaptiveTheme
    colors: theme?.colors,
    themeConfig: theme?.themeConfig,
    flowerParticles: theme?.flowerParticles,
  };
};

// ===== HOOK DE PREVIEW DE TEMA =====
export const useThemePreview = () => {
  const [previewTheme, setPreviewTheme] = useState<FlowerTheme | null>(null);
  const [previewMode, setPreviewMode] = useState<ThemeMode | null>(null);
  const { theme, phase } = useThemeSystem();

  const getPreview = useCallback((targetTheme: FlowerTheme, targetMode?: ThemeMode) => {
    const colors = getThemeColors(targetTheme, targetMode || 'dark', phase);
    const config = getThemeConfig(targetTheme);
    
    return {
      colors,
      config,
      flowerParticles: getFlowerParticles(targetTheme),
    };
  }, [phase]);

  const setPreview = useCallback((targetTheme: FlowerTheme | null, targetMode?: ThemeMode | null) => {
    setPreviewTheme(targetTheme);
    setPreviewMode(targetMode || null);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewTheme(null);
    setPreviewMode(null);
  }, []);

  const currentPreview = previewTheme ? getPreview(previewTheme, previewMode || undefined) : null;

  return {
    preview: currentPreview,
    previewTheme,
    previewMode,
    setPreview,
    clearPreview,
    getPreview,
    isPreviewActive: previewTheme !== null,
  };
};

// ===== HOOK PARA TRANSIÇÕES DE TEMA =====
export const useThemeTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDuration] = useState(800);

  const performTransition = useCallback(async (
    action: () => Promise<void> | void,
    duration?: number
  ) => {
    setIsTransitioning(true);
    
    try {
      await action();
      
      // Aguarda a duração da transição
      await new Promise(resolve => 
        setTimeout(resolve, duration || transitionDuration)
      );
    } catch (error) {
      console.error('Erro durante transição de tema:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [transitionDuration]);

  return {
    isTransitioning,
    transitionDuration,
    performTransition,
  };
};

export default useThemeSystem;