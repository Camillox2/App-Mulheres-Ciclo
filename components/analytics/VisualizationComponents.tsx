import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ViewStyle,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  Bar,
} from 'recharts';
import type { LabelProps, TooltipContentProps } from 'recharts';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../../hooks/useAdaptiveTheme';
import { DESIGN_SYSTEM } from '../../constants/desingSystem';

const { width } = Dimensions.get('window');

// ==================== TIPOS ====================
interface AnalyticsCardProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  onPress?: () => void;
  style?: ViewStyle;
  animationDelay?: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: number;
  color?: string;
  onPress?: () => void;
}

interface InsightCardProps {
  insights: string[];
  onRefresh: () => void;
}

interface MoodChartProps {
  data: { mood: string; count: number; percentage: number; color: string }[];
  interactive?: boolean;
}

interface TrendChartProps {
  data: { date: string; symptoms: number; mood: number }[];
  type: 'symptoms' | 'mood';
}

interface CycleComparisonProps {
  data: { cycle: number; length: number; symptoms: number }[];
}

// ==================== COMPONENTES BASE ====================

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  children,
  icon,
  onPress,
  style,
  animationDelay = 0,
}) => {
  const { theme } = useAdaptiveTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, [animationDelay, animatedValue]);

  const handlePress = () => {
    if (onPress) {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(onPress, 150);
    }
  };

  if (!theme) return null;

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <Animated.View
      style={[
        styles.analyticsCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          transform: [{ translateY }, { scale: scaleValue }],
          opacity,
        },
        style,
      ]}
    >
      <CardWrapper onPress={handlePress} style={styles.cardContent} activeOpacity={0.9}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            {icon && <Text style={styles.cardIcon}>{icon}</Text>}
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              {title}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>{children}</View>
      </CardWrapper>
    </Animated.View>
  );
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  onPress,
}) => {
  const { theme } = useAdaptiveTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  if (!theme) return null;

  const statColor = color || theme.colors.primary;

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.statCardContent, { transform: [{ scale: pulseAnim }] }]}>
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
            {subtitle && (
              <Text style={[styles.statSubtitle, { color: theme.colors.text.secondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ==================== COMPONENTES DE GRÁFICOS ====================

const renderCustomLabel = (props: LabelProps) => {
  // Pie label props are a superset of LabelProps, so we need to cast and check for required fields
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as any;

  // Adicionando verificações para valores que podem ser undefined
  if (
    percent === undefined ||
    percent < 0.05 ||
    midAngle === undefined ||
    innerRadius === undefined ||
    outerRadius === undefined
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  // cx e cy são garantidos como number pela typings, mas os outros não
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
  const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > (cx as number) ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label, theme }: TooltipContentProps<any, any> & { theme: any }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <View style={[styles.tooltip, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.tooltipText, { color: theme.colors.text.primary }]}>
                    {data.name}: {data.count} registros ({data.value}%)
                </Text>
            </View>
        );
    }
    return null;
};

export const MoodChart: React.FC<MoodChartProps> = ({ data, interactive = true }) => {
  const { theme } = useAdaptiveTheme();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  if (!theme || data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={[styles.emptyChartText, { color: theme?.colors.text.secondary }]}>
          Dados insuficientes para gráfico de humor
        </Text>
      </View>
    );
  }

  const chartData = data.map((item) => ({
    name: item.mood,
    value: item.percentage,
    color: item.color,
    count: item.count,
  }));

  return (
    <View style={styles.chartContainer}>
      <View style={styles.pieChartContainer}>
        <PieChart width={width - 80} height={200}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={
              interactive ? (_: any, index: number) => setSelectedMood(data[index]?.mood) : undefined
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={(props: TooltipContentProps<any, any>) => <CustomTooltip {...props} theme={theme} />}
          />
        </PieChart>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendContainer}>
        {data.map((item) => (
          <TouchableOpacity
            key={item.mood}
            style={[
              styles.legendItem,
              {
                backgroundColor:
                  selectedMood === item.mood ? `${item.color}20` : theme.colors.surface,
                borderColor: item.color,
              },
            ]}
            onPress={() => setSelectedMood(selectedMood === item.mood ? null : item.mood)}
          >
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: theme.colors.text.primary }]}>
              {item.mood}
            </Text>
            <Text style={[styles.legendValue, { color: theme.colors.text.secondary }]}>
              {item.percentage}%
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const TrendChart: React.FC<TrendChartProps> = ({ data, type }) => {
  const { theme } = useAdaptiveTheme();

  if (!theme || data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={[styles.emptyChartText, { color: theme?.colors.text.secondary }]}>
          Dados insuficientes para gráfico de tendência
        </Text>
      </View>
    );
  }

  const chartColor = type === 'symptoms' ? theme.colors.primary : theme.colors.secondary;
  const dataKey = type;

  return (
    <View style={styles.chartContainer}>
      <LineChart
        width={width - 60}
        height={200}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={`${theme.colors.border}50`} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: theme.colors.text.secondary }}
          tickLine={{ stroke: theme.colors.border }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: theme.colors.text.secondary }}
          tickLine={{ stroke: theme.colors.border }}
        />
        <Tooltip
            content={(props: TooltipContentProps<any, any>) => {
                const { active, payload, label } = props;
                if (active && payload && payload.length) {
                    return (
                        <View style={[styles.tooltip, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.tooltipText, { color: theme.colors.text.primary }]}>
                                {label}: {payload[0].value} {type === 'symptoms' ? 'sintomas' : 'humor'}
                            </Text>
                        </View>
                    );
                }
                return null;
            }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={chartColor}
          strokeWidth={3}
          dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2 }}
        />
      </LineChart>
    </View>
  );
};

export const CycleComparison: React.FC<CycleComparisonProps> = ({ data }) => {
  const { theme } = useAdaptiveTheme();

  if (!theme || data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={[styles.emptyChartText, { color: theme?.colors.text.secondary }]}>
          Dados insuficientes para comparação de ciclos
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.chartContainer}>
      <BarChart
        width={width - 60}
        height={200}
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={`${theme.colors.border}50`} />
        <XAxis
          dataKey="cycle"
          tick={{ fontSize: 12, fill: theme?.colors.text.secondary }}
          tickLine={{ stroke: theme?.colors.border }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: theme?.colors.text.secondary }}
          tickLine={{ stroke: theme?.colors.border }}
        />
        <Tooltip
          content={(props: TooltipContentProps<any, any>) => {
              const { active, payload, label } = props;
              if (active && payload && payload.length) {
                  const tooltipData = payload[0].payload;
                  return (
                      <View style={[styles.tooltip, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.tooltipText, { color: theme.colors.text.primary }]}>
                              Ciclo {label}: {tooltipData.length} dias, {tooltipData.symptoms} sintomas
                          </Text>
                      </View>
                  );
              }
              return null;
          }}
        />
        <Bar dataKey="length" fill={theme.colors.primary} />
      </BarChart>
    </View>
  );
};

// ==================== COMPONENTES ESPECIAIS ====================

export const InsightCard: React.FC<InsightCardProps> = ({ insights, onRefresh }) => {
  const { theme } = useAdaptiveTheme();
  const [currentInsight, setCurrentInsight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const rotateInsight = useCallback(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 200);
  }, [fadeAnim, insights.length]);

  useEffect(() => {
    if (insights.length > 1) {
      const interval = setInterval(rotateInsight, 5000);
      return () => clearInterval(interval);
    }
  }, [insights.length, rotateInsight]);

  if (!theme || insights.length === 0) {
    return (
      <AnalyticsCard title="💡 Insights" icon="🧠">
        <Text style={[styles.emptyText, { color: theme?.colors.text.secondary }]}>
          Registre mais dados para receber insights personalizados!
        </Text>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="💡 Insights Inteligentes" icon="🧠">
      <View style={styles.insightContainer}>
        <Animated.View style={[styles.insightContent, { opacity: fadeAnim }]}>
          <Text style={[styles.insightText, { color: theme.colors.text.primary }]}>
            {insights[currentInsight]}
          </Text>
        </Animated.View>

        <View style={styles.insightFooter}>
          <View style={styles.insightIndicators}>
            {insights.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.insightDot,
                  {
                    backgroundColor:
                      index === currentInsight
                        ? theme.colors.primary
                        : `${theme.colors.primary}30`,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnalyticsCard>
  );
};

export const QuickStatsOverview: React.FC<{ analytics: any }> = ({ analytics }) => {
  const { theme } = useAdaptiveTheme();

  if (!theme || !analytics) return null;

  const stats = [
    {
      title: 'Registros Totais',
      value: analytics.totalRecords,
      icon: '📝',
      trend: 12,
      color: theme.colors.primary,
    },
    {
      title: 'Ciclo Médio',
      value: `${analytics.averageCycleLength} dias`,
      icon: '📅',
      trend: -2,
      color: theme.colors.secondary,
    },
    {
      title: 'Sintomas Únicos',
      value: analytics.mostCommonSymptoms.length,
      icon: '🔍',
      trend: 5,
      color: '#FF6B6B',
    },
    {
      title: 'Regularidade',
      value:
        analytics.cycleLengthVariation < 3
          ? 'Alta'
          : analytics.cycleLengthVariation < 7
          ? 'Média'
          : 'Baixa',
      icon: '🎯',
      trend: 0,
      color: '#4ECDC4',
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quickStatsContainer}
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          trend={stat.trend}
          color={stat.color}
        />
      ))}
    </ScrollView>
  );
};

// ==================== ESTILOS ====================

const styles = StyleSheet.create({
  analyticsCard: {
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    marginBottom: DESIGN_SYSTEM.spacing.lg,
    borderWidth: 1,
    ...DESIGN_SYSTEM.shadows.md,
  },
  cardContent: {
    padding: DESIGN_SYSTEM.spacing.lg,
  },
  cardHeader: {
    marginBottom: DESIGN_SYSTEM.spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: DESIGN_SYSTEM.spacing.sm,
  },
  cardTitle: {
    fontSize: DESIGN_SYSTEM.typography.sizes.lg,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as any,
  },
  cardBody: {
  },
  statCard: {
    width: (width - 60) / 2.5,
    marginRight: DESIGN_SYSTEM.spacing.md,
    borderRadius: DESIGN_SYSTEM.borderRadius.md,
    overflow: 'hidden',
    ...DESIGN_SYSTEM.shadows.md,
  },
  statCardContent: {
    flex: 1,
  },
  statCardGradient: {
    padding: DESIGN_SYSTEM.spacing.md,
    minHeight: 120,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DESIGN_SYSTEM.spacing.sm,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statCardBody: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  statValue: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xxl,
    fontWeight: DESIGN_SYSTEM.typography.weights.bold as any,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: DESIGN_SYSTEM.typography.sizes.sm,
    fontWeight: DESIGN_SYSTEM.typography.weights.semibold as any,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: DESIGN_SYSTEM.typography.sizes.xs,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: DESIGN_SYSTEM.spacing.sm,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    fontStyle: 'italic',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: DESIGN_SYSTEM.spacing.md,
  },
  legendContainer: {
    maxHeight: 60,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  legendValue: {
    fontSize: 11,
  },
  tooltip: {
    padding: 8,
    borderRadius: 6,
    ...DESIGN_SYSTEM.shadows.md,
    backgroundColor: 'white', 
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightContainer: {
    minHeight: 80,
  },
  insightContent: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: DESIGN_SYSTEM.spacing.md,
  },
  insightText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 16,
  },
  quickStatsContainer: {
    paddingHorizontal: DESIGN_SYSTEM.spacing.md,
    marginBottom: DESIGN_SYSTEM.spacing.lg,
  },
  emptyText: {
    fontSize: DESIGN_SYSTEM.typography.sizes.md,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: DESIGN_SYSTEM.spacing.lg,
  },
});