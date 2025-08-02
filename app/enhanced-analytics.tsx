// app/enhanced-analytics.tsx - DASHBOARD ANALYTICS MELHORADA
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
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import { useThemeSystem } from '../hooks/useThemeSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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

interface PredictionData {
  nextPeriod: string;
  ovulation: string;
  fertileWindow: { start: string; end: string };
  accuracy: number;
}

interface AnalyticsStats {
  totalCycles: number;
  averageCycleLength: number;
  cycleLengthVariation: number;
  mostCommonSymptoms: { name: string; frequency: number }[];
  moodTrends: { mood: string; percentage: number }[];
  predictions: PredictionData;
  healthScore: number;
}

export default function EnhancedAnalyticsScreen() {
  const { theme, isLightMode } = useThemeSystem();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'insights' | 'predictions'>('overview');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (!isLoading) {
      startAnimations();
    }
  }, [isLoading]);

  const startAnimations = () => {
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
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      const [cycleDataStr, recordsStr] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyRecords')
      ]);

      const cycleData: CycleData | null = cycleDataStr ? JSON.parse(cycleDataStr) : null;
      const records: DailyRecord[] = recordsStr ? JSON.parse(recordsStr) : [];

      if (cycleData) {
        const analyticsStats = await calculateAdvancedStats(cycleData, records);
        setStats(analyticsStats);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de análise:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de análise');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAdvancedStats = async (cycleData: CycleData, records: DailyRecord[]): Promise<AnalyticsStats> => {
    // Filtrar registros baseado no período selecionado
    const now = moment();
    let startDate = moment();
    
    switch (selectedPeriod) {
      case '3m':
        startDate = now.clone().subtract(3, 'months');
        break;
      case '6m':
        startDate = now.clone().subtract(6, 'months');
        break;
      case '1y':
        startDate = now.clone().subtract(1, 'year');
        break;
      default:
        startDate = moment('2020-01-01'); // All time
    }

    const filteredRecords = records.filter(record => 
      moment(record.date).isAfter(startDate)
    );

    // Calcular ciclos completos
    const cycles = calculateCycles(cycleData, filteredRecords);
    
    // Estatísticas de sintomas
    const symptoms = extractSymptomsStats(filteredRecords);
    
    // Tendências de humor
    const moodTrends = calculateMoodTrends(filteredRecords);
    
    // Predições com ML básico
    const predictions = calculatePredictions(cycleData, cycles);
    
    // Score de saúde
    const healthScore = calculateHealthScore(cycles, symptoms, moodTrends);

    return {
      totalCycles: cycles.length,
      averageCycleLength: cycles.length > 0 ? 
        Math.round(cycles.reduce((sum, cycle) => sum + cycle.length, 0) / cycles.length) : 
        cycleData.averageCycleLength,
      cycleLengthVariation: calculateVariation(cycles.map(c => c.length)),
      mostCommonSymptoms: symptoms,
      moodTrends,
      predictions,
      healthScore
    };
  };

  const calculateCycles = (cycleData: CycleData, records: DailyRecord[]) => {
    // Simula cálculo de ciclos baseado nos registros
    const periodRecords = records.filter(r => r.flow && r.flow !== 'none');
    const cycles = [];
    
    for (let i = 0; i < periodRecords.length - 1; i++) {
      const current = moment(periodRecords[i].date);
      const next = moment(periodRecords[i + 1].date);
      const length = next.diff(current, 'days');
      
      if (length > 20 && length < 40) { // Ciclos válidos
        cycles.push({ 
          start: current.format('YYYY-MM-DD'),
          length,
          symptoms: records.filter(r => 
            moment(r.date).isBetween(current, next, 'day', '[]')
          ).flatMap(r => r.symptoms)
        });
      }
    }
    
    return cycles;
  };

  const extractSymptomsStats = (records: DailyRecord[]) => {
    const symptomCount: { [key: string]: number } = {};
    
    records.forEach(record => {
      record.symptoms.forEach(symptom => {
        symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptomCount)
      .map(([name, count]) => ({
        name,
        frequency: Math.round((count / records.length) * 100)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  };

  const calculateMoodTrends = (records: DailyRecord[]) => {
    const moodCount: { [key: string]: number } = {};
    
    records.forEach(record => {
      if (record.mood) {
        moodCount[record.mood] = (moodCount[record.mood] || 0) + 1;
      }
    });

    return Object.entries(moodCount)
      .map(([mood, count]) => ({
        mood,
        percentage: Math.round((count / records.length) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const calculatePredictions = (cycleData: CycleData, cycles: any[]): PredictionData => {
    const lastPeriod = moment(cycleData.lastPeriodDate);
    const avgLength = cycles.length > 0 ? 
      cycles.reduce((sum, c) => sum + c.length, 0) / cycles.length :
      cycleData.averageCycleLength;

    const nextPeriod = lastPeriod.clone().add(avgLength, 'days');
    const ovulation = nextPeriod.clone().subtract(14, 'days');
    
    // Calcular precisão baseada na variação dos ciclos
    const variation = calculateVariation(cycles.map(c => c.length));
    const accuracy = Math.max(60, 95 - (variation * 2));

    return {
      nextPeriod: nextPeriod.format('YYYY-MM-DD'),
      ovulation: ovulation.format('YYYY-MM-DD'),
      fertileWindow: {
        start: ovulation.clone().subtract(3, 'days').format('YYYY-MM-DD'),
        end: ovulation.clone().add(1, 'day').format('YYYY-MM-DD')
      },
      accuracy: Math.round(accuracy)
    };
  };

  const calculateVariation = (values: number[]) => {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const calculateHealthScore = (cycles: any[], symptoms: any[], moods: any[]) => {
    let score = 85; // Base score
    
    // Deduct points for irregularity
    const avgLength = cycles.reduce((sum, c) => sum + c.length, 0) / cycles.length;
    const variation = calculateVariation(cycles.map(c => c.length));
    if (variation > 3) score -= 10;
    if (variation > 7) score -= 10;
    
    // Deduct points for concerning symptoms
    const concerningSymptoms = ['Cólicas severas', 'Sangramento excessivo', 'Dor intensa'];
    symptoms.forEach(symptom => {
      if (concerningSymptoms.includes(symptom.name) && symptom.frequency > 50) {
        score -= 15;
      }
    });
    
    // Add points for regular tracking
    if (cycles.length >= 3) score += 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  }, [selectedPeriod]);

  const shareAnalytics = async () => {
    if (!stats) return;
    
    const shareContent = `📊 Meu Relatório de Ciclo Menstrual
    
🔸 Ciclos registrados: ${stats.totalCycles}
🔸 Duração média: ${stats.averageCycleLength} dias
🔸 Próxima menstruação: ${moment(stats.predictions.nextPeriod).format('DD/MM/YYYY')}
🔸 Score de saúde: ${stats.healthScore}/100

Gerado pelo app Entre Fases ✨`;

    try {
      await Share.share({ message: shareContent });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Cards de estatísticas principais */}
      <View style={styles.statsGrid}>
        <AnalyticsCard
          title="Ciclos Registrados"
          icon="📊"
          value={stats?.totalCycles || 0}
          color={theme.colors.primary}
        />
        <AnalyticsCard
          title="Duração Média"
          icon="⏱️"
          value={`${stats?.averageCycleLength || 0} dias`}
          color={theme.colors.secondary}
        />
        <AnalyticsCard
          title="Score de Saúde"
          icon="💚"
          value={`${stats?.healthScore || 0}/100`}
          color={getHealthScoreColor(stats?.healthScore || 0)}
        />
        <AnalyticsCard
          title="Precisão"
          icon="🎯"
          value={`${stats?.predictions.accuracy || 0}%`}
          color={theme.colors.accent}
        />
      </View>

      {/* Gráfico de variação */}
      <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>
          📈 Variação do Ciclo
        </Text>
        <View style={styles.variationChart}>
          <Text style={[styles.variationText, { color: theme.colors.text.secondary }]}>
            Variação: ±{Math.round(stats?.cycleLengthVariation || 0)} dias
          </Text>
          <View style={styles.variationBar}>
            <View 
              style={[
                styles.variationIndicator,
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${Math.min(100, (stats?.cycleLengthVariation || 0) * 10)}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.variationLabel, { color: theme.colors.text.tertiary }]}>
            {(stats?.cycleLengthVariation || 0) < 3 ? 'Regular' : 
             (stats?.cycleLengthVariation || 0) < 7 ? 'Moderadamente irregular' : 'Irregular'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPredictionsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.predictionCard, { backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.predictionGradient}
        >
          <Text style={styles.predictionTitle}>🔮 Predições Inteligentes</Text>
          <Text style={styles.predictionAccuracy}>
            Precisão: {stats?.predictions.accuracy}%
          </Text>
        </LinearGradient>
        
        <View style={styles.predictionContent}>
          <PredictionItem
            icon="🌸"
            title="Próxima Menstruação"
            date={stats?.predictions.nextPeriod}
            daysLeft={moment(stats?.predictions.nextPeriod).diff(moment(), 'days')}
          />
          
          <PredictionItem
            icon="⭐"
            title="Ovulação"
            date={stats?.predictions.ovulation}
            daysLeft={moment(stats?.predictions.ovulation).diff(moment(), 'days')}
          />
          
          <PredictionItem
            icon="🔥"
            title="Janela Fértil"
            date={`${moment(stats?.predictions.fertileWindow.start).format('DD/MM')} - ${moment(stats?.predictions.fertileWindow.end).format('DD/MM')}`}
            daysLeft={moment(stats?.predictions.fertileWindow.start).diff(moment(), 'days')}
          />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Analisando seus dados...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Analytics Avançada
        </Text>
        <TouchableOpacity onPress={shareAnalytics}>
          <Text style={styles.shareButton}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de período */}
      <View style={styles.periodFilter}>
        {['3m', '6m', '1y', 'all'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              {
                backgroundColor: selectedPeriod === period ? 
                  theme.colors.primary : theme.colors.surface
              }
            ]}
            onPress={() => setSelectedPeriod(period as any)}
          >
            <Text style={[
              styles.periodButtonText,
              {
                color: selectedPeriod === period ? 
                  'white' : theme.colors.text.secondary
              }
            ]}>
              {period === 'all' ? 'Tudo' : period.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['overview', 'predictions'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && { borderBottomColor: theme.colors.primary }
            ]}
            onPress={() => setSelectedTab(tab as any)}
          >
            <Text style={[
              styles.tabText,
              {
                color: selectedTab === tab ? 
                  theme.colors.primary : theme.colors.text.secondary
              }
            ]}>
              {tab === 'overview' ? 'Visão Geral' : 'Predições'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'predictions' && renderPredictionsTab()}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componentes auxiliares
const AnalyticsCard: React.FC<{
  title: string;
  icon: string;
  value: string | number;
  color: string;
}> = ({ title, icon, value, color }) => {
  const { theme } = useThemeSystem();
  
  return (
    <View style={[styles.analyticsCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.cardIcon, { backgroundColor: `${color}20` }]}>
        <Text style={styles.cardIconText}>{icon}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      <Text style={[styles.cardValue, { color }]}>
        {value}
      </Text>
    </View>
  );
};

const PredictionItem: React.FC<{
  icon: string;
  title: string;
  date?: string;
  daysLeft: number;
}> = ({ icon, title, date, daysLeft }) => {
  const { theme } = useThemeSystem();
  
  return (
    <View style={styles.predictionItem}>
      <Text style={styles.predictionIcon}>{icon}</Text>
      <View style={styles.predictionDetails}>
        <Text style={[styles.predictionItemTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.predictionDate, { color: theme.colors.text.secondary }]}>
          {date ? moment(date).format('DD/MM/YYYY') : 'Calculando...'}
        </Text>
        <Text style={[styles.predictionDays, { color: theme.colors.primary }]}>
          {daysLeft > 0 ? `Em ${daysLeft} dias` : 
           daysLeft === 0 ? 'Hoje!' : 
           `${Math.abs(daysLeft)} dias atrás`}
        </Text>
      </View>
    </View>
  );
};

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  return '#F44336';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  shareButton: {
    fontSize: 24,
  },
  periodFilter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analyticsCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  variationChart: {
    alignItems: 'center',
  },
  variationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  variationBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 10,
  },
  variationIndicator: {
    height: '100%',
    borderRadius: 4,
  },
  variationLabel: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  predictionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  predictionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  predictionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  predictionAccuracy: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  predictionContent: {
    padding: 20,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  predictionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  predictionDetails: {
    flex: 1,
  },
  predictionItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  predictionDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  predictionDays: {
    fontSize: 14,
    fontWeight: '600',
  },
});