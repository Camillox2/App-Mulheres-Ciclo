// app/dashboard.tsx - Dashboard Inteligente com Widgets
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useThemeSystem } from '../hooks/useThemeSystem';
import { calculateCycleInfo } from '../hooks/cycleCalculations';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface DashboardData {
  cycleInfo?: any;
  recentMood?: string;
  recentEnergy?: number;
  weeklySymptoms: number;
  streakDays: number;
  nextPeriod?: string;
  nextOvulation?: string;
}

const WidgetCard = ({ title, children, color, onPress, flex = 1 }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    if (onPress) onPress();
  };

  return (
    <Animated.View style={[styles.widgetContainer, { flex }, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.widgetTouchable}>
        <LinearGradient colors={color} style={styles.widget}>
          <Text style={styles.widgetTitle}>{title}</Text>
          {children}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const { theme } = useThemeSystem();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    weeklySymptoms: 0,
    streakDays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [cycleData, notesData, symptomsData] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyNotes'),
        AsyncStorage.getItem('symptomTracker'),
      ]);

      let data: DashboardData = {
        weeklySymptoms: 0,
        streakDays: 0,
      };

      // Dados do ciclo
      if (cycleData) {
        const cycle = JSON.parse(cycleData);
        const cycleInfo = calculateCycleInfo(cycle);
        data.cycleInfo = cycleInfo;
        data.nextPeriod = cycleInfo.nextPeriodDate.format('DD/MM');
        data.nextOvulation = cycleInfo.ovulationDate.format('DD/MM');
      }

      // Dados recentes de humor e energia
      if (notesData) {
        const notes = JSON.parse(notesData);
        const recentNote = notes
          .filter((note: any) => moment().diff(moment(note.date), 'days') <= 1)
          .sort((a: any, b: any) => moment(b.date).diff(moment(a.date)))[0];
        
        if (recentNote) {
          data.recentMood = recentNote.mood;
          data.recentEnergy = recentNote.energy;
        }
      }

      // Sintomas da semana
      if (symptomsData) {
        const symptoms = JSON.parse(symptomsData);
        const weeklySymptoms = symptoms.filter((symptom: any) =>
          moment().diff(moment(symptom.date), 'days') <= 7
        ).length;
        data.weeklySymptoms = weeklySymptoms;
      }

      // Streak de registros
      if (notesData) {
        const notes = JSON.parse(notesData);
        let streak = 0;
        let currentDate = moment();
        
        while (streak < 30) { // máximo 30 dias
          const hasRecord = notes.some((note: any) => 
            moment(note.date).isSame(currentDate, 'day')
          );
          if (!hasRecord) break;
          streak++;
          currentDate = currentDate.subtract(1, 'day');
        }
        
        data.streakDays = streak;
      }

      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      happy: '😊',
      calm: '😌',
      sad: '😔',
      angry: '😤',
      anxious: '😰',
      tired: '😴',
    };
    return moodMap[mood] || '😊';
  };

  const getPhaseEmoji = (phase: string) => {
    const phaseMap: { [key: string]: string } = {
      menstrual: '🩸',
      postMenstrual: '🌱',
      fertile: '🌸',
      ovulation: '🥚',
      preMenstrual: '🌙',
    };
    return phaseMap[phase] || '🌸';
  };

  if (loading || !theme) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { cycleInfo, recentMood, recentEnergy, weeklySymptoms, streakDays, nextPeriod, nextOvulation } = dashboardData;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Seu Dashboard 📊</Text>
            <Text style={styles.subtitle}>
              Resumo personalizado do seu bem-estar
            </Text>
          </View>

          {/* Linha 1: Ciclo Atual */}
          {cycleInfo && (
            <View style={styles.widgetRow}>
              <WidgetCard
                title="Fase Atual"
                color={['#FF6B9D', '#FFB4D6']}
                onPress={() => router.push('/calendar')}
                flex={1}
              >
                <Text style={styles.widgetEmoji}>
                  {getPhaseEmoji(cycleInfo.phase)}
                </Text>
                <Text style={styles.widgetValue}>{cycleInfo.phase}</Text>
                <Text style={styles.widgetSubtext}>Dia {cycleInfo.currentDay}</Text>
              </WidgetCard>

              <WidgetCard
                title="Próximo Período"
                color={['#4ECDC4', '#44B5CC']}
                onPress={() => router.push('/calendar')}
                flex={1}
              >
                <Text style={styles.widgetEmoji}>📅</Text>
                <Text style={styles.widgetValue}>{nextPeriod}</Text>
                <Text style={styles.widgetSubtext}>
                  {cycleInfo.daysUntilNextPeriod} dias
                </Text>
              </WidgetCard>
            </View>
          )}

          {/* Linha 2: Humor e Energia */}
          <View style={styles.widgetRow}>
            <WidgetCard
              title="Humor Hoje"
              color={['#FFB74D', '#FF9800']}
              onPress={() => router.push('/notes')}
              flex={1}
            >
              <Text style={styles.widgetEmoji}>
                {recentMood ? getMoodEmoji(recentMood) : '❓'}
              </Text>
              <Text style={styles.widgetValue}>
                {recentMood ? recentMood : 'Registre'}
              </Text>
              <Text style={styles.widgetSubtext}>
                {recentMood ? 'Registrado' : 'Não registrado'}
              </Text>
            </WidgetCard>

            <WidgetCard
              title="Energia"
              color={['#81C784', '#4CAF50']}
              onPress={() => router.push('/notes')}
              flex={1}
            >
              <Text style={styles.widgetEmoji}>⚡</Text>
              <Text style={styles.widgetValue}>
                {recentEnergy ? `${recentEnergy}/5` : '--'}
              </Text>
              <Text style={styles.widgetSubtext}>
                {recentEnergy ? 'Registrada' : 'Registre hoje'}
              </Text>
            </WidgetCard>
          </View>

          {/* Linha 3: Estatísticas */}
          <View style={styles.widgetRow}>
            <WidgetCard
              title="Sintomas (7 dias)"
              color={['#E1BEE7', '#CE93D8']}
              onPress={() => router.push('/symptom-tracker')}
              flex={1}
            >
              <Text style={styles.widgetEmoji}>🔍</Text>
              <Text style={styles.widgetValue}>{weeklySymptoms}</Text>
              <Text style={styles.widgetSubtext}>registros</Text>
            </WidgetCard>

            <WidgetCard
              title="Sequência"
              color={['#FFAB91', '#FF7043']}
              onPress={() => router.push('/notes')}
              flex={1}
            >
              <Text style={styles.widgetEmoji}>🔥</Text>
              <Text style={styles.widgetValue}>{streakDays}</Text>
              <Text style={styles.widgetSubtext}>
                dia{streakDays !== 1 ? 's' : ''} seguidos
              </Text>
            </WidgetCard>
          </View>

          {/* Linha 4: Ações Rápidas */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.widgetRow}>
              <WidgetCard
                title="Registrar Hoje"
                color={['#42A5F5', '#1E88E5']}
                onPress={() => router.push('/notes')}
                flex={1}
              >
                <Text style={styles.actionEmoji}>📝</Text>
                <Text style={styles.actionText}>Humor & Energia</Text>
              </WidgetCard>

              <WidgetCard
                title="Ver Insights"
                color={['#AB47BC', '#8E24AA']}
                onPress={() => router.push('/insights')}
                flex={1}
              >
                <Text style={styles.actionEmoji}>🧠</Text>
                <Text style={styles.actionText}>Análises</Text>
              </WidgetCard>
            </View>
          </View>

          {/* Widget de Fertilidade */}
          {cycleInfo && (
            <View style={styles.fertilitySection}>
              <WidgetCard
                title="Janela Fértil"
                color={cycleInfo.isInFertileWindow ? ['#4CAF50', '#66BB6A'] : ['#90A4AE', '#78909C']}
                onPress={() => router.push('/calendar')}
              >
                <Text style={styles.fertilityEmoji}>
                  {cycleInfo.isInFertileWindow ? '🌸' : '🌙'}
                </Text>
                <Text style={styles.fertilityValue}>
                  {cycleInfo.pregnancyChance}% chance
                </Text>
                <Text style={styles.fertilityStatus}>
                  {cycleInfo.isInFertileWindow ? 'JANELA FÉRTIL ATIVA' : 'Fora da janela fértil'}
                </Text>
                <Text style={styles.fertilitySubtext}>
                  Ovulação em {cycleInfo.daysUntilOvulation} dias
                </Text>
              </WidgetCard>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
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
  widgetRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  widgetContainer: {
    marginHorizontal: 5,
  },
  widgetTouchable: {
    flex: 1,
  },
  widget: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  widgetTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
    textAlign: 'center',
  },
  widgetEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  widgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  widgetSubtext: {
    fontSize: 11,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  actionsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  fertilitySection: {
    marginBottom: 20,
  },
  fertilityEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  fertilityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  fertilityStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  fertilitySubtext: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  bottomSpace: {
    height: 30,
  },
});