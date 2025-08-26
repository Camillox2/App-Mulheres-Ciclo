// widgets/CycleWidget.tsx - Widget Nativo do EntreFases
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import moment from 'moment';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { calculateCycleInfo } from '../hooks/cycleCalculations';

interface WidgetData {
  phase: string;
  dayOfCycle: number;
  daysUntilPeriod: number;
  pregnancyChance: number;
  mood?: string;
  energy?: number;
  isActive: boolean;
}

export default function CycleWidget() {
  const [widgetData, setWidgetData] = React.useState<WidgetData>({
    phase: 'loading',
    dayOfCycle: 0,
    daysUntilPeriod: 0,
    pregnancyChance: 0,
    isActive: false,
  });

  React.useEffect(() => {
    loadWidgetData();
    // Atualiza a cada 2 horas para economizar bateria
    const interval = setInterval(loadWidgetData, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadWidgetData = async () => {
    try {
      const [cycleDataRaw, notesDataRaw, widgetSettings] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyNotes'),
        AsyncStorage.getItem('widgetSettings')
      ]);

      const settings = widgetSettings ? JSON.parse(widgetSettings) : { enabled: true };
      
      if (!settings.enabled) {
        setWidgetData({
          phase: 'disabled',
          dayOfCycle: 0,
          daysUntilPeriod: 0,
          pregnancyChance: 0,
          isActive: false,
        });
        return;
      }

      if (!cycleDataRaw) {
        setWidgetData({
          phase: 'setup',
          dayOfCycle: 0,
          daysUntilPeriod: 0,
          pregnancyChance: 0,
          isActive: false,
        });
        return;
      }

      const cycleData = JSON.parse(cycleDataRaw);
      const cycleInfo = calculateCycleInfo(cycleData);
      
      let recentMood, recentEnergy;
      if (notesDataRaw) {
        const notes = JSON.parse(notesDataRaw);
        const recentNote = notes
          .filter((note: any) => moment().diff(moment(note.date), 'days') <= 1)
          .sort((a: any, b: any) => moment(b.date).diff(moment(a.date)))[0];
        
        if (recentNote) {
          recentMood = recentNote.mood;
          recentEnergy = recentNote.energy;
        }
      }

      setWidgetData({
        phase: cycleInfo.phase,
        dayOfCycle: cycleInfo.currentDay,
        daysUntilPeriod: cycleInfo.daysUntilNextPeriod,
        pregnancyChance: cycleInfo.pregnancyChance,
        mood: recentMood,
        energy: recentEnergy,
        isActive: true,
      });

    } catch (error) {
      console.error('Erro ao carregar dados do widget:', error);
      setWidgetData({
        phase: 'error',
        dayOfCycle: 0,
        daysUntilPeriod: 0,
        pregnancyChance: 0,
        isActive: false,
      });
    }
  };

  const openApp = () => {
    const url = Linking.createURL('/dashboard');
    Linking.openURL(url).catch(() => {
      // Fallback para abrir o app
      Linking.openURL('EntreFases://').catch(console.error);
    });
  };

  const getPhaseEmoji = (phase: string) => {
    const phaseMap: { [key: string]: string } = {
      menstrual: '🩸',
      folicular: '🌱',
      ovulatoria: '🌸',
      lutea: '🌙',
      loading: '⏳',
      setup: '⚙️',
      error: '❌',
      disabled: '⏸️',
    };
    return phaseMap[phase] || '🌸';
  };

  const getPhaseTitle = (phase: string) => {
    const titleMap: { [key: string]: string } = {
      menstrual: 'MENSTRUAL',
      folicular: 'FOLICULAR',  
      ovulatoria: 'OVULAÇÃO',
      lutea: 'LÚTEA',
      loading: 'CARREGANDO',
      setup: 'CONFIGURAR',
      error: 'ERRO',
      disabled: 'DESABILITADO',
    };
    return titleMap[phase] || 'CICLO';
  };

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return '❓';
    const moodMap: { [key: string]: string } = {
      otimo: '😊',
      bom: '�',
      neutro: '�',
      ruim: '�',
      pessimo: '�',
    };
    return moodMap[mood] || '😊';
  };

  const getPhaseColors = (phase: string): [string, string] => {
    const colorMap: { [key: string]: [string, string] } = {
      menstrual: ['#FF6B6B', '#FF8E8E'],
      folicular: ['#4CAF50', '#66BB6A'],
      ovulatoria: ['#FF9800', '#FFB74D'],
      lutea: ['#673AB7', '#9575CD'],
      loading: ['#90A4AE', '#B0BEC5'],
      setup: ['#2196F3', '#64B5F6'],
      error: ['#F44336', '#EF5350'],
      disabled: ['#757575', '#9E9E9E'],
    };
    return colorMap[phase] || ['#FF6B9D', '#FFB4D6'];
  };

  const { phase, dayOfCycle, daysUntilPeriod, pregnancyChance, mood, energy } = widgetData;

  // Estados especiais
  if (phase === 'loading') {
    return (
      <Pressable onPress={openApp} style={styles.widget}>
        <LinearGradient colors={['#90A4AE', '#B0BEC5']} style={styles.container}>
          <Text style={styles.loadingText}>⏳ Carregando...</Text>
          <Text style={styles.tapHint}>Toque para abrir</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  if (phase === 'setup') {
    return (
      <Pressable onPress={openApp} style={styles.widget}>
        <LinearGradient colors={['#2196F3', '#64B5F6']} style={styles.container}>
          <Text style={styles.setupEmoji}>⚙️</Text>
          <Text style={styles.setupText}>Configure seu{'\n'}ciclo no app!</Text>
          <Text style={styles.tapHint}>Toque para configurar</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  if (phase === 'disabled') {
    return (
      <Pressable onPress={openApp} style={styles.widget}>
        <LinearGradient colors={['#757575', '#9E9E9E']} style={styles.container}>
          <Text style={styles.disabledEmoji}>⏸️</Text>
          <Text style={styles.disabledText}>Widget{'\n'}desabilitado</Text>
          <Text style={styles.tapHint}>Toque para ativar</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  if (phase === 'error') {
    return (
      <Pressable onPress={openApp} style={styles.widget}>
        <LinearGradient colors={['#F44336', '#EF5350']} style={styles.container}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorText}>Erro ao carregar{'\n'}dados</Text>
          <Text style={styles.tapHint}>Toque para tentar novamente</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  // Widget normal
  return (
    <Pressable onPress={openApp} style={styles.widget}>
      <LinearGradient colors={getPhaseColors(phase)} style={styles.container}>
        {/* Header com fase */}
        <View style={styles.header}>
          <Text style={styles.phaseEmoji}>{getPhaseEmoji(phase)}</Text>
          <View style={styles.phaseInfo}>
            <Text style={styles.phaseName}>{getPhaseTitle(phase)}</Text>
            <Text style={styles.dayText}>Dia {dayOfCycle}</Text>
          </View>
        </View>

        {/* Informações principais */}
        <View style={styles.mainInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{daysUntilPeriod}</Text>
            <Text style={styles.infoLabel}>dias até{'\n'}período</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{pregnancyChance}%</Text>
            <Text style={styles.infoLabel}>chance{'\n'}gravidez</Text>
          </View>
        </View>

        {/* Status do dia */}
        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusEmoji}>{getMoodEmoji(mood)}</Text>
            <Text style={styles.statusText}>
              {mood || 'Registrar humor'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusEmoji}>⚡</Text>
            <Text style={styles.statusText}>
              Energia {energy ? `${energy}/5` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Indicador de atualização */}
        <View style={styles.updateIndicator}>
          <Text style={styles.updateText}>
            {moment().format('HH:mm')}
          </Text>
        </View>

        {/* Hint para toque */}
        <View style={styles.tapHintContainer}>
          <Text style={styles.tapHint}>Toque para abrir</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  widget: {
    width: 160,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  container: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  dayText: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: 'white',
    opacity: 0.8,
    marginTop: 2,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  footer: {
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statusEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  statusText: {
    fontSize: 8,
    color: 'white',
    opacity: 0.9,
    flex: 1,
  },
  updateIndicator: {
    position: 'absolute',
    top: 4,
    right: 6,
  },
  updateText: {
    fontSize: 7,
    color: 'white',
    opacity: 0.6,
  },
  tapHintContainer: {
    position: 'absolute',
    bottom: 4,
    left: 6,
  },
  tapHint: {
    fontSize: 6,
    color: 'white',
    opacity: 0.5,
    fontStyle: 'italic',
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  setupEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  setupText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  disabledEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  disabledText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  errorEmoji: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
});