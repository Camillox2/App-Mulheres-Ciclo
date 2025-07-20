// constants/designSystem.ts - SISTEMA DE DESIGN PROFISSIONAL
export const DESIGN_SYSTEM = {
  // Espaçamento baseado em 8px grid
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },

  // Raios de borda consistentes
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
  },

  // Tipografia refinada
  typography: {
    sizes: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      huge: 32,
      display: 40,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },

  // Sombras elegantes
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Opacidades consistentes
  opacity: {
    disabled: 0.4,
    overlay: 0.5,
    subtle: 0.6,
    medium: 0.8,
    high: 0.9,
  },

  // Animações fluidas
  animations: {
    timing: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeOut: [0.25, 1, 0.5, 1],
      easeIn: [0.5, 0, 0.75, 0],
      easeInOut: [0.4, 0, 0.2, 1],
      spring: { tension: 100, friction: 8 },
    },
  },
};

// Paleta de cores sofisticada por fase
export const SOPHISTICATED_COLORS = {
  light: {
    menstrual: {
      primary: '#D63384', // Rosa mais refinado
      secondary: '#F8BBD9',
      accent: '#FFE5F0',
      background: '#FEFBFC',
      surface: '#FFFFFF',
      text: {
        primary: '#2D1B2F',
        secondary: '#6B4C7A',
        tertiary: '#9A7AA8',
        disabled: '#C8B2D1',
      },
      gradients: {
        primary: ['#FFE5F0', '#F8BBD9', '#D63384'],
        secondary: ['#FEFBFC', '#FFE5F0'],
        card: ['#FFFFFF', '#FEFBFC'],
      },
      particles: '#F8BBD9',
      border: '#F0E6EA',
    },
    postMenstrual: {
      primary: '#059669', // Verde esmeralda
      secondary: '#A7F3D0',
      accent: '#ECFDF5',
      background: '#FEFFFE',
      surface: '#FFFFFF',
      text: {
        primary: '#064E3B',
        secondary: '#047857',
        tertiary: '#10B981',
        disabled: '#A7F3D0',
      },
      gradients: {
        primary: ['#ECFDF5', '#A7F3D0', '#059669'],
        secondary: ['#FEFFFE', '#ECFDF5'],
        card: ['#FFFFFF', '#FEFFFE'],
      },
      particles: '#A7F3D0',
      border: '#D1FAE5',
    },
    fertile: {
      primary: '#DC2626', // Vermelho vibrante
      secondary: '#FCA5A5',
      accent: '#FEF2F2',
      background: '#FFFBFB',
      surface: '#FFFFFF',
      text: {
        primary: '#7F1D1D',
        secondary: '#991B1B',
        tertiary: '#DC2626',
        disabled: '#FCA5A5',
      },
      gradients: {
        primary: ['#FEF2F2', '#FCA5A5', '#DC2626'],
        secondary: ['#FFFBFB', '#FEF2F2'],
        card: ['#FFFFFF', '#FFFBFB'],
      },
      particles: '#FCA5A5',
      border: '#FED7D7',
    },
    ovulation: {
      primary: '#F59E0B', // Âmbar dourado
      secondary: '#FDE68A',
      accent: '#FFFBEB',
      background: '#FFFEF7',
      surface: '#FFFFFF',
      text: {
        primary: '#78350F',
        secondary: '#92400E',
        tertiary: '#F59E0B',
        disabled: '#FDE68A',
      },
      gradients: {
        primary: ['#FFFBEB', '#FDE68A', '#F59E0B'],
        secondary: ['#FFFEF7', '#FFFBEB'],
        card: ['#FFFFFF', '#FFFEF7'],
      },
      particles: '#FDE68A',
      border: '#FEF3C7',
    },
    preMenstrual: {
      primary: '#7C3AED', // Violeta real
      secondary: '#C4B5FD',
      accent: '#F5F3FF',
      background: '#FDFDFF',
      surface: '#FFFFFF',
      text: {
        primary: '#3C1A78',
        secondary: '#5B21B6',
        tertiary: '#7C3AED',
        disabled: '#C4B5FD',
      },
      gradients: {
        primary: ['#F5F3FF', '#C4B5FD', '#7C3AED'],
        secondary: ['#FDFDFF', '#F5F3FF'],
        card: ['#FFFFFF', '#FDFDFF'],
      },
      particles: '#C4B5FD',
      border: '#E9D5FF',
    },
  },
  dark: {
    menstrual: {
      primary: '#EC4899', // Rosa brilhante para contraste
      secondary: '#BE185D',
      accent: '#831843',
      background: '#0F0A0D',
      surface: '#1F1419',
      text: {
        primary: '#FECDD3',
        secondary: '#FDA4AF',
        tertiary: '#FB7185',
        disabled: '#9F1239',
      },
      gradients: {
        primary: ['#831843', '#BE185D', '#EC4899'],
        secondary: ['#0F0A0D', '#1F1419'],
        card: ['#1F1419', '#2D1B21'],
      },
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
        disabled: '#065F46',
      },
      gradients: {
        primary: ['#064E3B', '#047857', '#10B981'],
        secondary: ['#0A0F0C', '#14241A'],
        card: ['#14241A', '#1F2F25'],
      },
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
        disabled: '#B91C1C',
      },
      gradients: {
        primary: ['#991B1B', '#DC2626', '#EF4444'],
        secondary: ['#0F0A0A', '#241818'],
        card: ['#241818', '#2F1F1F'],
      },
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
        disabled: '#A16207',
      },
      gradients: {
        primary: ['#D97706', '#F59E0B', '#FBBF24'],
        secondary: ['#0F0E0A', '#241F14'],
        card: ['#241F14', '#2F2A1A'],
      },
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
        disabled: '#5B21B6',
      },
      gradients: {
        primary: ['#6D28D9', '#7C3AED', '#8B5CF6'],
        secondary: ['#0A0A0F', '#1A1824'],
        card: ['#1A1824', '#252130'],
      },
      particles: '#7C3AED',
      border: '#2D1F47',
    },
  },
};

// Componentes de UI elegantes
export const UI_COMPONENTS = {
  button: {
    primary: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: DESIGN_SYSTEM.borderRadius.md,
      ...DESIGN_SYSTEM.shadows.md,
    },
    secondary: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: DESIGN_SYSTEM.borderRadius.md,
      borderWidth: 1.5,
    },
    ghost: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: DESIGN_SYSTEM.borderRadius.sm,
    },
  },
  card: {
    default: {
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      padding: DESIGN_SYSTEM.spacing.lg,
      ...DESIGN_SYSTEM.shadows.lg,
    },
    elevated: {
      borderRadius: DESIGN_SYSTEM.borderRadius.xl,
      padding: DESIGN_SYSTEM.spacing.xl,
      ...DESIGN_SYSTEM.shadows.xl,
    },
    minimal: {
      borderRadius: DESIGN_SYSTEM.borderRadius.md,
      padding: DESIGN_SYSTEM.spacing.md,
      ...DESIGN_SYSTEM.shadows.sm,
    },
  },
  input: {
    default: {
      borderRadius: DESIGN_SYSTEM.borderRadius.md,
      paddingVertical: DESIGN_SYSTEM.spacing.md,
      paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
      fontSize: DESIGN_SYSTEM.typography.sizes.md,
      borderWidth: 1.5,
    },
    floating: {
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      paddingVertical: DESIGN_SYSTEM.spacing.lg,
      paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
      fontSize: DESIGN_SYSTEM.typography.sizes.md,
      borderWidth: 0,
      ...DESIGN_SYSTEM.shadows.md,
    },
  },
};

// Breakpoints responsivos
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Constantes de layout
export const LAYOUT = {
  header: {
    height: 60,
    paddingHorizontal: 20,
  },
  sidebar: {
    width: {
      percentage: 0.85,
      maxWidth: 320,
    },
  },
  bottomTabBar: {
    height: 80,
    paddingBottom: 20,
  },
  modal: {
    maxWidth: '90%',
    maxHeight: '80%',
    borderRadius: DESIGN_SYSTEM.borderRadius.xxl,
  },
};

// Configurações de acessibilidade
export const ACCESSIBILITY = {
  minimumTouchTarget: 44,
  contrastRatios: {
    normal: 4.5,
    large: 3,
  },
  focusOutlineWidth: 2,
  reducedMotionDuration: 50,
};

// Configurações de performance
export const PERFORMANCE = {
  animationConfig: {
    useNativeDriver: true,
    duration: DESIGN_SYSTEM.animations.timing.normal,
  },
  listOptimization: {
    windowSize: 10,
    initialNumToRender: 8,
    maxToRenderPerBatch: 5,
  },
};

// Utilitários de tema
export const createThemeUtils = (colors: any) => ({
  // Cria variações de cor com opacidade
  withOpacity: (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `#${hex}${alpha}`;
  },

  // Gera gradientes baseados nas cores do tema
  generateGradient: (baseColor: string, intensity: number = 0.8) => {
    const lighten = (color: string, amount: number) => {
      // Implementação simplificada - em produção usar biblioteca como tinycolor2
      return color;
    };
    const darken = (color: string, amount: number) => {
      // Implementação simplificada
      return color;
    };

    return [
      lighten(baseColor, 0.3),
      baseColor,
      darken(baseColor, 0.2),
    ];
  },

  // Calcula cor de texto com base no background
  getTextColor: (backgroundColor: string, theme: 'light' | 'dark') => {
    // Implementação simplificada - calcular luminosidade real
    return theme === 'light' ? colors.text.primary : colors.text.primary;
  },

  // Gera estilos de elevação
  getElevation: (level: number) => {
    const elevations = [
      DESIGN_SYSTEM.shadows.sm,
      DESIGN_SYSTEM.shadows.md,
      DESIGN_SYSTEM.shadows.lg,
      DESIGN_SYSTEM.shadows.xl,
    ];
    return elevations[Math.min(level - 1, elevations.length - 1)] || elevations[0];
  },
});

// Configurações de animação avançadas
export const ADVANCED_ANIMATIONS = {
  // Animações de entrada
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideInFromRight: {
    from: { transform: [{ translateX: 300 }] },
    to: { transform: [{ translateX: 0 }] },
  },
  slideInFromBottom: {
    from: { transform: [{ translateY: 300 }] },
    to: { transform: [{ translateY: 0 }] },
  },
  scaleIn: {
    from: { transform: [{ scale: 0.8 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
  },

  // Animações de interação
  pressScale: {
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 0.95 }] },
  },
  bounce: {
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 1.05 }] },
  },

  // Animações de loading
  pulse: {
    from: { opacity: 0.5 },
    to: { opacity: 1 },
  },
  rotate: {
    from: { transform: [{ rotate: '0deg' }] },
    to: { transform: [{ rotate: '360deg' }] },
  },

  // Configurações de spring
  springConfigs: {
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
  },
};

// Configurações de glassmorphism
export const GLASSMORPHISM = {
  blur: {
    light: 20,
    medium: 40,
    heavy: 80,
  },
  opacity: {
    subtle: 0.7,
    medium: 0.8,
    strong: 0.9,
  },
  border: {
    width: 1,
    opacity: 0.2,
  },
};

// Microtopografia feminina
export const FEMININE_TOUCHES = {
  curves: {
    gentle: 8,
    moderate: 16,
    pronounced: 24,
    circular: 9999,
  },
  softShadows: {
    glow: {
      shadowColor: '#FFB4D6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    warm: {
      shadowColor: '#FFA8A8',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  },
  gradientOverlays: {
    subtle: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],
    warm: ['rgba(255, 182, 193, 0.3)', 'rgba(255, 218, 225, 0.1)'],
    dreamy: ['rgba(255, 240, 245, 0.6)', 'rgba(255, 182, 193, 0.2)'],
  },
};

export default DESIGN_SYSTEM;