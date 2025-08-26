// app/symptom-tracker.tsx - Sistema Avançado de Tracking de Sintomas
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeSystem } from '../hooks/useThemeSystem';
import moment from 'moment';

const { width } = Dimensions.get('window');

interface SymptomData {
  date: string;
  symptoms: { [key: string]: number }; // intensidade 1-5
  notes?: string;
}

const SYMPTOM_CATEGORIES = {
  physical: {
    title: 'Sintomas Físicos',
    icon: '💪',
    color: ['#FF6B6B', '#FF8E8E'],
    symptoms: [
      { key: 'cramps', label: 'Cólicas', icon: '💥' },
      { key: 'headache', label: 'Dor de cabeça', icon: '🤕' },
      { key: 'backache', label: 'Dor nas costas', icon: '🏥' },
      { key: 'breast_tenderness', label: 'Sensibilidade nos seios', icon: '🤱' },
      { key: 'bloating', label: 'Inchaço', icon: '🎈' },
      { key: 'nausea', label: 'Náusea', icon: '🤢' },
      { key: 'fatigue', label: 'Fadiga', icon: '😴' },
      { key: 'acne', label: 'Acne', icon: '😣' },
    ]
  },
  emotional: {
    title: 'Sintomas Emocionais',
    icon: '💗',
    color: ['#4ECDC4', '#44B5CC'],
    symptoms: [
      { key: 'mood_swings', label: 'Mudanças de humor', icon: '🎭' },
      { key: 'irritability', label: 'Irritabilidade', icon: '😤' },
      { key: 'anxiety', label: 'Ansiedade', icon: '😰' },
      { key: 'depression', label: 'Tristeza', icon: '😢' },
      { key: 'crying', label: 'Vontade de chorar', icon: '😭' },
      { key: 'confusion', label: 'Confusão mental', icon: '🤯' },
    ]
  },
  behavioral: {
    title: 'Sintomas Comportamentais',
    icon: '🏃‍♀️',
    color: ['#A8E6CF', '#7FCDCD'],
    symptoms: [
      { key: 'appetite_changes', label: 'Mudanças no apetite', icon: '🍽️' },
      { key: 'sleep_issues', label: 'Problemas de sono', icon: '🛏️' },
      { key: 'concentration', label: 'Falta de concentração', icon: '🧠' },
      { key: 'libido_changes', label: 'Mudanças na libido', icon: '💕' },
      { key: 'social_withdrawal', label: 'Isolamento social', icon: '🚫' },
    ]
  }
};

const INTENSITY_LEVELS = [
  { value: 1, label: 'Leve', emoji: '🟢', color: '#4CAF50' },
  { value: 2, label: 'Moderado', emoji: '🟡', color: '#FFC107' },
  { value: 3, label: 'Médio', emoji: '🟠', color: '#FF9800' },
  { value: 4, label: 'Forte', emoji: '🔴', color: '#F44336' },
  { value: 5, label: 'Muito Forte', emoji: '⚫', color: '#9C27B0' },
];

export default function SymptomTrackerScreen() {
  const { theme } = useThemeSystem();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [symptoms, setSymptoms] = useState<{ [key: string]: number }>({});
  const [allSymptomData, setAllSymptomData] = useState<SymptomData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('physical');

  useEffect(() => {
    loadSymptomData();
  }, []);

  useEffect(() => {
    const dataForDate = allSymptomData.find(data => data.date === selectedDate);
    setSymptoms(dataForDate?.symptoms || {});
  }, [selectedDate, allSymptomData]);

  const loadSymptomData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('symptomTracker');
      if (storedData) {
        setAllSymptomData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de sintomas:', error);
    }
  };

  const saveSymptomData = async () => {
    try {
      const existingDataIndex = allSymptomData.findIndex(data => data.date === selectedDate);
      let updatedData;

      const symptomsToSave = { date: selectedDate, symptoms };

      if (existingDataIndex >= 0) {
        updatedData = [...allSymptomData];
        updatedData[existingDataIndex] = symptomsToSave;
      } else {
        updatedData = [...allSymptomData, symptomsToSave];
      }

      await AsyncStorage.setItem('symptomTracker', JSON.stringify(updatedData));
      setAllSymptomData(updatedData);
      Alert.alert('Sucesso', 'Sintomas salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar sintomas:', error);
      Alert.alert('Erro', 'Não foi possível salvar os sintomas.');
    }
  };

  const setSymptomIntensity = (symptomKey: string, intensity: number) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomKey]: intensity
    }));
  };

  const getSymptomIntensity = (symptomKey: string) => {
    return symptoms[symptomKey] || 0;
  };

  const clearSymptom = (symptomKey: string) => {
    setSymptoms(prev => {
      const updated = { ...prev };
      delete updated[symptomKey];
      return updated;
    });
  };

  const getSymptomStats = () => {
    const today = moment(selectedDate);
    const weekData = allSymptomData.filter(data => {
      const dataDate = moment(data.date);
      return dataDate.isBetween(today.clone().subtract(7, 'days'), today, null, '[]');
    });

    const totalSymptoms = Object.keys(symptoms).length;
    const avgIntensity = totalSymptoms > 0 
      ? Object.values(symptoms).reduce((a, b) => a + b, 0) / totalSymptoms 
      : 0;

    return {
      totalToday: totalSymptoms,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      weeklyEntries: weekData.length,
    };
  };

  const renderDateSelector = () => {
    const dates = [];
    for (let i = -6; i <= 0; i++) {
      const date = moment().add(i, 'days');
      dates.push({
        date: date.format('YYYY-MM-DD'),
        display: date.format('DD/MM'),
        dayName: date.format('ddd'),
        isToday: i === 0,
      });
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dateSelector}
        contentContainerStyle={styles.dateSelectorContent}
      >
        {dates.map((item) => (
          <TouchableOpacity
            key={item.date}
            style={[
              styles.dateItem,
              {
                backgroundColor: selectedDate === item.date 
                  ? theme?.colors.primary 
                  : 'rgba(255,255,255,0.2)'
              }
            ]}
            onPress={() => setSelectedDate(item.date)}
          >
            <Text style={[
              styles.dateDayName,
              { color: selectedDate === item.date ? 'white' : theme?.colors.text }
            ]}>
              {item.dayName}
            </Text>
            <Text style={[
              styles.dateDisplay,
              { color: selectedDate === item.date ? 'white' : theme?.colors.text }
            ]}>
              {item.display}
            </Text>
            {item.isToday && (
              <Text style={styles.todayIndicator}>Hoje</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderCategoryTabs = () => (
    <View style={styles.categoryTabs}>
      {Object.entries(SYMPTOM_CATEGORIES).map(([key, category]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.categoryTab,
            { backgroundColor: selectedCategory === key ? 'white' : 'rgba(255,255,255,0.2)' }
          ]}
          onPress={() => setSelectedCategory(key)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[
            styles.categoryLabel,
            { color: selectedCategory === key ? theme?.colors.primary : 'white' }
          ]}>
            {category.title.split(' ')[0]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSymptomGrid = () => {
    const category = SYMPTOM_CATEGORIES[selectedCategory as keyof typeof SYMPTOM_CATEGORIES];
    
    return (
      <View style={styles.symptomGrid}>
        {category.symptoms.map((symptom) => {
          const intensity = getSymptomIntensity(symptom.key);
          const isSelected = intensity > 0;

          return (
            <View key={symptom.key} style={styles.symptomCard}>
              <View style={styles.symptomHeader}>
                <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                <Text style={styles.symptomLabel}>{symptom.label}</Text>
                {isSelected && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => clearSymptom(symptom.key)}
                  >
                    <Text style={styles.clearButtonText}>✖</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.intensitySelector}>
                {INTENSITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.intensityButton,
                      {
                        backgroundColor: intensity === level.value ? level.color : 'rgba(255,255,255,0.2)',
                        borderColor: intensity === level.value ? level.color : 'transparent',
                      }
                    ]}
                    onPress={() => setSymptomIntensity(symptom.key, level.value)}
                  >
                    <Text style={[
                      styles.intensityEmoji,
                      { opacity: intensity === level.value ? 1 : 0.6 }
                    ]}>
                      {level.emoji}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {isSelected && (
                <Text style={styles.intensityLabel}>
                  {INTENSITY_LEVELS.find(l => l.value === intensity)?.label}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderStats = () => {
    const stats = getSymptomStats();
    
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Resumo de Hoje</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalToday}</Text>
            <Text style={styles.statLabel}>Sintomas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgIntensity}</Text>
            <Text style={styles.statLabel}>Intensidade Média</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.weeklyEntries}</Text>
            <Text style={styles.statLabel}>Registros (7 dias)</Text>
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Rastreamento de Sintomas 📊</Text>
            <Text style={styles.subtitle}>
              Monitore seus sintomas e identifique padrões
            </Text>
          </View>

          {renderDateSelector()}
          {renderStats()}
          {renderCategoryTabs()}
          {renderSymptomGrid()}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveSymptomData}
          >
            <Text style={styles.saveButtonText}>Salvar Sintomas</Text>
          </TouchableOpacity>

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
  dateSelector: {
    marginBottom: 20,
  },
  dateSelectorContent: {
    paddingHorizontal: 10,
  },
  dateItem: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 60,
  },
  dateDayName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateDisplay: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  todayIndicator: {
    fontSize: 10,
    color: 'white',
    marginTop: 2,
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
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryTab: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  symptomGrid: {
    marginBottom: 20,
  },
  symptomCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  symptomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  symptomIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  symptomLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    flex: 1,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
  },
  intensitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  intensityEmoji: {
    fontSize: 16,
  },
  intensityLabel: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  bottomSpace: {
    height: 30,
  },
});