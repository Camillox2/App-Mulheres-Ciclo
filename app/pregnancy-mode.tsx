// app/pregnancy-mode.tsx - Modo Gravidez
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeSystem } from '../hooks/useThemeSystem';

const { width } = Dimensions.get('window');

interface PregnancyData {
  isActive: boolean;
  lastPeriodDate?: string;
  dueDate?: string;
  currentWeek: number;
  currentDay: number;
  babySize?: string;
  weeklyTip?: string;
  symptoms: string[];
  appointments: Array<{
    date: string;
    type: string;
    notes?: string;
  }>;
}

const PREGNANCY_SYMPTOMS = [
  { key: 'nausea', label: 'Náusea matinal', icon: '🤢' },
  { key: 'fatigue', label: 'Fadiga', icon: '😴' },
  { key: 'breast_tenderness', label: 'Sensibilidade nos seios', icon: '🤱' },
  { key: 'frequent_urination', label: 'Micção frequente', icon: '🚽' },
  { key: 'mood_swings', label: 'Mudanças de humor', icon: '🎭' },
  { key: 'food_cravings', label: 'Desejos alimentares', icon: '🍎' },
  { key: 'heartburn', label: 'Azia', icon: '🔥' },
  { key: 'back_pain', label: 'Dor nas costas', icon: '🏥' },
  { key: 'constipation', label: 'Constipação', icon: '😣' },
  { key: 'stretch_marks', label: 'Estrias', icon: '〰️' },
  { key: 'swelling', label: 'Inchaço', icon: '🎈' },
  { key: 'sleep_issues', label: 'Problemas de sono', icon: '🛏️' },
];

const BABY_SIZES_BY_WEEK: { [key: number]: { size: string; emoji: string; description: string } } = {
  4: { size: 'semente de papoula', emoji: '⚫', description: 'Minúsculo, mas já em desenvolvimento!' },
  8: { size: 'framboesa', emoji: '🫐', description: 'Órgãos principais começando a formar' },
  12: { size: 'ameixa', emoji: '🟣', description: 'Final do primeiro trimestre!' },
  16: { size: 'abacate', emoji: '🥑', description: 'Movimentos podem ser sentidos em breve' },
  20: { size: 'banana', emoji: '🍌', description: 'Metade da gravidez!' },
  24: { size: 'espiga de milho', emoji: '🌽', description: 'Viabilidade fetal!' },
  28: { size: 'beringela', emoji: '🍆', description: 'Terceiro trimestre começando' },
  32: { size: 'coco', emoji: '🥥', description: 'Desenvolvimento dos pulmões' },
  36: { size: 'melão cantalupo', emoji: '🍈', description: 'Quase pronto para nascer!' },
  40: { size: 'melancia pequena', emoji: '🍉', description: 'Termo completo!' },
};

const WEEKLY_TIPS: { [key: number]: string } = {
  4: 'Comece a tomar ácido fólico se ainda não começou!',
  8: 'É hora de agendar sua primeira consulta pré-natal.',
  12: 'Muitas pessoas escolhem contar a novidade agora!',
  16: 'Considere fazer exercícios leves aprovados pelo médico.',
  20: 'Ultrassom morfológico - você pode descobrir o sexo!',
  24: 'Comece a pensar em nomes e prepare o enxoval.',
  28: 'Teste de diabetes gestacional pode ser necessário.',
  32: 'Considere fazer aulas de preparação para o parto.',
  36: 'Finalize os preparativos para a chegada do bebê.',
  40: 'O bebê pode chegar a qualquer momento!',
};

export default function PregnancyModeScreen() {
  const { theme } = useThemeSystem();
  const [pregnancyData, setPregnancyData] = useState<PregnancyData>({
    isActive: false,
    currentWeek: 0,
    currentDay: 0,
    symptoms: [],
    appointments: [],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerMode, setDatePickerMode] = useState<'lastPeriod' | 'dueDate'>('lastPeriod');

  useEffect(() => {
    loadPregnancyData();
  }, []);

  useEffect(() => {
    if (pregnancyData.isActive && pregnancyData.lastPeriodDate) {
      calculatePregnancyWeek();
    }
  }, [pregnancyData.lastPeriodDate, pregnancyData.isActive]);

  const loadPregnancyData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('pregnancyData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setPregnancyData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da gravidez:', error);
    }
  };

  const savePregnancyData = async (data: PregnancyData) => {
    try {
      await AsyncStorage.setItem('pregnancyData', JSON.stringify(data));
      setPregnancyData(data);
    } catch (error) {
      console.error('Erro ao salvar dados da gravidez:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  const calculatePregnancyWeek = () => {
    if (!pregnancyData.lastPeriodDate) return;
    // Usar clone para não mutar a data original armazenada
    const lastPeriod = moment(pregnancyData.lastPeriodDate);
    const now = moment();
    const daysSinceLMP = now.diff(lastPeriod, 'days');
    const weeks = Math.max(0, Math.floor(daysSinceLMP / 7));
    const days = Math.max(0, daysSinceLMP % 7);

    const estimatedDueDate = moment(pregnancyData.lastPeriodDate).clone().add(280, 'days');

    const nextState: PregnancyData = {
      ...pregnancyData,
      currentWeek: weeks,
      currentDay: days,
      dueDate: pregnancyData.dueDate || estimatedDueDate.toISOString(),
    };
    if (
      nextState.currentWeek !== pregnancyData.currentWeek ||
      nextState.currentDay !== pregnancyData.currentDay ||
      !pregnancyData.dueDate
    ) {
      setPregnancyData(nextState);
      savePregnancyData(nextState);
    }
  };

  const activatePregnancyMode = () => {
    Alert.alert(
      'Ativar Modo Gravidez',
      'Parabéns! 🎉 Vamos configurar o acompanhamento da sua gravidez.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            setDatePickerMode('lastPeriod');
            setShowDatePicker(true);
          },
        },
      ]
    );
  };

  const deactivatePregnancyMode = () => {
    Alert.alert(
      'Desativar Modo Gravidez',
      'Tem certeza que deseja desativar o modo gravidez? Os dados serão mantidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: () => {
            const updatedData = { ...pregnancyData, isActive: false };
            savePregnancyData(updatedData);
          },
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && datePickerMode === 'lastPeriod') {
      const updatedData = {
        ...pregnancyData,
        isActive: true,
        lastPeriodDate: selectedDate.toISOString(),
        currentWeek: 0,
        currentDay: 0,
      };
      console.log('Ativando modo gravidez com data:', selectedDate.toISOString());
      savePregnancyData(updatedData);
      
      // Força o cálculo imediatamente após salvar
      setTimeout(() => {
        calculatePregnancyWeek();
      }, 100);
      
      Alert.alert('Sucesso', 'Modo gravidez ativado! 🤰');
    }
  };
  
  const resetDates = () => {
    Alert.alert(
      'Recalcular Datas',
      'Deseja redefinir a data da última menstruação para recalcular as semanas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Redefinir',
          onPress: () => {
            setDatePickerMode('lastPeriod');
            setShowDatePicker(true);
          }
        }
      ]
    );
  };

  const toggleSymptom = (symptomKey: string) => {
    const symptoms = pregnancyData.symptoms.includes(symptomKey)
      ? pregnancyData.symptoms.filter(s => s !== symptomKey)
      : [...pregnancyData.symptoms, symptomKey];
    
    const updatedData = { ...pregnancyData, symptoms };
    savePregnancyData(updatedData);
  };

  const getDaysUntilDue = () => {
    if (!pregnancyData.dueDate) return 0;
    return Math.max(0, moment(pregnancyData.dueDate).diff(moment(), 'days'));
  };

  const getBabyInfo = () => {
    const week = pregnancyData.currentWeek;
    // Encontra a semana mais próxima disponível
    const availableWeeks = Object.keys(BABY_SIZES_BY_WEEK).map(Number).sort((a, b) => a - b);
    const closestWeek = availableWeeks.reduce((prev, curr) => 
      Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
    );
    return BABY_SIZES_BY_WEEK[closestWeek] || BABY_SIZES_BY_WEEK[4];
  };

  const getWeeklyTip = () => {
    const week = pregnancyData.currentWeek;
    const availableWeeks = Object.keys(WEEKLY_TIPS).map(Number).sort((a, b) => a - b);
    const closestWeek = availableWeeks.reduce((prev, curr) => 
      Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
    );
    return WEEKLY_TIPS[closestWeek] || 'Aproveite cada momento desta jornada especial! 💕';
  };

  const getTrimester = () => {
    const week = pregnancyData.currentWeek;
    if (week <= 12) return { name: '1º Trimestre', emoji: '🌱', color: ['#4CAF50', '#66BB6A'] };
    if (week <= 26) return { name: '2º Trimestre', emoji: '🌸', color: ['#FF9800', '#FFB74D'] };
    return { name: '3º Trimestre', emoji: '🌺', color: ['#E91E63', '#F48FB1'] };
  };

  if (!theme) return null;

  if (!pregnancyData.isActive) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.gradient}
        >
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeEmoji}>🤰</Text>
            <Text style={styles.welcomeTitle}>Modo Gravidez</Text>
            <Text style={styles.welcomeSubtitle}>
              Acompanhe sua jornada da gravidez com ferramentas especializadas
            </Text>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Text style={styles.featureEmoji}>📅</Text>
                <Text style={styles.featureText}>Contador de semanas</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureEmoji}>👶</Text>
                <Text style={styles.featureText}>Desenvolvimento do bebê</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureEmoji}>💡</Text>
                <Text style={styles.featureText}>Dicas semanais</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureEmoji}>🩺</Text>
                <Text style={styles.featureText}>Sintomas específicos</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.activateButton} onPress={activatePregnancyMode}>
              <Text style={styles.activateButtonText}>Ativar Modo Gravidez</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const babyInfo = getBabyInfo();
  const weeklyTip = getWeeklyTip();
  const trimester = getTrimester();
  const daysUntilDue = getDaysUntilDue();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Minha Gravidez 🤰</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={resetDates} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Recalcular</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deactivatePregnancyMode} style={styles.deactivateButton}>
                <Text style={styles.deactivateText}>Desativar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Principal */}
          <View style={styles.mainCard}>
            <LinearGradient colors={[trimester.color[0], trimester.color[1]] as any} style={styles.mainCardGradient}>
              <View style={styles.mainCardContent}>
                <Text style={styles.trimesterEmoji}>{trimester.emoji}</Text>
                <Text style={styles.trimesterName}>{trimester.name}</Text>
                <Text style={styles.weekInfo}>
                  {pregnancyData.currentWeek} semanas e {pregnancyData.currentDay} dias
                </Text>
                <Text style={styles.daysUntilDue}>
                  {daysUntilDue} dias até o nascimento
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Tamanho do Bebê */}
          <View style={styles.babyCard}>
            <Text style={styles.cardTitle}>Tamanho do Bebê</Text>
            <View style={styles.babyInfo}>
              <Text style={styles.babyEmoji}>{babyInfo.emoji}</Text>
              <View style={styles.babyDetails}>
                <Text style={styles.babySize}>Como um(a) {babyInfo.size}</Text>
                <Text style={styles.babyDescription}>{babyInfo.description}</Text>
              </View>
            </View>
          </View>

          {/* Dica da Semana */}
          <View style={styles.tipCard}>
            <Text style={styles.cardTitle}>💡 Dica da Semana</Text>
            <Text style={styles.tipText}>{weeklyTip}</Text>
          </View>

          {/* Sintomas da Gravidez */}
          <View style={styles.symptomsSection}>
            <Text style={styles.cardTitle}>Sintomas</Text>
            <Text style={styles.sectionSubtitle}>
              Marque os sintomas que você está sentindo:
            </Text>
            
            <View style={styles.symptomsGrid}>
              {PREGNANCY_SYMPTOMS.map((symptom) => (
                <TouchableOpacity
                  key={symptom.key}
                  style={[
                    styles.symptomChip,
                    {
                      backgroundColor: pregnancyData.symptoms.includes(symptom.key)
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
                      color: pregnancyData.symptoms.includes(symptom.key)
                        ? theme.colors.primary
                        : 'white'
                    }
                  ]}>
                    {symptom.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={moment().subtract(300, 'days').toDate()}
          />
        )}
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  activateButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  deactivateButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  deactivateText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  secondaryButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    opacity: 0.9,
  },
  mainCard: {
    borderRadius: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mainCardGradient: {
    borderRadius: 20,
    padding: 30,
  },
  mainCardContent: {
    alignItems: 'center',
  },
  trimesterEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  trimesterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  weekInfo: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
    fontWeight: '600',
  },
  daysUntilDue: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  babyCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  babyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyEmoji: {
    fontSize: 48,
    marginRight: 20,
  },
  babyDetails: {
    flex: 1,
  },
  babySize: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  babyDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    textAlign: 'center',
  },
  symptomsSection: {
    marginBottom: 20,
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
  symptomChip: {
    width: (width - 60) / 2,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  symptomIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  symptomLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpace: {
    height: 30,
  },
});