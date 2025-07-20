// hooks/useAdaptiveTheme.ts
import { useState, useEffect } from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CyclePhase = 'menstrual' | 'postMenstrual' | 'fertile' | 'preMenstrual';
export type ThemeMode = 'light' | 'dark';

interface PhaseColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  gradients: string[];
  particles: string;
}

interface AdaptiveTheme {
  mode: ThemeMode;
  phase: CyclePhase;
  colors: PhaseColors;
  intensity: number;
  nextPhaseIn: number;
}

const PHASE_COLORS = {
  light: {
    menstrual: {
      primary: '#E74C3C',
      secondary: '#FF6B9D',
      accent: '#FFB4B4',
      background: '#FFF5F5',
      surface: '#FFFFFF',
      gradients: ['#FFB4B4', '#FF6B9D', '#E74C3C'],
      particles: '#FF6B9D'
    },
    postMenstrual: {
      primary: '#27AE60',
      secondary: '#58D68D',
      accent: '#85E0A3',
      background: '#F8FFF8',
      surface: '#FFFFFF',
      gradients: ['#85E0A3', '#58D68D', '#27AE60'],
      particles: '#58D68D'
    },
    fertile: {
      primary: '#FF4500',
      secondary: '#FF6347',
      accent: '#FFD700',
      background: '#FFFAF0',
      surface: '#FFFFFF',
      gradients: ['#FFD700', '#FF6347', '#FF4500'],
      particles: '#FF6347'
    },
    preMenstrual: {
      primary: '#8E44AD',
      secondary: '#BB86FC',
      accent: '#E1BEE7',
      background: '#FAF8FF',
      surface: '#FFFFFF',
      gradients: ['#E1BEE7', '#BB86FC', '#8E44AD'],
      particles: '#BB86FC'
    }
  },
  dark: {
    menstrual: {
      primary: '#C0392B',
      secondary: '#E74C3C',
      accent: '#FF6B9D',
      background: '#1A0F0F',
      surface: '#2D1B1B',
      gradients: ['#2D1B1B', '#C0392B', '#E74C3C'],
      particles: '#E74C3C'
    },
    postMenstrual: {
      primary: '#1E8449',
      secondary: '#27AE60',
      accent: '#58D68D',
      background: '#0F1A0F',
      surface: '#1B2D1B',
      gradients: ['#1B2D1B', '#1E8449', '#27AE60'],
      particles: '#27AE60'
    },
    fertile: {
      primary: '#CC3700',
      secondary: '#FF4500',
      accent: '#FFD700',
      background: '#1A1000',
      surface: '#2D2000',
      gradients: ['#2D2000', '#CC3700', '#FF4500'],
      particles: '#FF4500'
    },
    preMenstrual: {
      primary: '#6A1B9A',
      secondary: '#8E44AD',
      accent: '#BB86FC',
      background: '#1A0F1A',
      surface: '#2D1B2D',
      gradients: ['#2D1B2D', '#6A1B9A', '#8E44AD'],
      particles: '#8E44AD'
    }
  }
};

export const useAdaptiveTheme = () => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<AdaptiveTheme | null>(null);

  // Calcula a fase atual do ciclo
  const getCurrentPhase = async (): Promise<{phase: CyclePhase, intensity: number, nextPhaseIn: number}> => {
    try {
      const cycleData = await AsyncStorage.getItem('cycleData');
      if (!cycleData) {
        return { phase: 'menstrual', intensity: 0.8, nextPhaseIn: 0 };
      }

      const { lastPeriodDate, averageCycleLength } = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const dayOfCycle = today.diff(lastPeriod, 'days') + 1;
      
      // Normaliza para o ciclo atual
      const normalizedDay = ((dayOfCycle - 1) % averageCycleLength) + 1;
      
      let phase: CyclePhase;
      let nextPhaseIn: number;
      
      if (normalizedDay >= 1 && normalizedDay <= 5) {
        phase = 'menstrual';
        nextPhaseIn = 6 - normalizedDay;
      } else if (normalizedDay >= 6 && normalizedDay <= 11) {
        phase = 'postMenstrual';
        nextPhaseIn = 12 - normalizedDay;
      } else if (normalizedDay >= 12 && normalizedDay <= 16) {
        phase = 'fertile';
        nextPhaseIn = 17 - normalizedDay;
      } else {
        phase = 'preMenstrual';
        nextPhaseIn = (averageCycleLength + 1) - normalizedDay;
      }
      
      // Calcula intensidade baseada na proximidade do meio da fase
      const intensity = calculatePhaseIntensity(normalizedDay, phase, averageCycleLength);
      
      return { phase, intensity, nextPhaseIn };
      
    } catch (error) {
      console.error('Erro ao calcular fase:', error);
      return { phase: 'menstrual', intensity: 0.8, nextPhaseIn: 0 };
    }
  };

  // Calcula intensidade da fase
  const calculatePhaseIntensity = (dayOfCycle: number, phase: CyclePhase, cycleLength: number): number => {
    let phaseRange: [number, number];
    
    switch (phase) {
      case 'menstrual':
        phaseRange = [1, 5];
        break;
      case 'postMenstrual':
        phaseRange = [6, 11];
        break;
      case 'fertile':
        phaseRange = [12, 16];
        break;
      case 'preMenstrual':
        phaseRange = [17, cycleLength];
        break;
    }
    
    const [start, end] = phaseRange;
    const middle = Math.floor((start + end) / 2);
    const distanceFromMiddle = Math.abs(dayOfCycle - middle);
    const maxDistance = Math.floor((end - start) / 2);
    
    return Math.max(0.4, 1.0 - (distanceFromMiddle / maxDistance) * 0.6);
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
    const colors = PHASE_COLORS[mode][phase];
    
    setCurrentTheme({
      mode,
      phase,
      colors,
      intensity,
      nextPhaseIn
    });
  };

  // Carrega configurações salvas
  const loadSavedMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) {
        setMode(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Erro ao carregar modo do tema:', error);
    }
  };

  // Inicialização
  useEffect(() => {
    loadSavedMode();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [mode]);

  return {
    theme: currentTheme,
    toggleMode,
    updateTheme,
    isLightMode: mode === 'light',
    isDarkMode: mode === 'dark'
  };
};