// app/calendar.tsx - REDESIGN COMPLETO
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { getDayInfo, DayInfo } from '../hooks/cycleCalculations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React from 'react';

const { width, height } = Dimensions.get('window');
const CALENDAR_PADDING = 20;
const CALENDAR_WIDTH = width - (CALENDAR_PADDING * 2);
const DAY_SIZE = (CALENDAR_WIDTH - 60) / 7; // 60 = gaps between days

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

interface CalendarDayProps {
  dayInfo: DayInfo;
  onPress: (dayInfo: DayInfo) => void;
  theme: any;
  index: number;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ dayInfo, onPress, theme, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada escalonada
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 15,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress(dayInfo);
    });
  };

  const getPhaseColor = () => {
    const colors = {
      menstrual: ['#FF6B9D', '#E74C3C'],
      postMenstrual: ['#58D68D', '#27AE60'],
      fertile: ['#FFD700', '#FF6347'],
      ovulation: ['#FFD700', '#FFA500'],
      preMenstrual: ['#BB86FC', '#8E44AD'],
    };
    return colors[dayInfo.phase];
  };

  const getIntensityOpacity = () => {
    return Math.max(0.3, dayInfo.phaseIntensity * 0.8);
  };

  return (
    <Animated.View
      style={[
        styles.dayContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.dayButton,
          {
            backgroundColor: dayInfo.isCurrentMonth 
              ? `${getPhaseColor()[0]}20` 
              : 'transparent',
            borderColor: dayInfo.isToday 
              ? theme.colors.primary 
              : 'transparent',
            borderWidth: dayInfo.isToday ? 2 : 0,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {dayInfo.isCurrentMonth && (
          <LinearGradient
            colors={[
              `${getPhaseColor()[0]}${Math.round(getIntensityOpacity() * 255).toString(16).padStart(2, '0')}`,
              `${getPhaseColor()[1]}${Math.round(getIntensityOpacity() * 255).toString(16).padStart(2, '0')}`,
            ]}
            style={styles.dayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        
        <View style={styles.dayContent}>
          <Text
            style={[
              styles.dayNumber,
              {
                color: dayInfo.isCurrentMonth 
                  ? (dayInfo.isToday ? theme.colors.primary : 'white')
                  : theme.colors.secondary,
                fontWeight: dayInfo.isToday ? 'bold' : '600',
                fontSize: dayInfo.isToday ? 18 : 16,
              },
            ]}
          >
            {dayInfo.date.format('D')}
          </Text>
          
          {dayInfo.isCurrentMonth && (
            <View style={styles.dayInfo}>
              <Text style={styles.pregnancyChance}>
                {dayInfo.pregnancyChance}%
              </Text>
              <View style={[styles.phaseIndicator, { backgroundColor: getPhaseColor()[0] }]} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CalendarScreen() {
  const { theme, isLightMode } = useAdaptiveTheme();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const legendScale = useRef(new Animated.Value(0.8)).current;
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCycleData();
  }, []);

  useEffect(() => {
    if (cycleData) {
      generateCalendarDays();
    }
  }, [currentMonth, cycleData]);

  useEffect(() => {
    // Animações de entrada
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(legendScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const loadCycleData = async () => {
    try {
      const data = await AsyncStorage.getItem('cycleData');
      if (data) {
        setCycleData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do ciclo:', error);
    }
  };

  const generateCalendarDays = () => {
    if (!cycleData) return;

    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');

    const days: DayInfo[] = [];
    const current = startOfWeek.clone();

    while (current.isSameOrBefore(endOfWeek, 'day')) {
      const dayInfo = getDayInfo(current.clone(), cycleData, currentMonth);
      days.push(dayInfo);
      current.add(1, 'day');
    }

    setCalendarDays(days);
  };

  const handleDayPress = (dayInfo: DayInfo) => {
    setSelectedDay(dayInfo);
    setModalVisible(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' 
      ? currentMonth.clone().subtract(1, 'month')
      : currentMonth.clone().add(1, 'month');
    
    setCurrentMonth(newMonth);
  };

  type PhaseType = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

  const getPhaseDescription = (phase: PhaseType) => {
    const descriptions: Record<PhaseType, string> = {
      menstrual: 'Período menstrual - tempo de renovação e autocuidado',
      postMenstrual: 'Pós-menstrual - energia renovada e disposição',
      fertile: 'Período fértil - alta probabilidade de concepção',
      ovulation: 'Ovulação - pico de fertilidade',
      preMenstrual: 'Pré-menstrual - preparação para o próximo ciclo',
    };
    return descriptions[phase] || '';
  };

  const getPhaseEmoji = (phase: PhaseType) => {
    const emojis: Record<PhaseType, string> = {
      menstrual: '🌸',
      postMenstrual: '🌱',
      fertile: '🔥',
      ovulation: '⭐',
      preMenstrual: '💜',
    };
    return emojis[phase] || '';
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (!theme || !cycleData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme?.colors.background }]}>
        <LinearGradient
          colors={Array.isArray(theme?.colors.gradients) && theme.colors.gradients.length >= 2
            ? (theme.colors.gradients as unknown as [import('react-native').ColorValue, import('react-native').ColorValue, ...import('react-native').ColorValue[]])
            : ['#FF6B9D', '#FFB4D6']}
          style={styles.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.loadingText}>Carregando calendário...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isLightMode ? 'dark-content' : 'light-content'} />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header do Calendário */}
        <Animated.View style={[styles.calendarHeader, { opacity: headerOpacity }]}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: `${theme.colors.primary}15` }]}
              onPress={() => navigateMonth('prev')}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>‹</Text>
            </TouchableOpacity>
            
            <View style={styles.monthTitleContainer}>
              <Text style={[styles.monthTitle, { color: theme.colors.primary }]}>
                {currentMonth.format('MMMM')}
              </Text>
              <Text style={[styles.yearTitle, { color: theme.colors.secondary }]}>
                {currentMonth.format('YYYY')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.navButton, { backgroundColor: `${theme.colors.primary}15` }]}
              onPress={() => navigateMonth('next')}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Legenda das Fases */}
        <Animated.View 
          style={[
            styles.legendContainer, 
            { 
              backgroundColor: theme.colors.surface,
              transform: [{ scale: legendScale }],
            }
          ]}
        >
          <Text style={[styles.legendTitle, { color: theme.colors.primary }]}>
            Fases do Ciclo
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.legendContent}
          >
            {([
              { phase: 'menstrual' as PhaseType, name: 'Menstruação', colors: ['#FF6B9D', '#E74C3C'] as [import('react-native').ColorValue, import('react-native').ColorValue] },
              { phase: 'postMenstrual' as PhaseType, name: 'Pós-Menstrual', colors: ['#58D68D', '#27AE60'] as [import('react-native').ColorValue, import('react-native').ColorValue] },
              { phase: 'fertile' as PhaseType, name: 'Fértil', colors: ['#FFD700', '#FF6347'] as [import('react-native').ColorValue, import('react-native').ColorValue] },
              { phase: 'ovulation' as PhaseType, name: 'Ovulação', colors: ['#FFD700', '#FFA500'] as [import('react-native').ColorValue, import('react-native').ColorValue] },
              { phase: 'preMenstrual' as PhaseType, name: 'Pré-Menstrual', colors: ['#BB86FC', '#8E44AD'] as [import('react-native').ColorValue, import('react-native').ColorValue] },
            ]).map((item) => (
              <View key={item.phase} style={styles.legendItem}>
                <LinearGradient
                  colors={item.colors}
                  style={styles.legendColor}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={[styles.legendText, { color: theme.colors.primary }]}>
                  {getPhaseEmoji(item.phase)} {item.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Cabeçalho dos dias da semana */}
        <View style={styles.weekHeader}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayContainer}>
              <Text style={[styles.weekDayText, { color: theme.colors.secondary }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Grid do calendário */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((dayInfo, index) => (
            <CalendarDay
              key={`${dayInfo.date.format('YYYY-MM-DD')}-${index}`}
              dayInfo={dayInfo}
              onPress={handleDayPress}
              theme={theme}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modal de detalhes do dia */}
      {modalVisible && selectedDay && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
              },
            ]}
          >
            <BlurView intensity={80} style={styles.modalBlur}>
              <LinearGradient
                colors={[
                  `${theme.colors.surface}F5`,
                  `${theme.colors.surface}E8`,
                ]}
                style={styles.modalContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Header do Modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Text style={[styles.modalDate, { color: theme.colors.primary }]}>
                      {selectedDay.date.format('DD')}
                    </Text>
                    <View>
                      <Text style={[styles.modalDateText, { color: theme.colors.primary }]}>
                        {selectedDay.date.format('dddd')}
                      </Text>
                      <Text style={[styles.modalDateSubtext, { color: theme.colors.secondary }]}>
                        {selectedDay.date.format('MMMM YYYY')}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: `${theme.colors.primary}15` }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* Informações da fase */}
                <View style={styles.modalBody}>
                  <View style={[styles.phaseCard, { backgroundColor: `${theme.colors.primary}10` }]}>
                    <Text style={[styles.phaseEmoji, { fontSize: 32 }]}>
                      {getPhaseEmoji(selectedDay.phase)}
                    </Text>
                    <Text style={[styles.phaseName, { color: theme.colors.primary }]}>
                      {selectedDay.phase === 'menstrual' ? 'Menstruação' :
                       selectedDay.phase === 'postMenstrual' ? 'Pós-Menstrual' :
                       selectedDay.phase === 'fertile' ? 'Período Fértil' :
                       selectedDay.phase === 'ovulation' ? 'Ovulação' :
                       'Pré-Menstrual'}
                    </Text>
                    <Text style={[styles.phaseDescription, { color: theme.colors.secondary }]}>
                      {getPhaseDescription(selectedDay.phase)}
                    </Text>
                  </View>

                  {/* Estatísticas */}
                  <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
                        Dia do Ciclo
                      </Text>
                      <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                        {selectedDay.dayOfCycle}
                      </Text>
                    </View>
                    
                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
                        Chance de Gravidez
                      </Text>
                      <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                        {selectedDay.pregnancyChance}%
                      </Text>
                    </View>
                    
                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[styles.statLabel, { color: theme.colors.secondary }]}>
                        Intensidade
                      </Text>
                      <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                        {Math.round(selectedDay.phaseIntensity * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </View>
      )}
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: CALENDAR_PADDING,
  },
  calendarHeader: {
    paddingVertical: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  yearTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  legendContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  legendContent: {
    paddingHorizontal: 10,
  },
  legendItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 80,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayContainer: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 30,
  },
  dayContainer: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    marginHorizontal: 4,
    marginVertical: 4,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayInfo: {
    alignItems: 'center',
  },
  pregnancyChance: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  phaseIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width - 40,
    maxHeight: height * 0.7,
    borderRadius: 25,
    overflow: 'hidden',
  },
  modalBlur: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDate: {
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: 15,
  },
  modalDateText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalDateSubtext: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  phaseCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  phaseEmoji: {
    marginBottom: 10,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  phaseDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});