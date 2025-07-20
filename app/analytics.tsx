// app/analytics.tsx - VERSÃO TOTALMENTE CORRIGIDA
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
  Share,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment'; // <-- CORREÇÃO: Importação adicionada
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { useAnalyticsData, useRealTimeStats, FilterOptions } from '../hooks/useAnalyticsData';

const { width } = Dimensions.get('window');

type FilterPeriod = 'all' | 'monthly' | 'quarterly' | 'yearly';
type SelectedTab = 'overview' | 'trends' | 'insights';

// ==================== COMPONENTES CORRIGIDOS ====================

const AnalyticsCard: React.FC<{
  title: string;
  children: React.ReactNode;
  animationDelay?: number;
  fullWidth?: boolean;
}> = ({ title, children, animationDelay = 0, fullWidth = false }) => {
  const { theme } = useAdaptiveTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, [animationDelay, animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          transform: [{ translateY }],
          opacity,
          width: fullWidth ? '100%' : '48%',
        },
      ]}
    >
      <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      <View style={styles.cardBody}>{children}</View>
    </Animated.View>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  trend?: number;
  color?: string;
}> = ({ title, value, icon, trend, color }) => {
  const { theme } = useAdaptiveTheme();
  const statColor = color || theme.colors.primary;

  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={[`${statColor}20`, `${statColor}10`]}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardHeader}>
          <View style={[styles.statIconContainer, { backgroundColor: `${statColor}20` }]}>
            <Text style={styles.statIcon}>{icon}</Text>
          </View>
          {trend !== undefined && (
            <View style={styles.trendContainer}>
              <Text
                style={[
                  styles.trendText,
                  {
                    color:
                      trend > 0
                        ? '#2ECC71'
                        : trend < 0
                        ? '#E74C3C'
                        : theme.colors.text.secondary,
                  },
                ]}
              >
                {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statCardBody}>
          <Text style={[styles.statValue, { color: statColor }]}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
          <Text style={[styles.statTitle, { color: theme.colors.text.primary }]}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const BeautifulTrendChart: React.FC<{
  data: { date: string; symptoms: number; mood: number }[];
  type: 'symptoms' | 'mood';
}> = ({ data, type }) => {
  const { theme } = useAdaptiveTheme();
  
  const chartData = data.slice(-7).map(item => ({
    ...item,
    date: moment(item.date, 'DD/MM').format('DD'),
    dayName: moment(item.date, 'DD/MM').format('ddd'),
  }));
  
  const maxValue = Math.max(...chartData.map(d => d[type]), 1);
  const minValue = Math.min(...chartData.map(d => d[type]), 0);
  const range = maxValue - minValue || 1;
  
  const chartColor = type === 'symptoms' ? theme.colors.primary : '#FF6B6B';
  const gradientColor = type === 'symptoms' ? `${theme.colors.primary}20` : '#FF6B6B20';

  return (
    <View style={styles.beautifulTrendContainer}>
      <View style={styles.trendHeader}>
        <View style={styles.trendTitleRow}>
          <Text style={styles.trendEmoji}>{type === 'symptoms' ? '📊' : '😊'}</Text>
          <Text style={[styles.trendTitle, { color: theme.colors.text.primary }]}>
            {type === 'symptoms' ? 'Sintomas' : 'Humor'}
          </Text>
        </View>
        <Text style={[styles.trendSubtitle, { color: theme.colors.text.secondary }]}>
          Últimos 7 dias
        </Text>
      </View>
      
      <View style={styles.beautifulChart}>
        <View style={styles.chartGrid}>
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.gridLine, { backgroundColor: `${theme.colors.border}30` }]} />
          ))}
        </View>
        
        <View style={styles.chartArea}>
          {chartData.map((item, index) => {
            const heightPercent = range > 0 ? ((item[type] - minValue) / range) * 100 : 0;
            const isToday = index === chartData.length - 1;
            const isHigh = item[type] > (maxValue * 0.7);
            
            return (
              <View key={index} style={styles.chartColumn}>
                <View style={[styles.valueLabel, { 
                  backgroundColor: isToday ? chartColor : theme.colors.surface,
                  borderColor: chartColor,
                  borderWidth: isToday ? 0 : 1,
                }]}>
                  <Text style={[styles.valueLabelText, { 
                    color: isToday ? 'white' : theme.colors.text.primary,
                    fontWeight: isToday ? 'bold' : '600',
                  }]}>
                    {item[type]}
                  </Text>
                </View>
                
                <View style={styles.barWrapper}>
                  <LinearGradient
                    colors={[chartColor, gradientColor]}
                    style={[
                      styles.beautifulBar,
                      { 
                        height: `${Math.max(8, heightPercent)}%`,
                        shadowColor: chartColor,
                        shadowOpacity: isHigh ? 0.4 : 0.2,
                      }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                  
                  {isToday && (
                    <View style={[styles.todayIndicator, { backgroundColor: chartColor }]} />
                  )}
                </View>
                
                <View style={styles.dateLabels}>
                  <Text style={[styles.dayNumber, { 
                    color: isToday ? chartColor : theme.colors.text.primary,
                    fontWeight: isToday ? 'bold' : '500',
                  }]}>
                    {item.date}
                  </Text>
                  <Text style={[styles.dayName, { 
                    color: isToday ? chartColor : theme.colors.text.secondary,
                  }]}>
                    {item.dayName}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      
      <View style={styles.trendStats}>
        <View style={styles.trendStat}>
          <Text style={[styles.trendStatLabel, { color: theme.colors.text.secondary }]}>
            Média
          </Text>
          <Text style={[styles.trendStatValue, { color: chartColor }]}>
            {(chartData.reduce((sum, item) => sum + item[type], 0) / chartData.length).toFixed(1)}
          </Text>
        </View>
        
        <View style={styles.trendStat}>
          <Text style={[styles.trendStatLabel, { color: theme.colors.text.secondary }]}>
            Máximo
          </Text>
          <Text style={[styles.trendStatValue, { color: chartColor }]}>
            {maxValue}
          </Text>
        </View>
        
        <View style={styles.trendStat}>
          <Text style={[styles.trendStatLabel, { color: theme.colors.text.secondary }]}>
            Tendência
          </Text>
          <Text style={[styles.trendStatValue, { color: chartColor }]}>
            {chartData.length >= 2 && chartData[chartData.length - 1][type] > chartData[0][type] ? '📈' : 
             chartData.length >= 2 && chartData[chartData.length - 1][type] < chartData[0][type] ? '📉' : '➡️'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// <-- CORREÇÃO: Componente CycleProgressChart implementado
const CycleProgressChart: React.FC<{
  data: { startDate: string; length: number }[];
  theme: any;
}> = ({ data, theme }) => {
  if (!data || data.length === 0) {
    return <Text style={{ color: theme.colors.text.secondary, textAlign: 'center', paddingVertical: 20 }}>Dados de ciclo insuficientes.</Text>;
  }

  const averageLength = Math.round(data.reduce((sum, cycle) => sum + cycle.length, 0) / data.length);
  const maxLength = Math.max(...data.map(cycle => cycle.length), averageLength) * 1.2;

  const cycleColors = [theme.colors.primary, theme.colors.secondary, '#4ECDC4', '#FF6B6B'];

  return (
    <View style={styles.cycleProgressContainer}>
      <View style={styles.cycleHeader}>
        <Text style={[styles.cycleTitle, { color: theme.colors.text.primary }]}>Últimos Ciclos</Text>
        <Text style={[styles.cycleAverage, { color: theme.colors.primary, backgroundColor: `${theme.colors.primary}20` }]}>
          Média: {averageLength} dias
        </Text>
      </View>
      <View style={styles.cyclesList}>
        {data.slice(0, 5).map((cycle, index) => { // Limita a 5 ciclos para melhor visualização
          const barWidth = (cycle.length / maxLength) * 100;
          const diff = cycle.length - averageLength;
          const diffColor = diff > 0 ? '#E74C3C' : diff < 0 ? '#2ECC71' : theme.colors.text.secondary;

          return (
            <View key={index} style={styles.cycleItem}>
              <View style={styles.cycleInfo}>
                <Text style={[styles.cycleNumber, { color: theme.colors.text.primary }]}>
                  Ciclo #{data.length - index}
                </Text>
                <Text style={[styles.cycleDays, { color: theme.colors.text.secondary }]}>
                  {cycle.length} dias
                </Text>
                <Text style={[styles.cycleDiff, { color: diffColor }]}>
                  {diff !== 0 ? `${diff > 0 ? `+${diff}` : diff}d` : '-'}
                </Text>
              </View>
              <View style={styles.cycleBarContainer}>
                <View style={[styles.cycleBar, { 
                  width: `${Math.max(5, barWidth)}%`, 
                  backgroundColor: cycleColors[index % cycleColors.length] 
                }]} />
              </View>
              <Text style={[styles.cycleDate, { color: theme.colors.text.secondary }]}>
                {moment(cycle.startDate, 'YYYY-MM-DD').format('DD/MM/YY')}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.cycleLegend}>
        <View style={styles.cycleLegendItem}>
          <View style={[styles.cycleLegendDot, { backgroundColor: '#2ECC71' }]} />
          <Text style={[styles.cycleLegendText, { color: theme.colors.text.secondary }]}>Mais Curto</Text>
        </View>
        <View style={styles.cycleLegendItem}>
          <View style={[styles.cycleLegendDot, { backgroundColor: '#E74C3C' }]} />
          <Text style={[styles.cycleLegendText, { color: theme.colors.text.secondary }]}>Mais Longo</Text>
        </View>
      </View>
    </View>
  );
};


const MoodList: React.FC<{
  data: { mood: string; count: number; percentage: number; color: string }[];
}> = ({ data }) => {
  const { theme } = useAdaptiveTheme();

  return (
    <View style={styles.moodList}>
      {data.slice(0, 4).map((item, index) => (
        <View key={index} style={styles.moodItem}>
          <View style={styles.moodItemLeft}>
            <View style={[styles.moodDot, { backgroundColor: item.color }]} />
            <Text style={[styles.moodName, { color: theme.colors.text.primary }]}>
              {item.mood}
            </Text>
          </View>
          <View style={styles.moodItemRight}>
            <Text style={[styles.moodCount, { color: theme.colors.text.secondary }]}>
              {item.count}x
            </Text>
            <Text style={[styles.moodPercentage, { color: theme.colors.primary }]}>
              {item.percentage}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// ==================== COMPONENTES DE CONTEÚDO CORRIGIDOS ====================

const OverviewContent: React.FC<{ analytics: any; theme: any }> = ({ analytics, theme }) => (
  <View style={styles.contentContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quickStatsContainer}
      contentContainerStyle={styles.quickStatsContent}
    >
      <StatCard
        title="Registros Totais"
        value={analytics.totalRecords}
        icon="📝"
        trend={12}
        color={theme.colors.primary}
      />
      <StatCard
        title="Ciclo Médio"
        value={`${analytics.averageCycleLength} dias`}
        icon="📅"
        trend={-2}
        color={theme.colors.secondary}
      />
      <StatCard
        title="Sintomas Únicos"
        value={analytics.mostCommonSymptoms.length}
        icon="🔍"
        trend={5}
        color="#FF6B6B"
      />
      <StatCard
        title="Regularidade"
        value={analytics.cycleLengthVariation < 3 ? 'Alta' : 
               analytics.cycleLengthVariation < 7 ? 'Média' : 'Baixa'}
        icon="🎯"
        trend={0}
        color="#4ECDC4"
      />
    </ScrollView>

    <AnalyticsCard title="😊 Distribuição de Humor" animationDelay={100} fullWidth>
      <MoodList data={analytics.moodDistribution} />
    </AnalyticsCard>

    <View style={styles.twoColumnContainer}>
      <AnalyticsCard title="🔝 Top Sintomas" animationDelay={200}>
        <ScrollView style={styles.symptomsScroll} showsVerticalScrollIndicator={false}>
          {analytics.mostCommonSymptoms.slice(0, 5).map((symptom: any) => (
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
                <View style={styles.trendBadge}>
                  <Text style={[styles.symptomTrend, { 
                    color: symptom.trend > 0 ? '#E74C3C' : '#2ECC71' 
                  }]}>
                    {symptom.trend > 0 ? '↗' : '↘'} {Math.abs(symptom.trend)}%
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </AnalyticsCard>

      <AnalyticsCard title="📅 Próximos Eventos" animationDelay={300}>
        <View style={styles.predictionsContainer}>
          <View style={styles.predictionItem}>
            <View style={styles.predictionIcon}>
              <Text style={styles.predictionEmoji}>🌸</Text>
            </View>
            <View style={styles.predictionContent}>
              <Text style={[styles.predictionLabel, { color: theme.colors.text.secondary }]}>
                Próxima Menstruação
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.primary }]}>
                {analytics.nextPeriodPrediction || 'Calculando...'}
              </Text>
            </View>
          </View>
          
          <View style={styles.predictionDivider} />
          
          <View style={styles.predictionItem}>
            <View style={styles.predictionIcon}>
              <Text style={styles.predictionEmoji}>⭐</Text>
            </View>
            <View style={styles.predictionContent}>
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
  </View>
);

const TrendsContent: React.FC<{ analytics: any; theme: any }> = ({ analytics, theme }) => (
  <View style={styles.contentContainer}>
    <AnalyticsCard title="📊 Evolução dos Sintomas" animationDelay={100} fullWidth>
      <BeautifulTrendChart 
        data={analytics.timeSeriesData} 
        type="symptoms" 
      />
    </AnalyticsCard>

    <AnalyticsCard title="😊 Variação do Humor" animationDelay={200} fullWidth>
      <BeautifulTrendChart 
        data={analytics.timeSeriesData} 
        type="mood"
      />
    </AnalyticsCard>

    <AnalyticsCard title="🔄 Análise dos Ciclos" animationDelay={300} fullWidth>
      <CycleProgressChart 
        data={analytics.recentCycles}
        theme={theme}
      />
    </AnalyticsCard>

    <AnalyticsCard title="⚡ Insights Rápidos" animationDelay={400} fullWidth>
      <View style={styles.quickInsights}>
        <View style={styles.quickInsightItem}>
          <Text style={styles.quickInsightIcon}>🎯</Text>
          <View style={styles.quickInsightContent}>
            <Text style={[styles.quickInsightTitle, { color: theme.colors.text.primary }]}>
              Regularidade do Ciclo
            </Text>
            <Text style={[styles.quickInsightText, { color: theme.colors.text.secondary }]}>
              {analytics.cycleLengthVariation < 3 ? 
                'Seus ciclos são muito regulares! Continue assim.' : 
                analytics.cycleLengthVariation < 7 ? 
                'Seus ciclos têm uma variação normal.' :
                'Seus ciclos variam bastante. Considere conversar com um médico.'}
            </Text>
          </View>
        </View>
        
        <View style={styles.quickInsightItem}>
          <Text style={styles.quickInsightIcon}>📈</Text>
          <View style={styles.quickInsightContent}>
            <Text style={[styles.quickInsightTitle, { color: theme.colors.text.primary }]}>
              Tendência Geral
            </Text>
            <Text style={[styles.quickInsightText, { color: theme.colors.text.secondary }]}>
              {analytics.mostCommonSymptoms.length > 0 && analytics.mostCommonSymptoms[0].trend > 0 ?
                `${analytics.mostCommonSymptoms[0].name} tem aumentado recentemente.` :
                'Seus sintomas estão estáveis nas últimas semanas.'}
            </Text>
          </View>
        </View>
      </View>
    </AnalyticsCard>
  </View>
);

const InsightsContent: React.FC<{ analytics: any; onRefresh: () => void; theme: any }> = ({ 
  analytics, 
  onRefresh, 
  theme 
}) => (
  <View style={styles.contentContainer}>
    <AnalyticsCard title="💡 Insights Inteligentes" animationDelay={100} fullWidth>
      <View style={styles.insightsList}>
        {analytics.insights.map((insight: string, index: number) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={[styles.insightText, { color: theme.colors.text.primary }]}>
              {insight}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]} 
        onPress={onRefresh}
      >
        <Text style={styles.refreshButtonText}>🔄 Gerar Novos Insights</Text>
      </TouchableOpacity>
    </AnalyticsCard>
    
    <AnalyticsCard title="🎯 Recomendações" animationDelay={200} fullWidth>
      <View style={styles.recommendationsList}>
        {[
          {
            icon: "📝",
            title: "Continue registrando",
            text: "Seus registros ajudam a gerar insights mais precisos."
          },
          {
            icon: "📊",
            title: "Monitore os sintomas",
            text: "Observe padrões em seus sintomas mais comuns."
          },
          {
            icon: "🌸",
            title: "Consulte um médico",
            text: "Se houver mudanças significativas em seus padrões."
          }
        ].map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationIcon}>{rec.icon}</Text>
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: theme.colors.text.primary }]}>
                {rec.title}
              </Text>
              <Text style={[styles.recommendationText, { color: theme.colors.text.secondary }]}>
                {rec.text}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </AnalyticsCard>
  </View>
);

// ==================== COMPONENTE PRINCIPAL ====================

export default function AnalyticsScreen() {
  const { theme } = useAdaptiveTheme();
  
  const [selectedTab, setSelectedTab] = useState<SelectedTab>('overview');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filters = useMemo<FilterOptions>(() => ({
    period: filterPeriod,
  }), [filterPeriod]);

  const { analytics, loading, error, refreshData, hasData } = useAnalyticsData(filters);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleShareAnalytics = useCallback(async () => {
    if (!analytics) return;

    const report = `
📊 Meu Relatório EntrePhases (${filterPeriod})

🔢 Estatísticas:
• ${analytics.totalRecords} registros totais
• Ciclo médio: ${analytics.averageCycleLength} dias
• Variação do ciclo: ${analytics.cycleLengthVariation} dias

😊 Humor mais comum: ${analytics.moodDistribution[0]?.mood || 'N/A'}
🔝 Sintoma principal: ${analytics.mostCommonSymptoms[0]?.name || 'N/A'}

🌸 Próxima menstruação (previsão): ${analytics.nextPeriodPrediction || 'Calculando...'}

Gerado pelo app EntrePhases
    `.trim();

    try {
      await Share.share({
        message: report,
        title: 'Meu Relatório de Ciclo EntrePhases',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  }, [analytics, filterPeriod]);

  const renderContent = useCallback(() => {
    if (!analytics) return null;

    switch (selectedTab) {
      case 'overview':
        return <OverviewContent analytics={analytics} theme={theme} />;
      case 'trends':
        return <TrendsContent analytics={analytics} theme={theme} />;
      case 'insights':
        return <InsightsContent analytics={analytics} onRefresh={handleRefresh} theme={theme} />;
      default:
        return <OverviewContent analytics={analytics} theme={theme} />;
    }
  }, [selectedTab, analytics, theme, handleRefresh]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🔄</Text>
          <Text style={[styles.loadingText, {color: theme.colors.text.primary}]}>Analisando seus dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😔</Text>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
            Dados Insuficientes
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            Continue registrando seus dados para desbloquear análises detalhadas.
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/records')}
          >
            <Text style={styles.emptyButtonText}>Fazer Registros</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Analytics
          </Text>
          
          <TouchableOpacity style={styles.shareButton} onPress={handleShareAnalytics}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {[
            { key: 'all', label: 'Tudo', icon: '🌍' },
            { key: 'monthly', label: 'Mês', icon: '📅' },
            { key: 'quarterly', label: 'Trimestre', icon: '🗓️' },
            { key: 'yearly', label: 'Ano', icon: '📆' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filterPeriod === filter.key ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setFilterPeriod(filter.key as FilterPeriod)}
              activeOpacity={0.8}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text
                style={[
                  styles.filterText,
                  { color: filterPeriod === filter.key ? 'white' : theme.colors.text.primary },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.tabSection, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.tabScrollContent}>
          {[
            { key: 'overview', label: 'Resumo', icon: '📊' },
            { key: 'trends', label: 'Tendências', icon: '📈' },
            { key: 'insights', label: 'Insights', icon: '💡' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { borderBottomColor: selectedTab === tab.key ? theme.colors.primary : 'transparent' },
              ]}
              onPress={() => setSelectedTab(tab.key as SelectedTab)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === tab.key ? theme.colors.primary : theme.colors.text.secondary,
                    fontWeight: selectedTab === tab.key ? 'bold' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
        scrollEventThrottle={16}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

// ==================== ESTILOS CORRIGIDOS E ADAPTADOS ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 22,
  },
  filterSection: {
    paddingVertical: 10,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabSection: {
    borderBottomWidth: 1,
  },
  tabScrollContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardBody: {
    flex: 1,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  quickStatsContainer: {
    marginHorizontal: -16,
  },
  quickStatsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 60) / 2.2,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardGradient: {
    padding: 16,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
  },
  trendContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statCardBody: {},
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  moodList: {
    gap: 12,
  },
  moodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  moodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  moodName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  moodItemRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  moodCount: {
    fontSize: 13,
  },
  moodPercentage: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  symptomsScroll: {
    maxHeight: 190,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  symptomEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  symptomCount: {
    fontSize: 12,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  symptomTrend: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  predictionsContainer: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  predictionEmoji: {
    fontSize: 20,
  },
  predictionContent: {
    flex: 1,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  predictionValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  predictionDivider: {
    height: 1,
  },
  beautifulTrendContainer: {
    paddingVertical: 8,
  },
  trendHeader: {
    marginBottom: 20,
  },
  trendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  trendTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  trendSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  beautifulChart: {
    position: 'relative',
    height: 180,
    marginBottom: 16,
  },
  chartGrid: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    width: '100%',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    height: '100%',
    justifyContent: 'flex-end',
  },
  valueLabel: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  valueLabelText: {
    fontSize: 12,
  },
  barWrapper: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  beautifulBar: {
    width: '60%',
    maxWidth: 24,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateLabels: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 13,
    marginBottom: 2,
  },
  dayName: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  trendStat: {
    alignItems: 'center',
  },
  trendStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  trendStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cycleProgressContainer: {
    paddingVertical: 8,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cycleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  cycleAverage: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cyclesList: {
    gap: 16,
    marginBottom: 16,
  },
  cycleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cycleInfo: {
    width: 80,
    marginRight: 12,
  },
  cycleNumber: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  cycleDays: {
    fontSize: 12,
    marginTop: 2,
  },
  cycleDiff: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 1,
  },
  cycleBarContainer: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    overflow: 'hidden',
  },
  cycleBar: {
    height: '100%',
    borderRadius: 5,
  },
  cycleDate: {
    fontSize: 12,
    width: 60,
    textAlign: 'right',
  },
  cycleLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cycleLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cycleLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  cycleLegendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickInsights: {
    gap: 16,
  },
  quickInsightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
  },
  quickInsightIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  quickInsightContent: {
    flex: 1,
  },
  quickInsightTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickInsightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  insightsList: {
    gap: 16,
    marginBottom: 20,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  recommendationsList: {
    gap: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 22,
    marginRight: 16,
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  refreshButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});