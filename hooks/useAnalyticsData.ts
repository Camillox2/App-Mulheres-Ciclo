import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import _ from 'lodash';

// Tipos
export interface SymptomData {
  name: string;
  count: number;
  emoji: string;
  trend: number;
}

export interface MoodDistribution {
  mood: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentCycle {
  start: string;
  length: number;
  symptoms: number;
  mood: string;
}

export interface TimeSeriesData {
  date: string;
  symptoms: number;
  mood: number;
}

export interface CycleComparisonData {
  cycle: number;
  length: number;
  symptoms: number;
}

export interface Record {
    id: string;
    date: string;
    type: string;
    data: any;
}

export interface AnalyticsData {
  totalRecords: number;
  recordsByType: { [key: string]: number };
  mostCommonSymptoms: SymptomData[];
  averageCycleLength: number;
  cycleLengthVariation: number;
  periodFrequency: number;
  moodDistribution: MoodDistribution[];
  recentCycles: RecentCycle[];
  nextPeriodPrediction: string | null;
  insights: string[];
  timeSeriesData: TimeSeriesData[];
  cycleComparison: CycleComparisonData[];
}

export interface FilterOptions {
  period: 'all' | 'monthly' | 'quarterly' | 'yearly';
  dateRange?: { start: string; end: string };
  includeTypes?: string[];
  minSymptomCount?: number;
}

// Worker-like processing para cálculos pesados
class AnalyticsProcessor {
  private static instance: AnalyticsProcessor;
  private cache = new Map<string, any>();

  static getInstance(): AnalyticsProcessor {
    if (!AnalyticsProcessor.instance) {
      AnalyticsProcessor.instance = new AnalyticsProcessor();
    }
    return AnalyticsProcessor.instance;
  }

  public clearCache() {
    this.cache.clear();
  }

  getCachedResult<T>(key: string, calculator: () => T, ttl: number = 300000): T {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const result = calculator();
    this.cache.set(key, { data: result, timestamp: Date.now() });
    return result;
  }

  processSymptoms(records: Record[]): SymptomData[] {
    const symptomRecords = records.filter((r) => r.type === 'symptom');
    const grouped = _.groupBy(symptomRecords, 'data.name');

    return Object.entries(grouped)
      .map(([name, items]: [string, Record[]]) => {
        const recent = items.filter((item) =>
          moment(item.date).isAfter(moment().subtract(30, 'days'))
        ).length;
        const older = items.length - recent;
        const trend = older > 0 ? ((recent - older) / older) * 100 : 0;

        return {
          name,
          count: items.length,
          emoji: items[0]?.data?.emoji || '💭',
          trend: Math.round(trend),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }

  processMoodDistribution(records: Record[]): MoodDistribution[] {
    const moodSymptoms = ['Feliz','Triste','Ansiosa','Irritada','Energética','Romântica','Calma','Estressada'];
    const moodColors: { [key: string]: string } = {
      Feliz: '#FFD700',
      Triste: '#6B73FF',
      Ansiosa: '#FF6B6B',
      Irritada: '#FF4757',
      Energética: '#2ED573',
      Romântica: '#FF6B9D',
      Calma: '#70A1FF',
      Estressada: '#FF7675',
    };

    const moodRecords = records.filter(
      (r) => r.type === 'symptom' && moodSymptoms.includes(r.data.name)
    );
    const totalMoods = moodRecords.length;
    const grouped = _.groupBy(moodRecords, 'data.name');

    return Object.entries(grouped)
      .map(([mood, items]: [string, Record[]]) => ({
        mood,
        count: items.length,
        percentage: totalMoods > 0 ? Math.round((items.length / totalMoods) * 100) : 0,
        color: moodColors[mood] || '#95A5A6',
      }))
      .sort((a, b) => b.count - a.count);
  }

  processCycles(records: Record[]): {
    recentCycles: RecentCycle[];
    cycleLengths: number[];
    averageLength: number;
    variation: number;
  } {
    const periodRecords = records.filter((r) => r.type === 'period');
    if (periodRecords.length < 2) {
      return { recentCycles: [], cycleLengths: [], averageLength: 28, variation: 0 };
    }

    const sortedPeriods = _.sortBy(periodRecords, (r: Record) => moment(r.date).unix());
    const cycleStarts: moment.Moment[] = [];

    sortedPeriods.forEach((record: Record, index: number) => {
      const recordDate = moment(record.date);
      if (index === 0) {
        cycleStarts.push(recordDate);
      } else {
        const prevDate = moment(sortedPeriods[index - 1].date);
        if (recordDate.diff(prevDate, 'days') > 1) {
          cycleStarts.push(recordDate);
        }
      }
    });

    const cycleLengths: number[] = [];
    const recentCycles: RecentCycle[] = [];

    for (let i = 0; i < cycleStarts.length - 1; i++) {
      const start = cycleStarts[i];
      const end = cycleStarts[i + 1];
      const length = end.diff(start, 'days');

      const cycleRecords = records.filter((r: Record) => {
        const recordDate = moment(r.date);
        return recordDate.isBetween(start, end, 'day', '[]');
      });

      const symptomCount = cycleRecords.filter((r: Record) => r.type === 'symptom').length;
      const moodRecords = cycleRecords.filter(
        (r: Record) =>
          r.type === 'symptom' &&
          ['Feliz', 'Triste', 'Ansiosa', 'Irritada'].includes(r.data.name)
      );

      const dominantMoodGroup = _.groupBy(moodRecords, 'data.name');
      const dominantMoodEntry = _.maxBy(Object.entries(dominantMoodGroup), ([, group]) => group.length);

      cycleLengths.push(length);
      recentCycles.push({
        start: start.format('DD/MM/YYYY'),
        length,
        symptoms: symptomCount,
        mood: dominantMoodEntry ? dominantMoodEntry[0] : 'Neutro',
      });
    }

    const averageLength =
      cycleLengths.length > 0
        ? Math.round(_.mean(cycleLengths))
        : 28;

    const variation =
      cycleLengths.length > 1
        ? Math.round(
            Math.sqrt(
              cycleLengths.map((x) => Math.pow(x - averageLength, 2)).reduce((a, b) => a + b) /
                cycleLengths.length
            )
          )
        : 0;

    return {
      recentCycles: recentCycles.reverse().slice(0, 6),
      cycleLengths,
      averageLength,
      variation,
    };
  }

  generateInsights(data: any, records: Record[]): string[] {
    const insights: string[] = [];

    if (data.cycleLengthVariation < 3) {
      insights.push('🎯 Seus ciclos são muito regulares! Isso facilita as previsões.');
    } else if (data.cycleLengthVariation > 7) {
      insights.push('📊 Seus ciclos variam bastante. Considere consultar um médico se isso te preocupa.');
    }

    if (data.mostCommonSymptoms.length > 0) {
      const topSymptom = data.mostCommonSymptoms[0];
      if (topSymptom.trend > 20) {
        insights.push(`📈 ${topSymptom.name} tem aumentado ultimamente. Vale a pena observar.`);
      } else if (topSymptom.trend < -20) {
        insights.push(`📉 ${topSymptom.name} tem diminuído. Que bom!`);
      }
    }

    const happyMood = data.moodDistribution.find((m: MoodDistribution) => m.mood === 'Feliz');
    if (happyMood && happyMood.percentage > 40) {
      insights.push('😊 Você tem se sentido feliz na maioria dos dias!');
    }

    if (data.totalRecords > 100) {
      insights.push('📝 Parabéns! Você tem um excelente histórico de registros.');
    }

    const recentActivity = records.filter((r) =>
      moment(r.date).isAfter(moment().subtract(7, 'days'))
    ).length;

    if (recentActivity < 3) {
      insights.push('💡 Que tal registrar mais sintomas esta semana? Isso melhora as análises!');
    }

    return insights.slice(0, 3);
  }

  generateTimeSeriesData(records: Record[]): TimeSeriesData[] {
    const last30Days = Array.from({ length: 30 }, (_, i) =>
      moment().subtract(29 - i, 'days').format('DD/MM')
    );

    return last30Days.map((date) => {
      const dayRecords = records.filter(
        (r) => moment(r.date).format('DD/MM') === date
      );

      const symptoms = dayRecords.filter((r) => r.type === 'symptom').length;
      const moodScore = this.calculateMoodScore(dayRecords);

      return { date, symptoms, mood: moodScore };
    });
  }

  private calculateMoodScore(records: Record[]): number {
    const moodWeights: { [key: string]: number } = {
      Feliz: 5,
      Energética: 4,
      Romântica: 4,
      Calma: 3,
      Triste: 2,
      Ansiosa: 2,
      Irritada: 1,
      Estressada: 1,
    };

    const moodRecords = records.filter(
      (r) => r.type === 'symptom' && moodWeights[r.data.name]
    );

    if (moodRecords.length === 0) return 3;

    const totalScore = moodRecords.reduce(
      (sum, record) => sum + (moodWeights[record.data.name] || 3),
      0
    );

    return Math.round(totalScore / moodRecords.length);
  }
}

export const useAnalyticsData = (filters: FilterOptions) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processor = useMemo(() => AnalyticsProcessor.getInstance(), []);
  
  const applyFilters = useCallback((records: Record[], filterOptions: FilterOptions) => {
    let filtered = [...records];
    const now = moment();

    switch (filterOptions.period) {
      case 'monthly':
        filtered = filtered.filter((r) => moment(r.date).isSame(now, 'month'));
        break;
      case 'quarterly':
        filtered = filtered.filter((r) => moment(r.date).isSame(now, 'quarter'));
        break;
      case 'yearly':
        filtered = filtered.filter((r) => moment(r.date).isSame(now, 'year'));
        break;
    }

    if (filterOptions.dateRange) {
      const { start, end } = filterOptions.dateRange;
      filtered = filtered.filter((r) =>
        moment(r.date).isBetween(start, end, 'day', '[]')
      );
    }

    if (filterOptions.includeTypes?.length) {
      filtered = filtered.filter((r) => filterOptions.includeTypes!.includes(r.type));
    }

    return filtered;
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const recordsData = await AsyncStorage.getItem('dailyRecords');
      const allRecords: Record[] = recordsData ? JSON.parse(recordsData) : [];
      const filteredRecords = applyFilters(allRecords, filters);
      const cacheKey = `analytics_${JSON.stringify(filters)}_${filteredRecords.length}`;

      const result = processor.getCachedResult(cacheKey, () => {
        const symptomData = processor.processSymptoms(filteredRecords);
        const moodData = processor.processMoodDistribution(filteredRecords);
        const cycleData = processor.processCycles(allRecords);
        const timeSeriesData = processor.generateTimeSeriesData(filteredRecords);
        const totalRecords = filteredRecords.length;
        const periodRecords = allRecords.filter((r: Record) => r.type === 'period');
        const periodFrequency = new Set(
          periodRecords.map((r: Record) => moment(r.date).format('YYYY-MM'))
        ).size;
        const recordsByType = _.countBy(filteredRecords, 'type');
        
        // Correção aqui: usar uma função no iteratee do maxBy para ajudar na inferência de tipo
        const lastPeriod = _.maxBy(periodRecords, (r) => r.date);

        const nextPeriodPrediction = lastPeriod
          ? moment(lastPeriod.date).add(cycleData.averageLength, 'days').format('DD/MM/YYYY')
          : null;

        const cycleComparison = cycleData.recentCycles.map((cycle, index) => ({
          cycle: index + 1,
          length: cycle.length,
          symptoms: cycle.symptoms,
        }));

        const analyticsResult: AnalyticsData = {
          totalRecords,
          recordsByType,
          mostCommonSymptoms: symptomData,
          averageCycleLength: cycleData.averageLength,
          cycleLengthVariation: cycleData.variation,
          periodFrequency,
          moodDistribution: moodData,
          recentCycles: cycleData.recentCycles,
          nextPeriodPrediction,
          insights: processor.generateInsights(
            {
              cycleLengthVariation: cycleData.variation,
              mostCommonSymptoms: symptomData,
              moodDistribution: moodData,
              totalRecords,
            },
            filteredRecords
          ),
          timeSeriesData,
          cycleComparison,
        };
        return analyticsResult;
      });

      setAnalytics(result);
    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
      setError('Não foi possível carregar as estatísticas');
    } finally {
      setLoading(false);
    }
  }, [filters, processor, applyFilters]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const refreshData = useCallback(() => {
    processor.clearCache();
    loadAnalytics();
  }, [loadAnalytics, processor]);

  return {
    analytics,
    loading,
    error,
    refreshData,
    hasData: analytics !== null && analytics.totalRecords > 0,
  };
};

export const useRealTimeStats = () => {
  const [todayStats, setTodayStats] = useState<{
    recordsToday: number;
    symptomsToday: number;
    lastUpdated: Date | null;
  }>({
    recordsToday: 0,
    symptomsToday: 0,
    lastUpdated: null,
  });

  const updateTodayStats = useCallback(async () => {
    try {
      const recordsData = await AsyncStorage.getItem('dailyRecords');
      const allRecords: Record[] = recordsData ? (JSON.parse(recordsData)) : [];
      const today = moment().format('YYYY-MM-DD');
      const todayRecords = allRecords.filter(
        (r) => moment(r.date).format('YYYY-MM-DD') === today
      );

      setTodayStats({
        recordsToday: todayRecords.length,
        symptomsToday: todayRecords.filter((r) => r.type === 'symptom').length,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do dia:', error);
    }
  }, []);

  useEffect(() => {
    updateTodayStats();
    const interval = setInterval(updateTodayStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateTodayStats]);

  return { ...todayStats, updateTodayStats };
};