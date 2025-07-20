// app/calendar.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React from 'react';

const { width } = Dimensions.get('window');
const dayWidth = (width - 40) / 7;

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

interface DayInfo {
  date: moment.Moment;
  phase: 'menstrual' | 'postMenstrual' | 'fertile' | 'preMenstrual' | 'ovulation';
  pregnancyChance: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayOfCycle: number;
}

export default function CalendarScreen() {
  const { theme, isLightMode } = useAdaptiveTheme();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCycleData();
  }, []);

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

  const getDayInfo = (date: moment.Moment): DayInfo => {
    if (!cycleData) {
      return {
        date,
        phase: 'menstrual',
        pregnancyChance: 0,
        isToday: date.isSame(moment(), 'day'),
        isCurrentMonth: date.isSame(currentMonth, 'month'),
        dayOfCycle: 1,
      };
    }

    const lastPeriod = moment(cycleData.lastPeriodDate);
    const daysSinceLastPeriod = date.diff(lastPeriod, 'days');
    const dayOfCycle = ((daysSinceLastPeriod % cycleData.averageCycleLength) + cycleData.averageCycleLength) % cycleData.averageCycleLength + 1;
    
    let phase: DayInfo['phase'];
    let pregnancyChance: number;

    // Determina a fase
    if (dayOfCycle >= 1 && dayOfCycle <= cycleData.averagePeriodLength) {
      phase = 'menstrual';
      pregnancyChance = Math.random() * 10 + 1; // 1-10%
    } else if (dayOfCycle >= cycleData.averagePeriodLength + 1 && dayOfCycle <= 11) {
      phase = 'postMenstrual';
      pregnancyChance = Math.random() * 15 + 10; // 10-25%
    } else if (dayOfCycle >= 12 && dayOfCycle <= 16) {
      if (dayOfCycle === cycleData.averageCycleLength - 14) {
        phase = 'ovulation';
        pregnancyChance = Math.random() * 10 + 30; // 30-40%
      } else {
        phase = 'fertile';
        pregnancyChance = Math.random() * 15 + 20; // 20-35%
      }
    } else {
      phase = 'preMenstrual';
      pregnancyChance = Math.random() * 10 + 5; // 5-15%
    }

    return {
      date,
      phase,
      pregnancyChance: Math.round(pregnancyChance),
      isToday: date.isSame(moment(), 'day'),
      isCurrentMonth: date.isSame(currentMonth, 'month'),
      dayOfCycle,
    };
  };

  const getPhaseColor = (phase: DayInfo['phase'], isLight: boolean) => {
    const colors = {
      menstrual: isLight ? '#FF6B9D' : '#E74C3C',
      postMenstrual: isLight ? '#58D68D' : '#27AE60',
      fertile: isLight ? '#FF6347' : '#FF4500',
      ovulation: isLight ? '#FFD700' : '#FFA500',
      preMenstrual: isLight ? '#BB86FC' : '#8E44AD',
    };
    return colors[phase];
  };

  const getPhaseEmoji = (phase: DayInfo['phase']) => {
    const emojis = {
      menstrual: '🌸',
      postMenstrual: '🌱',
      fertile: '🔥',
      ovulation: '⭐',
      preMenstrual: '💜',
    };
    return emojis[phase];
  };

  const getPhaseDescription = (phase: DayInfo['phase']) => {
    const descriptions = {
      menstrual: 'Período menstrual - tempo de renovação e autocuidado',
      postMenstrual: 'Pós-menstrual - energia renovada e disposição',
      fertile: 'Período fértil - alta probabilidade de concepção',
      ovulation: 'Ovulação - pico de fertilidade',
      preMenstrual: 'Pré-menstrual - preparação para o próximo ciclo',
    };
    return descriptions[phase];
  };

  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');

    const days: DayInfo[] = [];
    const current = startOfWeek.clone();

    while (current.isSameOrBefore(endOfWeek, 'day')) {
      days.push(getDayInfo(current.clone()));
      current.add(1, 'day');
    }

    return days;
  };

  const handleDayPress = (dayInfo: DayInfo) => {
    setSelectedDay(dayInfo);
    setModalVisible(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(current => 
      direction === 'prev' 
        ? current.clone().subtract(1, 'month')
        : current.clone().add(1, 'month')
    );
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (!theme) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>‹</Text>
          </TouchableOpacity>
          
          <Text style={[styles.monthTitle, { color: theme.colors.primary }]}>
            {currentMonth.format('MMMM YYYY')}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Legenda das fases */}
        <View style={styles.legend}>
          <Text style={[styles.legendTitle, { color: theme.colors.primary }]}>
            Legenda das Fases
          </Text>
          <View style={styles.legendItems}>
            {['menstrual', 'postMenstrual', 'fertile', 'ovulation', 'preMenstrual'].map((phase) => (
              <View key={phase} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor,
                    { backgroundColor: getPhaseColor(phase as DayInfo['phase'], isLightMode) }
                  ]}
                />
                <Text style={[styles.legendText, { color: theme.colors.primary }]}>
                  {getPhaseEmoji(phase as DayInfo['phase'])} {
                    phase === 'menstrual' ? 'Menstruação' :
                    phase === 'postMenstrual' ? 'Pós-Menstrual' :
                    phase === 'fertile' ? 'Fértil' :
                    phase === 'ovulation' ? 'Ovulação' :
                    'Pré-Menstrual'
                  }
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cabeçalho dos dias da semana */}
        <View style={styles.weekHeader}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDay}>
              <Text style={[styles.weekDayText, { color: theme.colors.primary }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Grid do calendário */}
        <View style={styles.calendar}>
          {calendarDays.map((dayInfo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                {
                  backgroundColor: dayInfo.isCurrentMonth 
                    ? getPhaseColor(dayInfo.phase, isLightMode)
                    : 'transparent',
                  opacity: dayInfo.isCurrentMonth ? 1 : 0.3,
                  borderColor: dayInfo.isToday ? '#000' : 'transparent',
                  borderWidth: dayInfo.isToday ? 2 : 0,
                }
              ]}
              onPress={() => handleDayPress(dayInfo)}
            >
              <Text style={[
                styles.dayNumber,
                { 
                  color: dayInfo.isCurrentMonth ? 'white' : theme.colors.primary,
                  fontWeight: dayInfo.isToday ? 'bold' : 'normal'
                }
              ]}>
                {dayInfo.date.format('D')}
              </Text>
              {dayInfo.isCurrentMonth && (
                <Text style={styles.pregnancyChance}>
                  {dayInfo.pregnancyChance}%
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal de detalhes do dia */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {selectedDay && (
              <>
                <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
                  {selectedDay.date.format('DD/MM/YYYY')}
                </Text>
                
                <View style={styles.modalBody}>
                  <Text style={[styles.modalPhase, { color: getPhaseColor(selectedDay.phase, isLightMode) }]}>
                    {getPhaseEmoji(selectedDay.phase)} {
                      selectedDay.phase === 'menstrual' ? 'Menstruação' :
                      selectedDay.phase === 'postMenstrual' ? 'Pós-Menstrual' :
                      selectedDay.phase === 'fertile' ? 'Período Fértil' :
                      selectedDay.phase === 'ovulation' ? 'Ovulação' :
                      'Pré-Menstrual'
                    }
                  </Text>
                  
                  <Text style={[styles.modalDescription, { color: theme.colors.primary }]}>
                    {getPhaseDescription(selectedDay.phase)}
                  </Text>
                  
                  <View style={styles.modalStats}>
                    <View style={styles.modalStat}>
                      <Text style={[styles.modalStatLabel, { color: theme.colors.secondary }]}>
                        Dia do Ciclo
                      </Text>
                      <Text style={[styles.modalStatValue, { color: theme.colors.primary }]}>
                        {selectedDay.dayOfCycle}
                      </Text>
                    </View>
                    
                    <View style={styles.modalStat}>
                      <Text style={[styles.modalStatLabel, { color: theme.colors.secondary }]}>
                        Chance de Gravidez
                      </Text>
                      <Text style={[styles.modalStatValue, { color: theme.colors.primary }]}>
                        {selectedDay.pregnancyChance}%
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    textTransform: 'capitalize',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  legend: {
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    width: '48%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    width: dayWidth,
    alignItems: 'center',
    paddingVertical: 10,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  dayContainer: {
    width: dayWidth,
    height: dayWidth,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 5,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  pregnancyChance: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBody: {
    marginBottom: 25,
  },
  modalPhase: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});