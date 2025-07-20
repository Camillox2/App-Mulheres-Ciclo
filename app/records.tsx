// app/records.tsx
import { useState, useEffect } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React from 'react';

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
  const { theme } = useAdaptiveTheme();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [todayRecords, setTodayRecords] = useState<Record[]>([]);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadTodayRecords();
  }, [selectedDate]);

  const loadTodayRecords = async () => {
    try {
      const recordsData = await AsyncStorage.getItem('dailyRecords');
      if (recordsData) {
        const allRecords: Record[] = JSON.parse(recordsData);
        const dayRecords = allRecords.filter(record => 
          moment(record.date).isSame(selectedDate, 'day')
        );
        setTodayRecords(dayRecords);
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const saveRecord = async (newRecord: Omit<Record, 'id' | 'date'>) => {
    try {
      const recordsData = await AsyncStorage.getItem('dailyRecords');
      const allRecords: Record[] = recordsData ? JSON.parse(recordsData) : [];
      
      const record: Record = {
        id: Date.now().toString(),
        date: selectedDate,
        ...newRecord,
      };

      allRecords.push(record);
      await AsyncStorage.setItem('dailyRecords', JSON.stringify(allRecords));
      
      loadTodayRecords();
      Alert.alert('Sucesso', 'Registro salvo com sucesso!');
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
        loadTodayRecords();
      }
    } catch (error) {
      console.error('Erro ao remover registro:', error);
    }
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Registros do Dia
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Data selecionada */}
      <View style={styles.dateSection}>
        <Text style={[styles.selectedDate, { color: theme.colors.primary }]}>
          {moment(selectedDate).format('DD/MM/YYYY')}
        </Text>
        <Text style={[styles.selectedDateDay, { color: theme.colors.secondary }]}>
          {moment(selectedDate).format('dddd')}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Botões de registro rápido */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowSymptomModal(true)}
          >
            <Text style={styles.quickActionEmoji}>😣</Text>
            <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
              Sintomas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowPeriodModal(true)}
          >
            <Text style={styles.quickActionEmoji}>🌸</Text>
            <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
              Menstruação
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowActivityModal(true)}
          >
            <Text style={styles.quickActionEmoji}>💕</Text>
            <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
              Atividade
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowNoteModal(true)}
          >
            <Text style={styles.quickActionEmoji}>📝</Text>
            <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>
              Nota
            </Text>
          </TouchableOpacity>
        </View>

        {/* Registros do dia */}
        <View style={styles.todayRecords}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Registros de Hoje
          </Text>
          
          {todayRecords.length > 0 ? (
            todayRecords.map((record) => (
              <View key={record.id} style={[styles.recordItem, { backgroundColor: theme.colors.surface }]}>
                <Text style={styles.recordIcon}>{getRecordIcon(record)}</Text>
                <Text style={[styles.recordText, { color: theme.colors.primary }]}>
                  {getRecordText(record)}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeRecord(record.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emptyStateText, { color: theme.colors.secondary }]}>
                Nenhum registro para hoje
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  dateSection: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  selectedDate: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  selectedDateDay: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  quickActionButton: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  todayRecords: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  recordText: {
    flex: 1,
    fontSize: 16,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBody: {
    marginBottom: 20,
  },
  symptomCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  symptomEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  symptomName: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  flowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  flowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  flowEmoji: {
    fontSize: 20,
    marginRight: 15,
  },
  flowName: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
  },
  activityEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  modalSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalCancelButtonText: {
    color: 'white',
    fontSize: 16,
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