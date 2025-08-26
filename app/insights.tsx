// app/insights.tsx - Página de Insights Inteligentes
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem } from '../hooks/useThemeSystem';
import { useSmartInsights } from '../hooks/useSmartInsights';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface InsightCardProps {
  insight: any;
  index: number;
  onPress?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, index, onPress }) => {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animação de entrada escalonada
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500 });
    }, index * 200);
  }, [index]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
    animatedHeight.value = withSpring(expanded ? 0 : 1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: (1 - opacity.value) * 50,
      },
    ],
  }));

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: animatedHeight.value,
    maxHeight: animatedHeight.value * 200,
  }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFB74D';
      case 'low': return '#4CAF50';
      default: return '#4ECDC4';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'ALTA';
      case 'medium': return 'MÉDIA';
      case 'low': return 'BAIXA';
      default: return '';
    }
  };

  return (
    <Animated.View style={[styles.insightCard, animatedStyle]}>
      <LinearGradient
        colors={insight.color || ['#4ECDC4', '#44B5CC']}
        style={styles.cardGradient}
      >
        <TouchableOpacity onPress={toggleExpanded} style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.insightIcon}>{insight.icon}</Text>
            <View style={styles.headerText}>
              <Text style={styles.insightTitle} numberOfLines={2}>
                {insight.title}
              </Text>
              <View style={styles.priorityBadge}>
                <Text style={[
                  styles.priorityText,
                  { color: getPriorityColor(insight.priority) }
                ]}>
                  {getPriorityLabel(insight.priority)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.expandIcon}>
            {expanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.insightDescription} numberOfLines={expanded ? undefined : 2}>
          {insight.description}
        </Text>

        <Animated.View style={[styles.expandedContent, expandedStyle]}>
          <View style={styles.recommendationSection}>
            <Text style={styles.recommendationTitle}>💡 Recomendação:</Text>
            <Text style={styles.recommendationText}>
              {insight.recommendation}
            </Text>
          </View>

          {insight.dataPoints && (
            <View style={styles.dataPointsSection}>
              <Text style={styles.dataPointsText}>
                📊 Baseado em {insight.dataPoints} registros de dados
              </Text>
            </View>
          )}

          {insight.actionable && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onPress}
            >
              <Text style={styles.actionButtonText}>Tomar Ação</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function InsightsScreen() {
  const { theme } = useThemeSystem();
  const { insights, loading, refreshInsights } = useSmartInsights();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshInsights();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleInsightAction = (insight: any) => {
    switch (insight.type) {
      case 'cycle':
        Alert.alert(
          'Ação Sugerida',
          'Deseja agendar uma consulta com ginecologista?',
          [
            { text: 'Mais tarde', style: 'cancel' },
            { text: 'Sim, anotar', onPress: () => {
              Alert.alert('Anotado!', 'Lembre-se de agendar sua consulta médica.');
            }}
          ]
        );
        break;
      case 'symptoms':
        Alert.alert(
          'Rastreamento de Sintomas',
          'Continue monitorando seus sintomas diariamente para identificar padrões.',
          [{ text: 'Entendi' }]
        );
        break;
      case 'mood':
        Alert.alert(
          'Cuidado com o Bem-estar',
          'Considere técnicas de relaxamento como meditação ou exercícios leves.',
          [{ text: 'Vou tentar' }]
        );
        break;
      default:
        Alert.alert(
          'Insight Valioso',
          'Continue acompanhando seus dados para mais insights personalizados.',
          [{ text: 'Ok' }]
        );
    }
  };

  const getInsightStats = () => {
    const highPriority = insights.filter(i => i.priority === 'high').length;
    const mediumPriority = insights.filter(i => i.priority === 'medium').length;
    const lowPriority = insights.filter(i => i.priority === 'low').length;

    return { highPriority, mediumPriority, lowPriority, total: insights.length };
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>Coletando dados...</Text>
      <Text style={styles.emptySubtitle}>
        Continue registrando seus dados diários para receber insights personalizados sobre sua saúde.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => Alert.alert('Dica', 'Use as páginas de Anotações e Sintomas para começar!')}
      >
        <Text style={styles.emptyButtonText}>Como começar?</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => {
    const stats = getInsightStats();
    
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Resumo dos Insights</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF6B6B' }]}>{stats.highPriority}</Text>
            <Text style={styles.statLabel}>Alta Prioridade</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FFB74D' }]}>{stats.mediumPriority}</Text>
            <Text style={styles.statLabel}>Média Prioridade</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.lowPriority}</Text>
            <Text style={styles.statLabel}>Baixa Prioridade</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!theme) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="white"
              titleColor="white"
              title="Atualizando insights..."
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>Insights Inteligentes 🧠</Text>
            <Text style={styles.subtitle}>
              Análises personalizadas baseadas em seus dados
            </Text>
          </View>

          {insights.length > 0 ? (
            <>
              {renderStats()}
              
              <View style={styles.insightsContainer}>
                {insights.map((insight, index) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    index={index}
                    onPress={() => handleInsightAction(insight)}
                  />
                ))}
              </View>
            </>
          ) : (
            renderEmptyState()
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: 20,
  },
  insightCard: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  expandIcon: {
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
  },
  insightDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 10,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  recommendationSection: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 18,
  },
  dataPointsSection: {
    marginBottom: 10,
  },
  dataPointsText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  bottomSpace: {
    height: 30,
  },
});