// app/calendar.tsx - VERSÃO LINDA E CORRIGIDA
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { getDayInfo, DayInfo } from '../hooks/cycleCalculations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const CALENDAR_PADDING = 20;
const CALENDAR_WIDTH = width - (CALENDAR_PADDING * 2);
const DAY_SIZE = Math.floor((CALENDAR_WIDTH - 42) / 7); // 6px * 7 gaps = 42

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

type PhaseType = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

// Cores mais bonitas e suaves
const BEAUTIFUL_COLORS = {
  menstrual: {
    gradient: ['#FF9A9E', '#FECFEF', '#FECFEF'],
    primary: '#FF6B9D',
    text: '#FFFFFF'
  },
  postMenstrual: {
    gradient: ['#A8E6CF', '#DCEDC1', '#B8E994'],
    primary: '#27AE60',
    text: '#FFFFFF'
  },
  fertile: {
    gradient: ['#FFB347', '#FFCC5C', '#FFD93D'],
    primary: '#FF8C42',
    text: '#FFFFFF'
  },
  ovulation: {
    gradient: ['#FFE066', '#FFEB3B', '#FFF176'],
    primary: '#FFC107',
    text: '#2C2C2C'
  },
  preMenstrual: {
    gradient: ['#B39DDB', '#CE93D8', '#E1BEE7'],
    primary: '#9C27B0',
    text: '#FFFFFF'
  }
};

const PHASE_INFO = {
  menstrual: {
    name: 'Menstruação',
    emoji: '🌸',
    description: 'Período de renovação e autocuidado',
    color: '#FF6B9D'
  },
  postMenstrual: {
    name: 'Pós-Menstrual',
    emoji: '🌱',
    description: 'Energia renovada',
    color: '#27AE60'
  },
  fertile: {
    name: 'Período Fértil',
    emoji: '🔥',
    description: 'Alta energia',
    color: '#FF8C42'
  },
  ovulation: {
    name: 'Ovulação',
    emoji: '⭐',
    description: 'Pico de fertilidade',
    color: '#FFC107'
  },
  preMenstrual: {
    name: 'TPM',
    emoji: '💜',
    description: 'Introspecção',
    color: '#9C27B0'
  }
};

// Componente do dia - TOTALMENTE REFEITO
const BeautifulCalendarDay = React.memo<{
  dayInfo: DayInfo;
  onPress: (dayInfo: DayInfo) => void;
  theme: any;
}>(({ dayInfo, onPress, theme }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animação de toque
  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress(dayInfo);
  }, [dayInfo, onPress]);

  // Pulso para o dia atual
  useEffect(() => {
    if (dayInfo.isToday) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [dayInfo.isToday]);

  // Se não é do mês atual, mostrar discretamente
  if (!dayInfo.isCurrentMonth) {
    return (
      <View style={[styles.dayContainer, { width: DAY_SIZE, height: DAY_SIZE }]}>
        <View style={styles.emptyDay}>
          <Text style={[styles.emptyDayText, { color: theme.colors.text.tertiary }]}>
            {dayInfo.date.format('D')}
          </Text>
        </View>
      </View>
    );
  }

  const phaseColors = BEAUTIFUL_COLORS[dayInfo.phase];
  const intensity = Math.max(0.3, dayInfo.phaseIntensity);

  return (
    <View style={[styles.dayContainer, { width: DAY_SIZE, height: DAY_SIZE }]}>
      <Animated.View 
        style={[
          { transform: [{ scale: scaleAnim }, { scale: dayInfo.isToday ? pulseAnim : 1 }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.modernDayButton,
            dayInfo.isToday && styles.todayButton,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              [
                ...phaseColors.gradient.map(
                  color => `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`
                )
              ] as [import('react-native').ColorValue, import('react-native').ColorValue, ...import('react-native').ColorValue[]]
            }
            style={styles.dayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Conteúdo do dia */}
          <View style={styles.dayContent}>
            {/* APENAS UM NÚMERO - O DIA */}
            <Text
              style={[
                styles.modernDayNumber,
                {
                  color: dayInfo.isToday ? theme.colors.primary : phaseColors.text,
                  fontSize: dayInfo.isToday ? 18 : 16,
                  fontWeight: dayInfo.isToday ? '800' : '600',
                },
              ]}
            >
              {dayInfo.date.format('D')}
            </Text>
            
            {/* Indicadores visuais pequenos */}
            <View style={styles.indicators}>
              {/* Indicador de fertilidade */}
              {dayInfo.pregnancyChance > 20 && (
                <View style={[styles.fertilityDot, { backgroundColor: phaseColors.primary }]} />
              )}
              
              {/* Indicador de fase */}
              <View style={[styles.phaseDot, { backgroundColor: phaseColors.primary }]} />
            </View>

            {/* Borda especial para hoje */}
            {dayInfo.isToday && (
              <View style={[styles.todayBorder, { borderColor: theme.colors.primary }]} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

// Modal melhorado
const BeautifulDayModal = React.memo<{
  visible: boolean;
  onClose: () => void;
  dayInfo: DayInfo | null;
  theme: any;
}>(({ visible, onClose, dayInfo, theme }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!dayInfo) return null;

  const phaseInfo = PHASE_INFO[dayInfo.phase];
  const phaseColors = BEAUTIFUL_COLORS[dayInfo.phase];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[styles.modalOverlay, { opacity: opacityAnim }]}
      >
        <Pressable style={styles.modalBackground} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.beautifulModal,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header com gradiente */}
          <LinearGradient
            colors={phaseColors.gradient as [import('react-native').ColorValue, import('react-native').ColorValue, ...import('react-native').ColorValue[]]}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalEmoji}>{phaseInfo.emoji}</Text>
              <Text style={styles.modalDate}>
                {dayInfo.date.format('DD')}
              </Text>
              <Text style={styles.modalDayName}>
                {dayInfo.date.format('dddd, DD [de] MMMM')}
              </Text>
            </View>
          </LinearGradient>

          {/* Conteúdo */}
          <View style={styles.modalBody}>
            {/* Fase atual */}
            <View style={[styles.phaseSection, { borderLeftColor: phaseInfo.color }]}>
              <Text style={[styles.phaseName, { color: theme.colors.text.primary }]}>
                {phaseInfo.name}
              </Text>
              <Text style={[styles.phaseDescription, { color: theme.colors.text.secondary }]}>
                {phaseInfo.description}
              </Text>
            </View>

            {/* Estatísticas */}
            <View style={styles.statsSection}>
              <View style={[styles.statItem, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                  Dia do Ciclo
                </Text>
                <Text style={[styles.statValue, { color: phaseInfo.color }]}>
                  {dayInfo.dayOfCycle}º
                </Text>
              </View>
              
              <View style={[styles.statItem, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                  Fertilidade
                </Text>
                <Text style={[styles.statValue, { color: phaseInfo.color }]}>
                  {dayInfo.pregnancyChance}%
                </Text>
              </View>
            </View>

            {/* Dicas */}
            <View style={[styles.tipsSection, { backgroundColor: `${phaseInfo.color}10` }]}>
              <Text style={[styles.tipsTitle, { color: phaseInfo.color }]}>
                💡 Dica para hoje
              </Text>
              <Text style={[styles.tipText, { color: theme.colors.text.primary }]}>
                {phaseInfo.description}. Aproveite este momento único do seu ciclo.
              </Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

// Componente principal
export default function BeautifulCalendarScreen() {
  const { theme, isDarkMode } = useAdaptiveTheme();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Carrega dados
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('cycleData');
        if (data) {
          setCycleData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    };

    loadData();
  }, []);

  // Gera os dias do calendário
  const calendarDays = useMemo(() => {
    if (!cycleData) return [];

    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');

    const days: DayInfo[] = [];
    const current = startOfWeek.clone();

    while (current.isSameOrBefore(endOfWeek, 'day')) {
      days.push(getDayInfo(current.clone(), cycleData, currentMonth));
      current.add(1, 'day');
    }

    return days;
  }, [currentMonth, cycleData]);

  const handleDayPress = useCallback((dayInfo: DayInfo) => {
    setSelectedDay(dayInfo);
    setModalVisible(true);
  }, []);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' 
        ? prev.clone().subtract(1, 'month')
        : prev.clone().add(1, 'month')
    );
  }, []);

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={['#FF9A9E', '#FECFEF']}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>✨ Preparando seu calendário...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!cycleData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              Configure seu ciclo primeiro
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
              Vá em Configurações para definir os dados do seu ciclo menstrual
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header elegante */}
          <LinearGradient
            colors={[theme.colors.surface, `${theme.colors.surface}F0`]}
            style={styles.header}
          >
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: `${theme.colors.primary}15` }]}
              onPress={() => navigateMonth('prev')}
            >
              <Text style={[styles.navIcon, { color: theme.colors.primary }]}>‹</Text>
            </TouchableOpacity>
            
            <View style={styles.monthContainer}>
              <Text style={[styles.monthText, { color: theme.colors.text.primary }]}>
                {currentMonth.format('MMMM')}
              </Text>
              <Text style={[styles.yearText, { color: theme.colors.text.secondary }]}>
                {currentMonth.format('YYYY')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: `${theme.colors.primary}15` }]}
              onPress={() => navigateMonth('next')}
            >
              <Text style={[styles.navIcon, { color: theme.colors.primary }]}>›</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView 
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Legenda das fases */}
            <View style={[styles.legend, { backgroundColor: theme.colors.surface }]}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.legendContent}
              >
                {Object.entries(PHASE_INFO).map(([phase, info]) => (
                  <View key={phase} style={styles.legendItem}>
                    <LinearGradient
                      colors={BEAUTIFUL_COLORS[phase as PhaseType].gradient as [import('react-native').ColorValue, import('react-native').ColorValue, ...import('react-native').ColorValue[]]}
                      style={styles.legendDot}
                    />
                    <Text style={styles.legendEmoji}>{info.emoji}</Text>
                    <Text style={[styles.legendText, { color: theme.colors.text.secondary }]}>
                      {info.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Cabeçalho da semana */}
            <View style={styles.weekHeader}>
              {weekDays.map((day) => (
                <View key={day} style={[styles.weekDay, { width: DAY_SIZE }]}>
                  <Text style={[styles.weekDayText, { color: theme.colors.text.secondary }]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Grid do calendário */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((dayInfo) => (
                <BeautifulCalendarDay
                  key={dayInfo.date.format('YYYY-MM-DD')}
                  dayInfo={dayInfo}
                  onPress={handleDayPress}
                  theme={theme}
                />
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* Modal elegante */}
      <BeautifulDayModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dayInfo={selectedDay}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CALENDAR_PADDING,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },

  // Scroll
  scroll: {
    flex: 1,
    paddingHorizontal: CALENDAR_PADDING,
  },

  // Legenda
  legend: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  legendContent: {
    alignItems: 'center',
  },
  legendItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 6,
  },
  legendEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Week header
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingHorizontal: 3,
  },
  weekDay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 30,
  },

  // Day components
  dayContainer: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  emptyDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.4,
  },

  modernDayButton: {
    width: DAY_SIZE - 4,
    height: DAY_SIZE - 4,
    borderRadius: (DAY_SIZE - 4) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  todayButton: {
    borderWidth: 3,
    borderColor: 'transparent',
  },

  dayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: (DAY_SIZE - 4) / 2,
  },

  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  modernDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },

  indicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fertilityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 2,
  },

  phaseDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },

  todayBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: DAY_SIZE / 2,
    borderWidth: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  beautifulModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  modalHeader: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    position: 'relative',
  },

  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  modalCloseText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  modalHeaderContent: {
    alignItems: 'center',
  },

  modalEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },

  modalDate: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  modalDayName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  modalBody: {
    padding: 24,
  },

  phaseSection: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginBottom: 24,
  },

  phaseName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },

  phaseDescription: {
    fontSize: 16,
    lineHeight: 22,
  },

  statsSection: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },

  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },

  tipsSection: {
    borderRadius: 12,
    padding: 16,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  tipText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});