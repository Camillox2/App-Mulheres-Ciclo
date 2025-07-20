// utils/cycleCalculations.ts
import moment from 'moment';

export interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export type CyclePhase = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

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
 * Calcula informações completas sobre o ciclo atual
 */
export const calculateCycleInfo = (cycleData: CycleData, targetDate?: Date): CycleInfo => {
  const lastPeriod = moment(cycleData.lastPeriodDate);
  const currentDate = moment(targetDate || new Date());
  
  // Calcula o dia atual do ciclo
  let daysSinceLastPeriod = currentDate.diff(lastPeriod, 'days');
  
  // Se passou mais de um ciclo, ajusta para o ciclo atual
  if (daysSinceLastPeriod >= cycleData.averageCycleLength) {
    const cyclesPassed = Math.floor(daysSinceLastPeriod / cycleData.averageCycleLength);
    daysSinceLastPeriod = daysSinceLastPeriod % cycleData.averageCycleLength;
  }
  
  const currentDay = daysSinceLastPeriod + 1;
  
  // Calcula datas importantes
  const nextPeriodDate = lastPeriod.clone().add(
    Math.ceil((currentDate.diff(lastPeriod, 'days') + 1) / cycleData.averageCycleLength) * cycleData.averageCycleLength,
    'days'
  );
  
  const ovulationDay = cycleData.averageCycleLength - 14;
  const ovulationDate = lastPeriod.clone().add(ovulationDay - 1, 'days');
  
  // Se a ovulação já passou neste ciclo, calcula para o próximo
  if (currentDay > ovulationDay) {
    ovulationDate.add(cycleData.averageCycleLength, 'days');
  }
  
  // Determina a fase atual
  const phase = getCurrentPhase(currentDay, cycleData);
  
  // Calcula dias até próximos eventos
  const daysUntilNextPeriod = Math.max(0, nextPeriodDate.diff(currentDate, 'days'));
  const daysUntilOvulation = Math.max(0, ovulationDate.diff(currentDate, 'days'));
  
  // Calcula chance de gravidez
  const pregnancyChance = calculatePregnancyChance(currentDay, cycleData);
  
  // Verifica se está na janela fértil
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 1;
  const isInFertileWindow = currentDay >= fertileStart && currentDay <= fertileEnd;
  
  return {
    currentDay,
    phase,
    daysUntilNextPeriod,
    daysUntilOvulation,
    pregnancyChance,
    isInFertileWindow,
    nextPeriodDate,
    ovulationDate,
  };
};

/**
 * Determina a fase atual do ciclo
 */
export const getCurrentPhase = (dayOfCycle: number, cycleData: CycleData): CyclePhase => {
  const { averageCycleLength, averagePeriodLength } = cycleData;
  const ovulationDay = averageCycleLength - 14;
  
  if (dayOfCycle >= 1 && dayOfCycle <= averagePeriodLength) {
    return 'menstrual';
  } else if (dayOfCycle > averagePeriodLength && dayOfCycle < ovulationDay - 2) {
    return 'postMenstrual';
  } else if (dayOfCycle === ovulationDay) {
    return 'ovulation';
  } else if (dayOfCycle >= ovulationDay - 2 && dayOfCycle <= ovulationDay + 2) {
    return 'fertile';
  } else {
    return 'preMenstrual';
  }
};

/**
 * Calcula a chance de gravidez para um dia específico
 */
export const calculatePregnancyChance = (dayOfCycle: number, cycleData: CycleData): number => {
  const ovulationDay = cycleData.averageCycleLength - 14;
  const daysDifferenceFromOvulation = Math.abs(dayOfCycle - ovulationDay);
  
  // Chance máxima no dia da ovulação
  if (daysDifferenceFromOvulation === 0) {
    return 30 + Math.floor(Math.random() * 10); // 30-40%
  }
  
  // Janela fértil (5 dias antes a 1 dia depois da ovulação)
  if (dayOfCycle >= ovulationDay - 5 && dayOfCycle <= ovulationDay + 1) {
    const baseChance = 25 - (daysDifferenceFromOvulation * 3);
    return Math.max(15, baseChance + Math.floor(Math.random() * 8));
  }
  
  // Durante a menstruação
  if (dayOfCycle <= cycleData.averagePeriodLength) {
    return Math.floor(Math.random() * 5) + 1; // 1-5%
  }
  
  // Pós-menstrual
  if (dayOfCycle <= 11) {
    return Math.floor(Math.random() * 10) + 5; // 5-15%
  }
  
  // Pré-menstrual
  return Math.floor(Math.random() * 8) + 3; // 3-10%
};

/**
 * Calcula o progresso atual do ciclo (0 a 1)
 */
export const calculateCycleProgress = (dayOfCycle: number, cycleLength: number): number => {
  return Math.min(dayOfCycle / cycleLength, 1);
};

/**
 * Gera previsões para os próximos ciclos
 */
export const generateCyclePredictions = (
  cycleData: CycleData,
  monthsAhead: number = 6
): Array<{
  cycleNumber: number;
  periodStart: moment.Moment;
  periodEnd: moment.Moment;
  ovulation: moment.Moment;
  fertileWindowStart: moment.Moment;
  fertileWindowEnd: moment.Moment;
}> => {
  const predictions: Array<{
    cycleNumber: number;
    periodStart: moment.Moment;
    periodEnd: moment.Moment;
    ovulation: moment.Moment;
    fertileWindowStart: moment.Moment;
    fertileWindowEnd: moment.Moment;
  }> = [];
  const startDate = moment(cycleData.lastPeriodDate);
  
  for (let i = 0; i < monthsAhead; i++) {
    const cycleStart = startDate.clone().add(i * cycleData.averageCycleLength, 'days');
    const cycleEnd = cycleStart.clone().add(cycleData.averagePeriodLength - 1, 'days');
    const ovulation = cycleStart.clone().add(cycleData.averageCycleLength - 14, 'days');
    const fertileStart = ovulation.clone().subtract(5, 'days');
    const fertileEnd = ovulation.clone().add(1, 'day');
    
    predictions.push({
      cycleNumber: i + 1,
      periodStart: cycleStart,
      periodEnd: cycleEnd,
      ovulation,
      fertileWindowStart: fertileStart,
      fertileWindowEnd: fertileEnd,
    });
  }
  
  return predictions;
};

/**
 * Verifica se o ciclo está atrasado
 */
export const isCycleLate = (cycleData: CycleData, daysOfTolerance: number = 3): boolean => {
  const lastPeriod = moment(cycleData.lastPeriodDate);
  const expectedNextPeriod = lastPeriod.clone().add(cycleData.averageCycleLength, 'days');
  const today = moment();
  
  return today.isAfter(expectedNextPeriod.clone().add(daysOfTolerance, 'days'));
};

/**
 * Calcula estatísticas do ciclo com base no histórico
 */
export const calculateCycleStatistics = (cycleHistory: CycleData[]): {
  averageLength: number;
  shortestCycle: number;
  longestCycle: number;
  variation: number;
  regularity: 'regular' | 'irregular';
} => {
  if (cycleHistory.length < 2) {
    return {
      averageLength: 28,
      shortestCycle: 28,
      longestCycle: 28,
      variation: 0,
      regularity: 'regular',
    };
  }
  
  const lengths = cycleHistory.map(cycle => cycle.averageCycleLength);
  const averageLength = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  const shortestCycle = Math.min(...lengths);
  const longestCycle = Math.max(...lengths);
  const variation = longestCycle - shortestCycle;
  const regularity = variation <= 7 ? 'regular' : 'irregular';
  
  return {
    averageLength: Math.round(averageLength),
    shortestCycle,
    longestCycle,
    variation,
    regularity,
  };
};

/**
 * Formata informações do ciclo para exibição
 */
export const formatCycleInfo = (info: CycleInfo): {
  phaseDisplay: string;
  phaseEmoji: string;
  phaseDescription: string;
  nextEventText: string;
} => {
  const phaseMap = {
    menstrual: {
      display: 'Menstruação',
      emoji: '🌸',
      description: 'Período de renovação e autocuidado. Descanse e se hidrate bem.',
    },
    postMenstrual: {
      display: 'Pós-Menstrual',
      emoji: '🌱',
      description: 'Energia renovada! Ótimo momento para novos projetos.',
    },
    fertile: {
      display: 'Período Fértil',
      emoji: '🔥',
      description: 'Alta energia e criatividade. Período de maior fertilidade.',
    },
    ovulation: {
      display: 'Ovulação',
      emoji: '⭐',
      description: 'Pico de energia e fertilidade. Momento de maior chance de concepção.',
    },
    preMenstrual: {
      display: 'Pré-Menstrual',
      emoji: '💜',
      description: 'Tempo de introspecção. Prepare-se para o próximo ciclo.',
    },
  };
  
  const phaseInfo = phaseMap[info.phase];
  
  let nextEventText = '';
  if (info.daysUntilNextPeriod === 0) {
    nextEventText = 'Menstruação hoje!';
  } else if (info.daysUntilNextPeriod === 1) {
    nextEventText = 'Menstruação amanhã';
  } else if (info.daysUntilOvulation === 0) {
    nextEventText = 'Ovulação hoje!';
  } else if (info.daysUntilOvulation === 1) {
    nextEventText = 'Ovulação amanhã';
  } else if (info.daysUntilNextPeriod < info.daysUntilOvulation) {
    nextEventText = `Próxima menstruação em ${info.daysUntilNextPeriod} dias`;
  } else {
    nextEventText = `Ovulação em ${info.daysUntilOvulation} dias`;
  }
  
  return {
    phaseDisplay: phaseInfo.display,
    phaseEmoji: phaseInfo.emoji,
    phaseDescription: phaseInfo.description,
    nextEventText,
  };
};