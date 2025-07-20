// app/cycle-setup.tsx
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { scheduleAllNotifications } from '../hooks/notifications';
import React from 'react';

export default function CycleSetupScreen() {
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date());
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState(5);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cycleLengthOptions = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
  const periodLengthOptions = [3, 4, 5, 6, 7, 8];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setLastPeriodDate(selectedDate);
    }
  };

  const handleFinishSetup = async () => {
    setIsLoading(true);

    try {
      const cycleData = {
        lastPeriodDate: lastPeriodDate.toISOString(),
        averageCycleLength,
        averagePeriodLength,
        setupDate: new Date().toISOString(),
        irregularCycle: false, // Por enquanto assumimos regular
      };

      await AsyncStorage.setItem('cycleData', JSON.stringify(cycleData));
      
      // Marca setup como completo
      await AsyncStorage.setItem('setupCompleted', 'true');
      
      // Agenda todas as notificações baseadas no ciclo
      try {
        await scheduleAllNotifications();
        console.log('Notificações agendadas com sucesso');
      } catch (notificationError) {
        console.warn('Erro ao agendar notificações:', notificationError);
        // Não bloqueia o fluxo se houver erro nas notificações
      }
      
      // Pequeno delay para feedback visual
      setTimeout(() => {
        router.replace('/home');
      }, 500);
      
    } catch (error) {
      console.error('Erro ao salvar dados do ciclo:', error);
      Alert.alert('Erro', 'Não foi possível salvar os dados. Tente novamente.');
      setIsLoading(false);
    }
  };

  const getNextPeriodDate = () => {
    return moment(lastPeriodDate).add(averageCycleLength, 'days');
  };

  const getOvulationDate = () => {
    return moment(lastPeriodDate).add(averageCycleLength - 14, 'days');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FFB4D6', '#FF6B9D']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Configuração do Ciclo 📅</Text>
            <Text style={styles.subtitle}>
              Vamos configurar seu ciclo para fazer previsões precisas e notificações inteligentes
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Data da última menstruação */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quando foi sua última menstruação?</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {moment(lastPeriodDate).format('DD/MM/YYYY')}
                </Text>
                <Text style={styles.dateButtonIcon}>📅</Text>
              </TouchableOpacity>
              <Text style={styles.hint}>
                Data do primeiro dia da sua última menstruação
              </Text>
            </View>

            {/* Duração do ciclo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duração média do seu ciclo</Text>
              <Text style={styles.currentValue}>{averageCycleLength} dias</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                <View style={styles.optionsContainer}>
                  {cycleLengthOptions.map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.optionButton,
                        { backgroundColor: averageCycleLength === days ? 'white' : 'rgba(255,255,255,0.2)' }
                      ]}
                      onPress={() => setAverageCycleLength(days)}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: averageCycleLength === days ? '#FF6B9D' : 'white' }
                      ]}>
                        {days}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <Text style={styles.hint}>
                Intervalo entre o primeiro dia de uma menstruação e o primeiro dia da próxima
              </Text>
            </View>

            {/* Duração da menstruação */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duração da menstruação</Text>
              <Text style={styles.currentValue}>{averagePeriodLength} dias</Text>
              <View style={styles.optionsContainer}>
                {periodLengthOptions.map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.optionButton,
                      { backgroundColor: averagePeriodLength === days ? 'white' : 'rgba(255,255,255,0.2)' }
                    ]}
                    onPress={() => setAveragePeriodLength(days)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: averagePeriodLength === days ? '#FF6B9D' : 'white' }
                    ]}>
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hint}>
                Quantos dias sua menstruação costuma durar
              </Text>
            </View>

            {/* Previsões */}
            <View style={styles.predictions}>
              <Text style={styles.predictionsTitle}>📊 Suas previsões:</Text>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>Próxima menstruação:</Text>
                <Text style={styles.predictionValue}>
                  {getNextPeriodDate().format('DD/MM/YYYY')}
                </Text>
              </View>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>Próxima ovulação:</Text>
                <Text style={styles.predictionValue}>
                  {getOvulationDate().format('DD/MM/YYYY')}
                </Text>
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationText}>
                  🔔 Você receberá notificações sobre seus ciclos
                </Text>
              </View>
            </View>
          </View>

          {/* Botão finalizar */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinishSetup}
              disabled={isLoading}
            >
              <Text style={styles.finishButtonText}>
                {isLoading ? 'Finalizando...' : 'Finalizar Configuração'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.progressText}>2 de 2 - Ciclo</Text>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={lastPeriodDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={moment().subtract(60, 'days').toDate()}
          />
        )}

        {/* Decoração */}
        <View style={styles.decoration}>
          <View style={styles.decorationCircle1} />
          <View style={styles.decorationCircle2} />
        </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 30,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  currentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 18,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  dateButtonIcon: {
    fontSize: 20,
  },
  optionsScroll: {
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  optionButton: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    margin: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  predictions: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  predictionLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  notificationText: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  finishButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 50,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  finishButtonText: {
    color: '#FF6B9D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
  },
  decoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorationCircle1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: 150,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});