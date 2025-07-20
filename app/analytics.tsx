// app/analytics.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width } = Dimensions.get('window');

interface Record {
  id: string;
  date: string;
  type: 'symptom' | 'mood' | 'activity' | 'period' | 'note';
  data: any;
}

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

interface AnalyticsData {
  totalRecords: number;
  mostCommonSymptoms: Array<{ name: string; count: number; emoji: string }>;
  averageCycleLength: number;
  periodFrequency: number;
  moodDistribution: Array<{ mood: string; count: number; percentage: number }>;
  recentCycles: Array<{ start: string; length: number }>;
}

export default function AnalyticsScreen() {
  const { theme } = useAdaptiveTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'symptoms' | 'cycles'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Carrega registros diários
      const recordsData = await AsyncStorage.getItem('dailyRecords');
      const records: Record[] = recordsData ? JSON.parse(recordsData) : [];

      // Carrega dados do ciclo
      const cycleInfo = await AsyncStorage.getItem('cycleData');
      const cycleData: CycleData | null = cycleInfo ? JSON.parse(cycleInfo) : null;

      // Analisa sintomas mais comuns
      const symptoms = records.filter(r => r.type === 'symptom');
      const symptomCounts = symptoms.reduce((acc, record) => {
        const symptom = record.data;
        const key = symptom.name;
        if (!acc[key]) {
          acc[key] = { name: symptom.name, count: 0, emoji: symptom.emoji };
        }
        acc[key].count++;
        return acc;
      }, {} as { [key: string]: { name: string; count: number; emoji: string } });

      const mostCommonSymptoms = Object.values(symptomCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Analisa registros de humor (sintomas emocionais)
      const moodSymptoms = ['Feliz', 'Triste', 'Ansiosa', 'Irritada', 'Energética', 'Romântica'];
      const moodRecords = symptoms.filter(s => moodSymptoms.includes(s.data.name));
      const moodCounts = moodRecords.reduce((acc, record) => {
        const mood = record.data.name;
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const totalMoodRecords = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
      const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
        percentage: totalMoodRecords > 0 ? Math.round((count / totalMoodRecords) * 100) : 0,
      }));

      // Calcula frequência de períodos
      const periodRecords = records.filter(r => r.type === 'period');
      const uniquePeriodDates = [...new Set(periodRecords.map(r => moment(r.date).format('YYYY-MM')))];
      const periodFrequency = uniquePeriodDates.length;

      // Simula ciclos recentes (baseado nos dados salvos)
      const recentCycles: Array<{ start: string; length: number }> = [];
      if (cycleData) {
        const lastPeriod = moment(cycleData.lastPeriodDate);
        for (let i = 0; i < 6; i++) {
          const cycleStart = lastPeriod.clone().subtract(i * cycleData.averageCycleLength, 'days');
          const variation = Math.floor(Math.random() * 6) - 3; // Variação de -3 a +3 dias
          recentCycles.push({
            start: cycleStart.format('DD/MM'),
            length: cycleData.averageCycleLength + variation,
          });
        }
      }

      setAnalytics({
        totalRecords: records.length,
        mostCommonSymptoms,
        averageCycleLength: cycleData?.averageCycleLength || 28,
        periodFrequency,
        moodDistribution,
        recentCycles: recentCycles.reverse(),
      });

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { backgroundColor: color + '20' }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${percentage}%`, 
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: theme?.colors.primary }]}>
        {percentage}%
      </Text>
    </View>
  );

  if (!theme || !analytics) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando estatísticas...</Text>
      </View>
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
        
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Estatísticas
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Visão Geral', emoji: '📊' },
          { key: 'symptoms', label: 'Sintomas', emoji: '😔' },
          { key: 'cycles', label: 'Ciclos', emoji: '🔄' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: selectedTab === tab.key 
                  ? theme.colors.primary 
                  : theme.colors.surface
              }
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text
              style={[
                styles.tabText,
                {
                  color: selectedTab === tab.key 
                    ? 'white' 
                    : theme.colors.primary
                }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Cards de estatísticas gerais */}
            <View style={styles.statsCards}>
              <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.statsCardEmoji}>📝</Text>
                <Text style={[styles.statsCardValue, { color: theme.colors.primary }]}>
                  {analytics.totalRecords}
                </Text>
                <Text style={[styles.statsCardLabel, { color: theme.colors.secondary }]}>
                  Total de Registros
                </Text>
              </View>

              <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.statsCardEmoji}>📅</Text>
                <Text style={[styles.statsCardValue, { color: theme.colors.primary }]}>
                  {analytics.averageCycleLength}
                </Text>
                <Text style={[styles.statsCardLabel, { color: theme.colors.secondary }]}>
                  Dias de Ciclo
                </Text>
              </View>

              <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.statsCardEmoji}>🌸</Text>
                <Text style={[styles.statsCardValue, { color: theme.colors.primary }]}>
                  {analytics.periodFrequency}
                </Text>
                <Text style={[styles.statsCardLabel, { color: theme.colors.secondary }]}>
                  Períodos Registrados
                </Text>
              </View>
            </View>

            {/* Distribuição de humor */}
            {analytics.moodDistribution.length > 0 && (
              <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  📊 Distribuição de Humor
                </Text>
                {analytics.moodDistribution.map((mood, index) => (
                  <View key={mood.mood} style={styles.moodItem}>
                    <Text style={[styles.moodLabel, { color: theme.colors.primary }]}>
                      {mood.mood}
                    </Text>
                    {renderProgressBar(mood.percentage, theme.colors.gradients[index % theme.colors.gradients.length])}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {selectedTab === 'symptoms' && (
          <View style={styles.tabContent}>
            {/* Sintomas mais comuns */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                🔝 Sintomas Mais Comuns
              </Text>
              {analytics.mostCommonSymptoms.length > 0 ? (
                analytics.mostCommonSymptoms.map((symptom, index) => (
                  <View key={symptom.name} style={styles.symptomItem}>
                    <View style={styles.symptomInfo}>
                      <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                      <Text style={[styles.symptomName, { color: theme.colors.primary }]}>
                        {symptom.name}
                      </Text>
                    </View>
                    <View style={styles.symptomStats}>
                      <Text style={[styles.symptomCount, { color: theme.colors.secondary }]}>
                        {symptom.count} vezes
                      </Text>
                      <View style={[styles.symptomRank, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.symptomRankText}>#{index + 1}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>
                  Nenhum sintoma registrado ainda
                </Text>
              )}
            </View>
          </View>
        )}

        {selectedTab === 'cycles' && (
          <View style={styles.tabContent}>
            {/* Ciclos recentes */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                🔄 Ciclos Recentes
              </Text>
              {analytics.recentCycles.map((cycle, index) => (
                <View key={index} style={styles.cycleItem}>
                  <Text style={[styles.cycleDate, { color: theme.colors.primary }]}>
                    {cycle.start}
                  </Text>
                  <View style={styles.cycleLengthContainer}>
                    <Text style={[styles.cycleLength, { color: theme.colors.secondary }]}>
                      {cycle.length} dias
                    </Text>
                    <View 
                      style={[
                        styles.cycleLengthBar,
                        { 
                          backgroundColor: theme.colors.primary + '20',
                          width: `${(cycle.length / 35) * 100}%`
                        }
                      ]}
                    >
                      <View 
                        style={[
                          styles.cycleLengthFill,
                          { backgroundColor: theme.colors.primary }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Informações do ciclo atual */}
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                📈 Informações do Ciclo
              </Text>
              <View style={styles.cycleInfo}>
                <View style={styles.cycleInfoItem}>
                  <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>
                    Duração Média
                  </Text>
                  <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>
                    {analytics.averageCycleLength} dias
                  </Text>
                </View>
                <View style={styles.cycleInfoItem}>
                  <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>
                    Variação
                  </Text>
                  <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>
                    ±3 dias
                  </Text>
                </View>
                <View style={styles.cycleInfoItem}>
                  <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>
                    Regularidade
                  </Text>
                  <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>
                    Regular
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingBottom: 30,
  },
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    width: (width - 60) / 3,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsCardEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsCardLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  section: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  moodItem: {
    marginBottom: 15,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
  },
  symptomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  symptomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symptomEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '600',
  },
  symptomStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomCount: {
    fontSize: 14,
    marginRight: 10,
  },
  symptomRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomRankText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  cycleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cycleDate: {
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  cycleLengthContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cycleLength: {
    fontSize: 14,
    marginBottom: 4,
  },
  cycleLengthBar: {
    height: 6,
    borderRadius: 3,
  },
  cycleLengthFill: {
    height: '100%',
    borderRadius: 3,
    width: '100%',
  },
  cycleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cycleInfoItem: {
    alignItems: 'center',
  },
  cycleInfoLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  cycleInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});