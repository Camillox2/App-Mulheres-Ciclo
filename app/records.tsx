// app/records.tsx - DESIGN MODERNO E RESPONSIVO
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeSystem } from '../hooks/useThemeSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/pt-br';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isSmallScreen = screenWidth < 375;

// Configurar moment para português
moment.locale('pt-br');

// ... (interfaces e constantes permanecem as mesmas)
interface Symptom {
  id: string;
  name: string;
  emoji: string;
  category: 'physical' | 'emotional' | 'other';
}

interface Record {
  id: string;
  date: string;
  type: 'symptom' | 'mood' | 'activity' | 'period' | 'note';
  data: any;
}

const SYMPTOMS: Symptom[] = [
  // Físicos
  { id: 'cramps', name: 'Cólicas', emoji: '😣', category: 'physical' },
  { id: 'headache', name: 'Dor de cabeça', emoji: '🤕', category: 'physical' },
  { id: 'bloating', name: 'Inchaço', emoji: '🎈', category: 'physical' },
  { id: 'breast_pain', name: 'Dor nos seios', emoji: '😔', category: 'physical' },
  { id: 'back_pain', name: 'Dor nas costas', emoji: '😖', category: 'physical' },
  { id: 'acne', name: 'Espinhas', emoji: '😤', category: 'physical' },
  { id: 'fatigue', name: 'Cansaço', emoji: '😴', category: 'physical' },
  
  // Emocionais
  { id: 'happy', name: 'Feliz', emoji: '😊', category: 'emotional' },
  { id: 'sad', name: 'Triste', emoji: '😢', category: 'emotional' },
  { id: 'anxious', name: 'Ansiosa', emoji: '😰', category: 'emotional' },
  { id: 'irritated', name: 'Irritada', emoji: '😠', category: 'emotional' },
  { id: 'energetic', name: 'Energética', emoji: '💪', category: 'emotional' },
  { id: 'romantic', name: 'Romântica', emoji: '💕', category: 'emotional' },
  
  // Outros
  { id: 'increased_appetite', name: 'Mais fome', emoji: '🍽️', category: 'other' },
  { id: 'cravings', name: 'Desejos', emoji: '🍫', category: 'other' },
  { id: 'insomnia', name: 'Insônia', emoji: '🌙', category: 'other' },
  { id: 'libido_high', name: 'Libido alta', emoji: '🔥', category: 'other' },
  { id: 'libido_low', name: 'Libido baixa', emoji: '❄️', category: 'other' },
];

const FLOW_TYPES = [
  { id: 'light', name: 'Leve', emoji: '💧', color: '#FFB4D6' },
  { id: 'moderate', name: 'Moderado', emoji: '💧💧', color: '#FF6B9D' },
  { id: 'heavy', name: 'Intenso', emoji: '💧💧💧', color: '#E74C3C' },
];


export default function RecordsScreen() {
  const { theme } = useThemeSystem();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [records, setRecords] = useState<Record[]>([]);
  const [isToday, setIsToday] = useState(true);
  
  // Estados dos modais
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showPeriodStartEndModal, setShowPeriodStartEndModal] = useState(false);
  const [selectedPeriodDate, setSelectedPeriodDate] = useState(moment());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animação simples apenas para o date picker
  const dateAnim = new Animated.Value(1);

  const loadRecordsForDate = useCallback(async (date: moment.Moment) => {
    try {
      const recordsData = await AsyncStorage.getItem('dailyRecords');
      if (recordsData) {
        const allRecords: Record[] = JSON.parse(recordsData);
        const dayRecords = allRecords.filter(record => 
          moment(record.date).isSame(date, 'day')
        );
        setRecords(dayRecords);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  }, []);

  useEffect(() => {
    loadRecordsForDate(selectedDate);
    setIsToday(selectedDate.isSame(moment(), 'day'));
  }, [selectedDate, loadRecordsForDate]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = selectedDate.clone().add(direction === 'next' ? 1 : -1, 'days');
    
    if (newDate.isAfter(moment(), 'day')) {
      return; // Bloqueia datas futuras
    }

    setSelectedDate(newDate);
    
    // Animação de pulso na data
    Animated.sequence([
      Animated.timing(dateAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(dateAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const saveRecord = async (newRecord: Omit<Record, 'id' | 'date'>) => {
    try {
      const recordsData = await AsyncStorage.getItem('dailyRecords');
      const allRecords: Record[] = recordsData ? JSON.parse(recordsData) : [];
      
      const record: Record = {
        id: Date.now().toString(),
        date: selectedDate.format('YYYY-MM-DD'),
        ...newRecord,
      };

      allRecords.push(record);
      await AsyncStorage.setItem('dailyRecords', JSON.stringify(allRecords));
      await AsyncStorage.setItem('dataLastUpdate', Date.now().toString());
      
      loadRecordsForDate(selectedDate);
      setSuccessMessage('Registro salvo com sucesso! ✨');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  };

  const removeRecord = async (recordId: string) => {
    try {
      const recordsData = await AsyncStorage.getItem('dailyRecords');
      if (recordsData) {
        const allRecords: Record[] = JSON.parse(recordsData);
        const updatedRecords = allRecords.filter(record => record.id !== recordId);
        await AsyncStorage.setItem('dailyRecords', JSON.stringify(updatedRecords));
        await AsyncStorage.setItem('dataLastUpdate', Date.now().toString());
        loadRecordsForDate(selectedDate);
      }
    } catch (error) {
      console.error('Erro ao remover registro:', error);
    }
  };

  // ... (funções handleSymptomPress, handlePeriodRecord, etc. permanecem as mesmas)
  const handleSymptomPress = (symptom: Symptom) => {
    saveRecord({
      type: 'symptom',
      data: {
        symptomId: symptom.id,
        name: symptom.name,
        emoji: symptom.emoji,
        intensity: 'medium', // Por simplicidade, sempre médio
      },
    });
    setShowSymptomModal(false);
  };

  const handlePeriodRecord = (flowType: any) => {
    saveRecord({
      type: 'period',
      data: {
        flow: flowType.id,
        flowName: flowType.name,
        emoji: flowType.emoji,
        color: flowType.color,
      },
    });
    setShowPeriodModal(false);
  };

  const handleActivityRecord = () => {
    saveRecord({
      type: 'activity',
      data: {
        type: 'sexual',
        protection: 'unknown', // Por simplicidade
        notes: '',
      },
    });
    setShowActivityModal(false);
  };

  const handleNoteRecord = () => {
    if (noteText.trim()) {
      saveRecord({
        type: 'note',
        data: {
          text: noteText.trim(),
        },
      });
      setNoteText('');
      setShowNoteModal(false);
    }
  };

  const handlePeriodStartEnd = async (type: 'start' | 'end') => {
    try {
      const cycleData = await AsyncStorage.getItem('cycleData');
      let currentData = cycleData ? JSON.parse(cycleData) : {
        averageCycleLength: 28,
        averagePeriodLength: 5,
        lastPeriodDate: null,
        periodHistory: []
      };

      if (type === 'start') {
        // Registra início da menstruação
        currentData.lastPeriodDate = selectedPeriodDate.format('YYYY-MM-DD');
        currentData.periodHistory = currentData.periodHistory || [];
        currentData.periodHistory.push({
          startDate: selectedPeriodDate.format('YYYY-MM-DD'),
          endDate: null
        });

        // Salva registro de fluxo também
        await saveRecord({
          type: 'period',
          data: {
            flow: 'start',
            flowName: 'Início da Menstruação',
            emoji: '🌸',
            color: '#FF6B9D',
            isStart: true,
          },
        });
      } else {
        // Registra fim da menstruação
        if (currentData.periodHistory && currentData.periodHistory.length > 0) {
          const lastPeriod = currentData.periodHistory[currentData.periodHistory.length - 1];
          if (lastPeriod && !lastPeriod.endDate) {
            lastPeriod.endDate = selectedPeriodDate.format('YYYY-MM-DD');
            
            // Calcula duração da menstruação
            const startDate = moment(lastPeriod.startDate);
            const endDate = moment(lastPeriod.endDate);
            const duration = endDate.diff(startDate, 'days') + 1;
            
            // Atualiza média de duração da menstruação
            currentData.averagePeriodLength = Math.round((currentData.averagePeriodLength + duration) / 2);
          }
        }

        await saveRecord({
          type: 'period',
          data: {
            flow: 'end',
            flowName: 'Fim da Menstruação',
            emoji: '🌺',
            color: '#FFB4D6',
            isEnd: true,
          },
        });
      }

      await AsyncStorage.setItem('cycleData', JSON.stringify(currentData));
      await AsyncStorage.setItem('dataLastUpdate', Date.now().toString());
      
      setShowPeriodStartEndModal(false);
      setSuccessMessage(`${type === 'start' ? 'Início' : 'Fim'} da menstruação registrado com sucesso! 🌸`);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Erro ao registrar período:', error);
      Alert.alert('Erro', 'Não foi possível registrar.');
    }
  };

  const getRecordIcon = (record: Record) => {
    switch (record.type) {
      case 'symptom':
        return record.data.emoji;
      case 'period':
        return record.data.emoji;
      case 'activity':
        return '💕';
      case 'note':
        return '📝';
      default:
        return '📋';
    }
  };

  const getRecordText = (record: Record) => {
    switch (record.type) {
      case 'symptom':
        return record.data.name;
      case 'period':
        return `Fluxo ${record.data.flowName}`;
      case 'activity':
        return 'Atividade sexual';
      case 'note':
        return record.data.text;
      default:
        return 'Registro';
    }
  };

  const groupSymptomsByCategory = () => {
    const grouped = SYMPTOMS.reduce((acc, symptom) => {
      if (!acc[symptom.category]) {
        acc[symptom.category] = [];
      }
      acc[symptom.category].push(symptom);
      return acc;
    }, {} as { [key: string]: Symptom[] });
    return grouped;
  };

  if (!theme) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const symptomsByCategory = groupSymptomsByCategory();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.surface,
          theme.colors.background,
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header simplificado */}
      <View style={styles.headerSimple}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Meus Registros 📝
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Seletor de Data limpo */}
      <View 
        style={[
          styles.dateSelectorClean,
          {
            backgroundColor: theme.colors.surface
          }
        ]}
      >
        <View style={styles.dateSelectorGradient}>
          <TouchableOpacity 
            style={[styles.chevronButton, { backgroundColor: theme.colors.surface }]} 
            onPress={() => handleDateChange('prev')}
            activeOpacity={0.7}
          >
            <Text style={[styles.chevron, { color: theme.colors.text.secondary }]}>‹</Text>
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>
              {selectedDate.format('DD/MM/YYYY')}
            </Text>
            <Text style={[styles.dayText, { color: theme.colors.primary }]}>
              {isToday ? 'Hoje' : selectedDate.format('dddd').replace('feira', '')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.chevronButton, 
              { 
                backgroundColor: isToday ? theme.colors.border : theme.colors.surface,
                opacity: isToday ? 0.5 : 1
              }
            ]} 
            onPress={() => handleDateChange('next')}
            disabled={isToday}
            activeOpacity={0.7}
          >
            <Text style={[styles.chevron, { color: isToday ? theme.colors.border : theme.colors.text.secondary }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* ... (o resto do seu código para quickActions e todayRecords) */}
        {/* Botões de registro rápido modernos */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowSymptomModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionContainer}>
              <Text style={styles.quickActionEmoji}>😣</Text>
              <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
                Sintomas
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowPeriodModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionContainer}>
              <Text style={styles.quickActionEmoji}>🌸</Text>
              <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
                Menstruação
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowActivityModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionContainer}>
              <Text style={styles.quickActionEmoji}>💕</Text>
              <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
                Atividade
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowNoteModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionContainer}>
              <Text style={styles.quickActionEmoji}>📝</Text>
              <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
                Nota
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              setSelectedPeriodDate(selectedDate);
              setShowPeriodStartEndModal(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionContainer}>
              <Text style={styles.quickActionEmoji}>🌸</Text>
              <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
                Período
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Registros do dia com design moderno */}
        <View style={styles.todayRecords}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              📋 Registros do Dia
            </Text>
            <View style={[styles.recordsCounter, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.recordsCounterText}>{records.length}</Text>
            </View>
          </View>
          
          {records.length > 0 ? (
            records.map((record, index) => (
              <View
                key={record.id}
                style={[
                  styles.recordItem,
                  { backgroundColor: theme.colors.surface }
                ]}
              >
                <View style={[styles.recordItemContainer, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.recordIconContainer, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.recordIcon}>{getRecordIcon(record)}</Text>
                  </View>
                  <View style={styles.recordContent}>
                    <Text style={[styles.recordText, { color: theme.colors.text.primary }]}>
                      {getRecordText(record)}
                    </Text>
                    <Text style={[styles.recordTime, { color: theme.colors.text.secondary }]}>
                      Agora
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: '#dc354520' }]}
                    onPress={() => removeRecord(record.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.removeButtonText, { color: '#dc3545' }]}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.emptyStateContainer, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.emptyStateEmoji}>📝</Text>
                <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
                  Nenhum registro para {isToday ? 'hoje' : 'este dia'}
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.colors.text.secondary }]}>
                  Toque nos botões acima para adicionar registros
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ... (seus modais permanecem aqui) */}
      {/* Modal de sintomas */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSymptomModal}
        onRequestClose={() => setShowSymptomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
              Registrar Sintoma
            </Text>
            
            <ScrollView style={styles.modalBody}>
              {Object.entries(symptomsByCategory).map(([category, symptoms]) => (
                <View key={category} style={styles.symptomCategory}>
                  <Text style={[styles.categoryTitle, { color: theme.colors.secondary }]}>
                    {category === 'physical' ? 'Físicos' : 
                     category === 'emotional' ? 'Emocionais' : 'Outros'}
                  </Text>
                  <View style={styles.symptomsGrid}>
                    {symptoms.map((symptom) => (
                      <TouchableOpacity
                        key={symptom.id}
                        style={[styles.symptomButton, { backgroundColor: theme.colors.background }]}
                        onPress={() => handleSymptomPress(symptom)}
                      >
                        <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                        <Text style={[styles.symptomName, { color: theme.colors.primary }]}>
                          {symptom.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowSymptomModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de menstruação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPeriodModal}
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
              Registrar Menstruação
            </Text>
            
            <View style={styles.modalBody}>
              <Text style={[styles.flowTitle, { color: theme.colors.secondary }]}>
                Intensidade do fluxo:
              </Text>
              {FLOW_TYPES.map((flowType) => (
                <TouchableOpacity
                  key={flowType.id}
                  style={[styles.flowButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => handlePeriodRecord(flowType)}
                >
                  <Text style={styles.flowEmoji}>{flowType.emoji}</Text>
                  <Text style={[styles.flowName, { color: theme.colors.primary }]}>
                    {flowType.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowPeriodModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de atividade */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showActivityModal}
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
              Registrar Atividade
            </Text>
            
            <View style={styles.modalBody}>
              <TouchableOpacity
                style={[styles.activityButton, { backgroundColor: theme.colors.background }]}
                onPress={handleActivityRecord}
              >
                <Text style={styles.activityEmoji}>💕</Text>
                <Text style={[styles.activityName, { color: theme.colors.primary }]}>
                  Atividade Sexual
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowActivityModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de nota */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNoteModal}
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
              Adicionar Nota
            </Text>
            
            <View style={styles.modalBody}>
              <TextInput
                style={[styles.noteInput, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.primary,
                  borderColor: theme.colors.primary 
                }]}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Digite sua nota aqui..."
                placeholderTextColor={theme.colors.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalSaveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleNoteRecord}
                disabled={!noteText.trim()}
              >
                <Text style={styles.modalSaveButtonText}>Salvar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: theme.colors.secondary }]}
                onPress={() => {
                  setNoteText('');
                  setShowNoteModal(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de início/fim de menstruação */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPeriodStartEndModal}
        onRequestClose={() => setShowPeriodStartEndModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[theme.colors.surface, theme.colors.background, theme.colors.surface]}
              style={styles.modalGradientBackground}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
                🌸 Período Menstrual
              </Text>
              
              <View style={styles.modalBody}>
                <View style={[styles.dateDisplayContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Text style={[styles.dateDisplayText, { color: theme.colors.primary }]}>
                    📅 {selectedPeriodDate.format('DD/MM/YYYY')}
                  </Text>
                </View>
                
                <View style={styles.periodButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.periodActionButton, { 
                      backgroundColor: theme.colors.surface,
                      borderColor: '#FF6B9D',
                      shadowColor: '#FF6B9D'
                    }]}
                    onPress={() => handlePeriodStartEnd('start')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#FF6B9D10', '#FF6B9D05']}
                      style={styles.periodButtonGradient}
                    >
                      <Text style={styles.periodActionEmoji}>🌸</Text>
                      <Text style={[styles.periodActionText, { color: '#FF6B9D' }]}>
                        Início da Menstruação
                      </Text>
                      <Text style={[styles.periodActionSubtext, { color: theme.colors.text.secondary }]}>
                        Marcar o primeiro dia do ciclo
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.periodActionButton, { 
                      backgroundColor: theme.colors.surface,
                      borderColor: '#E91E63',
                      shadowColor: '#E91E63'
                    }]}
                    onPress={() => handlePeriodStartEnd('end')}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E91E6310', '#E91E6305']}
                      style={styles.periodButtonGradient}
                    >
                      <Text style={styles.periodActionEmoji}>🌺</Text>
                      <Text style={[styles.periodActionText, { color: '#E91E63' }]}>
                        Fim da Menstruação
                      </Text>
                      <Text style={[styles.periodActionSubtext, { color: theme.colors.text.secondary }]}>
                        Marcar o último dia do período
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowPeriodStartEndModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de sucesso bonito */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successModalContainer, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[
                theme.colors.primary + '20',
                theme.colors.secondary + '10',
                theme.colors.primary + '05'
              ]}
              style={styles.successModalGradient}
            >
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✨</Text>
              </View>
              
              <Text style={[styles.successTitle, { color: theme.colors.primary }]}>
                Sucesso!
              </Text>
              
              <Text style={[styles.successMessage, { color: theme.colors.text.primary }]}>
                {successMessage}
              </Text>
              
              <TouchableOpacity
                style={[styles.successButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowSuccessModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.successButtonText}>Perfeito! 🌸</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
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
  headerSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 44,
  },
  dateSelectorClean: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dateSelectorGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  chevronButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '600',
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dayText: {
    fontSize: isTablet ? 18 : 16,
    textTransform: 'capitalize',
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    width: isTablet ? 110 : 95,
    height: isTablet ? 100 : 90,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  quickActionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: isTablet ? 100 : 90,
  },
  quickActionEmoji: {
    fontSize: isTablet ? 36 : 32,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickActionText: {
    fontSize: isTablet ? 15 : 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: isTablet ? 18 : 16,
    paddingHorizontal: 4,
  },
  todayRecords: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recordsCounter: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  recordsCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordItem: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  recordItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  recordIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recordIcon: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 44,
  },
  recordContent: {
    flex: 1,
  },
  recordText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recordTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyStateText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: isTablet ? 500 : 400,
    maxHeight: '85%',
    borderRadius: 28,
    padding: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: isTablet ? 24 : 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  modalBody: {
    marginBottom: 24,
  },
  symptomCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  symptomButton: {
    width: isTablet ? '30%' : '31%',
    aspectRatio: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  symptomEmoji: {
    fontSize: isTablet ? 24 : 20,
    marginBottom: 6,
  },
  symptomName: {
    fontSize: isTablet ? 12 : 10,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  flowTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  flowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  flowEmoji: {
    fontSize: isTablet ? 24 : 20,
    marginRight: 15,
  },
  flowName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activityEmoji: {
    fontSize: isTablet ? 28 : 24,
    marginRight: 15,
  },
  activityName: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  noteInput: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    fontSize: isTablet ? 18 : 16,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  periodButtonsContainer: {
    marginTop: isTablet ? 24 : 16,
    gap: isTablet ? 20 : 12,
  },
  periodActionButton: {
    borderRadius: isTablet ? 20 : 16,
    alignItems: 'center',
    borderWidth: isTablet ? 3 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isTablet ? 4 : 2 },
    shadowOpacity: 0.15,
    shadowRadius: isTablet ? 8 : 4,
    elevation: isTablet ? 6 : 3,
    overflow: 'hidden',
  },
  periodActionEmoji: {
    fontSize: isTablet ? 40 : 28,
    marginBottom: isTablet ? 12 : 8,
  },
  periodActionText: {
    fontSize: isTablet ? 20 : isSmallScreen ? 14 : 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: isTablet ? 6 : 4,
    letterSpacing: 0.3,
  },
  periodActionSubtext: {
    fontSize: isTablet ? 16 : isSmallScreen ? 11 : 13,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: isTablet ? 20 : isSmallScreen ? 14 : 16,
    paddingHorizontal: isTablet ? 16 : 8,
  },
  modalGradientBackground: {
    borderRadius: isTablet ? 32 : isSmallScreen ? 20 : 24,
    padding: isTablet ? 32 : isSmallScreen ? 16 : 20,
    width: '100%',
  },
  dateDisplayContainer: {
    padding: isTablet ? 16 : 12,
    borderRadius: isTablet ? 16 : 12,
    alignItems: 'center',
    marginBottom: isTablet ? 24 : 16,
  },
  dateDisplayText: {
    fontSize: isTablet ? 18 : 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  periodButtonGradient: {
    width: '100%',
    padding: isTablet ? 24 : 16,
    borderRadius: isTablet ? 18 : 14,
    alignItems: 'center',
    minHeight: isTablet ? 120 : 90,
    justifyContent: 'center',
  },
  successModalContainer: {
    width: isTablet ? '75%' : isSmallScreen ? '95%' : '90%',
    maxWidth: isTablet ? 450 : isSmallScreen ? 280 : 320,
    borderRadius: isTablet ? 28 : 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isTablet ? 12 : 8 },
    shadowOpacity: 0.3,
    shadowRadius: isTablet ? 24 : 16,
  },
  successModalGradient: {
    padding: isTablet ? 40 : isSmallScreen ? 16 : 24,
    alignItems: 'center',
  },
  successIconContainer: {
    width: isTablet ? 100 : 70,
    height: isTablet ? 100 : 70,
    borderRadius: isTablet ? 50 : 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isTablet ? 24 : 16,
  },
  successIcon: {
    fontSize: isTablet ? 50 : 35,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: isTablet ? 28 : 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: isTablet ? 20 : 12,
    letterSpacing: 0.5,
  },
  successMessage: {
    fontSize: isTablet ? 18 : 15,
    textAlign: 'center',
    lineHeight: isTablet ? 26 : 22,
    marginBottom: isTablet ? 32 : 20,
    paddingHorizontal: isTablet ? 16 : 8,
  },
  successButton: {
    borderRadius: isTablet ? 20 : 14,
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: isTablet ? 40 : 28,
    minWidth: isTablet ? 240 : 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isTablet ? 6 : 4 },
    shadowOpacity: 0.2,
    shadowRadius: isTablet ? 12 : 8,
    elevation: isTablet ? 8 : 6,
  },
  successButtonText: {
    color: 'white',
    fontSize: isTablet ? 18 : 15,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
