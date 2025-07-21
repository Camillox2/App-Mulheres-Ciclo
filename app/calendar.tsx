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
  Image, // Importar o componente Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { getDayInfo, DayInfo } from '../hooks/cycleCalculations';
import { PHASE_INFO } from '../constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const CALENDAR_PADDING = 20;
const CALENDAR_WIDTH = width - (CALENDAR_PADDING * 2);
const DAY_SIZE = Math.floor((CALENDAR_WIDTH - 42) / 7);

// Certifique-se de que a sua logo está neste caminho
const logoFour = require('../assets/images/logoFour.png');

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

type PhaseType = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

const BEAUTIFUL_COLORS = {
  menstrual: {
    gradient: ['#FF9A9E', '#FECFEF'],
    primary: '#FF6B9D',
    text: '#FFFFFF'
  },
  postMenstrual: {
    gradient: ['#A8E6CF', '#DCEDC1'],
    primary: '#27AE60',
    text: '#FFFFFF'
  },
  fertile: {
    gradient: ['#FFB347', '#FFD93D'],
    primary: '#FF8C42',
    text: '#FFFFFF'
  },
  ovulation: {
    gradient: ['#FFE066', '#FFF176'],
    primary: '#FFC107',
    text: '#2C2C2C'
  },
  preMenstrual: {
    gradient: ['#B39DDB', '#E1BEE7'],
    primary: '#9C27B0',
    text: '#FFFFFF'
  }
};

const BeautifulCalendarDay = React.memo<{
  dayInfo: DayInfo;
  onPress: (dayInfo: DayInfo) => void;
  theme: any;
}>(({ dayInfo, onPress, theme }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();
    onPress(dayInfo);
  }, [dayInfo, onPress, scaleAnim]);

  useEffect(() => {
    if (dayInfo.isToday) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [dayInfo.isToday, pulseAnim]);

  if (!dayInfo.isCurrentMonth) {
    return <View style={[styles.dayContainer, { width: DAY_SIZE, height: DAY_SIZE }]} />;
  }

  const phaseColors = BEAUTIFUL_COLORS[dayInfo.phase];
  const intensity = Math.max(0.3, dayInfo.phaseIntensity);

  return (
    <View style={[styles.dayContainer, { width: DAY_SIZE, height: DAY_SIZE }]}>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }, { scale: dayInfo.isToday ? pulseAnim : 1 }] }]}>
        <TouchableOpacity
          style={[styles.modernDayButton, dayInfo.isToday && styles.todayButton]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={phaseColors.gradient.map(color => `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`) as [string, string, ...string[]]}
            style={styles.dayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.dayContent}>
            <Text style={[styles.modernDayNumber, { color: dayInfo.isToday ? theme.colors.primary : phaseColors.text, fontSize: dayInfo.isToday ? 18 : 16, fontWeight: dayInfo.isToday ? '800' : '600' }]}>
              {dayInfo.date.format('D')}
            </Text>
            <View style={styles.indicators}>
              {dayInfo.pregnancyChance > 20 && <View style={[styles.fertilityDot, { backgroundColor: phaseColors.primary }]} />}
              <View style={[styles.phaseDot, { backgroundColor: phaseColors.primary }]} />
            </View>
            {dayInfo.isToday && <View style={[styles.todayBorder, { borderColor: theme.colors.primary }]} />}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

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
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!dayInfo) return null;

  const phaseInfo = PHASE_INFO[dayInfo.phase];
  const phaseColors = BEAUTIFUL_COLORS[dayInfo.phase];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <Animated.View style={[styles.beautifulModal, { backgroundColor: theme.colors.surface, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient colors={phaseColors.gradient as [string, string, ...string[]]} style={styles.modalHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            <View style={styles.modalHeaderContent}>
              <Image source={logoFour} style={styles.modalLogo} />
              <Text style={styles.modalDate}>{dayInfo.date.format('DD')}</Text>
              <Text style={styles.modalDayName}>{dayInfo.date.format('dddd, DD [de] MMMM')}</Text>
            </View>
          </LinearGradient>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={[styles.phaseSection, { borderLeftColor: phaseInfo.color }]}>
              <Text style={[styles.phaseName, { color: theme.colors.text.primary }]}>{phaseInfo.name}</Text>
              <Text style={[styles.phaseDescription, { color: theme.colors.text.secondary }]}>{phaseInfo.description}</Text>
            </View>
            <View style={[styles.tipsSection, { backgroundColor: `${phaseInfo.color}1A` }]}>
              <Text style={[styles.tipsTitle, { color: phaseInfo.color }]}>💡 Dicas para hoje</Text>
              {phaseInfo.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={[styles.tipBullet, { color: phaseInfo.color }]}>•</Text>
                  <Text style={[styles.tipText, { color: theme.colors.text.primary }]}>{tip}</Text>
                </View>
              ))}
            </View>
            <View style={styles.statsSection}>
              <View style={[styles.statItem, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Dia do Ciclo</Text>
                <Text style={[styles.statValue, { color: phaseInfo.color }]}>{dayInfo.dayOfCycle}º</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Fertilidade</Text>
                <Text style={[styles.statValue, { color: phaseInfo.color }]}>{dayInfo.pregnancyChance}%</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

export default function BeautifulCalendarScreen() {
  const { theme, isDarkMode } = useAdaptiveTheme();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem('cycleData');
        if (data) setCycleData(JSON.parse(data));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }
    };
    loadData();
  }, [fadeAnim]);

  const calendarDays = useMemo(() => {
    if (!cycleData) return [];
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');
    const days: DayInfo[] = [];
    let current = startOfWeek.clone();
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

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? prev.clone().subtract(1, 'month') : prev.clone().add(1, 'month'));
  }, []);

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <LinearGradient colors={['#FF9A9E', '#FECFEF']} style={styles.loadingGradient}>
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
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>Configure seu ciclo primeiro</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>Vá em Configurações para definir os dados do seu ciclo menstrual</Text>
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
          <LinearGradient colors={[theme.colors.surface, `${theme.colors.surface}F0`]} style={styles.header}>
            <TouchableOpacity style={[styles.navButton, { backgroundColor: `${theme.colors.primary}15` }]} onPress={() => navigateMonth('prev')}>
              <Text style={[styles.navIcon, { color: theme.colors.primary }]}>‹</Text>
            </TouchableOpacity>
            <View style={styles.monthContainer}>
              <Text style={[styles.monthText, { color: theme.colors.text.primary }]}>{currentMonth.format('MMMM')}</Text>
              <Text style={[styles.yearText, { color: theme.colors.text.secondary }]}>{currentMonth.format('YYYY')}</Text>
            </View>
            <TouchableOpacity style={[styles.navButton, { backgroundColor: `${theme.colors.primary}15` }]} onPress={() => navigateMonth('next')}>
              <Text style={[styles.navIcon, { color: theme.colors.primary }]}>›</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
            <View style={[styles.legend, { backgroundColor: theme.colors.surface }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendContent}>
                {Object.entries(PHASE_INFO).map(([phase, info]) => (
                  <View key={phase} style={styles.legendItem}>
                    <LinearGradient colors={BEAUTIFUL_COLORS[phase as PhaseType].gradient as [string, string, ...string[]]} style={styles.legendDot} />
                    <Image source={logoFour} style={styles.legendLogo} />
                    <Text style={[styles.legendText, { color: theme.colors.text.secondary }]}>{info.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={styles.weekHeader}>
              {weekDays.map((day) => (
                <View key={day} style={[styles.weekDay, { width: DAY_SIZE }]}>
                  <Text style={[styles.weekDayText, { color: theme.colors.text.secondary }]}>{day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map((dayInfo) => (
                <BeautifulCalendarDay key={dayInfo.date.format('YYYY-MM-DD')} dayInfo={dayInfo} onPress={handleDayPress} theme={theme} />
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
      <BeautifulDayModal visible={modalVisible} onClose={handleCloseModal} dayInfo={selectedDay} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  // =================================
  // Contenedores Principais e Layout
  // =================================
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1 },

  // =================================
  // Ecrãs de Estado (Loading, Vazio)
  // =================================
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  loadingText: { color: 'white', fontSize: 20, fontWeight: '700' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 80, marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  emptySubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },

  // =================================
  // Cabeçalho do Calendário (Header)
  // =================================
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: CALENDAR_PADDING, paddingVertical: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  navButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  navIcon: { fontSize: 24, fontWeight: 'bold' },
  monthContainer: { alignItems: 'center' },
  monthText: { fontSize: 24, fontWeight: '700', textTransform: 'capitalize' },
  yearText: { fontSize: 14, fontWeight: '500', marginTop: 2 },

  // =================================
  // Conteúdo do Calendário (Scroll)
  // =================================
  scroll: { flex: 1, paddingHorizontal: CALENDAR_PADDING },
  legend: { borderRadius: 16, paddingVertical: 10, marginVertical: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  legendContent: { paddingHorizontal: 16, alignItems: 'center' },
  legendItem: { alignItems: 'center', marginHorizontal: 12 },
  legendDot: { width: 20, height: 20, borderRadius: 10, marginBottom: 6 },
  legendLogo: { width: 18, height: 18, marginBottom: 6 },
  legendText: { fontSize: 11, fontWeight: '600' },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, paddingHorizontal: 3 },
  weekDay: { alignItems: 'center', paddingVertical: 8 },
  weekDayText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingBottom: 30 },
  
  // =================================
  // Componentes de Dia do Calendário
  // =================================
  dayContainer: { marginBottom: 6, alignItems: 'center', justifyContent: 'center' },
  modernDayButton: { width: DAY_SIZE - 4, height: DAY_SIZE - 4, borderRadius: (DAY_SIZE - 4) / 2, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  todayButton: { borderWidth: 3, borderColor: 'transparent' },
  dayGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dayContent: { alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', height: '100%' },
  modernDayNumber: { fontWeight: '600', width: '100%', textAlign: 'center' },
  indicators: { flexDirection: 'row', position: 'absolute', bottom: 4, alignItems: 'center' },
  fertilityDot: { width: 4, height: 4, borderRadius: 2, marginRight: 2 },
  phaseDot: { width: 3, height: 3, borderRadius: 1.5 },
  todayBorder: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: DAY_SIZE / 2, borderWidth: 2 },
  
  // =================================
  // Modal de Detalhes do Dia
  // =================================
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  modalBackground: { ...StyleSheet.absoluteFillObject },
  beautifulModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.8, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.25, shadowRadius: 12 },
  modalHeader: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingVertical: 15, paddingHorizontal: 24, position: 'relative' },
  modalCloseButton: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCloseText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  modalHeaderContent: { alignItems: 'center' },
  modalLogo: { width: 40, height: 40, marginBottom: 8 },
  modalDate: { fontSize: 36, fontWeight: '800', color: 'white', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  modalDayName: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', textTransform: 'capitalize' },
  modalBody: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 20 },
  phaseSection: { borderLeftWidth: 4, paddingLeft: 16, marginBottom: 20 },
  phaseName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  phaseDescription: { fontSize: 16, lineHeight: 22 },
  statsSection: { flexDirection: 'row', marginTop: 24, gap: 12 },
  statItem: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  tipsSection: { borderRadius: 12, padding: 16, marginBottom: 10 },
  tipsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  tipBullet: { fontSize: 14, marginRight: 10, lineHeight: 22 },
  tipText: { fontSize: 14, lineHeight: 22, fontWeight: '500', flex: 1 },
});