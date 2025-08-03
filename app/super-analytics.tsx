// app/super-analytics.tsx - SUPER ANALYTICS MELHORADO E RESPONSIVO
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  RefreshControl,
  Share,
  Dimensions,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import { useThemeSystem } from '../hooks/useThemeSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

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

interface AdvancedStats {
  totalCycles: number;
  averageCycleLength: number;
  cycleLengthVariation: number;
  longestCycle: number;
  shortestCycle: number;
  mostCommonSymptoms: { name: string; frequency: number; trend: 'up' | 'down' | 'stable' }[];
  moodAnalysis: { mood: string; percentage: number; trend: string; color: string }[];
  healthScore: number;
  dataQuality: number;
  insights: string[];
  recommendations: string[];
  cycleRegularity: 'muito_regular' | 'regular' | 'irregular' | 'muito_irregular';
  riskFactors: string[];
  monthlyTrends: { month: string; avgCycle: number; symptoms: number }[];
  predictedNextPeriod: string;
  fertileWindow: { start: string; end: string };
  currentPhase: { name: string; day: number };
  correlations: { symptom: string; mood: string; count: number }[];
  futureCycles: { start: string; end: string }[];
}

type TabType = 'overview' | 'trends' | 'insights' | 'predictions';
type PeriodType = '3m' | '6m' | '1y' | 'all';

export default function SuperAnalyticsScreen() {
  const { theme, isLightMode } = useThemeSystem();
  
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('6m');
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadAdvancedAnalytics();
  }, [selectedPeriod]);

  // Atualização automática quando novos dados são adicionados
  useEffect(() => {
    const checkForDataUpdates = async () => {
      try {
        const lastUpdate = await AsyncStorage.getItem('dataLastUpdate');
        const currentCheck = await AsyncStorage.getItem('analyticsLastCheck') || '0';
        
        if (lastUpdate && lastUpdate !== currentCheck) {
          await AsyncStorage.setItem('analyticsLastCheck', lastUpdate);
          loadAdvancedAnalytics();
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações de dados:', error);
      }
    };

    const interval = setInterval(checkForDataUpdates, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && !error) {
      startAnimations();
    }
  }, [isLoading, error]);

  // Memoização para melhor performance
  const memoizedStats = useMemo(() => stats, [stats]);

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const loadAdvancedAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [cycleDataStr, recordsStr] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyRecords')
      ]);

      if (!cycleDataStr && !recordsStr) {
        setError('Não encontramos dados para análise. Por favor, registre seus ciclos e sintomas para que possamos gerar seus insights.');
        return;
      }

      const cycleData: CycleData | null = cycleDataStr ? JSON.parse(cycleDataStr) : null;
      const records: DailyRecord[] = recordsStr ? JSON.parse(recordsStr) : [];

      // Verificação adicional para garantir que records é um array válido
      if (!Array.isArray(records)) {
        setError('Houve um problema ao carregar seus registros. Por favor, tente recarregar a página.');
        return;
      }

      if (records.length < 1) {
        setError('Você precisa de pelo menos um registro para que a análise seja gerada. Continue registrando seus dados.');
        return;
      }

      if (!cycleData) {
        setError('Não encontramos seus dados de ciclo. Por favor, configure seu ciclo na tela inicial para que possamos gerar suas análises.');
        return;
      }

      const advancedStats = await calculateAdvancedAnalytics(cycleData, records);
      setStats(advancedStats);
    } catch (error) {
      console.error('Erro ao carregar análises avançadas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao processar dados: ${errorMessage}. Verifique seus registros e tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAdvancedAnalytics = useCallback(async (cycleData: CycleData, records: DailyRecord[]): Promise<AdvancedStats> => {
    // Filtrar registros por período
    const now = moment();
    let startDate = moment();
    
    switch (selectedPeriod) {
      case '3m': startDate = now.clone().subtract(3, 'months'); break;
      case '6m': startDate = now.clone().subtract(6, 'months'); break;
      case '1y': startDate = now.clone().subtract(1, 'year'); break;
      default: startDate = moment('2020-01-01');
    }

    const filteredRecords = records.filter(record => 
      moment(record.date).isAfter(startDate)
    );

    // Evitar processamento desnecessário para poucos dados
    if (filteredRecords.length < 5) {
      throw new Error('Dados insuficientes para o período selecionado.');
    }

    // Análise de ciclos melhorada
    const cycles = extractCycleData(cycleData, filteredRecords) || [];
    const cycleLengths = cycles.map(c => c.length).filter(l => l > 0);
    
    // Estatísticas básicas
    const averageCycleLength = cycleLengths.length > 0 ? 
      Math.round(cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length) : 
      (cycleData?.averageCycleLength || 28);
    
    const cycleLengthVariation = calculateStandardDeviation(cycleLengths);
    const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 0;
    const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 0;

    // Análise de sintomas com tendências melhorada
    const symptomsAnalysis = analyzeSymptomsTrends(filteredRecords);
    
    // Análise de humor avançada com cores
    const moodAnalysis = analyzeMoodPatterns(filteredRecords);
    
    // Score de saúde e qualidade dos dados
    const healthScore = calculateHealthScore(cycles, symptomsAnalysis, moodAnalysis);
    const dataQuality = calculateDataQuality(filteredRecords, cycles.length);
    
    // Regularidade do ciclo
    const cycleRegularity = determineCycleRegularity(cycleLengthVariation);
    
    // Insights e recomendações inteligentes
    const insights = generateInsights(cycles, symptomsAnalysis, moodAnalysis, cycleRegularity);
    const recommendations = generateRecommendations(healthScore, cycleRegularity, symptomsAnalysis);
    const riskFactors = identifyRiskFactors(cycles, symptomsAnalysis);

    // Tendências mensais
    const monthlyTrends = calculateMonthlyTrends(filteredRecords, cycles);

    // Predições
    const { predictedNextPeriod, fertileWindow } = calculatePredictions(cycleData, averageCycleLength);

    const currentPhase = calculateCurrentPhase(cycleData, averageCycleLength);

    const correlations = analyzeCorrelations(filteredRecords);

    const futureCycles = predictFutureCycles(cycleData, averageCycleLength);

    return {
      totalCycles: cycles.length,
      averageCycleLength,
      cycleLengthVariation: Math.round(cycleLengthVariation * 10) / 10,
      longestCycle,
      shortestCycle,
      mostCommonSymptoms: symptomsAnalysis,
      moodAnalysis,
      healthScore,
      dataQuality,
      insights,
      recommendations,
      cycleRegularity,
      riskFactors,
      monthlyTrends,
      predictedNextPeriod,
      fertileWindow,
      currentPhase,
      correlations,
      futureCycles,
    };
  }, [selectedPeriod]);

  const extractCycleData = (cycleData: CycleData, records: DailyRecord[]) => {
    const periodRecords = records
      .filter(r => r.flow && r.flow !== 'none')
      .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());
    
    const cycles = [];
    for (let i = 0; i < periodRecords.length - 1; i++) {
      const current = moment(periodRecords[i].date);
      const next = moment(periodRecords[i + 1].date);
      const length = next.diff(current, 'days');
      
      if (length >= 21 && length <= 40) {
        cycles.push({
          start: current.format('YYYY-MM-DD'),
          length,
          symptoms: records.filter(r => 
            moment(r.date).isBetween(current, next, 'day', '[]')
          ).flatMap(r => r.symptoms || [])
        });
      }
    }
    return cycles;
  };

  const calculateStandardDeviation = (values: number[]) => {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const analyzeSymptomsTrends = (records: DailyRecord[]) => {
    const symptomCount: { [key: string]: number[] } = {};
    const monthlyData: { [month: string]: { [symptom: string]: number } } = {};
    
    records.forEach(record => {
      const month = moment(record.date).format('YYYY-MM');
      if (!monthlyData[month]) monthlyData[month] = {};
      
      if (record.symptoms && Array.isArray(record.symptoms)) {
        record.symptoms.forEach(symptom => {
          if (!symptomCount[symptom]) symptomCount[symptom] = [];
          symptomCount[symptom].push(1);
          
          monthlyData[month][symptom] = (monthlyData[month][symptom] || 0) + 1;
        });
      }
    });

    const months = Object.keys(monthlyData).sort();
    const symptomsWithTrends = Object.entries(symptomCount).map(([symptom, occurrences]) => {
      const frequency = Math.round((occurrences.length / records.length) * 100);
      
      // Calcular tendência
      const recentMonths = months.slice(-3);
      const oldMonths = months.slice(0, 3);
      
      const recentAvg = recentMonths.reduce((sum, month) => 
        sum + (monthlyData[month][symptom] || 0), 0) / Math.max(recentMonths.length, 1);
      const oldAvg = oldMonths.reduce((sum, month) => 
        sum + (monthlyData[month][symptom] || 0), 0) / Math.max(oldMonths.length, 1);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > oldAvg * 1.2) trend = 'up';
      else if (recentAvg < oldAvg * 0.8) trend = 'down';
      
      return { name: symptom, frequency, trend };
    }).sort((a, b) => b.frequency - a.frequency).slice(0, 10);

    return symptomsWithTrends;
  };

  const analyzeMoodPatterns = (records: DailyRecord[]) => {
    const moodCount: { [mood: string]: number } = {};
    const moodColors: { [mood: string]: string } = {
      'happy': '#4CAF50',
      'sad': '#2196F3',
      'angry': '#F44336',
      'anxious': '#FF9800',
      'calm': '#9C27B0',
      'irritated': '#E91E63',
      'energetic': '#CDDC39',
      'tired': '#607D8B'
    };
    
    records.forEach(record => {
      if (record.mood) {
        moodCount[record.mood] = (moodCount[record.mood] || 0) + 1;
      }
    });

    return Object.entries(moodCount)
      .map(([mood, count]) => ({
        mood,
        percentage: Math.round((count / records.length) * 100),
        trend: 'stable',
        color: moodColors[mood] || '#757575'
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);
  };

  const calculateHealthScore = (cycles: any[], symptoms: any[], moods: any[]) => {
    let score = 85;
    
    // Penalizar irregularidade
    const lengths = cycles.map(c => c.length);
    const variation = calculateStandardDeviation(lengths);
    if (variation > 3) score -= 10;
    if (variation > 7) score -= 15;
    
    // Penalizar sintomas preocupantes
    const concerningSymptoms = ['Cólicas severas', 'Sangramento excessivo', 'Dor intensa'];
    if (symptoms && Array.isArray(symptoms)) {
      symptoms.forEach(symptom => {
        if (symptom && symptom.name && concerningSymptoms.some(cs => symptom.name.includes(cs)) && symptom.frequency > 50) {
          score -= 20;
        }
      });
    }
    
    // Bonus por dados consistentes
    if (cycles.length >= 3) score += 10;
    if (cycles.length >= 6) score += 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const calculateDataQuality = (records: DailyRecord[], cycleCount: number) => {
    let quality = 50;
    
    if (records.length > 30) quality += 20;
    if (records.length > 60) quality += 15;
    if (records.length > 90) quality += 10;
    
    const recordsWithSymptoms = records.filter(r => r.symptoms && r.symptoms.length > 0).length;
    const recordsWithMood = records.filter(r => r.mood).length;
    
    if (records.length > 0) {
      quality += Math.round((recordsWithSymptoms / records.length) * 25);
      quality += Math.round((recordsWithMood / records.length) * 15);
    }
    
    if (cycleCount >= 3) quality += 10;
    
    return Math.min(100, quality);
  };

  const determineCycleRegularity = (variation: number) => {
    if (variation <= 2) return 'muito_regular';
    if (variation <= 4) return 'regular';
    if (variation <= 7) return 'irregular';
    return 'muito_irregular';
  };

  const generateInsights = (cycles: any[], symptoms: any[], moods: any[], regularity: string) => {
    const insights = [];
    
    if (regularity === 'muito_regular') {
      insights.push('🎯 Seus ciclos são muito regulares! Isso indica boa saúde hormonal.');
    } else if (regularity === 'muito_irregular') {
      insights.push('⚠️ Ciclos irregulares detectados. Considere consultar um ginecologista.');
    }
    
    const dominantMood = moods[0]?.mood;
    if (dominantMood === 'happy') {
      insights.push('😊 Humor predominantemente positivo durante o período analisado.');
    } else if (dominantMood === 'irritated') {
      insights.push('😤 Irritabilidade frequente pode estar relacionada a mudanças hormonais.');
    }
    
    const topSymptom = symptoms[0];
    if (topSymptom && topSymptom.frequency > 60) {
      insights.push(`🔍 ${topSymptom.name} aparece em ${topSymptom.frequency}% dos registros.`);
    }
    
    if (cycles.length >= 6) {
      insights.push('📊 Dados suficientes para predições mais precisas!');
    }
    
    insights.push('💡 Continue registrando diariamente para insights ainda mais precisos.');
    insights.push('🌸 Cada ciclo é único e seus padrões estão se tornando mais claros.');
    
    return insights.slice(0, 6);
  };

  const generateRecommendations = (healthScore: number, regularity: string, symptoms: any[]) => {
    const recommendations = [];
    
    if (healthScore < 70) {
      recommendations.push('🏥 Considere uma consulta médica para avaliação.');
    }
    
    if (regularity === 'irregular' || regularity === 'muito_irregular') {
      recommendations.push('📱 Mantenha registros mais detalhados para identificar padrões.');
    }
    
    const hasStrongSymptoms = symptoms.some(s => 
      ['Cólicas severas', 'Dor intensa'].some(ss => s.name.includes(ss)) && s.frequency > 40
    );
    
    if (hasStrongSymptoms) {
      recommendations.push('💊 Técnicas de manejo da dor podem ajudar.');
    }
    
    recommendations.push('🧘 Pratique exercícios e alimentação equilibrada.');
    recommendations.push('💧 Mantenha-se bem hidratada durante todo o ciclo.');
    recommendations.push('😴 Priorize um sono de qualidade de 7-9 horas.');
    recommendations.push('🌱 Considere suplementos como magnésio e vitamina D.');
    
    return recommendations.slice(0, 6);
  };

  const identifyRiskFactors = (cycles: any[], symptoms: any[]) => {
    const risks = [];
    
    const lengths = cycles.map(c => c.length);
    if (lengths.some(l => l < 21)) {
      risks.push('Ciclos muito curtos detectados');
    }
    if (lengths.some(l => l > 35)) {
      risks.push('Ciclos muito longos detectados');
    }
    
    const severeSymptoms = symptoms.filter(s => 
      ['Sangramento excessivo', 'Dor extrema', 'Cólicas severas'].some(ss => s.name.includes(ss)) && s.frequency > 30
    );
    
    if (severeSymptoms.length > 0) {
      risks.push('Sintomas severos frequentes');
    }
    
    return risks;
  };

  const calculateMonthlyTrends = (records: DailyRecord[], cycles: any[]) => {
    const monthlyData: { [month: string]: { symptoms: number; cycles: any[] } } = {};
    
    records.forEach(record => {
      const month = moment(record.date).format('MMM/YY');
      if (!monthlyData[month]) {
        monthlyData[month] = { symptoms: 0, cycles: [] };
      }
      if (record.symptoms && Array.isArray(record.symptoms)) {
        monthlyData[month].symptoms += record.symptoms.length;
      }
    });

    cycles.forEach(cycle => {
      const month = moment(cycle.start).format('MMM/YY');
      if (monthlyData[month]) {
        monthlyData[month].cycles.push(cycle);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        avgCycle: data.cycles.length > 0 ? 
          Math.round(data.cycles.reduce((sum, c) => sum + c.length, 0) / data.cycles.length) : 0,
        symptoms: data.symptoms
      }))
      .sort((a, b) => moment(a.month, 'MMM/YY').valueOf() - moment(b.month, 'MMM/YY').valueOf())
      .slice(-6);
  };

  const calculatePredictions = (cycleData: CycleData | null, avgLength: number) => {
    if (!cycleData) {
      return {
        predictedNextPeriod: 'Dados insuficientes',
        fertileWindow: { start: 'N/A', end: 'N/A' }
      };
    }

    const lastPeriod = moment(cycleData.lastPeriodDate);
    const nextPeriod = lastPeriod.clone().add(avgLength, 'days');
    const ovulationDay = nextPeriod.clone().subtract(14, 'days');
    
    return {
      predictedNextPeriod: nextPeriod.format('DD/MM/YYYY'),
      fertileWindow: {
        start: ovulationDay.clone().subtract(2, 'days').format('DD/MM/YYYY'),
        end: ovulationDay.clone().add(2, 'days').format('DD/MM/YYYY')
      }
    };
  };

  const calculateCurrentPhase = (cycleData: CycleData | null, avgLength: number) => {
    if (!cycleData) {
      return { name: 'Desconhecida', day: 0 };
    }

    const today = moment();
    const lastPeriod = moment(cycleData.lastPeriodDate);
    const daysSinceLastPeriod = today.diff(lastPeriod, 'days');
    const cycleDay = (daysSinceLastPeriod % avgLength) + 1;

    if (cycleDay <= 5) return { name: 'Menstrual', day: cycleDay };
    if (cycleDay <= 13) return { name: 'Folicular', day: cycleDay };
    if (cycleDay <= 16) return { name: 'Ovulatória', day: cycleDay };
    return { name: 'Lútea', day: cycleDay };
  };

  const analyzeCorrelations = (records: DailyRecord[]) => {
    const correlations: { [key: string]: { [mood: string]: number } } = {};

    records.forEach(record => {
      if (record.symptoms && record.mood) {
        record.symptoms.forEach(symptom => {
          if (!correlations[symptom]) {
            correlations[symptom] = {};
          }
          correlations[symptom][record.mood] = (correlations[symptom][record.mood] || 0) + 1;
        });
      }
    });

    const correlationList = Object.entries(correlations)
      .flatMap(([symptom, moods]) =>
        Object.entries(moods).map(([mood, count]) => ({ symptom, mood, count }))
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return correlationList;
  };

  const predictFutureCycles = (cycleData: CycleData | null, avgLength: number) => {
    if (!cycleData) {
      return [];
    }

    const lastPeriod = moment(cycleData.lastPeriodDate);
    const futureCycles = [];

    for (let i = 1; i <= 3; i++) {
      const nextPeriod = lastPeriod.clone().add(avgLength * i, 'days');
      futureCycles.push({
        start: nextPeriod.format('DD/MM/YYYY'),
        end: nextPeriod.clone().add(5, 'days').format('DD/MM/YYYY'),
      });
    }

    return futureCycles;
  };

  const showModal = (type: string, data: any) => {
    setModalContent({ type, data });
    setModalVisible(true);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAdvancedAnalytics();
    setRefreshing(false);
  }, [selectedPeriod]);

  const shareAnalytics = async () => {
    if (!stats) return;
    
    const shareContent = `📊 Relatório Completo - Entre Fases

🔸 Score de Saúde: ${stats.healthScore}/100
🔸 Qualidade dos Dados: ${stats.dataQuality}/100
🔸 Ciclos Analisados: ${stats.totalCycles}
🔸 Duração Média: ${stats.averageCycleLength} dias
🔸 Regularidade: ${getRegularityText(stats.cycleRegularity)}

🔮 Próxima Menstruação: ${stats.predictedNextPeriod}
🌸 Janela Fértil: ${stats.fertileWindow.start} - ${stats.fertileWindow.end}

✨ Análises Avançadas com IA

Entre Fases - Seu companheiro inteligente`;

    try {
      await Share.share({ message: shareContent });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const getRegularityText = (regularity: string) => {
    const map: { [key: string]: string } = {
      'muito_regular': 'Muito Regular',
      'regular': 'Regular', 
      'irregular': 'Irregular',
      'muito_irregular': 'Muito Irregular'
    };
    return map[regularity] || 'Desconhecido';
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#8BC34A';
    if (score >= 55) return '#FF9800';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Animated.View style={{ 
            transform: [{ 
              rotate: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }]
          }}>
            <Ionicons name="analytics" size={48} color={theme.colors.primary} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Analisando seus dados...
          </Text>
          <Text style={[styles.loadingSubtext, { color: theme.colors.text.secondary }]}>
            Estamos preparando suas análises avançadas. Isso pode levar alguns segundos...
          </Text>
          
          {/* Indicador de progresso */}
          <View style={[styles.progressContainer, { borderColor: theme.colors.primary }]}>
            <Animated.View 
              style={[
                styles.loadingProgressBar, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color={theme.colors.primary} />
          <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>
            Oops! Algo deu errado
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.goBackButton, { borderColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.goBackText, { color: theme.colors.primary }]}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSelectPeriod = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Responsivo */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Super Analytics
          </Text>
          <View style={styles.subtitleContainer}>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Análise Inteligente • {stats?.totalCycles || 0} ciclos
            </Text>
            <View style={[styles.performanceIndicator, { backgroundColor: `${theme.colors.primary}15` }]}>
              <View style={[styles.performanceDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.performanceText, { color: '#10B981' }]}>
                Otimizado
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={shareAnalytics} 
          style={[styles.shareButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtros de Período Responsivos */}
      <View style={styles.periodFilterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodFilterContent}
        >
          {(['3m', '6m', '1y', 'all'] as PeriodType[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === period ? 
                    theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.primary
                }
              ]}
              onPress={() => handleSelectPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                {
                  color: selectedPeriod === period ? 
                    'white' : theme.colors.text.primary
                }
              ]}>
                {period === 'all' ? 'Tudo' : 
                 period === '3m' ? '3 Meses' :
                 period === '6m' ? '6 Meses' : '1 Ano'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tabs Melhoradas */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
        {(['overview', 'trends', 'insights', 'predictions'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && { borderBottomColor: theme.colors.primary }
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Ionicons 
              name={
                tab === 'overview' ? 'stats-chart' :
                tab === 'trends' ? 'trending-up' :
                tab === 'insights' ? 'bulb' : 'calendar'
              } 
              size={16} 
              color={selectedTab === tab ? theme.colors.primary : theme.colors.text.secondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[
              styles.tabText,
              {
                color: selectedTab === tab ? 
                  theme.colors.primary : theme.colors.text.secondary
              }
            ]}>
              {tab === 'overview' ? 'Visão Geral' : 
               tab === 'trends' ? 'Tendências' :
               tab === 'insights' ? 'Insights' : 'Predições'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {selectedTab === 'overview' && (
            <OverviewTab 
              stats={stats!} 
              theme={theme} 
              onShowModal={showModal}
              isTablet={isTablet}
            />
          )}
          {selectedTab === 'trends' && (
            <TrendsTab 
              stats={stats!} 
              theme={theme} 
              onShowModal={showModal}
              isTablet={isTablet}
            />
          )}
          {selectedTab === 'insights' && (
            <InsightsTab 
              stats={stats!} 
              theme={theme} 
              onShowModal={showModal}
              isTablet={isTablet}
            />
          )}
          {selectedTab === 'predictions' && (
            <PredictionsTab 
              stats={stats!} 
              theme={theme} 
              onShowModal={showModal}
              isTablet={isTablet}
            />
          )}
        </Animated.View>
      </ScrollView>

      {/* Modal Informativo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                {modalContent?.type === 'health' ? '💚 Score de Saúde' :
                 modalContent?.type === 'quality' ? '📊 Qualidade dos Dados' :
                 modalContent?.type === 'symptoms' ? '🔍 Análise de Sintomas' :
                 modalContent?.type === 'mood' ? '😊 Análise de Humor' :
                 modalContent?.type === 'regularity' ? '🎯 Regularidade do Ciclo' :
                 modalContent?.type === 'cycles_analyzed' ? '📅 Ciclos Analisados' :
                 modalContent?.type === 'average_length' ? '⏱️ Duração Média' :
                 modalContent?.type === 'variation' ? '📈 Variação do Ciclo' :
                 modalContent?.type === 'current_phase' ? '🌸 Fase Atual do Ciclo' :
                 modalContent?.type === 'predictions' ? '🔮 Predições' :
                 'Informações'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <ModalContent content={modalContent} theme={theme} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Componentes das Tabs
const OverviewTab: React.FC<{ stats: AdvancedStats; theme: any; onShowModal: (type: string, data: any) => void; isTablet: boolean }> = 
({ stats, theme, onShowModal, isTablet }) => (
  <View style={[styles.tabContent, isTablet && styles.tabContentTablet]}>
    {/* Score Cards */}
    <View style={[styles.scoreCards, isTablet && styles.scoreCardsTablet]}>
      <ScoreCard
        title="Score de Saúde"
        value={stats.healthScore}
        max={100}
        color={getHealthScoreColor(stats.healthScore)}
        icon="💚"
        onPress={() => onShowModal('health', { score: stats.healthScore })}
        theme={theme}
      />
      <ScoreCard
        title="Qualidade dos Dados"
        value={stats.dataQuality}
        max={100}
        color={theme.colors.primary}
        icon="📊"
        onPress={() => onShowModal('quality', { quality: stats.dataQuality })}
        theme={theme}
      />
    </View>

    {/* Stats Grid Responsivo */}
    <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
      <StatCard
        title="Fase Atual"
        value={`${stats.currentPhase.name} - Dia ${stats.currentPhase.day}`}
        icon="🌸"
        color={theme.colors.primary}
        theme={theme}
        onPress={() => onShowModal('current_phase', { phase: stats.currentPhase })}
      />
      <StatCard
        title="Ciclos Analisados"
        value={stats.totalCycles}
        icon="📅"
        color={theme.colors.secondary}
        theme={theme}
        onPress={() => onShowModal('cycles_analyzed', { total: stats.totalCycles })}
      />
      <StatCard
        title="Duração Média"
        value={`${stats.averageCycleLength}d`}
        icon="⏱️"
        color={theme.colors.accent}
        theme={theme}
        onPress={() => onShowModal('average_length', { avg: stats.averageCycleLength })}
      />
      <StatCard
        title="Variação"
        value={`±${stats.cycleLengthVariation}d`}
        icon="📈"
        color={theme.colors.primary}
        theme={theme}
        onPress={() => onShowModal('variation', { variation: stats.cycleLengthVariation })}
      />
      <StatCard
        title="Regularidade"
        value={getRegularityText(stats.cycleRegularity)}
        icon="🎯"
        color={getHealthScoreColor(stats.healthScore)}
        theme={theme}
        onPress={() => onShowModal('regularity', { regularity: stats.cycleRegularity, variation: stats.cycleLengthVariation })}
      />
    </View>

    {/* Cycle Chart Melhorado */}
    <CycleChart
      longestCycle={stats.longestCycle}
      shortestCycle={stats.shortestCycle}
      averageCycle={stats.averageCycleLength}
      theme={theme}
      onPress={() => onShowModal('cycles', { stats })}
    />

    {/* Monthly Trends */}
    <MonthlyTrendsChart
      trends={stats.monthlyTrends}
      theme={theme}
      onPress={() => onShowModal('trends', { trends: stats.monthlyTrends })}
    />
  </View>
);

const TrendsTab: React.FC<{ stats: AdvancedStats; theme: any; onShowModal: (type: string, data: any) => void; isTablet: boolean }> = 
({ stats, theme, onShowModal, isTablet }) => (
  <View style={[styles.tabContent, isTablet && styles.tabContentTablet]}>
    {/* Symptoms Analysis */}
    <SymptomsAnalysis 
      symptoms={stats.mostCommonSymptoms} 
      theme={theme}
      onPress={() => onShowModal('symptoms', { symptoms: stats.mostCommonSymptoms })}
    />

    {/* Mood Analysis */}
    <MoodAnalysis 
      moods={stats.moodAnalysis} 
      theme={theme}
      onPress={() => onShowModal('mood', { moods: stats.moodAnalysis })}
    />

    {/* Trends Over Time */}
    <TrendsOverTime
      monthlyTrends={stats.monthlyTrends}
      theme={theme}
      onPress={() => onShowModal('monthly-trends', { trends: stats.monthlyTrends })}
    />
  </View>
);

const InsightsTab: React.FC<{ stats: AdvancedStats; theme: any; onShowModal: (type: string, data: any) => void; isTablet: boolean }> = 
({ stats, theme, onShowModal, isTablet }) => (
  <View style={[styles.tabContent, isTablet && styles.tabContentTablet]}>
    {/* AI Insights */}
    <InsightsCard 
      insights={stats.insights}
      recommendations={stats.recommendations}
      riskFactors={stats.riskFactors}
      theme={theme}
      onPress={() => onShowModal('insights', { insights: stats.insights, recommendations: stats.recommendations })}
    />

    {/* Personalized Recommendations */}
    <RecommendationsCard
      recommendations={stats.recommendations}
      theme={theme}
      onPress={() => onShowModal('recommendations', { recommendations: stats.recommendations })}
    />

    {/* Risk Assessment */}
    {stats.riskFactors.length > 0 && (
      <RiskAssessmentCard
        riskFactors={stats.riskFactors}
        theme={theme}
        onPress={() => onShowModal('risks', { risks: stats.riskFactors })}
      />
    )}

    <CorrelationsCard correlations={stats.correlations} theme={theme} />
  </View>
);

const PredictionsTab: React.FC<{ stats: AdvancedStats; theme: any; onShowModal: (type: string, data: any) => void; isTablet: boolean }> = 
({ stats, theme, onShowModal, isTablet }) => (
  <View style={[styles.tabContent, isTablet && styles.tabContentTablet]}>
    {/* Next Period Prediction */}
    <PredictionCard
      title="🌸 Próxima Menstruação"
      prediction={stats.predictedNextPeriod}
      subtitle="Baseado no seu histórico"
      theme={theme}
      onPress={() => onShowModal('predictions', { period: stats.predictedNextPeriod })}
    />

    {/* Fertile Window */}
    <PredictionCard
      title="🔥 Janela Fértil"
      prediction={`${stats.fertileWindow.start} - ${stats.fertileWindow.end}`}
      subtitle="Período mais provável"
      theme={theme}
      onPress={() => onShowModal('fertile', { window: stats.fertileWindow })}
    />

    {/* Cycle Predictions */}
    <CyclePredictionsCard
      stats={stats}
      theme={theme}
      onPress={() => onShowModal('cycle-predictions', { stats })}
    />

    <FutureCyclesCard futureCycles={stats.futureCycles} theme={theme} />
  </View>
);

// Componentes auxiliares melhorados
const ScoreCard: React.FC<{
  title: string;
  value: number;
  max: number;
  color: string;
  icon: string;
  onPress?: () => void;
  theme: any;
}> = ({ title, value, max, color, icon, onPress, theme }) => {
  const progress = (value / max) * 100;
  
  return (
    <TouchableOpacity 
      style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[`${color}10`, `${color}05`]}
        style={styles.scoreCardGradient}
      >
        <View style={styles.scoreCardHeader}>
          <Text style={styles.scoreIcon}>{icon}</Text>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.text.tertiary} />
        </View>
        
        <Text style={[styles.scoreTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        
        <View style={styles.scoreProgress}>
          <View style={[styles.progressBar, { backgroundColor: `${color}20` }]}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { backgroundColor: color, width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={[styles.scoreValue, { color }]}>
            {value}/{max}
          </Text>
        </View>
        
        <Text style={[styles.scoreDescription, { color: theme.colors.text.secondary }]}>
          {value >= 85 ? 'Excelente' : value >= 70 ? 'Bom' : value >= 55 ? 'Regular' : 'Atenção'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
  theme: any;
  onPress?: () => void;
  small?: boolean;
}> = ({ title, value, icon, color, theme, onPress, small }) => {
  
  return (
    <TouchableOpacity 
      style={[
        styles.statCard, 
        { backgroundColor: theme.colors.surface }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={[styles.statTitle, { color: theme.colors.text.secondary }]}>
        {title}
      </Text>
      <Text style={[styles.statValue, { color }]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

const CycleChart: React.FC<{
  longestCycle: number;
  shortestCycle: number;
  averageCycle: number;
  theme: any;
  onPress?: () => void;
}> = ({ longestCycle, shortestCycle, averageCycle, theme, onPress }) => {
  const shortestAnim = useRef(new Animated.Value(0)).current;
  const averageAnim = useRef(new Animated.Value(0)).current;
  const longestAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(shortestAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(averageAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(longestAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  return (
    <TouchableOpacity 
      style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>
          📊 Análise de Ciclos
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
      
      <View style={styles.chartContent}>
        <View style={styles.chartBar}>
          <Text style={[styles.chartLabel, { color: theme.colors.text.secondary }]}>
            Mais Curto
          </Text>
          <View style={[styles.barContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Animated.View 
              style={[
                styles.bar, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${(shortestCycle / 40) * 100}%`,
                  transform: [{ scaleX: shortestAnim }]
                }
              ]} 
            />
          </View>
          <Text style={[styles.chartValue, { color: theme.colors.primary }]}>
            {shortestCycle}d
          </Text>
        </View>
        
        <View style={styles.chartBar}>
          <Text style={[styles.chartLabel, { color: theme.colors.text.secondary }]}>
            Média
          </Text>
          <View style={[styles.barContainer, { backgroundColor: `${theme.colors.secondary}20` }]}>
            <Animated.View 
              style={[
                styles.bar, 
                { 
                  backgroundColor: theme.colors.secondary,
                  width: `${(averageCycle / 40) * 100}%`,
                  transform: [{ scaleX: averageAnim }]
                }
              ]} 
            />
          </View>
          <Text style={[styles.chartValue, { color: theme.colors.secondary }]}>
            {averageCycle}d
          </Text>
        </View>
        
        <View style={styles.chartBar}>
          <Text style={[styles.chartLabel, { color: theme.colors.text.secondary }]}>
            Mais Longo
          </Text>
          <View style={[styles.barContainer, { backgroundColor: `${theme.colors.accent}20` }]}>
            <Animated.View 
              style={[
                styles.bar, 
                { 
                  backgroundColor: theme.colors.accent,
                  width: `${(longestCycle / 40) * 100}%`,
                  transform: [{ scaleX: longestAnim }]
                }
              ]} 
            />
          </View>
          <Text style={[styles.chartValue, { color: theme.colors.accent }]}>
            {longestCycle}d
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MonthlyTrendsChart: React.FC<{
  trends: { month: string; avgCycle: number; symptoms: number }[];
  theme: any;
  onPress?: () => void;
}> = ({ trends, theme, onPress }) => {
  
  return (
    <TouchableOpacity 
      style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>
          📈 Tendências Mensais
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.monthlyTrendsContainer}>
          {trends.map((trend, index) => (
            <View key={index} style={styles.monthlyTrendItem}>
              <Text style={[styles.monthLabel, { color: theme.colors.text.secondary }]}>
                {trend.month}
              </Text>
              <View style={styles.trendBars}>
                <View style={[styles.trendBar, { backgroundColor: `${theme.colors.primary}30`, height: Math.max(20, (trend.avgCycle / 35) * 60) }]} />
                <View style={[styles.trendBar, { backgroundColor: `${theme.colors.secondary}30`, height: Math.max(10, (trend.symptoms / 10) * 40) }]} />
              </View>
              <Text style={[styles.trendValue, { color: theme.colors.text.primary }]}>
                {trend.avgCycle}d
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
};

const SymptomsAnalysis: React.FC<{
  symptoms: { name: string; frequency: number; trend: 'up' | 'down' | 'stable' }[];
  theme: any;
  onPress?: () => void;
}> = ({ symptoms, theme, onPress }) => {
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };
  
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#F44336';
      case 'down': return '#4CAF50';
      default: return theme.colors.text.secondary;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.analysisHeader}>
        <Text style={[styles.analysisTitle, { color: theme.colors.text.primary }]}>
          🔍 Análise de Sintomas
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
      
      <View style={styles.symptomsList}>
        {symptoms.slice(0, 5).map((symptom, index) => (
          <View key={index} style={styles.symptomItem}>
            <View style={styles.symptomInfo}>
              <Text style={[styles.symptomName, { color: theme.colors.text.primary }]}>
                {symptom.name}
              </Text>
              <Text style={[styles.symptomFreq, { color: theme.colors.text.secondary }]}>
                {symptom.frequency}% dos registros
              </Text>
            </View>
            
            <View style={styles.symptomTrend}>
              <Ionicons 
                name={getTrendIcon(symptom.trend)} 
                size={16} 
                color={getTrendColor(symptom.trend)} 
              />
            </View>
            
            <View style={styles.symptomProgress}>
              <View style={[styles.progressBar, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.colors.primary,
                      width: `${symptom.frequency}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </View>
      
      <Text style={[styles.analysisFooter, { color: theme.colors.text.tertiary }]}>
        Toque para ver todos os sintomas
      </Text>
    </TouchableOpacity>
  );
};

const MoodAnalysis: React.FC<{
  moods: { mood: string; percentage: number; trend: string; color: string }[];
  theme: any;
  onPress?: () => void;
}> = ({ moods, theme, onPress }) => {
  
  const getMoodEmoji = (mood: string) => {
    const emojiMap: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'anxious': '😰',
      'calm': '😌',
      'irritated': '😤',
      'energetic': '⚡',
      'tired': '😴'
    };
    return emojiMap[mood] || '😐';
  };
  
  return (
    <TouchableOpacity 
      style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.analysisHeader}>
        <Text style={[styles.analysisTitle, { color: theme.colors.text.primary }]}>
          💭 Análise de Humor
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
      
      <View style={styles.moodGrid}>
        {moods.slice(0, 6).map((mood, index) => (
          <View key={index} style={[styles.moodItem, { backgroundColor: `${mood.color}10` }]}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(mood.mood)}</Text>
            <Text style={[styles.moodName, { color: theme.colors.text.primary }]}>
              {mood.mood}
            </Text>
            <Text style={[styles.moodPercentage, { color: mood.color }]}>
              {mood.percentage}%
            </Text>
          </View>
        ))}
      </View>
      
      <Text style={[styles.analysisFooter, { color: theme.colors.text.tertiary }]}>
        Toque para análise detalhada do humor
      </Text>
    </TouchableOpacity>
  );
};

const TrendsOverTime: React.FC<{
  monthlyTrends: { month: string; avgCycle: number; symptoms: number }[];
  theme: any;
  onPress?: () => void;
}> = ({ monthlyTrends, theme, onPress }) => {
  
  return (
    <TouchableOpacity 
      style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.analysisHeader}>
        <Text style={[styles.analysisTitle, { color: theme.colors.text.primary }]}>
          📊 Evolução ao Longo do Tempo
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
      
      <View style={styles.trendsContainer}>
        {monthlyTrends.map((trend, index) => (
          <View key={index} style={styles.trendItem}>
            <Text style={[styles.trendMonth, { color: theme.colors.text.secondary }]}>
              {trend.month}
            </Text>
            <View style={styles.trendDetails}>
              <View style={styles.trendStat}>
                <Text style={[styles.trendLabel, { color: theme.colors.text.tertiary }]}>Ciclo</Text>
                <Text style={[styles.trendValue, { color: theme.colors.primary }]}>{trend.avgCycle}d</Text>
              </View>
              <View style={styles.trendStat}>
                <Text style={[styles.trendLabel, { color: theme.colors.text.tertiary }]}>Sintomas</Text>
                <Text style={[styles.trendValue, { color: theme.colors.secondary }]}>{trend.symptoms}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const InsightsCard: React.FC<{
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
  theme: any;
  onPress?: () => void;
}> = ({ insights, recommendations, riskFactors, theme, onPress }) => (
  <TouchableOpacity 
    style={[styles.insightsCard, { backgroundColor: theme.colors.surface }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.insightsHeader}
    >
      <Text style={styles.insightsHeaderText}>🧠 Insights Inteligentes</Text>
      <Ionicons name="chevron-forward" size={20} color="white" />
    </LinearGradient>
    
    <View style={styles.insightsContent}>
      <View style={styles.insightSection}>
        <Text style={[styles.insightSectionTitle, { color: theme.colors.text.primary }]}>
          💡 Descobertas Principais
        </Text>
        {insights.slice(0, 3).map((insight, index) => (
          <View 
            key={index} 
            style={[
              styles.insightCard, 
              { 
                backgroundColor: theme.colors.card,
                borderLeftColor: index === 0 ? theme.colors.primary : 
                               index === 1 ? theme.colors.secondary : 
                               theme.colors.accent || theme.colors.primary
              }
            ]}
          >
            <View style={[styles.insightIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons 
                name={index === 0 ? "star" : index === 1 ? "trending-up" : "bulb"} 
                size={20} 
                color={theme.colors.primary} 
              />
            </View>
            <Text style={[styles.insightText, { color: theme.colors.text.secondary, flex: 1 }]}>
              {insight}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={[styles.insightStats, { backgroundColor: theme.colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {insights.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
            Insights
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>
            {Math.round(insights.length * 0.8)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>
            Ações
          </Text>
        </View>
      </View>
      
      <Text style={[styles.analysisFooter, { color: theme.colors.text.tertiary }]}>
        Toque para ver todos os insights
      </Text>
    </View>
  </TouchableOpacity>
);

const RecommendationsCard: React.FC<{
  recommendations: string[];
  theme: any;
  onPress?: () => void;
}> = ({ recommendations, theme, onPress }) => (
  <TouchableOpacity 
    style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.analysisHeader}>
      <Text style={[styles.analysisTitle, { color: theme.colors.text.primary }]}>
        ✨ Recomendações Personalizadas
      </Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
    </View>
    
    <View style={styles.recommendationsList}>
      {recommendations.slice(0, 3).map((rec, index) => (
        <View key={index} style={styles.recommendationItem}>
          <View style={[styles.recommendationIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
          </View>
          <Text style={[styles.recommendationText, { color: theme.colors.text.secondary }]}>
            {rec}
          </Text>
        </View>
      ))}
    </View>
  </TouchableOpacity>
);

const RiskAssessmentCard: React.FC<{
  riskFactors: string[];
  theme: any;
  onPress?: () => void;
}> = ({ riskFactors, theme, onPress }) => (
  <TouchableOpacity 
    style={[styles.analysisCard, { backgroundColor: theme.colors.surface, borderLeftWidth: 4, borderLeftColor: '#F44336' }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.analysisHeader}>
      <Text style={[styles.analysisTitle, { color: '#F44336' }]}>
        ⚠️ Pontos de Atenção
      </Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
    </View>
    
    <View style={styles.risksList}>
      {riskFactors.map((risk, index) => (
        <View key={index} style={styles.riskItem}>
          <Ionicons name="warning" size={16} color="#F44336" style={{ marginRight: 8 }} />
          <Text style={[styles.riskText, { color: theme.colors.text.secondary }]}>
            {risk}
          </Text>
        </View>
      ))}
    </View>
    
    <Text style={[styles.analysisFooter, { color: '#F44336' }]}>
      Considere consultar um profissional de saúde
    </Text>
  </TouchableOpacity>
);

const CorrelationsCard: React.FC<{
  correlations: { symptom: string; mood: string; count: number }[];
  theme: any;
}> = ({ correlations, theme }) => (
  <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
    <View style={styles.analysisHeader}>
      <Text style={[styles.analysisTitle, { color: theme.colors.text.primary }]}>
        🔗 Correlações Chave
      </Text>
    </View>
    <View style={styles.correlationsList}>
      {correlations.map((correlation, index) => (
        <View key={index} style={styles.correlationItem}>
          <Text style={[styles.correlationText, { color: theme.colors.text.secondary }]}>
            <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{correlation.symptom}</Text>
            {' '}
            parece estar associado a
            {' '}
            <Text style={{ fontWeight: 'bold', color: theme.colors.secondary }}>
              {correlation.mood}
            </Text>
            {' '}
            ({correlation.count} {correlation.count > 1 ? 'vezes' : 'vez'})
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const FutureCyclesCard: React.FC<{
  futureCycles: { start: string; end: string }[];
  theme: any;
}> = ({ futureCycles, theme }) => (
  <View style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}>
    <View style={styles.analysisHeader}>
      <Text style={[styles.analysisTitle, { color: theme.colors.text.primary }]}>
        🗓️ Próximos 3 Ciclos
      </Text>
    </View>
    <View style={styles.futureCyclesList}>
      {futureCycles.map((cycle, index) => (
        <View key={index} style={styles.futureCycleItem}>
          <Text style={[styles.futureCycleText, { color: theme.colors.text.secondary }]}>
            <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>{index + 1}º Ciclo:</Text> {cycle.start} - {cycle.end}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const PredictionCard: React.FC<{
  title: string;
  prediction: string;
  subtitle: string;
  theme: any;
  onPress?: () => void;
}> = ({ title, prediction, subtitle, theme, onPress }) => (
  <TouchableOpacity 
    style={[styles.predictionCard, { backgroundColor: theme.colors.surface }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={[`${theme.colors.primary}20`, `${theme.colors.primary}10`]}
      style={styles.predictionGradient}
    >
      <View style={styles.predictionHeader}>
        <Text style={[styles.predictionTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
      
      <Text style={[styles.predictionValue, { color: theme.colors.primary }]}>
        {prediction}
      </Text>
      
      <Text style={[styles.predictionSubtitle, { color: theme.colors.text.secondary }]}>
        {subtitle}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

const CyclePredictionsCard: React.FC<{
  stats: AdvancedStats;
  theme: any;
  onPress?: () => void;
}> = ({ stats, theme, onPress }) => (
  <TouchableOpacity 
    style={[styles.analysisCard, { backgroundColor: theme.colors.surface }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.analysisHeader}>
      <Text style={[styles.analysisTitle, { color: theme.colors.text.primary }]}>
        🔮 Predições do Ciclo
      </Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
    </View>
    
    <View style={styles.predictionsGrid}>
      <View style={styles.predictionStat}>
        <Text style={[styles.predictionStatLabel, { color: theme.colors.text.secondary }]}>
          Próximo Ciclo
        </Text>
        <Text style={[styles.predictionStatValue, { color: theme.colors.primary }]}>
          {stats.averageCycleLength} dias
        </Text>
      </View>
      
      <View style={styles.predictionStat}>
        <Text style={[styles.predictionStatLabel, { color: theme.colors.text.secondary }]}>
          Precisão
        </Text>
        <Text style={[styles.predictionStatValue, { color: theme.colors.secondary }]}>
          {stats.dataQuality}%
        </Text>
      </View>
      
      <View style={styles.predictionStat}>
        <Text style={[styles.predictionStatLabel, { color: theme.colors.text.secondary }]}>
          Confiança
        </Text>
        <Text style={[styles.predictionStatValue, { color: getHealthScoreColor(stats.healthScore) }]}>
          {stats.cycleRegularity === 'muito_regular' ? 'Alta' : 
           stats.cycleRegularity === 'regular' ? 'Boa' : 'Baixa'}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const ModalContent: React.FC<{ content: any; theme: any }> = ({ content, theme }) => {
  if (!content) return null;

  switch (content.type) {
    case 'health':
      return (
        <View>
          <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
            Seu score de saúde é {content.data.score}/100
          </Text>
          <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
            Este score é calculado com base na regularidade dos seus ciclos, sintomas reportados e qualidade dos dados.
          </Text>
          <View style={styles.modalTips}>
            <Text style={[styles.modalTipsTitle, { color: theme.colors.text.primary }]}>💡 Dicas para melhorar:</Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Registre seus dados diariamente
            </Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Mantenha uma rotina saudável
            </Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Consulte um médico se necessário
            </Text>
          </View>
        </View>
      );
    
    case 'quality':
      return (
        <View>
          <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
            Qualidade dos seus dados: {content.data.quality}/100
          </Text>
          <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
            A qualidade dos dados influencia diretamente na precisão das análises e predições.
          </Text>
          <View style={styles.modalTips}>
            <Text style={[styles.modalTipsTitle, { color: theme.colors.text.primary }]}>📊 Como melhorar:</Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Registre sintomas e humor diariamente
            </Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Seja consistente nos registros
            </Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Complete pelo menos 3 ciclos completos
            </Text>
          </View>
        </View>
      );
    
    case 'current_phase':
      return (
        <View>
          <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
            Você está na Fase {content.data.phase.name}, dia {content.data.phase.day}.
          </Text>
          <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
            A fase {content.data.phase.name} é caracterizada por... (WIP)
          </Text>
        </View>
      );
    case 'variation':
      return (
        <View>
          <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
            Variação do Ciclo: ±{content.data.variation} dias
          </Text>
          <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
            Seus ciclos variam em média {content.data.variation} dias. Pequenas variações são normais, mas grandes variações podem indicar irregularidades.
          </Text>
        </View>
      );
    case 'average_length':
      return (
        <View>
          <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
            Duração Média do Ciclo: {content.data.avg} dias
          </Text>
          <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
            A duração média do seu ciclo é de {content.data.avg} dias. Um ciclo saudável geralmente varia entre 21 e 35 dias.
          </Text>
        </View>
      );
    case 'cycles_analyzed':
      return (
        <View>
          <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
            Total de Ciclos Analisados: {content.data.total}
          </Text>
          <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
            Analisamos {content.data.total} ciclos completos para gerar seus insights. Quanto mais dados, mais precisas as análises.
          </Text>
        </View>
      );
    case 'regularity':
      return (
        <View>
          <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
            Regularidade: {getRegularityText(content.data.regularity)}
          </Text>
          <Text style={[styles.modalDescription, { color: theme.colors.text.secondary }]}>
            A variação do seu ciclo é de aproximadamente ±{content.data.variation} dias. Variações de até 7 dias são consideradas normais.
          </Text>
          <View style={styles.modalTips}>
            <Text style={[styles.modalTipsTitle, { color: theme.colors.text.primary }]}>💡 O que isso significa:</Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Ciclos regulares indicam um equilíbrio hormonal saudável.
            </Text>
            <Text style={[styles.modalTip, { color: theme.colors.text.secondary }]}>
              • Irregularidades podem ser causadas por estresse, dieta ou outras condições.
            </Text>
          </View>
        </View>
      );
    
    default:
      return (
        <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
          Informações detalhadas não disponíveis.
        </Text>
      );
  }
};

// Funções auxiliares
const getHealthScoreColor = (score: number) => {
  if (score >= 85) return '#4CAF50';
  if (score >= 70) return '#8BC34A';
  if (score >= 55) return '#FF9800';
  return '#F44336';
};

const getRegularityText = (regularity: string) => {
  const map: { [key: string]: string } = {
    'muito_regular': 'Muito Regular',
    'regular': 'Regular', 
    'irregular': 'Irregular',
    'muito_irregular': 'Muito Irregular'
  };
  return map[regularity] || 'Desconhecido';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  loadingProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  goBackButton: {
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  goBackText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  periodFilterContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  periodFilterContent: {
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    gap: 16,
  },
  tabContentTablet: {
    padding: 24,
    gap: 24,
  },
  scoreCards: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreCardsTablet: {
    gap: 16,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scoreCardGradient: {
    padding: 16,
    minHeight: 140,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreIcon: {
    fontSize: 24,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  scoreProgress: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsGridTablet: {
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2.5,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 20,
  },
  correlationsList: {
    marginTop: 12,
    gap: 8,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correlationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  futureCyclesList: {
    marginTop: 12,
    gap: 8,
  },
  futureCycleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  futureCycleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statValueSmall: {
    fontSize: 14,
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartContent: {
    gap: 12,
  },
  chartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartLabel: {
    width: 80,
    fontSize: 12,
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
    height: 16,
    borderRadius: 8,
  },
  bar: {
    height: '100%',
    borderRadius: 8,
    minWidth: 8,
  },
  chartValue: {
    width: 35,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
  },
  monthlyTrendsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    gap: 16,
  },
  monthlyTrendItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  monthLabel: {
    fontSize: 10,
    marginBottom: 8,
  },
  trendBars: {
    flexDirection: 'row',
    gap: 4,
    height: 60,
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  trendBar: {
    width: 8,
    borderRadius: 4,
  },
  trendValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  analysisCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisFooter: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  symptomsList: {
    gap: 12,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symptomInfo: {
    flex: 2,
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  symptomFreq: {
    fontSize: 12,
  },
  symptomTrend: {
    width: 30,
    alignItems: 'center',
  },
  symptomProgress: {
    flex: 1,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodItem: {
    width: (width - 76) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  moodName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  moodPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendsContainer: {
    gap: 12,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 8,
  },
  trendMonth: {
    width: 60,
    fontSize: 12,
    fontWeight: '600',
  },
  trendDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trendStat: {
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  trendValueSecondary: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  insightsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  insightsHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  insightsContent: {
    padding: 20,
  },
  insightSection: {
    marginBottom: 16,
  },
  insightSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  risksList: {
    gap: 8,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  riskText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  predictionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  predictionGradient: {
    padding: 20,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  predictionSubtitle: {
    fontSize: 12,
  },
  predictionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  predictionStat: {
    alignItems: 'center',
  },
  predictionStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  predictionStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: height * 0.6,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalTips: {
    marginTop: 8,
  },
  modalTipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalTip: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  modalSymptomItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  modalSymptomName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalSymptomFreq: {
    fontSize: 12,
  },
  // Novos estilos para insights melhorados
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightStats: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },
  // Estilos para o indicador de performance no header
  subtitleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  performanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  performanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  performanceText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});