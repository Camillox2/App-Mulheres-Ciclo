// types/index.ts

/**
 * Tipos relacionados ao ciclo menstrual
 */
export type CyclePhase = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

export interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  setupDate: string;
  irregularCycle?: boolean;
}

export interface CycleInfo {
  currentDay: number;
  phase: CyclePhase;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
  pregnancyChance: number;
  isInFertileWindow: boolean;
  nextPeriodDate: moment.Moment;
  ovulationDate: moment.Moment;
}

/**
 * Tipos relacionados ao tema
 */
export type ThemeMode = 'light' | 'dark';

export interface PhaseColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  gradients: string[];
  particles: string;
}

export interface AdaptiveTheme {
  mode: ThemeMode;
  phase: CyclePhase;
  colors: PhaseColors;
  intensity: number;
  nextPhaseIn: number;
}

/**
 * Tipos relacionados ao perfil do usuário
 */
export interface UserProfile {
  name: string;
  profileImage?: string;
  setupDate: string;
}

/**
 * Tipos relacionados aos registros
 */
export type RecordType = 'symptom' | 'mood' | 'activity' | 'period' | 'note';

export interface Record {
  id: string;
  date: string;
  type: RecordType;
  data: any;
}

export interface SymptomRecord extends Record {
  type: 'symptom';
  data: {
    symptomId: string;
    name: string;
    emoji: string;
    intensity: 'light' | 'medium' | 'heavy';
    category: 'physical' | 'emotional' | 'other';
  };
}

export interface PeriodRecord extends Record {
  type: 'period';
  data: {
    flow: 'light' | 'moderate' | 'heavy';
    flowName: string;
    emoji: string;
    color: string;
  };
}

export interface ActivityRecord extends Record {
  type: 'activity';
  data: {
    type: 'sexual';
    protection: 'none' | 'condom' | 'pill' | 'iud' | 'other' | 'unknown';
    notes?: string;
  };
}

export interface NoteRecord extends Record {
  type: 'note';
  data: {
    text: string;
  };
}

/**
 * Tipos relacionados aos sintomas
 */
export interface Symptom {
  id: string;
  name: string;
  emoji: string;
  category: 'physical' | 'emotional' | 'other';
}

export interface FlowType {
  id: 'light' | 'moderate' | 'heavy';
  name: string;
  emoji: string;
  color: string;
}

/**
 * Tipos relacionados às notificações
 */
export interface NotificationSettings {
  periodReminder: boolean;
  periodReminderDays: number;
  ovulationReminder: boolean;
  ovulationReminderDays: number;
  dailyReminder: boolean;
  dailyReminderTime: string;
  fertileWindowReminder: boolean;
  lateReminder: boolean;
}

/**
 * Tipos relacionados às análises
 */
export interface AnalyticsData {
  totalRecords: number;
  mostCommonSymptoms: Array<{
    name: string;
    count: number;
    emoji: string;
  }>;
  averageCycleLength: number;
  periodFrequency: number;
  moodDistribution: Array<{
    mood: string;
    count: number;
    percentage: number;
  }>;
  recentCycles: Array<{
    start: string;
    length: number;
  }>;
}

/**
 * Tipos relacionados ao calendário
 */
export interface DayInfo {
  date: moment.Moment;
  phase: CyclePhase;
  pregnancyChance: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayOfCycle: number;
  hasRecords?: boolean;
  recordTypes?: RecordType[];
}

/**
 * Tipos relacionados ao conteúdo educativo
 */
export interface EducationalContent {
  title: string;
  emoji: string;
  sections: Array<{
    subtitle: string;
    content: string;
    tips?: string[];
  }>;
}

/**
 * Tipos relacionados às estatísticas do ciclo
 */
export interface CycleStatistics {
  averageLength: number;
  shortestCycle: number;
  longestCycle: number;
  variation: number;
  regularity: 'regular' | 'irregular';
}

/**
 * Tipos relacionados às previsões
 */
export interface CyclePrediction {
  cycleNumber: number;
  periodStart: moment.Moment;
  periodEnd: moment.Moment;
  ovulation: moment.Moment;
  fertileWindowStart: moment.Moment;
  fertileWindowEnd: moment.Moment;
}

/**
 * Tipos para componentes
 */
export interface ParticleSystemProps {
  particleColor: string;
  opacity?: number;
  count?: number;
  duration?: number;
}

export interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  colors: string[];
  backgroundColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
  duration?: number;
}

export interface EducationalModalProps {
  visible: boolean;
  onClose: () => void;
  content: EducationalContent;
  theme: AdaptiveTheme;
}

/**
 * Tipos relacionados à navegação
 */
export type RootStackParamList = {
  index: undefined;
  welcome: undefined;
  'profile-setup': undefined;
  'cycle-setup': undefined;
  home: undefined;
  calendar: undefined;
  records: undefined;
  analytics: undefined;
  settings: undefined;
};

/**
 * Tipos de utilidade
 */
export interface AsyncStorageKeys {
  userProfile: 'userProfile';
  cycleData: 'cycleData';
  dailyRecords: 'dailyRecords';
  notificationSettings: 'notificationSettings';
  themeMode: 'themeMode';
  isFirstTime: 'isFirstTime';
  setupCompleted: 'setupCompleted';
}

/**
 * Enum para chaves do AsyncStorage
 */
export const STORAGE_KEYS: AsyncStorageKeys = {
  userProfile: 'userProfile',
  cycleData: 'cycleData',
  dailyRecords: 'dailyRecords',
  notificationSettings: 'notificationSettings',
  themeMode: 'themeMode',
  isFirstTime: 'isFirstTime',
  setupCompleted: 'setupCompleted',
} as const;