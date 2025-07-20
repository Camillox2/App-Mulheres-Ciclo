// constants/appConstants.ts
import { Symptom, FlowType } from '../types';

/**
 * Informações do aplicativo
 */
export const APP_INFO = {
  name: 'EntrePhases',
  version: '1.0.0',
  description: 'Seu companheiro inteligente para acompanhar o ciclo menstrual',
  tagline: 'Conectada com seu ciclo',
} as const;

/**
 * Configurações padrão do ciclo
 */
export const CYCLE_DEFAULTS = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  minCycleLength: 21,
  maxCycleLength: 35,
  minPeriodLength: 3,
  maxPeriodLength: 8,
  ovulationDayFromEnd: 14, // Dias antes do fim do ciclo
} as const;

/**
 * Lista completa de sintomas disponíveis
 */
export const SYMPTOMS: Symptom[] = [
  // Sintomas Físicos
  { id: 'cramps', name: 'Cólicas', emoji: '😣', category: 'physical' },
  { id: 'headache', name: 'Dor de cabeça', emoji: '🤕', category: 'physical' },
  { id: 'bloating', name: 'Inchaço', emoji: '🎈', category: 'physical' },
  { id: 'breast_pain', name: 'Dor nos seios', emoji: '😔', category: 'physical' },
  { id: 'back_pain', name: 'Dor nas costas', emoji: '😖', category: 'physical' },
  { id: 'acne', name: 'Espinhas', emoji: '😤', category: 'physical' },
  { id: 'fatigue', name: 'Cansaço', emoji: '😴', category: 'physical' },
  { id: 'nausea', name: 'Náusea', emoji: '🤢', category: 'physical' },
  { id: 'dizziness', name: 'Tontura', emoji: '😵', category: 'physical' },
  { id: 'hot_flashes', name: 'Ondas de calor', emoji: '🥵', category: 'physical' },
  { id: 'joint_pain', name: 'Dor nas articulações', emoji: '🦴', category: 'physical' },
  { id: 'muscle_pain', name: 'Dor muscular', emoji: '💪', category: 'physical' },

  // Sintomas Emocionais
  { id: 'happy', name: 'Feliz', emoji: '😊', category: 'emotional' },
  { id: 'sad', name: 'Triste', emoji: '😢', category: 'emotional' },
  { id: 'anxious', name: 'Ansiosa', emoji: '😰', category: 'emotional' },
  { id: 'irritated', name: 'Irritada', emoji: '😠', category: 'emotional' },
  { id: 'energetic', name: 'Energética', emoji: '💪', category: 'emotional' },
  { id: 'romantic', name: 'Romântica', emoji: '💕', category: 'emotional' },
  { id: 'moody', name: 'Instável', emoji: '😤', category: 'emotional' },
  { id: 'confident', name: 'Confiante', emoji: '😎', category: 'emotional' },
  { id: 'sensitive', name: 'Sensível', emoji: '🥺', category: 'emotional' },
  { id: 'stressed', name: 'Estressada', emoji: '😫', category: 'emotional' },
  { id: 'calm', name: 'Calma', emoji: '😌', category: 'emotional' },
  { id: 'creative', name: 'Criativa', emoji: '🎨', category: 'emotional' },

  // Outros Sintomas
  { id: 'increased_appetite', name: 'Mais fome', emoji: '🍽️', category: 'other' },
  { id: 'decreased_appetite', name: 'Menos fome', emoji: '🚫', category: 'other' },
  { id: 'cravings_sweet', name: 'Desejo por doces', emoji: '🍫', category: 'other' },
  { id: 'cravings_salty', name: 'Desejo por salgados', emoji: '🍟', category: 'other' },
  { id: 'insomnia', name: 'Insônia', emoji: '🌙', category: 'other' },
  { id: 'sleepy', name: 'Sonolenta', emoji: '😪', category: 'other' },
  { id: 'libido_high', name: 'Libido alta', emoji: '🔥', category: 'other' },
  { id: 'libido_low', name: 'Libido baixa', emoji: '❄️', category: 'other' },
  { id: 'focus_high', name: 'Muito focada', emoji: '🎯', category: 'other' },
  { id: 'focus_low', name: 'Desconcentrada', emoji: '🌀', category: 'other' },
  { id: 'skin_good', name: 'Pele boa', emoji: '✨', category: 'other' },
  { id: 'skin_bad', name: 'Pele ruim', emoji: '😞', category: 'other' },
];

/**
 * Tipos de fluxo menstrual
 */
export const FLOW_TYPES: FlowType[] = [
  { 
    id: 'light', 
    name: 'Leve', 
    emoji: '💧', 
    color: '#FFB4D6' 
  },
  { 
    id: 'moderate', 
    name: 'Moderado', 
    emoji: '💧💧', 
    color: '#FF6B9D' 
  },
  { 
    id: 'heavy', 
    name: 'Intenso', 
    emoji: '💧💧💧', 
    color: '#E74C3C' 
  },
];

/**
 * Cores dos temas por fase do ciclo
 */
export const PHASE_COLORS = {
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
    ovulation: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FFFF99',
      background: '#FFFEF0',
      surface: '#FFFFFF',
      gradients: ['#FFFF99', '#FFD700', '#FFA500'],
      particles: '#FFD700'
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
    ovulation: {
      primary: '#B8860B',
      secondary: '#FFD700',
      accent: '#FFFF99',
      background: '#1A1A00',
      surface: '#2D2D00',
      gradients: ['#2D2D00', '#B8860B', '#FFD700'],
      particles: '#FFD700'
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
} as const;

/**
 * Informações sobre as fases do ciclo
 */
export const PHASE_INFO = {
  menstrual: {
    name: 'Menstruação',
    emoji: '🌸',
    description: 'Período de renovação e autocuidado',
    duration: '3-7 dias',
    hormones: 'Estrogênio e progesterona baixos',
    tips: [
      'Descanse e se hidrate bem',
      'Use calor para aliviar cólicas',
      'Pratique atividades relaxantes',
      'Seja gentil consigo mesma'
    ]
  },
  postMenstrual: {
    name: 'Pós-Menstrual',
    emoji: '🌱',
    description: 'Energia renovada e disposição',
    duration: '6-13 dias do ciclo',
    hormones: 'Estrogênio em ascensão',
    tips: [
      'Aproveite a energia extra',
      'Inicie novos projetos',
      'Exercite-se mais intensamente',
      'Socialize e tome decisões'
    ]
  },
  fertile: {
    name: 'Período Fértil',
    emoji: '🔥',
    description: 'Alta energia e criatividade',
    duration: '10-17 dias do ciclo',
    hormones: 'Estrogênio no pico',
    tips: [
      'Use proteção se não desejar engravidar',
      'Aproveite a criatividade',
      'Observe mudanças no muco cervical',
      'Energia no máximo'
    ]
  },
  ovulation: {
    name: 'Ovulação',
    emoji: '⭐',
    description: 'Pico de fertilidade',
    duration: '12-16 dias do ciclo',
    hormones: 'Pico de LH e estrogênio',
    tips: [
      'Maior chance de gravidez',
      'Energia e libido no máximo',
      'Possível dor no ovário',
      'Momento ideal para concepção'
    ]
  },
  preMenstrual: {
    name: 'Pré-Menstrual',
    emoji: '💜',
    description: 'Preparação e introspecção',
    duration: '18-28 dias do ciclo',
    hormones: 'Progesterona alta, depois queda',
    tips: [
      'Pratique autocuidado',
      'Evite decisões importantes',
      'Mantenha dieta equilibrada',
      'Exercícios leves ajudam'
    ]
  }
} as const;

/**
 * Configurações padrão de notificações
 */
export const DEFAULT_NOTIFICATION_SETTINGS = {
  periodReminder: true,
  periodReminderDays: 2,
  ovulationReminder: true,
  ovulationReminderDays: 1,
  dailyReminder: false,
  dailyReminderTime: '20:00',
  fertileWindowReminder: true,
  lateReminder: true,
} as const;

/**
 * Textos motivacionais por fase
 */
export const MOTIVATIONAL_MESSAGES = {
  menstrual: [
    'Tempo de se reconectar com você mesma 🌸',
    'Seu corpo está fazendo um trabalho incrível ✨',
    'Descanse, você merece este cuidado 💜',
    'Cada ciclo é uma nova oportunidade 🌙'
  ],
  postMenstrual: [
    'Energia renovada, mundo nas suas mãos! 🌱',
    'Hora de brilhar e conquistar seus objetivos ⭐',
    'Sua força interior está no auge 💪',
    'Aproveite esta fase de clareza mental 🧠'
  ],
  fertile: [
    'Você está radiante e poderosa! 🔥',
    'Criatividade e energia em alta 🎨',
    'Sua confiança está no máximo ✨',
    'Momento perfeito para novos projetos 🚀'
  ],
  ovulation: [
    'Você é pura energia e vitalidade! ⭐',
    'Seu corpo está no auge da feminilidade 💫',
    'Momento de celebrar sua força interior 🎉',
    'Sua intuição está especialmente aguçada 🔮'
  ],
  preMenstrual: [
    'Tempo de introspecção e sabedoria 💜',
    'Sua sensibilidade é um superpoder 🦋',
    'Prepare-se para um novo ciclo de renovação 🌙',
    'Seja paciente e amorosa consigo mesma 💝'
  ]
} as const;

/**
 * Dicas de bem-estar por fase
 */
export const WELLNESS_TIPS = {
  menstrual: [
    'Beba bastante água para se manter hidratada',
    'Use uma bolsa de água quente para aliviar cólicas',
    'Coma alimentos ricos em ferro como espinafre',
    'Pratique yoga suave ou alongamentos',
    'Durma bem - seu corpo precisa descansar'
  ],
  postMenstrual: [
    'Aproveite para fazer exercícios mais intensos',
    'É um ótimo momento para começar novos hábitos',
    'Inclua proteínas magras na sua alimentação',
    'Socialize - você está no seu melhor humor',
    'Planeje projetos importantes'
  ],
  fertile: [
    'Observe as mudanças no seu muco cervical',
    'Mantenha-se ativa - você tem muita energia',
    'Coma alimentos antioxidantes como frutas vermelhas',
    'É normal sentir-se mais atraente',
    'Hidrate-se bem para manter a energia'
  ],
  ovulation: [
    'Sua temperatura corporal pode estar ligeiramente elevada',
    'É normal sentir uma leve dor no ovário',
    'Aproveite o pico de energia para atividades importantes',
    'Sua libido está naturalmente mais alta',
    'Momento ideal para atividades criativas'
  ],
  preMenstrual: [
    'Evite cafeína em excesso se estiver ansiosa',
    'Coma carboidratos complexos para estabilizar o humor',
    'Pratique técnicas de respiração para relaxar',
    'É normal ter desejos alimentares - modere sem culpa',
    'Exercícios leves como caminhada podem ajudar'
  ]
} as const;

/**
 * Limites e validações
 */
export const VALIDATION_LIMITS = {
  nameMinLength: 2,
  nameMaxLength: 30,
  noteMaxLength: 500,
  maxRecordsPerDay: 20,
  maxCycleHistory: 12, // meses
  minAgeForApp: 12,
  maxAgeForApp: 55,
} as const;

/**
 * Configurações de animação
 */
export const ANIMATION_CONFIG = {
  shortDuration: 300,
  mediumDuration: 600,
  longDuration: 1000,
  particleCount: 15,
  particleDuration: 8000,
  progressAnimationDuration: 1500,
} as const;