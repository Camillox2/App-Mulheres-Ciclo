import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const PALETTE = {
  pink_light: '#F8E8EE',
  pink_primary: '#E5739D',
  pink_dark: '#C23B6C',
  
  green_light: '#EAF6F0',
  green_primary: '#58D68D',
  green_dark: '#27AE60',

  purple_light: '#F3E5F5',
  purple_primary: '#BB86FC',
  purple_dark: '#8E44AD',

  orange_light: '#FFF3E0',
  orange_primary: '#FFB74D',
  orange_dark: '#FF9800',

  neutral_light: '#FFFFFF',
  neutral_medium: '#F5F5F5',
  neutral_dark: '#333333',
  neutral_overlay: 'rgba(0, 0, 0, 0.6)',
};

const PHASE_THEMES = {
  light: {
    menstrual: {
      primary: PALETTE.pink_primary,
      secondary: PALETTE.pink_dark,
      background: PALETTE.pink_light,
      surface: PALETTE.neutral_light,
      gradients: [PALETTE.pink_light, PALETTE.pink_primary],
      particles: PALETTE.pink_primary,
    },
    postMenstrual: {
      primary: PALETTE.green_primary,
      secondary: PALETTE.green_dark,
      background: PALETTE.green_light,
      surface: PALETTE.neutral_light,
      gradients: [PALETTE.green_light, PALETTE.green_primary],
      particles: PALETTE.green_primary,
    },
    fertile: {
        primary: PALETTE.orange_primary,
        secondary: PALETTE.orange_dark,
        background: PALETTE.orange_light,
        surface: PALETTE.neutral_light,
        gradients: [PALETTE.orange_light, PALETTE.orange_primary],
        particles: PALETTE.orange_primary,
    },
    preMenstrual: {
      primary: PALETTE.purple_primary,
      secondary: PALETTE.purple_dark,
      background: PALETTE.purple_light,
      surface: PALETTE.neutral_light,
      gradients: [PALETTE.purple_light, PALETTE.purple_primary],
      particles: PALETTE.purple_primary,
    },
    ovulation: { // Adicionando fase de ovulação
        primary: PALETTE.orange_dark,
        secondary: PALETTE.orange_primary,
        background: PALETTE.orange_light,
        surface: PALETTE.neutral_light,
        gradients: [PALETTE.orange_primary, PALETTE.orange_dark],
        particles: PALETTE.orange_dark,
    },
  },
  // Você pode adicionar um tema 'dark' aqui seguindo a mesma estrutura
};


export const theme = {
  colors: PALETTE,
  phaseThemes: PHASE_THEMES,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    body: { fontSize: 16 },
  },
  sizes: {
    width,
    height,
  },
};