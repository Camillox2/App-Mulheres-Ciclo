// app/home.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { ParticleSystem } from '../components/ParticleSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React from 'react';

const { width } = Dimensions.get('window');

interface UserProfile {
  name: string;
  profileImage?: string;
}

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export default function HomeScreen() {
  const { theme, toggleMode, isLightMode } = useAdaptiveTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [currentDayOfCycle, setCurrentDayOfCycle] = useState(1);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      const cycleInfo = await AsyncStorage.getItem('cycleData');
      
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      
      if (cycleInfo) {
        const cycle = JSON.parse(cycleInfo);
        setCycleData(cycle);
        
        // Calcula dia atual do ciclo
        const lastPeriod = moment(cycle.lastPeriodDate);
        const today = moment();
        const dayOfCycle = today.diff(lastPeriod, 'days') + 1;
        setCurrentDayOfCycle(((dayOfCycle - 1) % cycle.averageCycleLength) + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const getPhaseInfo = () => {
    if (!theme || !cycleData) return { name: 'Carregando...', emoji: '⏳', description: '' };
    
    switch (theme.phase) {
      case 'menstrual':
        return {
          name: 'Menstruação',
          emoji: '🌸',
          description: 'Período de renovação e autocuidado'
        };
      case 'postMenstrual':
        return {
          name: 'Pós-Menstrual',
          emoji: '🌱',
          description: 'Energia renovada e disposição'
        };
      case 'fertile':
        return {
          name: 'Período Fértil',
          emoji: '🔥',
          description: 'Alta energia e criatividade'
        };
      case 'preMenstrual':
        return {
          name: 'Pré-Menstrual',
          emoji: '💜',
          description: 'Preparação e introspecção'
        };
      default:
        return {
          name: 'Carregando...',
          emoji: '⏳',
          description: ''
        };
    }
  };

  const getNextPeriodDays = () => {
    if (!cycleData) return 0;
    
    const lastPeriod = moment(cycleData.lastPeriodDate);
    const nextPeriod = lastPeriod.clone().add(cycleData.averageCycleLength, 'days');
    const today = moment();
    
    return Math.max(0, nextPeriod.diff(today, 'days'));
  };

  const getPregnancyChance = () => {
    if (!theme) return 0;
    
    switch (theme.phase) {
      case 'menstrual':
        return Math.floor(Math.random() * 10) + 1; // 1-10%
      case 'postMenstrual':
        return Math.floor(Math.random() * 15) + 10; // 10-25%
      case 'fertile':
        return Math.floor(Math.random() * 15) + 25; // 25-40%
      case 'preMenstrual':
        return Math.floor(Math.random() * 10) + 5; // 5-15%
      default:
        return 0;
    }
  };

  const phaseInfo = getPhaseInfo();
  const daysToNextPeriod = getNextPeriodDays();
  const pregnancyChance = getPregnancyChance();

  if (!theme) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Sistema de partículas adaptativo */}
      <ParticleSystem
        particleColor={theme.colors.particles}
        opacity={isLightMode ? 0.3 : 0.5}
        count={12}
        enabled={true}
      />

      {/* Header com perfil */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {userProfile?.profileImage ? (
            <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.profileImageText}>
                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: theme.colors.primary }]}>
              Olá, {userProfile?.name || 'Usuária'}! 👋
            </Text>
            <Text style={[styles.currentPhase, { color: theme.colors.secondary }]}>
              {phaseInfo.emoji} {phaseInfo.name}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: theme.colors.surface }]}
          onPress={toggleMode}
        >
          <Text style={styles.themeToggleText}>
            {isLightMode ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card principal do ciclo */}
        <LinearGradient
          colors={theme.colors.gradients as [string, string, ...string[]]}
          style={styles.mainCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cycleInfo}>
            <Text style={styles.cycleTitle}>Dia {currentDayOfCycle} do Ciclo</Text>
            <Text style={styles.cycleDescription}>{phaseInfo.description}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(currentDayOfCycle / (cycleData?.averageCycleLength || 28)) * 100}%`,
                      backgroundColor: 'white'
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {cycleData?.averageCycleLength || 28} dias de ciclo
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Cards de informações */}
        <View style={styles.infoCards}>
          {/* Próxima menstruação */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.infoCardEmoji}>📅</Text>
            <Text style={[styles.infoCardTitle, { color: theme.colors.primary }]}>
              Próxima Menstruação
            </Text>
            <Text style={[styles.infoCardValue, { color: theme.colors.secondary }]}>
              {daysToNextPeriod === 0 ? 'Hoje!' : `${daysToNextPeriod} dias`}
            </Text>
          </View>

          {/* Chance de gravidez */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.infoCardEmoji}>🎯</Text>
            <Text style={[styles.infoCardTitle, { color: theme.colors.primary }]}>
              Chance de Gravidez
            </Text>
            <Text style={[styles.infoCardValue, { color: theme.colors.secondary }]}>
              {pregnancyChance}%
            </Text>
          </View>
        </View>

        {/* Botões de ação rápida */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Ações Rápidas
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/records')}
            >
              <Text style={styles.actionButtonEmoji}>📝</Text>
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Registrar Sintomas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/calendar')}
            >
              <Text style={styles.actionButtonEmoji}>📅</Text>
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Ver Calendário
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/analytics')}
            >
              <Text style={styles.actionButtonEmoji}>📊</Text>
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Estatísticas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.actionButtonEmoji}>⚙️</Text>
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                Configurações
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currentPhase: {
    fontSize: 14,
    opacity: 0.8,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  themeToggleText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  mainCard: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cycleInfo: {
    alignItems: 'center',
  },
  cycleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cycleDescription: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  infoCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoCardEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionButtonEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});