// app/menopause.tsx - Página dedicada à Menopausa
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

interface MenopauseData {
  age: number;
  lastPeriodDate?: string;
  symptoms: string[];
  stage: 'premenopausa' | 'perimenopausa' | 'menopausa' | 'pos-menopausa';
  trackedSince: string;
}

const MENOPAUSE_SYMPTOMS = [
  { key: 'hot_flashes', label: 'Ondas de calor', icon: '🔥' },
  { key: 'night_sweats', label: 'Suores noturnos', icon: '💧' },
  { key: 'irregular_periods', label: 'Períodos irregulares', icon: '📅' },
  { key: 'mood_changes', label: 'Mudanças de humor', icon: '😔' },
  { key: 'sleep_problems', label: 'Problemas de sono', icon: '😴' },
  { key: 'vaginal_dryness', label: 'Ressecamento vaginal', icon: '🌡️' },
  { key: 'decreased_libido', label: 'Diminuição da libido', icon: '💔' },
  { key: 'weight_gain', label: 'Ganho de peso', icon: '⚖️' },
  { key: 'memory_problems', label: 'Problemas de memória', icon: '🧠' },
  { key: 'joint_pain', label: 'Dores nas articulações', icon: '🦴' },
  { key: 'headaches', label: 'Dores de cabeça', icon: '🤕' },
  { key: 'fatigue', label: 'Fadiga', icon: '😵' },
];

const MENOPAUSE_STAGES = {
  'premenopausa': {
    title: 'Pré-menopausa',
    description: 'Períodos regulares, mas alguns sintomas podem começar a aparecer',
    color: ['#4CAF50', '#66BB6A'],
  },
  'perimenopausa': {
    title: 'Perimenopausa',
    description: 'Períodos irregulares e sintomas mais intensos',
    color: ['#FF9800', '#FFB74D'],
  },
  'menopausa': {
    title: 'Menopausa',
    description: '12 meses sem menstruação',
    color: ['#F44336', '#EF5350'],
  },
  'pos-menopausa': {
    title: 'Pós-menopausa',
    description: 'Após a menopausa, alguns sintomas podem persistir',
    color: ['#9C27B0', '#BA68C8'],
  },
};

export default function MenopauseScreen() {
  const { theme } = useThemeSystem();
  const [menopauseData, setMenopauseData] = useState<MenopauseData>({
    age: 45,
    symptoms: [],
    stage: 'premenopausa',
    trackedSince: moment().format('YYYY-MM-DD'),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSymptomTracker, setShowSymptomTracker] = useState(false);

  useEffect(() => {
    loadMenopauseData();
  }, []);

  const loadMenopauseData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('menopauseData');
      const cycleData = await AsyncStorage.getItem('cycleData');
      
      let dataToSet = {
        age: 45,
        symptoms: [],
        stage: 'premenopausa',
        trackedSince: moment().format('YYYY-MM-DD'),
      };
      
      if (storedData) {
        dataToSet = JSON.parse(storedData);
      } else if (cycleData) {
        const cycle = JSON.parse(cycleData);
        if (cycle.age) {
          dataToSet.age = cycle.age;
        }
      }
      
      // Calcula o estágio automaticamente
      const calculatedStage = calculateStageForData(dataToSet);
      dataToSet.stage = calculatedStage;
      
      setMenopauseData(dataToSet);
    } catch (error) {
      console.error('Erro ao carregar dados da menopausa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMenopauseData = async () => {
    try {
      await AsyncStorage.setItem('menopauseData', JSON.stringify(menopauseData));
      Alert.alert('Sucesso', 'Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados da menopausa:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  const calculateStageForData = (data: MenopauseData) => {
    const { age, symptoms, lastPeriodDate } = data;
    
    console.log('🌸 Calculando estágio da menopausa:', { age, symptomsCount: symptoms.length, lastPeriodDate });
    
    if (age < 40) return 'premenopausa';
    
    const hasIrregularPeriods = symptoms.includes('irregular_periods');
    const hasHotFlashes = symptoms.includes('hot_flashes');
    const hasNightSweats = symptoms.includes('night_sweats');
    const hasCommonSymptoms = hasHotFlashes || hasNightSweats || symptoms.includes('mood_changes');
    
    // Se tem data da última menstruação, usa para determinar
    if (lastPeriodDate) {
      const monthsSinceLastPeriod = moment().diff(moment(lastPeriodDate), 'months');
      if (monthsSinceLastPeriod >= 12) {
        return age > 55 ? 'pos-menopausa' : 'menopausa';
      }
    }
    
    // Lógica baseada em idade e sintomas
    if (age >= 51 && (hasHotFlashes || hasNightSweats || symptoms.length >= 3)) {
      return 'perimenopausa';
    }
    
    if (age >= 48 && (hasIrregularPeriods || hasCommonSymptoms)) {
      return 'perimenopausa';
    }
    
    if (age >= 45 && symptoms.length >= 2) {
      return 'perimenopausa';
    }
    
    if (age >= 50) return 'perimenopausa';
    
    return 'premenopausa';
  };

  const calculateMenopauseStage = () => {
    return calculateStageForData(menopauseData);
  };

  const toggleSymptom = (symptomKey: string) => {
    const symptoms = menopauseData.symptoms.includes(symptomKey)
      ? menopauseData.symptoms.filter(s => s !== symptomKey)
      : [...menopauseData.symptoms, symptomKey];
    
    const newData = { ...menopauseData, symptoms };
    const stage = calculateStageForData(newData);
    
    console.log('🌸 Sintoma alterado:', symptomKey, 'Novo estágio:', stage);
    
    setMenopauseData({ ...newData, stage });
  };

  const getMenopauseProbability = () => {
    const { age, symptoms } = menopauseData;
    let probability = 0;
    
    // Base da idade (mais realista)
    if (age >= 55) probability += 70;
    else if (age >= 52) probability += 50;
    else if (age >= 48) probability += 30;
    else if (age >= 45) probability += 15;
    else if (age >= 42) probability += 8;
    else if (age >= 40) probability += 3;
    
    // Sintomas específicos com pesos diferentes
    if (symptoms.includes('hot_flashes')) probability += 20;
    if (symptoms.includes('night_sweats')) probability += 15;
    if (symptoms.includes('irregular_periods')) probability += 15;
    if (symptoms.includes('mood_changes')) probability += 8;
    if (symptoms.includes('vaginal_dryness')) probability += 12;
    if (symptoms.includes('sleep_problems')) probability += 6;
    
    // Bônus por múltiplos sintomas
    if (symptoms.length >= 3) probability += 10;
    if (symptoms.length >= 5) probability += 15;
    
    console.log('🌸 Probabilidade calculada:', probability, 'para idade:', age, 'sintomas:', symptoms.length);
    
    return Math.min(100, Math.max(0, Math.round(probability)));
  };

  const renderStageCard = () => {
    const stage = menopauseData.stage;
    const stageInfo = MENOPAUSE_STAGES[stage];
    const probability = getMenopauseProbability();
    
    return (
      <View style={styles.stageCard}>
        <LinearGradient
          colors={stageInfo.color}
          style={styles.stageGradient}
        >
          <Text style={styles.stageTitle}>{stageInfo.title}</Text>
          <Text style={styles.stageDescription}>{stageInfo.description}</Text>
          <View style={styles.probabilityContainer}>
            <Text style={styles.probabilityLabel}>Probabilidade de menopausa:</Text>
            <Text style={styles.probabilityValue}>{probability}%</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderSymptomTracker = () => (
    <View style={styles.symptomsSection}>
      <Text style={styles.sectionTitle}>Rastreamento de Sintomas</Text>
      <Text style={styles.sectionSubtitle}>
        Selecione os sintomas que você está sentindo:
      </Text>
      
      <View style={styles.symptomsGrid}>
        {MENOPAUSE_SYMPTOMS.map((symptom) => (
          <TouchableOpacity
            key={symptom.key}
            style={[
              styles.symptomCard,
              {
                backgroundColor: menopauseData.symptoms.includes(symptom.key)
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.2)'
              }
            ]}
            onPress={() => toggleSymptom(symptom.key)}
          >
            <Text style={styles.symptomIcon}>{symptom.icon}</Text>
            <Text style={[
              styles.symptomLabel,
              {
                color: menopauseData.symptoms.includes(symptom.key)
                  ? theme?.colors.primary
                  : 'white'
              }
            ]}>
              {symptom.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEducationalContent = () => (
    <View style={styles.educationalSection}>
      <Text style={styles.sectionTitle}>Informações sobre Menopausa</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🌟 O que é a menopausa?</Text>
        <Text style={styles.infoText}>
          A menopausa é o fim natural dos ciclos menstruais, diagnosticada após 
          12 meses consecutivos sem menstruação. Geralmente ocorre entre 45-55 anos.
        </Text>
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🩺 Fases da menopausa</Text>
        <Text style={styles.infoText}>
          • Pré-menopausa: Períodos regulares{'\n'}
          • Perimenopausa: Períodos irregulares{'\n'}
          • Menopausa: 12 meses sem menstruação{'\n'}
          • Pós-menopausa: Após a menopausa
        </Text>
      </View>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Dicas para o bem-estar</Text>
        <Text style={styles.infoText}>
          • Mantenha uma dieta equilibrada{'\n'}
          • Exercite-se regularmente{'\n'}
          • Pratique técnicas de relaxamento{'\n'}
          • Consulte um médico regularmente
        </Text>
      </View>
    </View>
  );

  if (isLoading || !theme) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Menopausa 🌸</Text>
            <Text style={styles.subtitle}>
              Acompanhe sua jornada e sintomas
            </Text>
          </View>

          {renderStageCard()}

          <TouchableOpacity
            style={styles.trackerButton}
            onPress={() => setShowSymptomTracker(!showSymptomTracker)}
          >
            <Text style={styles.trackerButtonText}>
              {showSymptomTracker ? 'Ocultar' : 'Rastrear'} Sintomas
            </Text>
          </TouchableOpacity>

          {showSymptomTracker && renderSymptomTracker()}

          {renderEducationalContent()}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveMenopauseData}
          >
            <Text style={styles.saveButtonText}>Salvar Dados</Text>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
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
  stageCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stageGradient: {
    padding: 20,
    alignItems: 'center',
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stageDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 15,
  },
  probabilityContainer: {
    alignItems: 'center',
  },
  probabilityLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  probabilityValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  trackerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  trackerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  symptomsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomCard: {
    width: (width - 60) / 2,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  symptomIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  symptomLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  educationalSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
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