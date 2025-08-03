// constants/appConstants.ts
// constants/appConstants.ts
import { Symptom, FlowType } from '../types';

/**
 * Informações do aplicativo
 */
export const APP_INFO = {
  name: 'Entre Fases',
  version: '1.0.1',
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
    // ... (as suas definições de cores permanecem aqui)
} as const;

/**
 * Informações sobre as fases do ciclo com DICAS MELHORADAS
 */
export const PHASE_INFO = {
  menstrual: {
    name: 'Menstruação',
    description: 'Período de renovação e autocuidado',
    color: '#FF6B9D',
    tips: [
      'Beba chás quentes, como camomila ou gengibre, para aliviar cólicas.',
      'Use uma bolsa de água quente no abdômen para relaxar os músculos.',
      'Priorize alimentos ricos em ferro, como feijão, lentilha e vegetais escuros.',
      'Permita-se descansar. Seu corpo está a trabalhar muito.',
    ],
  },
  postMenstrual: {
    name: 'Pós-Menstrual',
    description: 'Energia renovada e disposição',
    color: '#27AE60',
    tips: [
      'Aproveite o aumento de energia para fazer exercícios mais intensos.',
      'É um ótimo momento para focar em tarefas que exigem concentração.',
      'Sua pele tende a estar no seu melhor. Mantenha uma boa rotina de cuidados.',
      'Socialize e conecte-se com amigos; sua disposição estará em alta.',
    ],
  },
  fertile: {
    name: 'Período Fértil',
    description: 'Alta energia e criatividade',
    color: '#FF8C42',
    tips: [
      'Sua libido pode estar mais alta. Use proteção se não desejar engravidar.',
      'Canalize sua energia extra para projetos criativos ou hobbies.',
      'Coma alimentos leves e nutritivos para manter a vitalidade.',
      'Sua comunicação está favorecida. Ótimo para conversas importantes.',
    ],
  },
  ovulation: {
    name: 'Ovulação',
    description: 'Pico de fertilidade',
    color: '#FFC107',
    tips: [
      'Este é o dia de maior chance de conceção.',
      'Aproveite a sua autoconfiança e magnetismo pessoal.',
      'É normal sentir uma leve pontada num dos lados do abdómen (dor de ovulação).',
      'Excelente dia para atividades que exijam o seu máximo desempenho.',
    ],
  },
  preMenstrual: {
    name: 'TPM / Lútea',
    description: 'Introspecção e sensibilidade',
    color: '#9C27B0',
    tips: [
      'Seja gentil consigo mesma; suas emoções podem estar mais sensíveis.',
      'Reduza o consumo de sal e cafeína para diminuir o inchaço e a irritabilidade.',
      'Pratique atividades relaxantes como meditação, leitura ou um banho quente.',
      'Prefira alimentos ricos em magnésio, como abacate e nozes, para aliviar sintomas.',
    ],
  },
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