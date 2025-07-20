// hooks/cycleCalculations.ts - VERSÃO CORRIGIDA
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

export interface DayInfo {
  date: moment.Moment;
  phase: CyclePhase;
  pregnancyChance: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayOfCycle: number;
  phaseIntensity: number;
}

// Cache para evitar recálculos desnecessários
const calculationCache = new Map<string, number>();

/**
 * FUNÇÃO CORRIGIDA: Calcula chance de gravidez de forma determinística
 */
export const calculatePregnancyChance = (
  dayOfCycle: number, 
  cycleData: CycleData,
  targetDate: moment.Moment
): number => {
  // Cria uma chave única para cache baseada na data e dados do ciclo
  const cacheKey = `${targetDate.format('YYYY-MM-DD')}-${dayOfCycle}-${cycleData.averageCycleLength}`;
  
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!;
  }

  const ovulationDay = cycleData.averageCycleLength - 14;
  let chance = 0;

  // Calcula baseado na distância do dia de ovulação
  const distanceFromOvulation = Math.abs(dayOfCycle - ovulationDay);

  if (dayOfCycle === ovulationDay) {
    // Dia da ovulação - chance máxima
    chance = 35;
  } else if (dayOfCycle >= ovulationDay - 5 && dayOfCycle <= ovulationDay + 1) {
    // Janela fértil (5 dias antes + 1 dia depois da ovulação)
    if (dayOfCycle < ovulationDay) {
      // Antes da ovulação - chance aumenta gradualmente
      chance = 15 + (5 - (ovulationDay - dayOfCycle)) * 4;
    } else {
      // Depois da ovulação - chance diminui rapidamente
      chance = 25 - (dayOfCycle - ovulationDay) * 10;
    }
  } else if (dayOfCycle >= 1 && dayOfCycle <= cycleData.averagePeriodLength) {
    // Durante a menstruação - chance muito baixa
    chance = 2;
  } else if (dayOfCycle <= cycleData.averagePeriodLength + 5) {
    // Pós-menstrual inicial - chance baixa
    chance = 5;
  } else if (dayOfCycle >= cycleData.averageCycleLength - 7) {
    // Pré-menstrual - chance baixa
    chance = 8;
  } else {
    // Outros dias - chance moderada baixa
    chance = 12;
  }

  // Adiciona uma pequena variação baseada na data para parecer mais natural
  // mas mantém determinístico para a mesma data
  const dateBasedVariation = (targetDate.dayOfYear() % 7) - 3; // -3 a +3
  chance = Math.max(1, Math.min(40, chance + dateBasedVariation));

  // Arredonda para número inteiro
  chance = Math.round(chance);

  // Salva no cache
  calculationCache.set(cacheKey, chance);

  return chance;
};

/**
 * FUNÇÃO CORRIGIDA: Determina a fase do ciclo de forma consistente
 */
export const getCurrentPhase = (dayOfCycle: number, cycleData: CycleData): CyclePhase => {
  const { averageCycleLength, averagePeriodLength } = cycleData;
  const ovulationDay = averageCycleLength - 14;
  
  if (dayOfCycle >= 1 && dayOfCycle <= averagePeriodLength) {
    return 'menstrual';
  } else if (dayOfCycle > averagePeriodLength && dayOfCycle < ovulationDay - 2) {
    return 'postMenstrual';
  } else if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
    if (dayOfCycle === ovulationDay) {
      return 'ovulation';
    }
    return 'fertile';
  } else {
    return 'preMenstrual';
  }
};

/**
 * FUNÇÃO NOVA: Calcula intensidade da fase para gradientes
 */
export const calculatePhaseIntensity = (dayOfCycle: number, phase: CyclePhase, cycleLength: number): number => {
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
  
  const intensity = Math.max(0.3, 1 - (distanceFromPeak / maxDistance) * 0.7);
  return Number(intensity.toFixed(2));
};

/**
 * FUNÇÃO CORRIGIDA: Calcula informações completas do dia
 */
export const getDayInfo = (date: moment.Moment, cycleData: CycleData, currentMonth: moment.Moment): DayInfo => {
  const lastPeriod = moment(cycleData.lastPeriodDate);
  
  // Calcula quantos dias se passaram desde a última menstruação
  let daysSinceLastPeriod = date.diff(lastPeriod, 'days');
  
  // Se a data é anterior à última menstruação, calcula para ciclo anterior
  if (daysSinceLastPeriod < 0) {
    const cyclesBack = Math.ceil(Math.abs(daysSinceLastPeriod) / cycleData.averageCycleLength);
    const adjustedLastPeriod = lastPeriod.clone().subtract(cyclesBack * cycleData.averageCycleLength, 'days');
    daysSinceLastPeriod = date.diff(adjustedLastPeriod, 'days');
  }
  
  // Normaliza para o ciclo atual (1-28, por exemplo)
  const dayOfCycle = (daysSinceLastPeriod % cycleData.averageCycleLength) + 1;
  
  // Determina a fase
  const phase = getCurrentPhase(dayOfCycle, cycleData);
  
  // Calcula chance de gravidez de forma determinística
  const pregnancyChance = calculatePregnancyChance(dayOfCycle, cycleData, date);
  
  // Calcula intensidade da fase
  const phaseIntensity = calculatePhaseIntensity(dayOfCycle, phase, cycleData.averageCycleLength);
  
  return {
    date: date.clone(),
    phase,
    pregnancyChance,
    isToday: date.isSame(moment(), 'day'),
    isCurrentMonth: date.isSame(currentMonth, 'month'),
    dayOfCycle,
    phaseIntensity,
  };
};

/**
 * FUNÇÃO CORRIGIDA: Calcula informações completas sobre o ciclo atual
 */
export const calculateCycleInfo = (cycleData: CycleData, targetDate?: Date): CycleInfo => {
  const lastPeriod = moment(cycleData.lastPeriodDate);
  const currentDate = moment(targetDate || new Date());
  
  // Calcula o dia atual do ciclo
  let daysSinceLastPeriod = currentDate.diff(lastPeriod, 'days');
  
  // Ajusta para o ciclo atual se necessário
  if (daysSinceLastPeriod >= cycleData.averageCycleLength) {
    const cyclesPassed = Math.floor(daysSinceLastPeriod / cycleData.averageCycleLength);
    daysSinceLastPeriod = daysSinceLastPeriod % cycleData.averageCycleLength;
  }
  
  const currentDay = daysSinceLastPeriod + 1;
  
  // Calcula próxima menstruação
  const nextPeriodDate = lastPeriod.clone().add(
    Math.ceil(currentDate.diff(lastPeriod, 'days') / cycleData.averageCycleLength) * cycleData.averageCycleLength,
    'days'
  );
  
  // Calcula próxima ovulação
  const ovulationDay = cycleData.averageCycleLength - 14;
  let ovulationDate = lastPeriod.clone().add(ovulationDay - 1, 'days');
  
  // Se a ovulação já passou neste ciclo, calcula para o próximo
  if (currentDay > ovulationDay) {
    ovulationDate = ovulationDate.add(cycleData.averageCycleLength, 'days');
  }
  
  // Determina a fase atual
  const phase = getCurrentPhase(currentDay, cycleData);
  
  // Calcula dias até próximos eventos
  const daysUntilNextPeriod = Math.max(0, nextPeriodDate.diff(currentDate, 'days'));
  const daysUntilOvulation = Math.max(0, ovulationDate.diff(currentDate, 'days'));
  
  // Calcula chance de gravidez
  const pregnancyChance = calculatePregnancyChance(currentDay, cycleData, currentDate);
  
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
 * Limpa o cache de cálculos (útil para testes ou mudanças nos dados do ciclo)
 */
export const clearCalculationCache = () => {
  calculationCache.clear();
};

/**
 * Gera dados para debug/testes
 */
export const debugCycleCalculations = (cycleData: CycleData) => {
  const today = moment();
  const debugData = [];
  
  for (let i = -5; i <= 35; i++) {
    const date = today.clone().add(i, 'days');
    const dayInfo = getDayInfo(date, cycleData, today);
    debugData.push({
      date: date.format('DD/MM'),
      dayOfCycle: dayInfo.dayOfCycle,
      phase: dayInfo.phase,
      pregnancyChance: dayInfo.pregnancyChance,
      intensity: dayInfo.phaseIntensity,
    });
  }
  
  console.table(debugData);
  return debugData;
};