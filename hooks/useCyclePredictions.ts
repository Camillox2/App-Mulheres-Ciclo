// hooks/useCyclePredictions.ts - PREDIÇÕES DE CICLO COM ML BÁSICO
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

interface DailyRecord {
  date: string;
  symptoms: string[];
  mood: string;
  flow: string;
  notes: string;
}

interface HistoricalCycle {
  startDate: string;
  length: number;
  periodLength: number;
  symptoms: string[];
  moodTrend: string;
}

interface PredictionResult {
  nextPeriod: {
    date: string;
    confidence: number;
    range: { earliest: string; latest: string };
  };
  ovulation: {
    date: string;
    confidence: number;
    range: { earliest: string; latest: string };
  };
  fertileWindow: {
    start: string;
    end: string;
    confidence: number;
  };
  symptoms: {
    name: string;
    probability: number;
    expectedDays: number[];
  }[];
  moodForecast: {
    phase: string;
    mood: string;
    probability: number;
  }[];
}

interface MLModel {
  cycleLengthWeights: number[];
  symptomPatterns: { [key: string]: number[] };
  moodPatterns: { [key: string]: number[] };
  seasonalFactors: number[];
  accuracy: number;
  lastTrained: string;
}

export const useCyclePredictions = () => {
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [model, setModel] = useState<MLModel | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    loadModel();
    generatePredictions();
  }, []);

  const loadModel = async () => {
    try {
      const modelStr = await AsyncStorage.getItem('mlModel');
      if (modelStr) {
        const loadedModel = JSON.parse(modelStr);
        setModel(loadedModel);
        setAccuracy(loadedModel.accuracy || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar modelo:', error);
    }
  };

  const saveModel = async (newModel: MLModel) => {
    try {
      await AsyncStorage.setItem('mlModel', JSON.stringify(newModel));
      setModel(newModel);
      setAccuracy(newModel.accuracy);
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
    }
  };

  const extractHistoricalCycles = async (): Promise<HistoricalCycle[]> => {
    try {
      const [cycleDataStr, recordsStr] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyRecords')
      ]);

      const cycleData: CycleData | null = cycleDataStr ? JSON.parse(cycleDataStr) : null;
      const records: DailyRecord[] = recordsStr ? JSON.parse(recordsStr) : [];

      if (!cycleData || records.length === 0) {
        return [];
      }

      // Identificar início de cada ciclo (dias com fluxo menstrual)
      const menstrualDays = records
        .filter(r => r.flow && r.flow !== 'none' && r.flow !== '')
        .map(r => ({ date: r.date, record: r }))
        .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

      const cycles: HistoricalCycle[] = [];
      
      for (let i = 0; i < menstrualDays.length - 1; i++) {
        const currentStart = moment(menstrualDays[i].date);
        const nextStart = moment(menstrualDays[i + 1].date);
        const cycleLength = nextStart.diff(currentStart, 'days');

        // Filtrar ciclos válidos (21-40 dias)
        if (cycleLength >= 21 && cycleLength <= 40) {
          const cycleRecords = records.filter(r => {
            const recordDate = moment(r.date);
            return recordDate.isBetween(currentStart, nextStart, 'day', '[)');
          });

          // Calcular duração da menstruação
          const periodLength = cycleRecords
            .filter(r => r.flow && r.flow !== 'none')
            .length;

          // Extrair sintomas do ciclo
          const symptoms = cycleRecords
            .flatMap(r => r.symptoms)
            .filter(s => s && s.trim() !== '');

          // Analisar tendência de humor
          const moods = cycleRecords
            .map(r => r.mood)
            .filter(m => m && m.trim() !== '');
          
          const moodTrend = getMostFrequent(moods) || 'neutral';

          cycles.push({
            startDate: currentStart.format('YYYY-MM-DD'),
            length: cycleLength,
            periodLength,
            symptoms,
            moodTrend
          });
        }
      }

      return cycles;
    } catch (error) {
      console.error('Erro ao extrair ciclos históricos:', error);
      return [];
    }
  };

  const trainModel = useCallback(async (): Promise<MLModel> => {
    setIsTraining(true);
    
    try {
      const cycles = await extractHistoricalCycles();
      
      if (cycles.length < 3) {
        // Modelo básico para poucos dados
        return createBasicModel();
      }

      // Análise de padrões de duração do ciclo
      const cycleLengths = cycles.map(c => c.length);
      const cycleLengthWeights = calculateWeights(cycleLengths);

      // Análise de padrões de sintomas
      const symptomPatterns: { [key: string]: number[] } = {};
      cycles.forEach((cycle, cycleIndex) => {
        const uniqueSymptoms = [...new Set(cycle.symptoms)];
        uniqueSymptoms.forEach(symptom => {
          if (!symptomPatterns[symptom]) {
            symptomPatterns[symptom] = new Array(35).fill(0);
          }
          
          // Simular distribuição de sintomas ao longo do ciclo
          const peakDay = Math.floor(cycle.length * 0.8); // Sintomas mais comuns no final
          for (let day = 0; day < cycle.length; day++) {
            const distance = Math.abs(day - peakDay);
            const probability = Math.exp(-distance / 5); // Distribuição exponencial
            symptomPatterns[symptom][day] += probability;
          }
        });
      });

      // Normalizar padrões de sintomas
      Object.keys(symptomPatterns).forEach(symptom => {
        const sum = symptomPatterns[symptom].reduce((a, b) => a + b, 0);
        if (sum > 0) {
          symptomPatterns[symptom] = symptomPatterns[symptom].map(val => val / sum);
        }
      });

      // Análise de padrões de humor
      const moodPatterns: { [key: string]: number[] } = {};
      cycles.forEach(cycle => {
        if (!moodPatterns[cycle.moodTrend]) {
          moodPatterns[cycle.moodTrend] = new Array(35).fill(0);
        }
        
        // Distribuir humor ao longo do ciclo
        for (let day = 0; day < cycle.length; day++) {
          const cyclePosition = day / cycle.length;
          let moodIntensity = 1;
          
          // Padrões típicos de humor durante o ciclo
          if (cycle.moodTrend === 'irritated' || cycle.moodTrend === 'anxious') {
            moodIntensity = cyclePosition > 0.7 ? 2 : 0.5; // Mais intenso no final
          } else if (cycle.moodTrend === 'happy' || cycle.moodTrend === 'energetic') {
            moodIntensity = cyclePosition < 0.5 ? 1.5 : 1; // Mais intenso no início
          }
          
          moodPatterns[cycle.moodTrend][day] += moodIntensity;
        }
      });

      // Fatores sazonais (simplificado)
      const seasonalFactors = calculateSeasonalFactors(cycles);

      // Calcular precisão baseada na consistência dos dados
      const accuracy = calculateModelAccuracy(cycles);

      const newModel: MLModel = {
        cycleLengthWeights,
        symptomPatterns,
        moodPatterns,
        seasonalFactors,
        accuracy,
        lastTrained: moment().toISOString()
      };

      await saveModel(newModel);
      return newModel;
    } catch (error) {
      console.error('Erro no treinamento do modelo:', error);
      return createBasicModel();
    } finally {
      setIsTraining(false);
    }
  }, []);

  const createBasicModel = (): MLModel => {
    return {
      cycleLengthWeights: [0.1, 0.2, 0.4, 0.2, 0.1], // Distribuição normal simples
      symptomPatterns: {
        'Cólicas': new Array(35).fill(0).map((_, i) => 
          i < 5 || i > 25 ? 0.3 : 0.1), // Mais comum no início e fim
        'Dor de cabeça': new Array(35).fill(0.1),
        'Inchaço': new Array(35).fill(0).map((_, i) => 
          i > 20 ? 0.4 : 0.1), // Mais comum no final
      },
      moodPatterns: {
        'happy': new Array(35).fill(0).map((_, i) => 
          i < 14 ? 0.3 : 0.1), // Mais feliz na primeira metade
        'irritated': new Array(35).fill(0).map((_, i) => 
          i > 21 ? 0.4 : 0.1), // Mais irritada no final
      },
      seasonalFactors: [1, 1, 1, 1], // Sem variação sazonal
      accuracy: 65, // Precisão básica
      lastTrained: moment().toISOString()
    };
  };

  const calculateWeights = (values: number[]): number[] => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Criar distribuição de pesos baseada nos dados históricos
    const weights: number[] = [];
    for (let i = -2; i <= 2; i++) {
      const value = mean + (i * stdDev);
      const weight = Math.exp(-Math.pow(i, 2) / 2); // Distribuição normal
      weights.push(weight);
    }
    
    // Normalizar pesos
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    return weights.map(w => w / totalWeight);
  };

  const calculateSeasonalFactors = (cycles: HistoricalCycle[]): number[] => {
    const seasonalData = [0, 0, 0, 0]; // Primavera, Verão, Outono, Inverno
    const seasonalCounts = [0, 0, 0, 0];
    
    cycles.forEach(cycle => {
      const month = moment(cycle.startDate).month();
      const season = Math.floor(month / 3);
      seasonalData[season] += cycle.length;
      seasonalCounts[season]++;
    });
    
    // Calcular médias sazonais
    return seasonalData.map((total, index) => 
      seasonalCounts[index] > 0 ? total / seasonalCounts[index] / 28 : 1
    );
  };

  const calculateModelAccuracy = (cycles: HistoricalCycle[]): number => {
    if (cycles.length < 3) return 65;
    
    const lengths = cycles.map(c => c.length);
    const mean = lengths.reduce((sum, val) => sum + val, 0) / lengths.length;
    const variance = lengths.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Precisão baseada na consistência (menor variação = maior precisão)
    const consistency = Math.max(0, 1 - (stdDev / mean));
    const baseAccuracy = 70 + (consistency * 25);
    
    // Bonus por quantidade de dados
    const dataBonus = Math.min(10, cycles.length);
    
    return Math.min(95, Math.round(baseAccuracy + dataBonus));
  };

  const generatePredictions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let currentModel = model;
      if (!currentModel) {
        currentModel = await trainModel();
      }

      const [cycleDataStr] = await Promise.all([
        AsyncStorage.getItem('cycleData')
      ]);

      const cycleData: CycleData | null = cycleDataStr ? JSON.parse(cycleDataStr) : null;
      
      if (!cycleData) {
        setPredictions(null);
        return;
      }

      const lastPeriod = moment(cycleData.lastPeriodDate);
      const currentDay = moment().diff(lastPeriod, 'days') + 1;
      
      // Predição de próxima menstruação
      const predictedCycleLength = predictCycleLength(currentModel, lastPeriod);
      const nextPeriodDate = lastPeriod.clone().add(predictedCycleLength, 'days');
      
      const nextPeriodConfidence = Math.max(60, currentModel.accuracy - 5);
      const periodRange = {
        earliest: nextPeriodDate.clone().subtract(2, 'days').format('YYYY-MM-DD'),
        latest: nextPeriodDate.clone().add(2, 'days').format('YYYY-MM-DD')
      };

      // Predição de ovulação
      const ovulationDate = nextPeriodDate.clone().subtract(14, 'days');
      const ovulationConfidence = Math.max(55, currentModel.accuracy - 10);
      const ovulationRange = {
        earliest: ovulationDate.clone().subtract(1, 'day').format('YYYY-MM-DD'),
        latest: ovulationDate.clone().add(1, 'day').format('YYYY-MM-DD')
      };

      // Janela fértil
      const fertileStart = ovulationDate.clone().subtract(3, 'days');
      const fertileEnd = ovulationDate.clone().add(1, 'day');
      const fertileConfidence = Math.max(70, currentModel.accuracy - 5);

      // Predição de sintomas
      const symptomPredictions = predictSymptoms(currentModel, currentDay, predictedCycleLength);

      // Predição de humor
      const moodForecast = predictMood(currentModel, currentDay, predictedCycleLength);

      const newPredictions: PredictionResult = {
        nextPeriod: {
          date: nextPeriodDate.format('YYYY-MM-DD'),
          confidence: nextPeriodConfidence,
          range: periodRange
        },
        ovulation: {
          date: ovulationDate.format('YYYY-MM-DD'),
          confidence: ovulationConfidence,
          range: ovulationRange
        },
        fertileWindow: {
          start: fertileStart.format('YYYY-MM-DD'),
          end: fertileEnd.format('YYYY-MM-DD'),
          confidence: fertileConfidence
        },
        symptoms: symptomPredictions,
        moodForecast
      };

      setPredictions(newPredictions);
    } catch (error) {
      console.error('Erro ao gerar predições:', error);
    } finally {
      setIsLoading(false);
    }
  }, [model, trainModel]);

  const predictCycleLength = (model: MLModel, lastPeriod: moment.Moment): number => {
    // Aplicar fatores sazonais
    const currentSeason = Math.floor(moment().month() / 3);
    const seasonalFactor = model.seasonalFactors[currentSeason];
    
    // Calcular média ponderada baseada nos pesos do modelo
    const baseLength = 28; // Duração base
    const weightedLength = model.cycleLengthWeights.reduce((sum, weight, index) => {
      return sum + (weight * (baseLength + index - 2));
    }, 0);
    
    return Math.round(weightedLength * seasonalFactor);
  };

  const predictSymptoms = (model: MLModel, currentDay: number, cycleLength: number) => {
    const predictions: PredictionResult['symptoms'] = [];
    
    Object.entries(model.symptomPatterns).forEach(([symptom, pattern]) => {
      const probabilities = pattern.slice(0, cycleLength);
      const maxProbability = Math.max(...probabilities);
      
      if (maxProbability > 0.1) {
        const expectedDays = probabilities
          .map((prob, day) => ({ prob, day }))
          .filter(item => item.prob > maxProbability * 0.5)
          .map(item => item.day + 1);

        predictions.push({
          name: symptom,
          probability: Math.round(maxProbability * 100),
          expectedDays
        });
      }
    });

    return predictions.sort((a, b) => b.probability - a.probability);
  };

  const predictMood = (model: MLModel, currentDay: number, cycleLength: number) => {
    const predictions: PredictionResult['moodForecast'] = [];
    
    // Dividir ciclo em fases
    const phases = [
      { name: 'menstrual', start: 1, end: 5 },
      { name: 'follicular', start: 6, end: Math.floor(cycleLength / 2) },
      { name: 'ovulatory', start: Math.floor(cycleLength / 2) + 1, end: Math.floor(cycleLength * 0.7) },
      { name: 'luteal', start: Math.floor(cycleLength * 0.7) + 1, end: cycleLength }
    ];

    phases.forEach(phase => {
      let dominantMood = 'neutral';
      let maxProbability = 0;

      Object.entries(model.moodPatterns).forEach(([mood, pattern]) => {
        const phaseSum = pattern
          .slice(phase.start - 1, phase.end)
          .reduce((sum, prob) => sum + prob, 0);
        
        if (phaseSum > maxProbability) {
          maxProbability = phaseSum;
          dominantMood = mood;
        }
      });

      predictions.push({
        phase: phase.name,
        mood: dominantMood,
        probability: Math.round((maxProbability / (phase.end - phase.start + 1)) * 100)
      });
    });

    return predictions;
  };

  const getMostFrequent = (array: string[]): string | null => {
    if (array.length === 0) return null;
    
    const frequency: { [key: string]: number } = {};
    array.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)[0][0];
  };

  const retrain = useCallback(async () => {
    await trainModel();
    await generatePredictions();
  }, [trainModel, generatePredictions]);

  return {
    predictions,
    accuracy,
    isLoading,
    isTraining,
    generatePredictions,
    trainModel,
    retrain
  };
};