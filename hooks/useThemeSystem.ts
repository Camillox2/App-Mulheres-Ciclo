// hooks/useThemeSystem.ts - SISTEMA DE TEMAS PERSONALIZADOS INTEGRADO
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { CyclePhase } from './useAdaptiveTheme';
import { useCycleBasedTheme } from './useCycleBasedTheme';

export type ThemeVariant = 'rose' | 'lavender' | 'sunset' | 'ocean' | 'forest' | 'cherry';
export type ThemeMode = 'light' | 'dark';

interface BaseThemeColors {
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

interface AdaptedTheme {
  variant: ThemeVariant;
  mode: ThemeMode;
  phase: CyclePhase;
  colors: BaseThemeColors;
  intensity: number;
}

// DEFINIÇÕES DOS TEMAS BASE CONFORME PLANO
const THEME_VARIANTS = {
  rose: {
    name: 'Rosa Elegante',
    icon: '🌹',
    light: {
      menstrual: {
        primary: '#FF6B9D',
        secondary: '#FFB4D6',
        accent: '#FF8FAB',
        background: '#FFF9FC',
        surface: '#FFFFFF',
        text: { primary: '#2D1B2F', secondary: '#6B4C7A', tertiary: '#9A7AA8' },
        gradients: { primary: ['#FFF0F5', '#FFE5F0'] as [string, string] },
        particles: '#FFB4D6',
        border: '#F5E6EA',
      },
      postMenstrual: {
        primary: '#E91E63',
        secondary: '#F8BBD9',
        accent: '#F48FB1',
        background: '#FFF8FA',
        surface: '#FFFFFF',
        text: { primary: '#2D1B2F', secondary: '#6B4C7A', tertiary: '#9A7AA8' },
        gradients: { primary: ['#FFF0F5', '#FCE4EC'] as [string, string] },
        particles: '#F8BBD9',
        border: '#F5E6EA',
      },
      fertile: {
        primary: '#FF4081',
        secondary: '#FF80AB',
        accent: '#FF6B9D',
        background: '#FFF9FC',
        surface: '#FFFFFF',
        text: { primary: '#2D1B2F', secondary: '#6B4C7A', tertiary: '#9A7AA8' },
        gradients: { primary: ['#FFF5F8', '#FFE8F0'] as [string, string] },
        particles: '#FF80AB',
        border: '#F5E6EA',
      },
      ovulation: {
        primary: '#D81B60',
        secondary: '#F06292',
        accent: '#E91E63',
        background: '#FFF8FA',
        surface: '#FFFFFF',
        text: { primary: '#2D1B2F', secondary: '#6B4C7A', tertiary: '#9A7AA8' },
        gradients: { primary: ['#FFF0F5', '#FCE4EC'] as [string, string] },
        particles: '#F06292',
        border: '#F5E6EA',
      },
      preMenstrual: {
        primary: '#AD1457',
        secondary: '#E91E63',
        accent: '#C2185B',
        background: '#FFF8FA',
        surface: '#FFFFFF',
        text: { primary: '#2D1B2F', secondary: '#6B4C7A', tertiary: '#9A7AA8' },
        gradients: { primary: ['#FFF0F5', '#FCE4EC'] as [string, string] },
        particles: '#E91E63',
        border: '#F5E6EA',
      },
    },
    dark: {
      menstrual: {
        primary: '#FF6B9D',
        secondary: '#FFB4D6',
        accent: '#FF8FAB',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#FECDD3', secondary: '#FDA4AF', tertiary: '#FB7185' },
        gradients: { primary: ['#831843', '#FF6B9D'] as [string, string] },
        particles: '#FFB4D6',
        border: '#44262F',
      },
      postMenstrual: {
        primary: '#E91E63',
        secondary: '#F8BBD9',
        accent: '#F48FB1',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#FECDD3', secondary: '#FDA4AF', tertiary: '#FB7185' },
        gradients: { primary: ['#881337', '#E91E63'] as [string, string] },
        particles: '#F8BBD9',
        border: '#44262F',
      },
      fertile: {
        primary: '#FF4081',
        secondary: '#FF80AB',
        accent: '#FF6B9D',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#FECDD3', secondary: '#FDA4AF', tertiary: '#FB7185' },
        gradients: { primary: ['#9F1239', '#FF4081'] as [string, string] },
        particles: '#FF80AB',
        border: '#44262F',
      },
      ovulation: {
        primary: '#D81B60',
        secondary: '#F06292',
        accent: '#E91E63',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#FECDD3', secondary: '#FDA4AF', tertiary: '#FB7185' },
        gradients: { primary: ['#831843', '#D81B60'] as [string, string] },
        particles: '#F06292',
        border: '#44262F',
      },
      preMenstrual: {
        primary: '#AD1457',
        secondary: '#E91E63',
        accent: '#C2185B',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#FECDD3', secondary: '#FDA4AF', tertiary: '#FB7185' },
        gradients: { primary: ['#701a75', '#AD1457'] as [string, string] },
        particles: '#E91E63',
        border: '#44262F',
      },
    },
  },
  lavender: {
    name: 'Lavanda Suave',
    icon: '💜',
    light: {
      menstrual: {
        primary: '#9C88FF',
        secondary: '#C4B5FD',
        accent: '#A78BFA',
        background: '#F8F5FF',
        surface: '#FFFFFF',
        text: { primary: '#3C1A78', secondary: '#5B21B6', tertiary: '#7C3AED' },
        gradients: { primary: ['#F5F3FF', '#9C88FF'] as [string, string] },
        particles: '#C4B5FD',
        border: '#E9D5FF',
      },
      postMenstrual: {
        primary: '#8B5CF6',
        secondary: '#A78BFA',
        accent: '#9333EA',
        background: '#F8F5FF',
        surface: '#FFFFFF',
        text: { primary: '#3C1A78', secondary: '#5B21B6', tertiary: '#7C3AED' },
        gradients: { primary: ['#DDD6FE', '#8B5CF6'] as [string, string] },
        particles: '#A78BFA',
        border: '#E9D5FF',
      },
      fertile: {
        primary: '#7C3AED',
        secondary: '#8B5CF6',
        accent: '#6D28D9',
        background: '#F8F5FF',
        surface: '#FFFFFF',
        text: { primary: '#3C1A78', secondary: '#5B21B6', tertiary: '#7C3AED' },
        gradients: { primary: ['#C4B5FD', '#7C3AED'] as [string, string] },
        particles: '#8B5CF6',
        border: '#E9D5FF',
      },
      ovulation: {
        primary: '#6D28D9',
        secondary: '#7C3AED',
        accent: '#5B21B6',
        background: '#F8F5FF',
        surface: '#FFFFFF',
        text: { primary: '#3C1A78', secondary: '#5B21B6', tertiary: '#7C3AED' },
        gradients: { primary: ['#A78BFA', '#6D28D9'] as [string, string] },
        particles: '#7C3AED',
        border: '#E9D5FF',
      },
      preMenstrual: {
        primary: '#5B21B6',
        secondary: '#6D28D9',
        accent: '#4C1D95',
        background: '#F8F5FF',
        surface: '#FFFFFF',
        text: { primary: '#3C1A78', secondary: '#5B21B6', tertiary: '#7C3AED' },
        gradients: { primary: ['#8B5CF6', '#5B21B6'] as [string, string] },
        particles: '#6D28D9',
        border: '#E9D5FF',
      },
    },
    dark: {
      menstrual: {
        primary: '#9C88FF',
        secondary: '#C4B5FD',
        accent: '#A78BFA',
        background: '#0A0A0F',
        surface: '#1A1824',
        text: { primary: '#DDD6FE', secondary: '#C4B5FD', tertiary: '#A78BFA' },
        gradients: { primary: ['#6D28D9', '#9C88FF'] as [string, string] },
        particles: '#C4B5FD',
        border: '#2D1F47',
      },
      postMenstrual: {
        primary: '#8B5CF6',
        secondary: '#A78BFA',
        accent: '#9333EA',
        background: '#0A0A0F',
        surface: '#1A1824',
        text: { primary: '#DDD6FE', secondary: '#C4B5FD', tertiary: '#A78BFA' },
        gradients: { primary: ['#5B21B6', '#8B5CF6'] as [string, string] },
        particles: '#A78BFA',
        border: '#2D1F47',
      },
      fertile: {
        primary: '#7C3AED',
        secondary: '#8B5CF6',
        accent: '#6D28D9',
        background: '#0A0A0F',
        surface: '#1A1824',
        text: { primary: '#DDD6FE', secondary: '#C4B5FD', tertiary: '#A78BFA' },
        gradients: { primary: ['#4C1D95', '#7C3AED'] as [string, string] },
        particles: '#8B5CF6',
        border: '#2D1F47',
      },
      ovulation: {
        primary: '#6D28D9',
        secondary: '#7C3AED',
        accent: '#5B21B6',
        background: '#0A0A0F',
        surface: '#1A1824',
        text: { primary: '#DDD6FE', secondary: '#C4B5FD', tertiary: '#A78BFA' },
        gradients: { primary: ['#3C1A78', '#6D28D9'] as [string, string] },
        particles: '#7C3AED',
        border: '#2D1F47',
      },
      preMenstrual: {
        primary: '#5B21B6',
        secondary: '#6D28D9',
        accent: '#4C1D95',
        background: '#0A0A0F',
        surface: '#1A1824',
        text: { primary: '#DDD6FE', secondary: '#C4B5FD', tertiary: '#A78BFA' },
        gradients: { primary: ['#2E1065', '#5B21B6'] as [string, string] },
        particles: '#6D28D9',
        border: '#2D1F47',
      },
    },
  },
  sunset: {
    name: 'Pôr do Sol',
    icon: '🌅',
    light: {
      menstrual: {
        primary: '#FF8A65',
        secondary: '#FFAB91',
        accent: '#FF7043',
        background: '#FFF8F5',
        surface: '#FFFFFF',
        text: { primary: '#BF360C', secondary: '#D84315', tertiary: '#FF5722' },
        gradients: { primary: ['#FFE0B2', '#FF8A65'] as [string, string] },
        particles: '#FFAB91',
        border: '#FFCCBC',
      },
      postMenstrual: {
        primary: '#FF7043',
        secondary: '#FF8A65',
        accent: '#FF5722',
        background: '#FFF8F5',
        surface: '#FFFFFF',
        text: { primary: '#BF360C', secondary: '#D84315', tertiary: '#FF5722' },
        gradients: { primary: ['#FFCCBC', '#FF7043'] as [string, string] },
        particles: '#FF8A65',
        border: '#FFCCBC',
      },
      fertile: {
        primary: '#FF5722',
        secondary: '#FF7043',
        accent: '#F4511E',
        background: '#FFF8F5',
        surface: '#FFFFFF',
        text: { primary: '#BF360C', secondary: '#D84315', tertiary: '#FF5722' },
        gradients: { primary: ['#FF8A65', '#FF5722'] as [string, string] },
        particles: '#FF7043',
        border: '#FFCCBC',
      },
      ovulation: {
        primary: '#F4511E',
        secondary: '#FF5722',
        accent: '#E64A19',
        background: '#FFF8F5',
        surface: '#FFFFFF',
        text: { primary: '#BF360C', secondary: '#D84315', tertiary: '#FF5722' },
        gradients: { primary: ['#FF7043', '#F4511E'] as [string, string] },
        particles: '#FF5722',
        border: '#FFCCBC',
      },
      preMenstrual: {
        primary: '#E64A19',
        secondary: '#F4511E',
        accent: '#D84315',
        background: '#FFF8F5',
        surface: '#FFFFFF',
        text: { primary: '#BF360C', secondary: '#D84315', tertiary: '#FF5722' },
        gradients: { primary: ['#FF5722', '#E64A19'] as [string, string] },
        particles: '#F4511E',
        border: '#FFCCBC',
      },
    },
    dark: {
      menstrual: {
        primary: '#FF8A65',
        secondary: '#FFAB91',
        accent: '#FF7043',
        background: '#0F0A0A',
        surface: '#241818',
        text: { primary: '#FFCCBC', secondary: '#FFAB91', tertiary: '#FF8A65' },
        gradients: { primary: ['#BF360C', '#FF8A65'] as [string, string] },
        particles: '#FFAB91',
        border: '#44292A',
      },
      postMenstrual: {
        primary: '#FF7043',
        secondary: '#FF8A65',
        accent: '#FF5722',
        background: '#0F0A0A',
        surface: '#241818',
        text: { primary: '#FFCCBC', secondary: '#FFAB91', tertiary: '#FF8A65' },
        gradients: { primary: ['#D84315', '#FF7043'] as [string, string] },
        particles: '#FF8A65',
        border: '#44292A',
      },
      fertile: {
        primary: '#FF5722',
        secondary: '#FF7043',
        accent: '#F4511E',
        background: '#0F0A0A',
        surface: '#241818',
        text: { primary: '#FFCCBC', secondary: '#FFAB91', tertiary: '#FF8A65' },
        gradients: { primary: ['#E64A19', '#FF5722'] as [string, string] },
        particles: '#FF7043',
        border: '#44292A',
      },
      ovulation: {
        primary: '#F4511E',
        secondary: '#FF5722',
        accent: '#E64A19',
        background: '#0F0A0A',
        surface: '#241818',
        text: { primary: '#FFCCBC', secondary: '#FFAB91', tertiary: '#FF8A65' },
        gradients: { primary: ['#D84315', '#F4511E'] as [string, string] },
        particles: '#FF5722',
        border: '#44292A',
      },
      preMenstrual: {
        primary: '#E64A19',
        secondary: '#F4511E',
        accent: '#D84315',
        background: '#0F0A0A',
        surface: '#241818',
        text: { primary: '#FFCCBC', secondary: '#FFAB91', tertiary: '#FF8A65' },
        gradients: { primary: ['#BF360C', '#E64A19'] as [string, string] },
        particles: '#F4511E',
        border: '#44292A',
      },
    },
  },
  ocean: {
    name: 'Oceano Sereno',
    icon: '🌊',
    light: {
      menstrual: {
        primary: '#4FC3F7',
        secondary: '#81D4FA',
        accent: '#29B6F6',
        background: '#F5FCFF',
        surface: '#FFFFFF',
        text: { primary: '#01579B', secondary: '#0277BD', tertiary: '#0288D1' },
        gradients: { primary: ['#E1F5FE', '#4FC3F7'] as [string, string] },
        particles: '#81D4FA',
        border: '#B3E5FC',
      },
      postMenstrual: {
        primary: '#29B6F6',
        secondary: '#4FC3F7',
        accent: '#03A9F4',
        background: '#F5FCFF',
        surface: '#FFFFFF',
        text: { primary: '#01579B', secondary: '#0277BD', tertiary: '#0288D1' },
        gradients: { primary: ['#B3E5FC', '#29B6F6'] as [string, string] },
        particles: '#4FC3F7',
        border: '#B3E5FC',
      },
      fertile: {
        primary: '#03A9F4',
        secondary: '#29B6F6',
        accent: '#0288D1',
        background: '#F5FCFF',
        surface: '#FFFFFF',
        text: { primary: '#01579B', secondary: '#0277BD', tertiary: '#0288D1' },
        gradients: { primary: ['#4FC3F7', '#03A9F4'] as [string, string] },
        particles: '#29B6F6',
        border: '#B3E5FC',
      },
      ovulation: {
        primary: '#0288D1',
        secondary: '#03A9F4',
        accent: '#0277BD',
        background: '#F5FCFF',
        surface: '#FFFFFF',
        text: { primary: '#01579B', secondary: '#0277BD', tertiary: '#0288D1' },
        gradients: { primary: ['#29B6F6', '#0288D1'] as [string, string] },
        particles: '#03A9F4',
        border: '#B3E5FC',
      },
      preMenstrual: {
        primary: '#0277BD',
        secondary: '#0288D1',
        accent: '#01579B',
        background: '#F5FCFF',
        surface: '#FFFFFF',
        text: { primary: '#01579B', secondary: '#0277BD', tertiary: '#0288D1' },
        gradients: { primary: ['#03A9F4', '#0277BD'] as [string, string] },
        particles: '#0288D1',
        border: '#B3E5FC',
      },
    },
    dark: {
      menstrual: {
        primary: '#4FC3F7',
        secondary: '#81D4FA',
        accent: '#29B6F6',
        background: '#0A0F14',
        surface: '#142028',
        text: { primary: '#B3E5FC', secondary: '#81D4FA', tertiary: '#4FC3F7' },
        gradients: { primary: ['#01579B', '#4FC3F7'] as [string, string] },
        particles: '#81D4FA',
        border: '#1F3A48',
      },
      postMenstrual: {
        primary: '#29B6F6',
        secondary: '#4FC3F7',
        accent: '#03A9F4',
        background: '#0A0F14',
        surface: '#142028',
        text: { primary: '#B3E5FC', secondary: '#81D4FA', tertiary: '#4FC3F7' },
        gradients: { primary: ['#0277BD', '#29B6F6'] as [string, string] },
        particles: '#4FC3F7',
        border: '#1F3A48',
      },
      fertile: {
        primary: '#03A9F4',
        secondary: '#29B6F6',
        accent: '#0288D1',
        background: '#0A0F14',
        surface: '#142028',
        text: { primary: '#B3E5FC', secondary: '#81D4FA', tertiary: '#4FC3F7' },
        gradients: { primary: ['#0288D1', '#03A9F4'] as [string, string] },
        particles: '#29B6F6',
        border: '#1F3A48',
      },
      ovulation: {
        primary: '#0288D1',
        secondary: '#03A9F4',
        accent: '#0277BD',
        background: '#0A0F14',
        surface: '#142028',
        text: { primary: '#B3E5FC', secondary: '#81D4FA', tertiary: '#4FC3F7' },
        gradients: { primary: ['#0277BD', '#0288D1'] as [string, string] },
        particles: '#03A9F4',
        border: '#1F3A48',
      },
      preMenstrual: {
        primary: '#0277BD',
        secondary: '#0288D1',
        accent: '#01579B',
        background: '#0A0F14',
        surface: '#142028',
        text: { primary: '#B3E5FC', secondary: '#81D4FA', tertiary: '#4FC3F7' },
        gradients: { primary: ['#01579B', '#0277BD'] as [string, string] },
        particles: '#0288D1',
        border: '#1F3A48',
      },
    },
  },
  forest: {
    name: 'Floresta Mística',
    icon: '🌿',
    light: {
      menstrual: {
        primary: '#66BB6A',
        secondary: '#A5D6A7',
        accent: '#4CAF50',
        background: '#F5FFF5',
        surface: '#FFFFFF',
        text: { primary: '#1B5E20', secondary: '#2E7D32', tertiary: '#388E3C' },
        gradients: { primary: ['#E8F5E8', '#66BB6A'] as [string, string] },
        particles: '#A5D6A7',
        border: '#C8E6C9',
      },
      postMenstrual: {
        primary: '#4CAF50',
        secondary: '#66BB6A',
        accent: '#388E3C',
        background: '#F5FFF5',
        surface: '#FFFFFF',
        text: { primary: '#1B5E20', secondary: '#2E7D32', tertiary: '#388E3C' },
        gradients: { primary: ['#C8E6C9', '#4CAF50'] as [string, string] },
        particles: '#66BB6A',
        border: '#C8E6C9',
      },
      fertile: {
        primary: '#388E3C',
        secondary: '#4CAF50',
        accent: '#2E7D32',
        background: '#F5FFF5',
        surface: '#FFFFFF',
        text: { primary: '#1B5E20', secondary: '#2E7D32', tertiary: '#388E3C' },
        gradients: { primary: ['#66BB6A', '#388E3C'] as [string, string] },
        particles: '#4CAF50',
        border: '#C8E6C9',
      },
      ovulation: {
        primary: '#2E7D32',
        secondary: '#388E3C',
        accent: '#1B5E20',
        background: '#F5FFF5',
        surface: '#FFFFFF',
        text: { primary: '#1B5E20', secondary: '#2E7D32', tertiary: '#388E3C' },
        gradients: { primary: ['#4CAF50', '#2E7D32'] as [string, string] },
        particles: '#388E3C',
        border: '#C8E6C9',
      },
      preMenstrual: {
        primary: '#1B5E20',
        secondary: '#2E7D32',
        accent: '#0D47A1',
        background: '#F5FFF5',
        surface: '#FFFFFF',
        text: { primary: '#1B5E20', secondary: '#2E7D32', tertiary: '#388E3C' },
        gradients: { primary: ['#388E3C', '#1B5E20'] as [string, string] },
        particles: '#2E7D32',
        border: '#C8E6C9',
      },
    },
    dark: {
      menstrual: {
        primary: '#66BB6A',
        secondary: '#A5D6A7',
        accent: '#4CAF50',
        background: '#0A140A',
        surface: '#142818',
        text: { primary: '#C8E6C9', secondary: '#A5D6A7', tertiary: '#81C784' },
        gradients: { primary: ['#1B5E20', '#66BB6A'] as [string, string] },
        particles: '#A5D6A7',
        border: '#1F4A23',
      },
      postMenstrual: {
        primary: '#4CAF50',
        secondary: '#66BB6A',
        accent: '#388E3C',
        background: '#0A140A',
        surface: '#142818',
        text: { primary: '#C8E6C9', secondary: '#A5D6A7', tertiary: '#81C784' },
        gradients: { primary: ['#2E7D32', '#4CAF50'] as [string, string] },
        particles: '#66BB6A',
        border: '#1F4A23',
      },
      fertile: {
        primary: '#388E3C',
        secondary: '#4CAF50',
        accent: '#2E7D32',
        background: '#0A140A',
        surface: '#142818',
        text: { primary: '#C8E6C9', secondary: '#A5D6A7', tertiary: '#81C784' },
        gradients: { primary: ['#1B5E20', '#388E3C'] as [string, string] },
        particles: '#4CAF50',
        border: '#1F4A23',
      },
      ovulation: {
        primary: '#2E7D32',
        secondary: '#388E3C',
        accent: '#1B5E20',
        background: '#0A140A',
        surface: '#142818',
        text: { primary: '#C8E6C9', secondary: '#A5D6A7', tertiary: '#81C784' },
        gradients: { primary: ['#0D47A1', '#2E7D32'] as [string, string] },
        particles: '#388E3C',
        border: '#1F4A23',
      },
      preMenstrual: {
        primary: '#1B5E20',
        secondary: '#2E7D32',
        accent: '#0D47A1',
        background: '#0A140A',
        surface: '#142818',
        text: { primary: '#C8E6C9', secondary: '#A5D6A7', tertiary: '#81C784' },
        gradients: { primary: ['#263238', '#1B5E20'] as [string, string] },
        particles: '#2E7D32',
        border: '#1F4A23',
      },
    },
  },
  cherry: {
    name: 'Cerejeira',
    icon: '🌸',
    light: {
      menstrual: {
        primary: '#F48FB1',
        secondary: '#F8BBD9',
        accent: '#E91E63',
        background: '#FFF0F5',
        surface: '#FFFFFF',
        text: { primary: '#880E4F', secondary: '#AD1457', tertiary: '#C2185B' },
        gradients: { primary: ['#FCE4EC', '#F48FB1'] as [string, string] },
        particles: '#F8BBD9',
        border: '#F8BBD9',
      },
      postMenstrual: {
        primary: '#E91E63',
        secondary: '#F48FB1',
        accent: '#C2185B',
        background: '#FFF0F5',
        surface: '#FFFFFF',
        text: { primary: '#880E4F', secondary: '#AD1457', tertiary: '#C2185B' },
        gradients: { primary: ['#F8BBD9', '#E91E63'] as [string, string] },
        particles: '#F48FB1',
        border: '#F8BBD9',
      },
      fertile: {
        primary: '#C2185B',
        secondary: '#E91E63',
        accent: '#AD1457',
        background: '#FFF0F5',
        surface: '#FFFFFF',
        text: { primary: '#880E4F', secondary: '#AD1457', tertiary: '#C2185B' },
        gradients: { primary: ['#F48FB1', '#C2185B'] as [string, string] },
        particles: '#E91E63',
        border: '#F8BBD9',
      },
      ovulation: {
        primary: '#AD1457',
        secondary: '#C2185B',
        accent: '#880E4F',
        background: '#FFF0F5',
        surface: '#FFFFFF',
        text: { primary: '#880E4F', secondary: '#AD1457', tertiary: '#C2185B' },
        gradients: { primary: ['#E91E63', '#AD1457'] as [string, string] },
        particles: '#C2185B',
        border: '#F8BBD9',
      },
      preMenstrual: {
        primary: '#880E4F',
        secondary: '#AD1457',
        accent: '#4A148C',
        background: '#FFF0F5',
        surface: '#FFFFFF',
        text: { primary: '#880E4F', secondary: '#AD1457', tertiary: '#C2185B' },
        gradients: { primary: ['#C2185B', '#880E4F'] as [string, string] },
        particles: '#AD1457',
        border: '#F8BBD9',
      },
    },
    dark: {
      menstrual: {
        primary: '#F48FB1',
        secondary: '#F8BBD9',
        accent: '#E91E63',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#F8BBD9', secondary: '#F48FB1', tertiary: '#EC407A' },
        gradients: { primary: ['#880E4F', '#F48FB1'] as [string, string] },
        particles: '#F8BBD9',
        border: '#44262F',
      },
      postMenstrual: {
        primary: '#E91E63',
        secondary: '#F48FB1',
        accent: '#C2185B',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#F8BBD9', secondary: '#F48FB1', tertiary: '#EC407A' },
        gradients: { primary: ['#AD1457', '#E91E63'] as [string, string] },
        particles: '#F48FB1',
        border: '#44262F',
      },
      fertile: {
        primary: '#C2185B',
        secondary: '#E91E63',
        accent: '#AD1457',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#F8BBD9', secondary: '#F48FB1', tertiary: '#EC407A' },
        gradients: { primary: ['#880E4F', '#C2185B'] as [string, string] },
        particles: '#E91E63',
        border: '#44262F',
      },
      ovulation: {
        primary: '#AD1457',
        secondary: '#C2185B',
        accent: '#880E4F',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#F8BBD9', secondary: '#F48FB1', tertiary: '#EC407A' },
        gradients: { primary: ['#4A148C', '#AD1457'] as [string, string] },
        particles: '#C2185B',
        border: '#44262F',
      },
      preMenstrual: {
        primary: '#880E4F',
        secondary: '#AD1457',
        accent: '#4A148C',
        background: '#0F0A0D',
        surface: '#1F1419',
        text: { primary: '#F8BBD9', secondary: '#F48FB1', tertiary: '#EC407A' },
        gradients: { primary: ['#311B92', '#880E4F'] as [string, string] },
        particles: '#AD1457',
        border: '#44262F',
      },
    },
  },
};

// HOOK PRINCIPAL INTEGRADO
export const useThemeSystem = () => {
  const [selectedVariant, setSelectedVariant] = useState<ThemeVariant>('rose');
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [currentPhase, setCurrentPhase] = useState<CyclePhase>('menstrual');
  const [intensity, setIntensity] = useState(0.8);
  
  // INTEGRAÇÃO COM SISTEMA AUTOMÁTICO
  const cycleTheme = useCycleBasedTheme();

  // Carrega configurações salvas
  useEffect(() => {
    loadSettings();
  }, []);

  // Listener para mudanças de tema em tempo real
  useEffect(() => {
    const checkForThemeChanges = async () => {
      try {
        const lastChanged = await AsyncStorage.getItem('themeLastChanged');
        const currentTimestamp = await AsyncStorage.getItem('currentThemeTimestamp') || '0';
        
        if (lastChanged && lastChanged !== currentTimestamp) {
          await AsyncStorage.setItem('currentThemeTimestamp', lastChanged);
          // Recarregar configurações
          await loadSettings();
        }
      } catch (error) {
        console.error('Erro ao verificar mudanças de tema:', error);
      }
    };

    // Verificação mais frequente para mudanças de tema
    const interval = setInterval(checkForThemeChanges, 100);
    return () => clearInterval(interval);
  }, [selectedVariant, mode]);

  // Listener adicional para mudanças imediatas
  useEffect(() => {
    const handleStorageChange = () => {
      loadSettings();
    };
    
    // Simular listener de storage changes
    const storageInterval = setInterval(handleStorageChange, 50);
    return () => clearInterval(storageInterval);
  }, []);

  const loadSettings = async () => {
    try {
      const [savedVariant, savedMode] = await Promise.all([
        AsyncStorage.getItem('selectedThemeVariant'),
        AsyncStorage.getItem('themeMode')
      ]);

      if (savedVariant && Object.keys(THEME_VARIANTS).includes(savedVariant)) {
        setSelectedVariant(savedVariant as ThemeVariant);
      }

      if (savedMode === 'light' || savedMode === 'dark') {
        setMode(savedMode);
      }

      // Calcula fase atual
      await updateCurrentPhase();
    } catch (error) {
      console.error('Erro ao carregar configurações do tema:', error);
    }
  };

  const updateCurrentPhase = async (): Promise<CyclePhase> => {
    try {
      const cycleData = await AsyncStorage.getItem('cycleData');
      if (!cycleData) return 'menstrual';

      const { lastPeriodDate, averageCycleLength, averagePeriodLength } = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const daysSinceLastPeriod = today.diff(lastPeriod, 'days');
      const dayOfCycle = (daysSinceLastPeriod % averageCycleLength) + 1;
      
      const ovulationDay = averageCycleLength - 14;
      
      let phase: CyclePhase;
      if (dayOfCycle <= averagePeriodLength) {
        phase = 'menstrual';
      } else if (dayOfCycle < ovulationDay - 2) {
        phase = 'postMenstrual';
      } else if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
        if (dayOfCycle === ovulationDay) {
          phase = 'ovulation';
        } else {
          phase = 'fertile';
        }
      } else {
        phase = 'preMenstrual';
      }

      setCurrentPhase(phase);
      
      // Calcula intensidade baseada na posição na fase
      const phaseIntensity = calculatePhaseIntensity(dayOfCycle, phase, averageCycleLength);
      setIntensity(phaseIntensity);
      
      return phase;
    } catch (error) {
      console.error('Erro ao calcular fase:', error);
      return 'menstrual';
    }
  };

  const calculatePhaseIntensity = (dayOfCycle: number, phase: CyclePhase, cycleLength: number): number => {
    let phaseStart: number, phaseEnd: number, phasePeak: number;

    switch (phase) {
      case 'menstrual':
        phaseStart = 1;
        phaseEnd = 5;
        phasePeak = 3;
        break;
      case 'postMenstrual':
        phaseStart = 6;
        phaseEnd = Math.floor(cycleLength / 2) - 3;
        phasePeak = Math.floor((phaseStart + phaseEnd) / 2);
        break;
      case 'fertile':
      case 'ovulation':
        phaseStart = cycleLength - 16;
        phaseEnd = cycleLength - 12;
        phasePeak = cycleLength - 14;
        break;
      case 'preMenstrual':
        phaseStart = cycleLength - 11;
        phaseEnd = cycleLength;
        phasePeak = cycleLength - 5;
        break;
      default:
        return 0.7;
    }

    const distanceFromPeak = Math.abs(dayOfCycle - phasePeak);
    const maxDistance = Math.max(phasePeak - phaseStart, phaseEnd - phasePeak);
    
    if (maxDistance === 0) return 1;
    
    const calculatedIntensity = Math.max(0.3, 1 - (distanceFromPeak / maxDistance) * 0.7);
    return Number(calculatedIntensity.toFixed(2));
  };

  // Salva variante selecionada
  const saveThemeVariant = useCallback(async (variant: ThemeVariant, isManual = true) => {
    try {
      await AsyncStorage.setItem('selectedThemeVariant', variant);
      
      // Marca timestamp da mudança para forçar atualização em outras telas
      await AsyncStorage.setItem('themeLastChanged', Date.now().toString());
      
      setSelectedVariant(variant);
      
      // Força atualização da fase atual para aplicar o novo tema
      await updateCurrentPhase();
      
      // Se é mudança manual, marca override no sistema automático
      if (isManual && cycleTheme) {
        await cycleTheme.setManualOverride(true);
      }
      
      console.log('🎨 Tema alterado para:', variant);
    } catch (error) {
      console.error('Erro ao salvar variante:', error);
    }
  }, [cycleTheme]);

  // Alterna modo claro/escuro
  const toggleMode = useCallback(async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    try {
      await AsyncStorage.setItem('themeMode', newMode);
      
      // Marca timestamp da mudança para forçar atualização em outras telas
      await AsyncStorage.setItem('themeLastChanged', Date.now().toString());
      
      setMode(newMode);
      
      console.log('🎨 Modo alterado para:', newMode);
    } catch (error) {
      console.error('Erro ao alternar modo:', error);
    }
  }, [mode]);

  // Gera tema adaptado atual
  const getAdaptedTheme = (): AdaptedTheme => {
    const variantThemes = THEME_VARIANTS[selectedVariant];
    const phaseColors = variantThemes[mode][currentPhase];

    return {
      variant: selectedVariant,
      mode,
      phase: currentPhase,
      colors: phaseColors,
      intensity,
    };
  };

  // Lista todas as variantes disponíveis
  const getAvailableVariants = () => {
    return Object.entries(THEME_VARIANTS).map(([key, value]) => ({
      key: key as ThemeVariant,
      name: value.name,
      icon: value.icon,
    }));
  };

  // Preview de uma variante específica
  const previewVariant = (variant: ThemeVariant, previewMode?: ThemeMode): AdaptedTheme => {
    const variantThemes = THEME_VARIANTS[variant];
    const previewModeToUse = previewMode || mode;
    const phaseColors = variantThemes[previewModeToUse][currentPhase];

    return {
      variant,
      mode: previewModeToUse,
      phase: currentPhase,
      colors: phaseColors,
      intensity,
    };
  };

  return {
    // Estado atual
    selectedVariant,
    mode,
    currentPhase,
    intensity,
    
    // Tema atual
    theme: getAdaptedTheme(),
    
    // Métodos de controle
    saveThemeVariant,
    toggleMode,
    updateCurrentPhase,
    
    // Utilitários
    getAvailableVariants,
    previewVariant,
    
    // Flags convenientes
    isLightMode: mode === 'light',
    isDarkMode: mode === 'dark',
    
    // SISTEMA AUTOMÁTICO INTEGRADO
    cycleTheme: cycleTheme ? {
      ...cycleTheme,
      isEnabled: cycleTheme.settings.autoThemeEnabled,
      currentAutoTheme: cycleTheme.getThemeForPhase(currentPhase),
      toggleAutoTheme: cycleTheme.toggleAutoTheme,
      updatePhaseMapping: cycleTheme.updatePhaseThemeMapping,
      resetDefaults: cycleTheme.resetToDefaults,
    } : null,
  };
};