// hooks/useAdaptiveTheme.ts - VERSÃO ATUALIZADA
import { useState, useEffect } from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOPHISTICATED_COLORS, createThemeUtils } from '../constants/desingSystem';

export type CyclePhase = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';
export type ThemeMode = 'light' | 'dark';

interface PhaseColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    card: string[];
  };
  particles: string;
  border: string;
}

interface AdaptiveTheme {
  mode: ThemeMode;
  phase: CyclePhase;
  colors: PhaseColors;
  intensity: number;
  nextPhaseIn: number;
  utils: ReturnType<typeof createThemeUtils>;
  // Propriedades de compatibilidade para não quebrar código existente
  gradients?: string[];
}

export const useAdaptiveTheme = () => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<AdaptiveTheme | null>(null);

  // Calcula a fase atual do ciclo com melhor precisão
  const getCurrentPhase = async (): Promise<{
    phase: CyclePhase;
    intensity: number;
    nextPhaseIn: number;
  }> => {
    try {
      const cycleData = await AsyncStorage.getItem('cycleData');
      if (!cycleData) {
        return { phase: 'menstrual', intensity: 0.8, nextPhaseIn: 0 };
      }

      const { lastPeriodDate, averageCycleLength, averagePeriodLength } = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const daysSinceLastPeriod = today.diff(lastPeriod, 'days');
      
      // Normaliza para o ciclo atual
      const normalizedDay = ((daysSinceLastPeriod % averageCycleLength) + averageCycleLength) % averageCycleLength + 1;
      
      let phase: CyclePhase;
      let nextPhaseIn: number;
      
      // Calcula a ovulação baseada no ciclo (tipicamente 14 dias antes do fim)
      const ovulationDay = averageCycleLength - 14;
      const fertileStart = ovulationDay - 5;
      const fertileEnd = ovulationDay + 1;
      
      if (normalizedDay >= 1 && normalizedDay <= averagePeriodLength) {
        phase = 'menstrual';
        nextPhaseIn = averagePeriodLength + 1 - normalizedDay;
      } else if (normalizedDay > averagePeriodLength && normalizedDay < fertileStart) {
        phase = 'postMenstrual';
        nextPhaseIn = fertileStart - normalizedDay;
      } else if (normalizedDay === ovulationDay) {
        phase = 'ovulation';
        nextPhaseIn = 1; // Ovulação dura 1 dia
      } else if (normalizedDay >= fertileStart && normalizedDay <= fertileEnd) {
        phase = 'fertile';
        nextPhaseIn = fertileEnd + 1 - normalizedDay;
      } else {
        phase = 'preMenstrual';
        nextPhaseIn = (averageCycleLength + 1) - normalizedDay;
      }
      
      // Calcula intensidade baseada na posição dentro da fase
      const intensity = calculatePhaseIntensity(normalizedDay, phase, averageCycleLength, averagePeriodLength);
      
      return { phase, intensity, nextPhaseIn };
      
    } catch (error) {
      console.error('Erro ao calcular fase:', error);
      return { phase: 'menstrual', intensity: 0.8, nextPhaseIn: 0 };
    }
  };

  // Calcula intensidade da fase com base em curvas naturais
  const calculatePhaseIntensity = (
    dayOfCycle: number, 
    phase: CyclePhase, 
    cycleLength: number,
    periodLength: number
  ): number => {
    const ovulationDay = cycleLength - 14;
    
    switch (phase) {
      case 'menstrual':
        // Intensidade alta no meio da menstruação
        const midMenstrual = Math.ceil(periodLength / 2);
        const distanceFromMidMenstrual = Math.abs(dayOfCycle - midMenstrual);
        return Math.max(0.6, 1.0 - (distanceFromMidMenstrual / midMenstrual) * 0.4);
        
      case 'postMenstrual':
        // Intensidade cresce gradualmente após a menstruação
        const postMenstrualDays = ovulationDay - 5 - periodLength;
        const dayInPhase = dayOfCycle - periodLength;
        return Math.min(0.9, 0.4 + (dayInPhase / postMenstrualDays) * 0.5);
        
      case 'fertile':
        // Intensidade alta próximo à ovulação
        const distanceFromOvulation = Math.abs(dayOfCycle - ovulationDay);
        return Math.max(0.7, 1.0 - (distanceFromOvulation / 3) * 0.3);
        
      case 'ovulation':
        // Intensidade máxima
        return 1.0;
        
      case 'preMenstrual':
        // Intensidade varia ao longo da fase
        const preMenstrualStart = ovulationDay + 2;
        const dayInPreMenstrual = dayOfCycle - preMenstrualStart;
        const preMenstrualLength = cycleLength - preMenstrualStart;
        
        // Curva que simula mudanças hormonais
        const progress = dayInPreMenstrual / preMenstrualLength;
        return 0.5 + Math.sin(progress * Math.PI) * 0.4;
        
      default:
        return 0.7;
    }
  };

  // Toggle entre modo claro e escuro
  const toggleMode = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
    updateTheme();
  };

  // Atualiza tema baseado na fase atual
  const updateTheme = async () => {
    const { phase, intensity, nextPhaseIn } = await getCurrentPhase();
    const colors = SOPHISTICATED_COLORS[mode][phase];
    const utils = createThemeUtils(colors);
    
    // Cria tema com estrutura compatível
    const theme: AdaptiveTheme = {
      mode,
      phase,
      colors,
      intensity,
      nextPhaseIn,
      utils,
      // Propriedade de compatibilidade
      gradients: colors.gradients.primary,
    };
    
    setCurrentTheme(theme);
  };

  // Carrega configurações salvas
  const loadSavedMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        setMode(savedMode);
      }
    } catch (error) {
      console.error('Erro ao carregar modo do tema:', error);
    }
  };

  // Funções utilitárias expostas
  const getContrastColor = (backgroundColor: string): string => {
    if (!currentTheme) return '#000000';
    return currentTheme.utils.getTextColor(backgroundColor, mode);
  };

  const withOpacity = (color: string, opacity: number): string => {
    if (!currentTheme) return color;
    return currentTheme.utils.withOpacity(color, opacity);
  };

  const generateGradient = (baseColor?: string, intensity?: number): string[] => {
    if (!currentTheme) return ['#FF6B9D', '#FFB4D6'];
    
    if (baseColor) {
      return currentTheme.utils.generateGradient(baseColor, intensity);
    }
    
    return currentTheme.colors.gradients.primary;
  };

  const getElevation = (level: number) => {
    if (!currentTheme) return {};
    return currentTheme.utils.getElevation(level);
  };

  // Inicialização
  useEffect(() => {
    loadSavedMode();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [mode]);

  // Auto-update do tema baseado no tempo (opcional)
  useEffect(() => {
    const interval = setInterval(() => {
      updateTheme();
    }, 60000 * 60); // Atualiza a cada hora

    return () => clearInterval(interval);
  }, [mode]);

  return {
    theme: currentTheme,
    toggleMode,
    updateTheme,
    isLightMode: mode === 'light',
    isDarkMode: mode === 'dark',
    
    // Utilitários expostos
    getContrastColor,
    withOpacity,
    generateGradient,
    getElevation,
    
    // Informações adicionais
    phaseProgress: currentTheme?.intensity || 0,
    daysUntilNextPhase: currentTheme?.nextPhaseIn || 0,
  };
};