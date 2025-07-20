// app/analytics.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions,
    ViewStyle,
    TextStyle,
    ImageStyle
} from 'react-native';
import { router } from 'expo-router';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { Card, ProgressBar, Button } from '../components/ui';
import { DESIGN_SYSTEM } from '../constants/desingSystem';

const { width } = Dimensions.get('window');

// --- TIPOS E INTERFACES ---

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

interface RecentCycle {
  start: string;
  length: number;
}

interface AnalyticsData {
  totalRecords: number;
  mostCommonSymptoms: Array<{ name: string; count: number; emoji: string }>;
  averageCycleLength: number;
  cycleLengthVariation: number;
  periodFrequency: number;
  moodDistribution: Array<{ mood: string; count: number; percentage: number }>;
  recentCycles: RecentCycle[];
  nextPeriodPrediction: string | null;
}

type FilterPeriod = 'all' | 'monthly' | 'yearly';
type SelectedTab = 'overview' | 'symptoms' | 'cycles';

// --- HOOK CUSTOMIZADO PARA LÓGICA DE DADOS ---

const useAnalyticsData = (filterPeriod: FilterPeriod) => {
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const calculateRecentCycles = (periodRecords: Record[]): { recentCycles: RecentCycle[], cycleLengths: number[] } => {
    if (periodRecords.length < 2) return { recentCycles: [], cycleLengths: [] };

    const sortedPeriods = [...periodRecords].sort((a, b) => moment(a.date).diff(moment(b.date)));
    const cycleStarts: moment.Moment[] = [];

    sortedPeriods.forEach((record, index) => {
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

    const recentCycles: RecentCycle[] = [];
    const cycleLengths: number[] = [];

    for (let i = 0; i < cycleStarts.length - 1; i++) {
      const length = cycleStarts[i + 1].diff(cycleStarts[i], 'days');
      cycleLengths.push(length);
      recentCycles.push({
        start: cycleStarts[i].format('DD/MM/YYYY'),
        length,
      });
    }

    return { recentCycles: recentCycles.reverse(), cycleLengths };
  };

  React.useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const recordsData = await AsyncStorage.getItem('dailyRecords');
        const allRecords: Record[] = recordsData ? JSON.parse(recordsData) : [];
        const now = moment();

        const filteredRecords = allRecords.filter(r => {
          if (filterPeriod === 'monthly') return moment(r.date).isSame(now, 'month');
          if (filterPeriod === 'yearly') return moment(r.date).isSame(now, 'year');
          return true;
        });

        const symptomRecords = filteredRecords.filter(r => r.type === 'symptom');
        const symptomCounts = symptomRecords.reduce((acc, { data }) => {
          acc[data.name] = {
            name: data.name,
            emoji: data.emoji,
            count: (acc[data.name]?.count || 0) + 1,
          };
          return acc;
        }, {} as { [key: string]: { name: string; emoji: string; count: number } });

        const mostCommonSymptoms = Object.values(symptomCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const moodSymptoms = ['Feliz', 'Triste', 'Ansiosa', 'Irritada', 'Energética', 'Romântica'];
        const moodRecords = symptomRecords.filter(s => moodSymptoms.includes(s.data.name));
        const totalMoodRecords = moodRecords.length;
        const moodCounts = moodRecords.reduce((acc, { data }) => {
          acc[data.name] = (acc[data.name] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
          mood,
          count,
          percentage: totalMoodRecords > 0 ? Math.round((count / totalMoodRecords) * 100) : 0,
        }));

        const periodRecords = allRecords.filter(r => r.type === 'period');
        const periodFrequency = new Set(periodRecords.map(r => moment(r.date).format('YYYY-MM'))).size;

        const { recentCycles, cycleLengths } = calculateRecentCycles(periodRecords);
        const averageCycleLength = cycleLengths.length > 0
            ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
            : 28;

        const cycleLengthVariation = cycleLengths.length > 1
            ? Math.round(Math.sqrt(cycleLengths.map(x => Math.pow(x - averageCycleLength, 2)).reduce((a, b) => a + b) / cycleLengths.length))
            : 0;

        const lastPeriodDate = periodRecords.length > 0
            ? moment.max(periodRecords.map(r => moment(r.date)))
            : null;

        const nextPeriodPrediction = lastPeriodDate
            ? lastPeriodDate.clone().add(averageCycleLength, 'days').format('DD/MM/YYYY')
            : null;

        setAnalytics({
          totalRecords: filteredRecords.length,
          mostCommonSymptoms,
          averageCycleLength,
          cycleLengthVariation,
          periodFrequency,
          moodDistribution,
          recentCycles,
          nextPeriodPrediction,
        });

      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [filterPeriod]);

  return { analytics, loading };
};

// --- INTERFACES DE PROPS PARA COMPONENTES DE UI ---

interface TabComponentProps {
    analytics: AnalyticsData;
    theme: any;
    styles: ReturnType<typeof getStyles>;
}

// --- COMPONENTES DE UI ---

const OverviewTab: React.FC<TabComponentProps> = ({ analytics, theme, styles }) => (
  <>
    <View style={styles.statsCards}>
      <Card style={styles.statsCard} variant="minimal">
        <Text style={styles.statsCardEmoji}>📝</Text>
        <Text style={[styles.statsCardValue, { color: theme.colors.primary }]}>{analytics.totalRecords}</Text>
        <Text style={[styles.statsCardLabel, { color: theme.colors.secondary }]}>Total de Registros</Text>
      </Card>
      <Card style={styles.statsCard} variant="minimal">
        <Text style={styles.statsCardEmoji}>📅</Text>
        <Text style={[styles.statsCardValue, { color: theme.colors.primary }]}>{analytics.averageCycleLength}</Text>
        <Text style={[styles.statsCardLabel, { color: theme.colors.secondary }]}>Média do Ciclo</Text>
      </Card>
      <Card style={styles.statsCard} variant="minimal">
        <Text style={styles.statsCardEmoji}>🌸</Text>
        <Text style={[styles.statsCardValue, { color: theme.colors.primary }]}>{analytics.periodFrequency}</Text>
        <Text style={[styles.statsCardLabel, { color: theme.colors.secondary }]}>Períodos Registrados</Text>
      </Card>
    </View>
    {analytics.moodDistribution.length > 0 && (
      <Card style={styles.section} variant="default">
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>📊 Distribuição de Humor</Text>
        {analytics.moodDistribution.map(({ mood, percentage }) => (
          <View key={mood} style={styles.moodItem}>
            <Text style={[styles.moodLabel, { color: theme.colors.primary }]}>{mood}</Text>
            <View style={styles.progressBarContainer}>
              <ProgressBar progress={percentage / 100} height={DESIGN_SYSTEM.spacing.xs} style={{ flex: 1, marginRight: DESIGN_SYSTEM.spacing.sm }}/>
              <Text style={[styles.progressText, { color: theme.colors.primary }]}>{percentage}%</Text>
            </View>
          </View>
        ))}
      </Card>
    )}
  </>
);

const SymptomsTab: React.FC<TabComponentProps> = ({ analytics, theme, styles }) => (
  <Card style={styles.section} variant="default">
    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>🔝 Sintomas Mais Comuns</Text>
    {analytics.mostCommonSymptoms.length > 0 ? (
      analytics.mostCommonSymptoms.map((symptom: { name: string; emoji: string; count: number }, index: number) => (
        <View key={symptom.name} style={styles.symptomItem}>
          <View style={styles.symptomInfo}>
            <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
            <Text style={[styles.symptomName, { color: theme.colors.primary }]}>{symptom.name}</Text>
          </View>
          <View style={styles.symptomStats}>
            <Text style={[styles.symptomCount, { color: theme.colors.secondary }]}>{symptom.count} vezes</Text>
            <View style={[styles.symptomRank, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.symptomRankText}>#{index + 1}</Text>
            </View>
          </View>
        </View>
      ))
    ) : (
      <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>Nenhum sintoma registrado neste período.</Text>
    )}
  </Card>
);

const CyclesTab: React.FC<TabComponentProps> = ({ analytics, theme, styles }) => (
    <>
        <Card style={styles.section} variant="default">
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>📈 Previsão e Informações</Text>
            <View style={styles.cycleInfo}>
                <View style={styles.cycleInfoItem}>
                    <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>Próximo Período</Text>
                    <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>{analytics.nextPeriodPrediction || 'N/A'}</Text>
                </View>
                <View style={styles.cycleInfoItem}>
                    <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>Duração Média</Text>
                    <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>{analytics.averageCycleLength} dias</Text>
                </View>
                <View style={styles.cycleInfoItem}>
                    <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>Variação</Text>
                    <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>±{analytics.cycleLengthVariation} dias</Text>
                </View>
            </View>
        </Card>
        <Card style={styles.section} variant="default">
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>🔄 Histórico de Ciclos</Text>
            {analytics.recentCycles.length > 0 ? (
                analytics.recentCycles.map((cycle: RecentCycle, index: number) => (
                    <View key={index} style={styles.cycleItem}>
                        <Text style={[styles.cycleDate, { color: theme.colors.primary }]}>{moment(cycle.start, 'DD/MM/YYYY').format('DD/MM')}</Text>
                        <View style={styles.cycleLengthContainer}>
                            <Text style={[styles.cycleLength, { color: theme.colors.secondary }]}>{cycle.length} dias</Text>
                            <ProgressBar progress={cycle.length / 45} height={DESIGN_SYSTEM.spacing.xs} style={{ flex: 1 }}/>
                        </View>
                    </View>
                ))
            ) : (
                <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>Dados insuficientes para exibir o histórico de ciclos.</Text>
            )}
        </Card>
    </>
);


// --- COMPONENTE PRINCIPAL ---

export default function AnalyticsScreen() {
  const { theme } = useAdaptiveTheme();
  const [selectedTab, setSelectedTab] = React.useState<SelectedTab>('overview');
  const [filterPeriod, setFilterPeriod] = React.useState<FilterPeriod>('all');
  const { analytics, loading } = useAnalyticsData(filterPeriod);

  if (!theme) return null;

  const styles = getStyles(theme);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{color: theme.colors.primary}}>Carregando estatísticas...</Text>
        </View>
      );
    }
    if (!analytics) {
      return (
         <View style={styles.loadingContainer}>
          <Text style={{color: theme.colors.secondary}}>Não foi possível carregar os dados.</Text>
        </View>
      );
    }

    switch(selectedTab) {
      case 'overview': return <OverviewTab analytics={analytics} theme={theme} styles={styles} />;
      case 'symptoms': return <SymptomsTab analytics={analytics} theme={theme} styles={styles} />;
      case 'cycles': return <CyclesTab analytics={analytics} theme={theme} styles={styles} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Estatísticas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Visão Geral', emoji: '📊' },
          { key: 'symptoms', label: 'Sintomas', emoji: '😔' },
          { key: 'cycles', label: 'Ciclos', emoji: '🔄' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { backgroundColor: selectedTab === tab.key ? theme.colors.primary : theme.colors.surface }]}
            onPress={() => setSelectedTab(tab.key as SelectedTab)}
          >
            <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            <Text style={[styles.tabText, { color: selectedTab === tab.key ? 'white' : theme.colors.primary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Tudo' },
          { key: 'monthly', label: 'Mês' },
          { key: 'yearly', label: 'Ano' },
        ].map((filter) => (
          <Button
            key={filter.key}
            title={filter.label}
            onPress={() => setFilterPeriod(filter.key as FilterPeriod)}
            variant={filterPeriod === filter.key ? 'primary' : 'secondary'}
            size="sm"
            style={styles.filterButton}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- FÁBRICA DE ESTILOS ---

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
    paddingVertical: DESIGN_SYSTEM.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  backButton: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_SYSTEM.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  } as ViewStyle,
  backButtonText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xl,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as 'bold',
  } as TextStyle,
  title: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xl,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as 'bold',
    color: theme.colors.primary,
  } as TextStyle,
  headerSpacer: {
    width: 40,
  } as ViewStyle,
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: DESIGN_SYSTEM.spacing.md,
    paddingVertical: DESIGN_SYSTEM.spacing.md,
    justifyContent: 'space-around',
  } as ViewStyle,
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
    borderRadius: DESIGN_SYSTEM.borderRadius.xl,
    marginHorizontal: DESIGN_SYSTEM.spacing.xs,
    ...DESIGN_SYSTEM.shadows.sm,
  } as ViewStyle,
  tabEmoji: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    marginRight: DESIGN_SYSTEM.spacing.xs,
  } as TextStyle,
  tabText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as '600',
  } as TextStyle,
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: DESIGN_SYSTEM.spacing.md,
    paddingHorizontal: DESIGN_SYSTEM.spacing.md,
  } as ViewStyle,
  filterButton: {
    flex: 1,
    marginHorizontal: DESIGN_SYSTEM.spacing.xs,
  } as ViewStyle,
  content: {
    paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
    paddingBottom: DESIGN_SYSTEM.spacing.xxl,
  } as ViewStyle,
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DESIGN_SYSTEM.spacing.lg,
  } as ViewStyle,
  statsCard: {
    flex: 1,
    marginHorizontal: DESIGN_SYSTEM.spacing.xs,
    padding: DESIGN_SYSTEM.spacing.md,
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    alignItems: 'center',
    ...DESIGN_SYSTEM.shadows.md,
  } as ViewStyle,
  statsCardEmoji: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xxl,
    marginBottom: DESIGN_SYSTEM.spacing.xs,
  } as TextStyle,
  statsCardValue: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xl,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as 'bold',
    marginBottom: DESIGN_SYSTEM.spacing.xs,
  } as TextStyle,
  statsCardLabel: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xs,
    textAlign: 'center',
    lineHeight: DESIGN_SYSTEM.typography.lineHeights.normal,
  } as TextStyle,
  section: {
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    padding: DESIGN_SYSTEM.spacing.lg,
    marginBottom: DESIGN_SYSTEM.spacing.lg,
    ...DESIGN_SYSTEM.shadows.md,
  } as ViewStyle,
  sectionTitle: {
    fontSize: DESIGN_SYSTEM.typography.sizes.lg,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as 'bold',
    marginBottom: DESIGN_SYSTEM.spacing.md,
  } as TextStyle,
  moodItem: {
    marginBottom: DESIGN_SYSTEM.spacing.md,
  } as ViewStyle,
  moodLabel: {
    fontSize: DESIGN_SYSTEM.typography.sizes.base,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as '600',
    marginBottom: DESIGN_SYSTEM.spacing.xs,
  } as TextStyle,
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  progressText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as '600',
    minWidth: 40,
    textAlign: 'right',
  } as TextStyle,
  symptomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  symptomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  symptomEmoji: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xl,
    marginRight: DESIGN_SYSTEM.spacing.sm,
  } as TextStyle,
  symptomName: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as '600',
  } as TextStyle,
  symptomStats: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  symptomCount: {
    fontSize: DESIGN_SYSTEM.typography.sizes.base,
    marginRight: DESIGN_SYSTEM.spacing.sm,
  } as TextStyle,
  symptomRank: {
    width: 24,
    height: 24,
    borderRadius: DESIGN_SYSTEM.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  symptomRankText: {
    color: 'white',
    fontSize: DESIGN_SYSTEM.typography.sizes.xs,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as 'bold',
  } as TextStyle,
  emptyText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: DESIGN_SYSTEM.spacing.md,
  } as TextStyle,
  cycleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  cycleDate: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as '600',
    width: 60,
  } as TextStyle,
  cycleLengthContainer: {
    flex: 1,
    marginLeft: DESIGN_SYSTEM.spacing.md,
  } as ViewStyle,
  cycleLength: {
    fontSize: DESIGN_SYSTEM.typography.sizes.base,
    marginBottom: DESIGN_SYSTEM.spacing.xs,
  } as TextStyle,
  cycleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
  } as ViewStyle,
  cycleInfoItem: {
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  cycleInfoLabel: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    color: theme.colors.secondary,
    marginBottom: DESIGN_SYSTEM.spacing.xs,
  } as TextStyle,
  cycleInfoValue: {
    fontSize: DESIGN_SYSTEM.typography.sizes.lg,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as 'bold',
  } as TextStyle,
});