// app/notes.tsx - Página de Anotações Diárias
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useThemeSystem } from '../hooks/useThemeSystem';
import { router } from 'expo-router';

interface DailyNote {
  date: string;
  mood: string;
  energy: number; // 1-5
  notes: string;
  tags: string[];
}

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Feliz', value: 'happy' },
  { emoji: '😌', label: 'Calma', value: 'calm' },
  { emoji: '😔', label: 'Triste', value: 'sad' },
  { emoji: '😤', label: 'Irritada', value: 'angry' },
  { emoji: '😰', label: 'Ansiosa', value: 'anxious' },
  { emoji: '😴', label: 'Cansada', value: 'tired' },
];

// Sintomas rápidos para anotações (removido - usar só o tracker detalhado)

const TAG_OPTIONS = [
  'Física',
  'Emocional',
  'Sexual',
  'Trabalho',
  'Relacionamento',
  'Exercício',
  'Alimentação',
  'Sono',
];

export default function NotesScreen() {
  const { theme } = useThemeSystem();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentNote, setCurrentNote] = useState<DailyNote>({
    date: selectedDate,
    mood: '',
    energy: 3,
    notes: '',
    tags: [],
  });
  const [allNotes, setAllNotes] = useState<DailyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    const noteForDate = allNotes.find(note => note.date === selectedDate);
    if (noteForDate) {
      setCurrentNote(noteForDate);
    } else {
      setCurrentNote({
        date: selectedDate,
        mood: '',
        energy: 3,
        notes: '',
        tags: [],
      });
    }
  }, [selectedDate, allNotes]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('dailyNotes');
      if (storedNotes) {
        setAllNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  };

  const saveNote = async () => {
    if (!currentNote.mood && !currentNote.notes && currentNote.tags.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um humor, tag ou anotação.');
      return;
    }

    setIsLoading(true);

    try {
      const existingNoteIndex = allNotes.findIndex(note => note.date === selectedDate);
      let updatedNotes;

      if (existingNoteIndex >= 0) {
        updatedNotes = [...allNotes];
        updatedNotes[existingNoteIndex] = currentNote;
      } else {
        updatedNotes = [...allNotes, currentNote];
      }

      await AsyncStorage.setItem('dailyNotes', JSON.stringify(updatedNotes));
      setAllNotes(updatedNotes);
      Alert.alert('Sucesso', 'Anotação salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a anotação.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sintomas removidos - use a página dedicada "Sintomas" para tracking detalhado

  const toggleTag = (tag: string) => {
    const tags = currentNote.tags.includes(tag)
      ? currentNote.tags.filter(t => t !== tag)
      : [...currentNote.tags, tag];
    
    setCurrentNote({ ...currentNote, tags });
  };

  const renderDateSelector = () => {
    const dates = [];
    for (let i = -7; i <= 0; i++) {
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

  if (!theme) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary, theme.colors.primary]}
        style={styles.gradient}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Anotações Diárias 📝</Text>
            <Text style={styles.subtitle}>
              Registre como você se sente e seus sintomas
            </Text>
          </View>

          {renderDateSelector()}

          {/* Humor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Como você está se sentindo?</Text>
            <View style={styles.moodContainer}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodOption,
                    { backgroundColor: currentNote.mood === mood.value ? 'white' : 'rgba(255,255,255,0.2)' }
                  ]}
                  onPress={() => setCurrentNote({ ...currentNote, mood: mood.value })}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    { color: currentNote.mood === mood.value ? theme.colors.primary : 'white' }
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nível de Energia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nível de energia (1-5)</Text>
            <Text style={styles.energyDisplay}>{currentNote.energy} ⚡</Text>
            <View style={styles.energyContainer}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.energyButton,
                    { backgroundColor: currentNote.energy === level ? 'white' : 'rgba(255,255,255,0.2)' }
                  ]}
                  onPress={() => setCurrentNote({ ...currentNote, energy: level })}
                >
                  <Text style={[
                    styles.energyText,
                    { color: currentNote.energy === level ? theme.colors.primary : 'white' }
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Link para Sintomas Detalhados */}
          <View style={styles.linkSection}>
            <TouchableOpacity 
              style={styles.linkCard} 
              onPress={() => router.push('/symptom-tracker')}
            >
              <Text style={styles.linkEmoji}>🩺</Text>
              <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>Rastrear Sintomas</Text>
                <Text style={styles.linkSubtitle}>Use a página dedicada para tracking detalhado com intensidade</Text>
              </View>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <View style={styles.tagsContainer}>
              {TAG_OPTIONS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    { backgroundColor: currentNote.tags.includes(tag) ? 'white' : 'rgba(255,255,255,0.2)' }
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[
                    styles.tagText,
                    { color: currentNote.tags.includes(tag) ? theme.colors.primary : 'white' }
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Anotações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anotações pessoais</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Digite suas observações do dia..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              multiline
              numberOfLines={4}
              value={currentNote.notes}
              onChangeText={(text) => setCurrentNote({ ...currentNote, notes: text })}
            />
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveNote}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Salvando...' : 'Salvar Anotação'}
            </Text>
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
  section: {
    marginBottom: 25,
  },
  linkSection: {
    marginBottom: 25,
  },
  linkCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  linkEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  linkSubtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    lineHeight: 16,
  },
  linkArrow: {
    fontSize: 18,
    color: 'white',
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodOption: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  energyDisplay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  energyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  energyButton: {
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  energyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilos de sintomas removidos - usar página dedicada
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tagChip: {
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    marginTop: 20,
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