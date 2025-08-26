// hooks/useSmartInsights.ts - Sistema de Insights Inteligentes
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { CycleData } from './cycleCalculations';

interface DailyNote {
  date: string;
  mood: string;
  symptoms: string[];
  energy: number;
  notes: string;
  tags: string[];
}

interface SymptomData {
  date: string;
  symptoms: { [key: string]: number };
}

interface MenopauseData {
  age: number;
  symptoms: string[];
  stage: string;
}

interface InsightData {
  id: string;
  type: 'cycle' | 'symptoms' | 'mood' | 'energy' | 'menopause' | 'general';
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string[];
  actionable?: boolean;
  dataPoints?: number;
}

export const useSmartInsights = () => {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    try {
      setLoading(true);
      
      // Carrega todos os dados necessários
      const [cycleData, notesData, symptomsData, menopauseData] = await Promise.all([
        loadCycleData(),
        loadNotesData(),
        loadSymptomsData(),
        loadMenopauseData(),
      ]);

      console.log('📊 Dados carregados:', {
        cycleData: !!cycleData,
        notesCount: notesData?.length || 0,
        symptomsCount: symptomsData?.length || 0,
        menopauseData: !!menopauseData
      });

      const generatedInsights: InsightData[] = [];

      // Insights sobre ciclo menstrual - SEMPRE gera se tem dados do ciclo
      if (cycleData) {
        generatedInsights.push(...generateCycleInsights(cycleData));
      }

      // Insights sobre sintomas - reduz requisito mínimo
      if (symptomsData && symptomsData.length > 0) {
        generatedInsights.push(...generateSymptomInsights(symptomsData));
      }

      // Insights sobre humor e energia - reduz requisito mínimo
      if (notesData && notesData.length > 0) {
        generatedInsights.push(...generateMoodInsights(notesData));
        generatedInsights.push(...generateEnergyInsights(notesData));
      }

      // Insights sobre menopausa - corrige a lógica
      if (menopauseData || (cycleData?.age && cycleData.age >= 40)) {
        const ageToUse = menopauseData?.age || cycleData?.age || 40;
        const symptomsToUse = menopauseData?.symptoms || [];
        generatedInsights.push(...generateMenopauseInsights({
          age: ageToUse,
          symptoms: symptomsToUse,
          stage: menopauseData?.stage || 'premenopausa'
        }));
      }

      // Insights gerais baseados na idade - SEMPRE gera se tem idade
      if (cycleData?.age) {
        generatedInsights.push(...generateAgeBasedInsights(cycleData.age));
      }

      // Adiciona insights de boas-vindas se não há dados suficientes
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          id: 'welcome-insight',
          type: 'general',
          title: 'Bem-vinda ao EntreFases! 🌸',
          description: 'Comece registrando seus dados para receber insights personalizados.',
          recommendation: 'Use as páginas de Anotações e Sintomas para começar a coletar dados sobre seu bem-estar.',
          priority: 'medium',
          icon: '👋',
          color: ['#FF6B9D', '#FFB4D6'],
          actionable: true,
        });
      }

      console.log('🧠 Insights gerados:', generatedInsights.length);

      // Ordena por prioridade
      generatedInsights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCycleData = async (): Promise<CycleData | null> => {
    try {
      const data = await AsyncStorage.getItem('cycleData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const loadNotesData = async (): Promise<DailyNote[] | null> => {
    try {
      const data = await AsyncStorage.getItem('dailyNotes');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const loadSymptomsData = async (): Promise<SymptomData[] | null> => {
    try {
      const data = await AsyncStorage.getItem('symptomTracker');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const loadMenopauseData = async (): Promise<MenopauseData | null> => {
    try {
      const data = await AsyncStorage.getItem('menopauseData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const generateCycleInsights = (cycleData: CycleData): InsightData[] => {
    const insights: InsightData[] = [];
    const { averageCycleLength, irregularCycle, age } = cycleData;

    // Insight básico sobre o ciclo configurado
    insights.push({
      id: 'cycle-configured',
      type: 'cycle',
      title: 'Ciclo configurado com sucesso! 📅',
      description: `Seu ciclo de ${averageCycleLength} dias está sendo monitorado. Continue registrando dados para insights mais precisos.`,
      recommendation: 'Use as páginas de Anotações e Sintomas diariamente para obter análises mais detalhadas.',
      priority: 'low',
      icon: '✅',
      color: ['#4CAF50', '#66BB6A'],
      actionable: true,
    });

    // Insight sobre duração do ciclo
    if (averageCycleLength < 21 || averageCycleLength > 35) {
      insights.push({
        id: 'cycle-length-unusual',
        type: 'cycle',
        title: 'Duração do ciclo fora do padrão',
        description: `Seu ciclo de ${averageCycleLength} dias está fora da faixa típica (21-35 dias).`,
        recommendation: 'Considere consultar um ginecologista para avaliar se há alguma condição que precise de atenção.',
        priority: 'high',
        icon: '⚠️',
        color: ['#FF6B6B', '#FF8E8E'],
        actionable: true,
      });
    } else {
      insights.push({
        id: 'cycle-length-normal',
        type: 'cycle',
        title: 'Duração do ciclo saudável',
        description: `Seu ciclo de ${averageCycleLength} dias está dentro da faixa normal (21-35 dias).`,
        recommendation: 'Continue monitorando para identificar padrões e variações ao longo do tempo.',
        priority: 'low',
        icon: '💚',
        color: ['#4CAF50', '#66BB6A'],
        actionable: false,
      });
    }

    // Insight sobre ciclos irregulares
    if (irregularCycle && age && age < 45) {
      insights.push({
        id: 'irregular-cycle-young',
        type: 'cycle',
        title: 'Ciclos irregulares detectados',
        description: 'Ciclos irregulares podem indicar desequilíbrios hormonais ou outras condições.',
        recommendation: 'Mantenha um registro detalhado dos seus ciclos e consulte um médico se a irregularidade persistir.',
        priority: 'medium',
        icon: '📊',
        color: ['#4ECDC4', '#44B5CC'],
        actionable: true,
      });
    } else if (irregularCycle) {
      insights.push({
        id: 'irregular-cycle-age',
        type: 'cycle',
        title: 'Irregularidade relacionada à idade',
        description: 'Ciclos irregulares são comuns com o avanço da idade, especialmente após os 40.',
        recommendation: 'Continue monitorando e considere discutir com um ginecologista sobre a transição hormonal.',
        priority: 'low',
        icon: '🌸',
        color: ['#E1BEE7', '#CE93D8'],
        actionable: false,
      });
    }

    return insights;
  };

  const generateSymptomInsights = (symptomsData: SymptomData[]): InsightData[] => {
    const insights: InsightData[] = [];
    const recentData = symptomsData.filter(data => 
      moment().diff(moment(data.date), 'days') <= 30
    );

    // Insight básico se tem qualquer dado de sintomas
    if (recentData.length > 0) {
      insights.push({
        id: 'symptoms-tracking',
        type: 'symptoms',
        title: 'Rastreamento de sintomas ativo! 📊',
        description: `Você registrou sintomas em ${recentData.length} dia${recentData.length > 1 ? 's' : ''} recente${recentData.length > 1 ? 's' : ''}.`,
        recommendation: 'Continue registrando diariamente para identificar padrões e tendências.',
        priority: 'low',
        icon: '📈',
        color: ['#A8E6CF', '#7FCDCD'],
        dataPoints: recentData.length,
      });
    }

    if (recentData.length < 2) return insights;

    // Analisa sintomas mais frequentes
    const symptomFrequency: { [key: string]: number } = {};
    const symptomIntensity: { [key: string]: number[] } = {};

    recentData.forEach(data => {
      Object.entries(data.symptoms).forEach(([symptom, intensity]) => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
        if (!symptomIntensity[symptom]) symptomIntensity[symptom] = [];
        symptomIntensity[symptom].push(intensity);
      });
    });

    // Encontra o sintoma mais frequente (reduzindo requisito mínimo)
    const mostFrequentSymptom = Object.entries(symptomFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostFrequentSymptom && mostFrequentSymptom[1] >= 2) {
      const [symptom, frequency] = mostFrequentSymptom;
      const avgIntensity = symptomIntensity[symptom].reduce((a, b) => a + b, 0) / symptomIntensity[symptom].length;

      insights.push({
        id: 'frequent-symptom',
        type: 'symptoms',
        title: 'Sintoma frequente detectado',
        description: `Você relatou "${symptom}" em ${frequency} dos últimos ${recentData.length} registros.`,
        recommendation: avgIntensity > 3 
          ? 'A intensidade alta deste sintoma sugere consultar um profissional de saúde.'
          : 'Monitore este sintoma e considere técnicas de alívio natural.',
        priority: avgIntensity > 3 ? 'high' : 'medium',
        icon: '🔍',
        color: ['#A8E6CF', '#7FCDCD'],
        dataPoints: frequency,
      });
    }

    return insights;
  };

  const generateMoodInsights = (notesData: DailyNote[]): InsightData[] => {
    const insights: InsightData[] = [];
    const recentData = notesData.filter(note => 
      moment().diff(moment(note.date), 'days') <= 14
    );

    // Insight básico para qualquer anotação de humor
    if (recentData.length > 0) {
      insights.push({
        id: 'mood-tracking',
        type: 'mood',
        title: 'Acompanhamento de humor ativo! 😊',
        description: `Você registrou seu humor em ${recentData.length} dia${recentData.length > 1 ? 's' : ''} nas últimas 2 semanas.`,
        recommendation: 'Continue registrando para identificar padrões emocionais relacionados ao seu ciclo.',
        priority: 'low',
        icon: '💝',
        color: ['#FFB74D', '#FF9800'],
        dataPoints: recentData.length,
      });
    }

    if (recentData.length < 3) return insights;

    const moodCounts: { [key: string]: number } = {};
    recentData.forEach(note => {
      if (note.mood) {
        moodCounts[note.mood] = (moodCounts[note.mood] || 0) + 1;
      }
    });

    const totalEntries = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    const negativeEmotion = (moodCounts.sad || 0) + (moodCounts.angry || 0) + (moodCounts.anxious || 0);

    if (negativeEmotion / totalEntries > 0.6) {
      insights.push({
        id: 'mood-concern',
        type: 'mood',
        title: 'Padrão de humor preocupante',
        description: `Você relatou emoções negativas em ${Math.round((negativeEmotion / totalEntries) * 100)}% dos registros recentes.`,
        recommendation: 'Considere técnicas de bem-estar como meditação, exercícios ou conversas com um psicólogo.',
        priority: 'high',
        icon: '💙',
        color: ['#A8E6CF', '#7FCDCD'],
        actionable: true,
      });
    }

    return insights;
  };

  const generateEnergyInsights = (notesData: DailyNote[]): InsightData[] => {
    const insights: InsightData[] = [];
    const recentData = notesData.filter(note => 
      moment().diff(moment(note.date), 'days') <= 14 && note.energy
    );

    // Insight básico para qualquer registro de energia
    if (recentData.length > 0) {
      const avgEnergy = recentData.reduce((sum, note) => sum + note.energy, 0) / recentData.length;
      insights.push({
        id: 'energy-tracking',
        type: 'energy',
        title: 'Monitoramento de energia ativo! ⚡',
        description: `Sua energia média é ${avgEnergy.toFixed(1)}/5 baseada em ${recentData.length} registro${recentData.length > 1 ? 's' : ''}.`,
        recommendation: avgEnergy < 3 
          ? 'Considere técnicas para aumentar sua energia: melhor sono, exercícios leves ou alimentação balanceada.'
          : 'Continue monitorando para identificar padrões relacionados ao seu ciclo.',
        priority: avgEnergy < 2.5 ? 'medium' : 'low',
        icon: '🔋',
        color: ['#81C784', '#4CAF50'],
        dataPoints: recentData.length,
      });
    }

    if (recentData.length < 3) return insights;

    const avgEnergy = recentData.reduce((sum, note) => sum + note.energy, 0) / recentData.length;

    if (avgEnergy < 2.5) {
      insights.push({
        id: 'low-energy',
        type: 'energy',
        title: 'Níveis de energia consistentemente baixos',
        description: `Sua energia média nas últimas duas semanas foi ${avgEnergy.toFixed(1)}/5.`,
        recommendation: 'Avalie seu sono, alimentação e níveis de estresse. Considere suplementos ou exames médicos.',
        priority: 'medium',
        icon: '🔋',
        color: ['#FFB74D', '#FF9800'],
        actionable: true,
      });
    }

    return insights;
  };

  const generateMenopauseInsights = (menopauseData: MenopauseData): InsightData[] => {
    const insights: InsightData[] = [];
    const { age, symptoms, stage } = menopauseData;

    if (age >= 45 && symptoms.length >= 3) {
      insights.push({
        id: 'menopause-transition',
        type: 'menopause',
        title: 'Possível transição da menopausa',
        description: `Com ${age} anos e ${symptoms.length} sintomas relatados, você pode estar entrando na perimenopausa.`,
        recommendation: 'Consulte um ginecologista especializado em menopausa para orientação personalizada.',
        priority: 'high',
        icon: '🌸',
        color: ['#E1BEE7', '#CE93D8'],
        actionable: true,
      });
    }

    return insights;
  };

  const generateAgeBasedInsights = (age: number): InsightData[] => {
    const insights: InsightData[] = [];

    if (age >= 35 && age < 40) {
      insights.push({
        id: 'fertility-awareness',
        type: 'general',
        title: 'Consciência sobre fertilidade',
        description: 'A fertilidade começa a declinar gradualmente após os 35 anos.',
        recommendation: 'Se você planeja engravidar, considere conversar com um especialista em fertilidade.',
        priority: 'low',
        icon: '🤱',
        color: ['#81C784', '#4CAF50'],
        actionable: false,
      });
    }

    if (age >= 40) {
      insights.push({
        id: 'health-checkups',
        type: 'general',
        title: 'Importância de check-ups regulares',
        description: 'Aos 40+ anos, exames preventivos se tornam ainda mais importantes.',
        recommendation: 'Mantenha consultas regulares com ginecologista e faça exames de rotina anuais.',
        priority: 'medium',
        icon: '🏥',
        color: ['#90CAF9', '#2196F3'],
        actionable: true,
      });
    }

    return insights;
  };

  const refreshInsights = () => {
    generateInsights();
  };

  return {
    insights,
    loading,
    refreshInsights,
  };
};