// app/analytics-enhanced.tsx - VERSÃO MELHORADA COMPLETA
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  RefreshControl,
  Alert,
  Share,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { useAnalyticsData, useRealTimeStats, FilterOptions } from '../hooks/useAnalyticsData';
import {
  AnalyticsCard,
  StatCard,
  InsightCard,
  MoodChart,
  TrendChart,
  CycleComparison,
  QuickStatsOverview,
} from '../components/analytics/VisualizationComponents';
import { DESIGN_SYSTEM } from '../constants/desingSystem';

const { width, height } = Dimensions.get('window');

type FilterPeriod = 'all' | 'monthly' | 'quarterly' | 'yearly';
type SelectedTab = 'overview' | 'trends' | 'patterns' | 'insights';
type ViewMode = 'cards' | 'charts' | 'detailed';

interface AnimatedHeaderProps {
  scrollY: Animated.Value;
  theme: any;
  refreshing: boolean;
  onRefresh: () => void;
}

interface FilterSectionProps {
  filterPeriod: FilterPeriod;
  onFilterChange: (filter: FilterPeriod) => void;
  theme: any;
}

interface TabSectionProps {
  selectedTab: SelectedTab;
  onTabChange: (tab: SelectedTab) => void;
  theme: any;
}

// ==================== COMPONENTES AUXILIARES ====================

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ scrollY, theme, refreshing, onRefresh }) => {
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}>
      <LinearGradient
        colors={theme.colors.gradients.primary as [string, string]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <Animated.View style={[styles.headerTitleContainer, { opacity: titleOpacity }]}>
              <Text style={styles.headerTitle}>Analytics Avançado</Text>
              <Text style={styles.headerSubtitle}>Insights do seu ciclo</Text>
            </Animated.View>

            <TouchableOpacity style={styles.shareButton} onPress={onRefresh}>
              <Text style={styles.shareIcon}>{refreshing ? '🔄' : '📊'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
};

const FilterSection: React.FC<FilterSectionProps> = ({ filterPeriod, onFilterChange, theme }) => {
  const filterOptions = [
    { key: 'all', label: 'Tudo', icon: '🌍' },
    { key: 'monthly', label: 'Mês', icon: '📅' },
    { key: 'quarterly', label: 'Trimestre', icon: '🗓️' },
    { key: 'yearly', label: 'Ano', icon: '📆' },
  ] as const;

  return (
    <View style={styles.filterSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor: filterPeriod === filter.key ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text
              style={[
                styles.filterText,
                {
                  color: filterPeriod === filter.key ? 'white' : theme.colors.text.primary,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const TabSection: React.FC<TabSectionProps> = ({ selectedTab, onTabChange, theme }) => {
  const tabs = [
    { key: 'overview', label: 'Visão Geral', icon: '📊' },
    { key: 'trends', label: 'Tendências', icon: '📈' },
    { key: 'patterns', label: 'Padrões', icon: '🔍' },
    { key: 'insights', label: 'Insights', icon: '💡' },
  ] as const;

  return (
    <View style={[styles.tabSection, { backgroundColor: theme.colors.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: selectedTab === tab.key ? `${theme.colors.primary}20` : 'transparent',
                borderBottomColor: selectedTab === tab.key ? theme.colors.primary : 'transparent',
              },
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabText,
                {
                  color: selectedTab === tab.key ? theme.colors.primary : theme.colors.text.secondary,
                  fontWeight: selectedTab === tab.key ? '600' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ==================== COMPONENTES DE CONTEÚDO ====================

const OverviewContent: React.FC<{ analytics: any; theme: any }> = ({ analytics, theme }) => (
  <>
    <QuickStatsOverview analytics={analytics} />
    
    <AnalyticsCard title="📊 Distribuição de Humor" animationDelay={100}>
      <MoodChart data={analytics.moodDistribution} interactive />
    </AnalyticsCard>

    <View style={styles.twoColumnGrid}>
      <AnalyticsCard title="🔝 Top Sintomas" style={styles.halfCard} animationDelay={200}>
        {analytics.mostCommonSymptoms.slice(0, 3).map((symptom: any, index: number) => (
          <View key={symptom.name} style={styles.symptomRow}>
            <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
            <View style={styles.symptomInfo}>
              <Text style={[styles.symptomName, { color: theme.colors.text.primary }]}>
                {symptom.name}
              </Text>
              <Text style={[styles.symptomCount, { color: theme.colors.text.secondary }]}>
                {symptom.count} vezes
              </Text>
            </View>
            {symptom.trend !== 0 && (
              <Text style={[styles.symptomTrend, { 
                color: symptom.trend > 0 ? '#E74C3C' : '#2ECC71' 
              }]}>
                {symptom.trend > 0 ? '↗' : '↘'} {Math.abs(symptom.trend)}%
              </Text>
            )}
          </View>
        ))}
      </AnalyticsCard>

      <AnalyticsCard title="📅 Próximos Eventos" style={styles.halfCard} animationDelay={300}>
        <View style={styles.predictionContainer}>
          <View style={styles.predictionItem}>
            <Text style={styles.predictionIcon}>🌸</Text>
            <View>
              <Text style={[styles.predictionLabel, { color: theme.colors.text.secondary }]}>
                Próxima Menstruação
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.primary }]}>
                {analytics.nextPeriodPrediction || 'Calculando...'}
              </Text>
            </View>
          </View>
          
          <View style={styles.predictionItem}>
            <Text style={styles.predictionIcon}>⭐</Text>
            <View>
              <Text style={[styles.predictionLabel, { color: theme.colors.text.secondary }]}>
                Regularidade
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.primary }]}>
                {analytics.cycleLengthVariation < 3 ? 'Alta' : 
                 analytics.cycleLengthVariation < 7 ? 'Média' : 'Baixa'}
              </Text>
            </View>
          </View>
        </View>
      </AnalyticsCard>
    </View>
  </>
);

const TrendsContent: React.FC<{ analytics: any; theme: any }> = ({ analytics, theme }) => (
  <>
    <AnalyticsCard title="📈 Tendência de Sintomas (30 dias)" animationDelay={100}>
      <TrendChart data={analytics.timeSeriesData} type="symptoms" />
    </AnalyticsCard>

    <AnalyticsCard title="😊 Tendência de Humor (30 dias)" animationDelay={200}>
      <TrendChart data={analytics.timeSeriesData} type="mood" />
    </AnalyticsCard>

    <AnalyticsCard title="🔄 Comparação de Ciclos" animationDelay={300}>
      <CycleComparison data={analytics.cycleComparison} />
    </AnalyticsCard>
  </>
);

const PatternsContent: React.FC<{ analytics: any; theme: any }> = ({ analytics, theme }) => (
  <>
    <AnalyticsCard title="🕐 Padrões Temporais" animationDelay={100}>
      <View style={styles.patternsGrid}>
        <View style={styles.patternCard}>
          <Text style={styles.patternIcon}>📊</Text>
          <Text style={[styles.patternLabel, { color: theme.colors.text.secondary }]}>
            Registros por tipo
          </Text>
          {Object.entries(analytics.recordsByType).map(([type, count]: [string, any]) => (
            <View key={type} style={styles.patternRow}>
              <Text style={[styles.patternType, { color: theme.colors.text.primary }]}>
                {type === 'symptom' ? 'Sintomas' :
                 type === 'period' ? 'Menstruação' :
                 type === 'mood' ? 'Humor' :
                 type === 'activity' ? 'Atividade' : 'Notas'}
              </Text>
              <Text style={[styles.patternCount, { color: theme.colors.primary }]}>
                {count}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </AnalyticsCard>

    <AnalyticsCard title="🎯 Correlações Detectadas" animationDelay={200}>
      <View style={styles.correlationsList}>
        <View style={styles.correlationItem}>
          <Text style={styles.correlationIcon}>🔗</Text>
          <Text style={[styles.correlationText, { color: theme.colors.text.primary }]}>
            Cólicas são mais frequentes no início do ciclo
          </Text>
        </View>
        <View style={styles.correlationItem}>
          <Text style={styles.correlationIcon}>🔗</Text>
          <Text style={[styles.correlationText, { color: theme.colors.text.primary }]}>
            Humor melhora gradualmente após a menstruação
          </Text>
        </View>
        <View style={styles.correlationItem}>
          <Text style={styles.correlationIcon}>🔗</Text>
          <Text style={[styles.correlationText, { color: theme.colors.text.primary }]}>
            Energia aumenta próximo à ovulação
          </Text>
        </View>
      </View>
    </AnalyticsCard>
  </>
);

const InsightsContent: React.FC<{ analytics: any; onRefresh: () => void; theme: any }> = ({ 
  analytics, 
  onRefresh, 
  theme 
}) => (
  <>
    <InsightCard insights={analytics.insights} onRefresh={onRefresh} />
    
    <AnalyticsCard title="🎯 Recomendações Personalizadas" animationDelay={200}>
      <View style={styles.recommendationsList}>
        <View style={styles.recommendationItem}>
          <Text style={styles.recommendationIcon}>💡</Text>
          <View style={styles.recommendationContent}>
            <Text style={[styles.recommendationTitle, { color: theme.colors.text.primary }]}>
              Continue registrando
            </Text>
            <Text style={[styles.recommendationText, { color: theme.colors.text.secondary }]}>
              Seus registros ajudam a gerar insights mais precisos
            </Text>
          </View>
        </View>
        
        <View style={styles.recommendationItem}>
          <Text style={styles.recommendationIcon}>📊</Text>
          <View style={styles.recommendationContent}>
            <Text style={[styles.recommendationTitle, { color: theme.colors.text.primary }]}>
              Monitore sintomas
            </Text>
            <Text style={[styles.recommendationText, { color: theme.colors.text.secondary }]}>
              Observe padrões em seus sintomas mais comuns
            </Text>
          </View>
        </View>
        
        <View style={styles.recommendationItem}>
          <Text style={styles.recommendationIcon}>🌸</Text>
          <View style={styles.recommendationContent}>
            <Text style={[styles.recommendationTitle, { color: theme.colors.text.primary }]}>
              Consulte um médico
            </Text>
            <Text style={[styles.recommendationText, { color: theme.colors.text.secondary }]}>
              Se houver mudanças significativas em seus padrões
            </Text>
          </View>
        </View>
      </View>
    </AnalyticsCard>
  </>
);

// ==================== COMPONENTE PRINCIPAL ====================

export default function EnhancedAnalyticsScreen() {
  const { theme } = useAdaptiveTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Estados
  const [selectedTab, setSelectedTab] = useState<SelectedTab>('overview');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filtros para o hook de dados
  const filters = useMemo<FilterOptions>(() => ({
    period: filterPeriod,
  }), [filterPeriod]);

  // Hooks de dados
  const { analytics, loading, error, refreshData, hasData } = useAnalyticsData(filters);
  const { recordsToday, symptomsToday, updateTodayStats } = useRealTimeStats();

  // Funções
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    await updateTodayStats();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshData, updateTodayStats]);

  const handleShareAnalytics = useCallback(async () => {
    if (!analytics) return;

    const report = `
📊 Meu Relatório EntrePhases

🔢 Estatísticas:
• ${analytics.totalRecords} registros totais
• Ciclo médio: ${analytics.averageCycleLength} dias
• ${analytics.mostCommonSymptoms.length} sintomas únicos

😊 Humor mais comum: ${analytics.moodDistribution[0]?.mood || 'N/A'}
🔝 Sintoma principal: ${analytics.mostCommonSymptoms[0]?.name || 'N/A'}

🌸 Próxima menstruação: ${analytics.nextPeriodPrediction || 'Calculando...'}

Gerado pelo app EntrePhases
    `.trim();

    try {
      await Share.share({
        message: report,
        title: 'Meu Relatório EntrePhases',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  }, [analytics]);

  const renderContent = useCallback(() => {
    if (!analytics) return null;

    switch (selectedTab) {
      case 'overview':
        return <OverviewContent analytics={analytics} theme={theme} />;
      case 'trends':
        return <TrendsContent analytics={analytics} theme={theme} />;
      case 'patterns':
        return <PatternsContent analytics={analytics} theme={theme} />;
      case 'insights':
        return <InsightsContent analytics={analytics} onRefresh={handleRefresh} theme={theme} />;
      default:
        return null;
    }
  }, [selectedTab, analytics, theme, handleRefresh]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme?.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme?.colors.text.primary }]}>
            Analisando seus dados...
          </Text>
          <View style={styles.loadingSpinner}>
            <Text style={styles.loadingEmoji}>🔄</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme?.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😔</Text>
          <Text style={[styles.errorText, { color: theme?.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme?.colors.primary }]} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  if (!hasData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme?.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyTitle, { color: theme?.colors.text.primary }]}>
            Dados Insuficientes
          </Text>
          <Text style={[styles.emptyText, { color: theme?.colors.text.secondary }]}>
            Registre mais sintomas e dados para ver suas análises detalhadas
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme?.colors.primary }]}
            onPress={() => router.push('/records')}
          >
            <Text style={styles.emptyButtonText}>Fazer Registros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!theme) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AnimatedHeader
        scrollY={scrollY}
        theme={theme}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <FilterSection
        filterPeriod={filterPeriod}
        onFilterChange={setFilterPeriod}
        theme={theme}
      />

      <TabSection
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        theme={theme}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderContent()}

        {/* Floating Action Button para compartilhar */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={handleShareAnalytics}
            activeOpacity={0.8}
          >
            <Text style={styles.fabIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ==================== ESTILOS ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header animado
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    flex: 1,
  },
  headerSafeArea: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
    paddingTop: DESIGN_SYSTEM.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: DESIGN_SYSTEM.typography.sizes.xl,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as any,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    textAlign: 'center',
    marginTop: 2,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shareIcon: {
    fontSize: 20,
  },

  // Filtros
  filterSection: {
    marginTop: 120,
    paddingVertical: DESIGN_SYSTEM.spacing.md,
  },
  filterScrollContent: {
    paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN_SYSTEM.spacing.md,
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
    borderRadius: DESIGN_SYSTEM.borderRadius.xl,
    marginRight: DESIGN_SYSTEM.spacing.sm,
    borderWidth: 1,
    ...DESIGN_SYSTEM.shadows.sm,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: DESIGN_SYSTEM.spacing.xs,
  },
  filterText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
  },

  // Tabs
  tabSection: {
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabScrollContent: {
    paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN_SYSTEM.spacing.md,
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
    marginRight: DESIGN_SYSTEM.spacing.md,
    borderRadius: DESIGN_SYSTEM.borderRadius.md,
    borderBottomWidth: 2,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: DESIGN_SYSTEM.spacing.xs,
  },
  tabText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_SYSTEM.spacing.lg,
    paddingBottom: 100,
    paddingTop: DESIGN_SYSTEM.spacing.md,
  },

  // Grid layouts
  twoColumnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48%',
  },

  // Overview content
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  symptomEmoji: {
    fontSize: 20,
    marginRight: DESIGN_SYSTEM.spacing.sm,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
  },
  symptomCount: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    marginTop: 2,
  },
  symptomTrend: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as any,
  },

  predictionContainer: {
    gap: DESIGN_SYSTEM.spacing.md,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionIcon: {
    fontSize: 24,
    marginRight: DESIGN_SYSTEM.spacing.md,
  },
  predictionLabel: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    marginBottom: 2,
  },
  predictionValue: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as any,
  },

  // Patterns content
  patternsGrid: {
    gap: DESIGN_SYSTEM.spacing.md,
  },
  patternCard: {
    padding: DESIGN_SYSTEM.spacing.md,
    borderRadius: DESIGN_SYSTEM.borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  patternIcon: {
    fontSize: 24,
    marginBottom: DESIGN_SYSTEM.spacing.sm,
    textAlign: 'center',
  },
  patternLabel: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
    textAlign: 'center',
    marginBottom: DESIGN_SYSTEM.spacing.sm,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN_SYSTEM.spacing.xs,
  },
  patternType: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
  },
  patternCount: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as any,
  },

  correlationsList: {
    gap: DESIGN_SYSTEM.spacing.md,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  correlationIcon: {
    fontSize: 16,
    marginRight: DESIGN_SYSTEM.spacing.sm,
    marginTop: 2,
  },
  correlationText: {
    flex: 1,
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    lineHeight: 20,
  },

  // Insights content
  recommendationsList: {
    gap: DESIGN_SYSTEM.spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: DESIGN_SYSTEM.spacing.md,
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    lineHeight: 18,
  },

  // States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN_SYSTEM.spacing.xl,
  },
  loadingText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.lg,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
    marginBottom: DESIGN_SYSTEM.spacing.lg,
    textAlign: 'center',
  },
  loadingSpinner: {
    padding: DESIGN_SYSTEM.spacing.lg,
  },
  loadingEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN_SYSTEM.spacing.xl,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: DESIGN_SYSTEM.spacing.lg,
  },
  errorText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.lg,
    textAlign: 'center',
    marginBottom: DESIGN_SYSTEM.spacing.xl,
  },
  retryButton: {
    paddingHorizontal: DESIGN_SYSTEM.spacing.xl,
    paddingVertical: DESIGN_SYSTEM.spacing.md,
    borderRadius: DESIGN_SYSTEM.borderRadius.md,
  },
  retryButtonText: {
    color: 'white',
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN_SYSTEM.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: DESIGN_SYSTEM.spacing.lg,
  },
  emptyTitle: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xl,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as any,
    textAlign: 'center',
    marginBottom: DESIGN_SYSTEM.spacing.md,
  },
  emptyText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DESIGN_SYSTEM.spacing.xl,
  },
  emptyButton: {
    paddingHorizontal: DESIGN_SYSTEM.spacing.xl,
    paddingVertical: DESIGN_SYSTEM.spacing.md,
    borderRadius: DESIGN_SYSTEM.borderRadius.md,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
  },

  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...DESIGN_SYSTEM.shadows.lg,
  },
  fabIcon: {
    fontSize: 24,
  },
});