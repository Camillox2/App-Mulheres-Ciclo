// app/calendar.tsx - VERSÃO ULTRA OTIMIZADA
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
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { getDayInfo, DayInfo } from '../hooks/cycleCalculations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const CALENDAR_PADDING = 16;
const CALENDAR_WIDTH = width - (CALENDAR_PADDING * 2);
const DAY_SIZE = Math.floor((CALENDAR_WIDTH - 48) / 7);

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

type PhaseType = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

// Cache para cores das fases
const PHASE_COLORS_CACHE = {
  menstrual: ['#FF6B9D', '#E74C3C'],
  postMenstrual: ['#58D68D', '#27AE60'],
  fertile: ['#FFD700', '#FF6347'],
  ovulation: ['#FFA500', '#FF8C00'],
  preMenstrual: ['#BB86FC', '#8E44AD'],
} as const;

// Dados educativos - versão compacta
const PHASE_INFO = {
  menstrual: {
    name: 'Menstruação',
    emoji: '🌸',
    description: 'Período de renovação e autocuidado',
    tips: ['Descanse bastante', 'Mantenha-se hidratada', 'Use calor para aliviar cólicas'],
    hormones: 'Estrogênio e progesterona baixos'
  },
  postMenstrual: {
    name: 'Pós-Menstrual',
    emoji: '🌱',
    description: 'Energia renovada e disposição',
    tips: ['Aproveite para exercícios', 'Inicie novos projetos', 'Socialize mais'],
    hormones: 'Estrogênio em ascensão'
  },
  fertile: {
    name: 'Período Fértil',
    emoji: '🔥',
    description: 'Alta energia e criatividade',
    tips: ['Use proteção se necessário', 'Aproveite a energia criativa', 'Mantenha-se ativa'],
    hormones: 'Estrogênio em alta'
  },
  ovulation: {
    name: 'Ovulação',
    emoji: '⭐',
    description: 'Pico de energia e fertilidade',
    tips: ['Hidrate-se bem', 'Aproveite a energia extra', 'Observe sinais do corpo'],
    hormones: 'Pico de LH e estrogênio'
  },
  preMenstrual: {
    name: 'Pré-Menstrual',
    emoji: '💜',
    description: 'Preparação e introspecção',
    tips: ['Seja paciente consigo mesma', 'Pratique relaxamento', 'Exercícios leves ajudam'],
    hormones: 'Progesterona alta, depois queda'
  }
} as const;

// Componente de dia otimizado com shouldComponentUpdate
const CalendarDay = React.memo<{
  dayInfo: DayInfo;
  onPress: (dayInfo: DayInfo) => void;
  theme: any;
}>(({ dayInfo, onPress, theme }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    // Feedback tátil instantâneo
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Delay pequeno para melhor UX
    setTimeout(() => onPress(dayInfo), 50);
  }, [dayInfo, onPress]);

  // Cache das cores para evitar recálculos
  const colors = useMemo(() => PHASE_COLORS_CACHE[dayInfo.phase], [dayInfo.phase]);
  const intensity = useMemo(() => Math.max(0.4, dayInfo.phaseIntensity * 0.9), [dayInfo.phaseIntensity]);

  // Renderização condicional para dias fora do mês
  if (!dayInfo.isCurrentMonth) {
    return (
      <View style={styles.dayContainer}>
        <View style={styles.emptyDay}>
          <Text style={[styles.dayNumber, { color: theme.colors.text?.disabled || '#CCC' }]}>
            {dayInfo.date.format('D')}
          </Text>
        </View>
      </View>
    );
  }

  const gradientColors: [string, string] = [
    `${colors[0]}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
    `${colors[1]}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
  ];

  return (
    <View style={styles.dayContainer}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={[
            styles.dayButton,
            {
              borderColor: dayInfo.isToday ? theme.colors.primary : 'transparent',
              borderWidth: dayInfo.isToday ? 2 : 0,
            },
          ]}
          onPress={handlePress}
          android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true }}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.dayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.dayContent}>
            <Text
              style={[
                styles.dayNumber,
                {
                  color: dayInfo.isToday ? theme.colors.primary : 'white',
                  fontWeight: dayInfo.isToday ? '700' : '600',
                },
              ]}
            >
              {dayInfo.date.format('D')}
            </Text>
            
            <Text style={styles.pregnancyText}>
              {dayInfo.pregnancyChance}%
            </Text>
            
            <View style={[styles.phaseIndicator, { backgroundColor: colors[0] }]} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Otimização: só re-renderiza se algo relevante mudou
  return (
    prevProps.dayInfo.date.isSame(nextProps.dayInfo.date, 'day') &&
    prevProps.dayInfo.phase === nextProps.dayInfo.phase &&
    prevProps.dayInfo.pregnancyChance === nextProps.dayInfo.pregnancyChance &&
    prevProps.dayInfo.isToday === nextProps.dayInfo.isToday &&
    prevProps.theme.colors.primary === nextProps.theme.colors.primary
  );
});

// Modal de detalhes do dia - versão simplificada
const DayDetailModal = React.memo<{
  visible: boolean;
  onClose: () => void;
  dayInfo: DayInfo | null;
  theme: any;
}>(({ visible, onClose, dayInfo, theme }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!dayInfo) return null;

  const phaseInfo = PHASE_INFO[dayInfo.phase];

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
            styles.dayModal,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalEmoji}>{phaseInfo.emoji}</Text>
              <View style={styles.modalTitleContainer}>
                <Text style={[styles.modalDate, { color: theme.colors.primary }]}>
                  {dayInfo.date.format('DD')}
                </Text>
                <Text style={[styles.modalDay, { color: theme.colors.text?.primary }]}>
                  {dayInfo.date.format('dddd')}
                </Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Text style={[styles.closeBtnText, { color: theme.colors.primary }]}>×</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.modalContent}>
            <View style={[styles.phaseCard, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Text style={[styles.phaseName, { color: theme.colors.primary }]}>
                {phaseInfo.name}
              </Text>
              <Text style={[styles.phaseDesc, { color: theme.colors.text?.secondary }]}>
                {phaseInfo.description}
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text?.secondary }]}>
                  Dia do Ciclo
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {dayInfo.dayOfCycle}
                </Text>
              </View>
              
              <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text?.secondary }]}>
                  Fertilidade
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {dayInfo.pregnancyChance}%
                </Text>
              </View>
            </View>

            <View style={[styles.tipsSection, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.tipsTitle, { color: theme.colors.primary }]}>
                💡 Dicas para hoje
              </Text>
              {phaseInfo.tips.slice(0, 2).map((tip, index) => (
                <Text key={index} style={[styles.tipText, { color: theme.colors.text?.primary }]}>
                  • {tip}
                </Text>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

// Modal educativo sobre fases - versão compacta
const PhaseEducationModal = React.memo<{
  visible: boolean;
  onClose: () => void;
  phase: PhaseType;
  theme: any;
}>(({ visible, onClose, phase, theme }) => {
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const phaseInfo = PHASE_INFO[phase];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.phaseModal,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateY }],
            },
          ]}
        >
          <LinearGradient
            colors={theme.colors.gradients?.primary || [theme.colors.primary, theme.colors.secondary]}
            style={styles.phaseModalHeader}
          >
            <Pressable style={styles.phaseModalClose} onPress={onClose}>
              <Text style={styles.phaseModalCloseText}>×</Text>
            </Pressable>
            
            <Text style={styles.phaseModalEmoji}>{phaseInfo.emoji}</Text>
            <Text style={styles.phaseModalTitle}>{phaseInfo.name}</Text>
            <Text style={styles.phaseModalSubtitle}>{phaseInfo.description}</Text>
          </LinearGradient>

          <ScrollView style={styles.phaseModalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.hormoneInfo, { backgroundColor: `${theme.colors.primary}10` }]}>
              <Text style={[styles.hormoneTitle, { color: theme.colors.primary }]}>
                🧬 Hormônios
              </Text>
              <Text style={[styles.hormoneText, { color: theme.colors.text?.secondary }]}>
                {phaseInfo.hormones}
              </Text>
            </View>

            <View style={styles.tipsContainer}>
              <Text style={[styles.tipsContainerTitle, { color: theme.colors.primary }]}>
                💡 Dicas de Bem-estar
              </Text>
              {phaseInfo.tips.map((tip, index) => (
                <View key={index} style={[styles.tipItem, { backgroundColor: `${theme.colors.primary}08` }]}>
                  <Text style={[styles.tipItemText, { color: theme.colors.text?.primary }]}>
                    • {tip}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});

// Componente principal
export default function CalendarScreen() {
  const { theme, isLightMode } = useAdaptiveTheme();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [phaseModalVisible, setPhaseModalVisible] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<PhaseType>('menstrual');
  const [isLoading, setIsLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Carrega dados de forma assíncrona
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
        // Usa InteractionManager para melhor performance
        InteractionManager.runAfterInteractions(() => {
          setIsLoading(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        });
      }
    };

    loadData();
  }, []);

  // Memoriza cálculos pesados do calendário
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

  // Callbacks otimizados
  const handleDayPress = useCallback((dayInfo: DayInfo) => {
    setSelectedDay(dayInfo);
    setDayModalVisible(true);
  }, []);

  const handlePhasePress = useCallback((phase: PhaseType) => {
    setSelectedPhase(phase);
    setPhaseModalVisible(true);
  }, []);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' 
        ? prev.clone().subtract(1, 'month')
        : prev.clone().add(1, 'month')
    );
  }, []);

  const closeDayModal = useCallback(() => setDayModalVisible(false), []);
  const closePhaseModal = useCallback(() => setPhaseModalVisible(false), []);

  // Constantes otimizadas
  const weekDays = useMemo(() => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], []);
  
  const phaseItems = useMemo(() => [
    { phase: 'menstrual' as PhaseType, colors: PHASE_COLORS_CACHE.menstrual },
    { phase: 'postMenstrual' as PhaseType, colors: PHASE_COLORS_CACHE.postMenstrual },
    { phase: 'fertile' as PhaseType, colors: PHASE_COLORS_CACHE.fertile },
    { phase: 'ovulation' as PhaseType, colors: PHASE_COLORS_CACHE.ovulation },
    { phase: 'preMenstrual' as PhaseType, colors: PHASE_COLORS_CACHE.preMenstrual },
  ], []);

  if (isLoading || !theme) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme?.colors.background || '#000' }]}>
        <LinearGradient
          colors={((theme?.colors.gradients?.primary || ['#FF6B9D', '#FFB4D6']) as [string, string])}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>✨ Carregando...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!cycleData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.text?.primary }]}>
              Configure seu ciclo primeiro
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isLightMode ? 'dark-content' : 'light-content'} />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header compacto */}
          <View style={styles.header}>
            <Pressable 
              style={[styles.navBtn, { backgroundColor: `${theme.colors.primary}15` }]}
              onPress={() => navigateMonth('prev')}
            >
              <Text style={[styles.navBtnText, { color: theme.colors.primary }]}>‹</Text>
            </Pressable>
            
            <Text style={[styles.monthText, { color: theme.colors.text?.primary }]}>
              {currentMonth.format('MMMM YYYY')}
            </Text>
            
            <Pressable 
              style={[styles.navBtn, { backgroundColor: `${theme.colors.primary}15` }]}
              onPress={() => navigateMonth('next')}
            >
              <Text style={[styles.navBtnText, { color: theme.colors.primary }]}>›</Text>
            </Pressable>
          </View>

          <ScrollView 
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Legenda compacta */}
            <View style={[styles.legend, { backgroundColor: theme.colors.surface }]}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.legendContent}
              >
                {phaseItems.map((item) => (
                  <Pressable
                    key={item.phase}
                    style={styles.legendItem}
                    onPress={() => handlePhasePress(item.phase)}
                  >
                    <LinearGradient
                      colors={item.colors}
                      style={styles.legendDot}
                    />
                    <Text style={[styles.legendEmoji]}>
                      {PHASE_INFO[item.phase].emoji}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Header da semana */}
            <View style={styles.weekHeader}>
              {weekDays.map((day) => (
                <View key={day} style={styles.weekDay}>
                  <Text style={[styles.weekDayText, { color: theme.colors.text?.secondary }]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Grid otimizado */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((dayInfo) => (
                <CalendarDay
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

      {/* Modais */}
      <DayDetailModal
        visible={dayModalVisible}
        onClose={closeDayModal}
        dayInfo={selectedDay}
        theme={theme}
      />

      <PhaseEducationModal
        visible={phaseModalVisible}
        onClose={closePhaseModal}
        phase={selectedPhase}
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
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CALENDAR_PADDING,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Scroll
  scroll: {
    flex: 1,
    paddingHorizontal: CALENDAR_PADDING,
  },

  // Legenda
  legend: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  legendContent: {
    paddingHorizontal: 8,
  },
  legendItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    paddingVertical: 4,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  legendEmoji: {
    fontSize: 14,
  },

  // Week header
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDay: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  dayContainer: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  emptyDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    flex: 1,
    borderRadius: DAY_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: DAY_SIZE / 2,
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  pregnancyText: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  phaseIndicator: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Day modal
  dayModal: {
    width: width - 32,
    maxHeight: height * 0.5,
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalDate: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalDay: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    gap: 12,
  },
  phaseCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  phaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phaseDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsSection: {
    borderRadius: 10,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },

  // Phase modal
  phaseModal: {
    width: width - 20,
    height: height * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  phaseModalHeader: {
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  phaseModalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseModalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseModalEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  phaseModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  phaseModalSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  phaseModalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  hormoneInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  hormoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  hormoneText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsContainerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipItem: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  tipItemText: {
    fontSize: 12,
    lineHeight: 16,
  },
});