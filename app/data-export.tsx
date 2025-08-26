// app/data-export.tsx - Sistema de Backup e Exportação
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useThemeSystem } from '../hooks/useThemeSystem';
import * as FileSystem from 'expo-file-system';

interface ExportData {
  cycleData?: any;
  dailyNotes: any[];
  symptomTracker: any[];
  menopauseData?: any;
  exportDate: string;
  version: string;
}

export default function DataExportScreen() {
  const { theme } = useThemeSystem();
  const [isExporting, setIsExporting] = useState(false);
  const [dataStats, setDataStats] = useState({
    notes: 0,
    symptoms: 0,
    totalDays: 0,
  });

  React.useEffect(() => {
    loadDataStats();
  }, []);

  const loadDataStats = async () => {
    try {
      const [notesData, symptomsData] = await Promise.all([
        AsyncStorage.getItem('dailyNotes'),
        AsyncStorage.getItem('symptomTracker'),
      ]);

      const notes = notesData ? JSON.parse(notesData) : [];
      const symptoms = symptomsData ? JSON.parse(symptomsData) : [];

      setDataStats({
        notes: notes.length,
        symptoms: symptoms.length,
        totalDays: Math.max(notes.length, symptoms.length),
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const [cycleData, dailyNotes, symptomTracker, menopauseData] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyNotes'),
        AsyncStorage.getItem('symptomTracker'),
        AsyncStorage.getItem('menopauseData'),
      ]);

      const exportData: ExportData = {
        cycleData: cycleData ? JSON.parse(cycleData) : null,
        dailyNotes: dailyNotes ? JSON.parse(dailyNotes) : [],
        symptomTracker: symptomTracker ? JSON.parse(symptomTracker) : [],
        menopauseData: menopauseData ? JSON.parse(menopauseData) : null,
        exportDate: moment().toISOString(),
        version: '1.0',
      };

      const fileName = `entrefases_backup_${moment().format('YYYY-MM-DD_HH-mm')}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));

      await Share.share({
        url: fileUri,
        title: 'Backup EntreFases',
        message: 'Seus dados do EntreFases estão anexados.',
      });

      Alert.alert('Sucesso', 'Backup criado e compartilhado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      Alert.alert('Erro', 'Não foi possível criar o backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSVReport = async () => {
    setIsExporting(true);
    try {
      const [dailyNotes, symptomTracker] = await Promise.all([
        AsyncStorage.getItem('dailyNotes'),
        AsyncStorage.getItem('symptomTracker'),
      ]);

      const notes = dailyNotes ? JSON.parse(dailyNotes) : [];
      const symptoms = symptomTracker ? JSON.parse(symptomTracker) : [];

      // Cria CSV das anotações
      let csvContent = 'Data,Humor,Energia,Sintomas,Tags,Observacoes\n';
      
      notes.forEach((note: any) => {
        const symptomsForDate = symptoms.find((s: any) => s.date === note.date);
        const symptomsList = symptomsForDate ? 
          Object.keys(symptomsForDate.symptoms).join(';') : '';
        
        csvContent += `${note.date},${note.mood || ''},${note.energy || ''},${symptomsList},${note.tags?.join(';') || ''},"${note.notes || ''}"\n`;
      });

      const fileName = `entrefases_relatorio_${moment().format('YYYY-MM-DD')}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      await Share.share({
        url: fileUri,
        title: 'Relatório EntreFases',
        message: 'Relatório CSV dos seus dados do EntreFases.',
      });

      Alert.alert('Sucesso', 'Relatório CSV criado e compartilhado!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      Alert.alert('Erro', 'Não foi possível criar o relatório.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportMedicalReport = async () => {
    setIsExporting(true);
    try {
      const [cycleData, dailyNotes, symptomTracker, menopauseData] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyNotes'),
        AsyncStorage.getItem('symptomTracker'),
        AsyncStorage.getItem('menopauseData'),
      ]);

      const cycle = cycleData ? JSON.parse(cycleData) : null;
      const notes = dailyNotes ? JSON.parse(dailyNotes) : [];
      const symptoms = symptomTracker ? JSON.parse(symptomTracker) : [];
      const menopause = menopauseData ? JSON.parse(menopauseData) : null;

      // Cria relatório médico estruturado
      let report = `RELATÓRIO MÉDICO - ENTREFASES
===============================

Data do Relatório: ${moment().format('DD/MM/YYYY')}
Período analisado: ${notes.length > 0 ? moment(notes[0].date).format('DD/MM/YYYY') : 'N/A'} até ${notes.length > 0 ? moment(notes[notes.length - 1].date).format('DD/MM/YYYY') : 'N/A'}

DADOS DO CICLO:
${cycle ? `
- Idade: ${cycle.age || 'N/A'} anos
- Duração média do ciclo: ${cycle.averageCycleLength} dias
- Duração da menstruação: ${cycle.averagePeriodLength} dias
- Ciclo irregular: ${cycle.irregularCycle ? 'Sim' : 'Não'}
- Última menstruação: ${moment(cycle.lastPeriodDate).format('DD/MM/YYYY')}
` : 'Não configurado'}

SINTOMAS MAIS FREQUENTES:
`;

      // Analisa sintomas frequentes
      const symptomCount: { [key: string]: number } = {};
      symptoms.forEach((symptomData: any) => {
        Object.keys(symptomData.symptoms).forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
      });

      const topSymptoms = Object.entries(symptomCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      topSymptoms.forEach(([symptom, count], index) => {
        report += `${index + 1}. ${symptom}: ${count} registros\n`;
      });

      // Padrões de humor
      const moodCount: { [key: string]: number } = {};
      notes.forEach((note: any) => {
        if (note.mood) {
          moodCount[note.mood] = (moodCount[note.mood] || 0) + 1;
        }
      });

      report += `\nPADRÕES DE HUMOR:
`;
      Object.entries(moodCount).forEach(([mood, count]) => {
        const percentage = ((count / notes.length) * 100).toFixed(1);
        report += `- ${mood}: ${count} registros (${percentage}%)\n`;
      });

      // Energia média
      const energyLevels = notes
        .filter((note: any) => note.energy)
        .map((note: any) => note.energy);
      
      if (energyLevels.length > 0) {
        const avgEnergy = energyLevels.reduce((a: number, b: number) => a + b, 0) / energyLevels.length;
        report += `\nNÍVEL MÉDIO DE ENERGIA: ${avgEnergy.toFixed(1)}/5\n`;
      }

      // Dados da menopausa se disponível
      if (menopause) {
        report += `\nDADOS DA MENOPAUSA:
- Idade: ${menopause.age} anos
- Estágio: ${menopause.stage}
- Sintomas: ${menopause.symptoms.join(', ')}
`;
      }

      report += `\n\nRELATÓRIO GERADO PELO APP ENTREFASES
Para mais informações, consulte um profissional de saúde.`;

      const fileName = `entrefases_relatorio_medico_${moment().format('YYYY-MM-DD')}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, report);

      await Share.share({
        url: fileUri,
        title: 'Relatório Médico - EntreFases',
        message: 'Relatório médico estruturado dos seus dados do EntreFases.',
      });

      Alert.alert('Sucesso', 'Relatório médico criado e compartilhado!');
    } catch (error) {
      console.error('Erro ao exportar relatório médico:', error);
      Alert.alert('Erro', 'Não foi possível criar o relatório médico.');
    } finally {
      setIsExporting(false);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja apagar todos os seus dados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'dailyNotes',
                'symptomTracker',
                'menopauseData',
                'cycleData'
              ]);
              Alert.alert('Sucesso', 'Todos os dados foram apagados.');
              setDataStats({ notes: 0, symptoms: 0, totalDays: 0 });
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível apagar os dados.');
            }
          },
        },
      ]
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
            <Text style={styles.title}>Backup & Exportação 💾</Text>
            <Text style={styles.subtitle}>
              Gerencie seus dados de forma segura
            </Text>
          </View>

          {/* Estatísticas dos Dados */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Seus Dados</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dataStats.notes}</Text>
                <Text style={styles.statLabel}>Anotações</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dataStats.symptoms}</Text>
                <Text style={styles.statLabel}>Sintomas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{dataStats.totalDays}</Text>
                <Text style={styles.statLabel}>Total de Dias</Text>
              </View>
            </View>
          </View>

          {/* Opções de Exportação */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Opções de Exportação</Text>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={exportAllData}
              disabled={isExporting}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionEmoji}>📦</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Backup Completo</Text>
                <Text style={styles.optionDescription}>
                  Exporta todos os seus dados em formato JSON
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={exportCSVReport}
              disabled={isExporting}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionEmoji}>📊</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Relatório CSV</Text>
                <Text style={styles.optionDescription}>
                  Dados em planilha para análise externa
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={exportMedicalReport}
              disabled={isExporting}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.optionEmoji}>🏥</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Relatório Médico</Text>
                <Text style={styles.optionDescription}>
                  Relatório estruturado para consultas médicas
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Opções Avançadas */}
          <View style={styles.dangerSection}>
            <Text style={styles.sectionTitle}>Zona de Perigo</Text>
            <TouchableOpacity
              style={styles.dangerCard}
              onPress={clearAllData}
              disabled={isExporting}
            >
              <Text style={styles.dangerEmoji}>⚠️</Text>
              <Text style={styles.dangerTitle}>Limpar Todos os Dados</Text>
              <Text style={styles.dangerDescription}>
                Remove permanentemente todos os seus dados
              </Text>
            </TouchableOpacity>
          </View>

          {isExporting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Processando...</Text>
            </View>
          )}

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
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
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
  },
  optionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionEmoji: {
    fontSize: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  dangerSection: {
    marginBottom: 20,
  },
  dangerCard: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.5)',
  },
  dangerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  bottomSpace: {
    height: 30,
  },
});