// app/home.tsx - VERSÃO COMPLETA REDESENHADA
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { ParticleSystem } from '../components/ParticleSystem';
import { Card, Button, ProgressBar } from '../components/ui/index';
import { calculateCycleInfo } from '../hooks/cycleCalculations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React from 'react';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  name: string;
  profileImage?: string;
}

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

interface CycleInfo {
  currentDay: number;
  phase: string;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
  pregnancyChance: number;
  isInFertileWindow: boolean;
}

export default function HomeScreen() {
  const { theme, isLightMode, phaseProgress } = useAdaptiveTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (theme && userProfile) {
      startAnimations();
    }
  }, [theme, userProfile]);

  useEffect(() => {
    if (cycleData) {
      const info = calculateCycleInfo(cycleData);
      setCycleInfo(info);
    }
  }, [cycleData]);

  const startAnimations = () => {
    // Animação de entrada principal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação dos cards com stagger
    Animated.stagger(150, [
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação de pulso contínua
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  };

  const loadUserData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      const cycleInfo = await AsyncStorage.getItem('cycleData');
      
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      
      if (cycleInfo) {
        setCycleData(JSON.parse(cycleInfo));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const getPhaseInfo = () => {
    if (!theme) return { name: 'Carregando...', emoji: '⏳', description: '', tips: [] };
    
    const phaseMap = {
      menstrual: {
        name: 'Menstruação',
        emoji: '🌸',
        description: 'Tempo de renovação e autocuidado',
        tips: ['Descanse bastante', 'Mantenha-se hidratada', 'Use calor para aliviar cólicas', 'Seja gentil consigo mesma']
      },
      postMenstrual: {
        name: 'Pós-Menstrual',
        emoji: '🌱',
        description: 'Energia renovada e disposição',
        tips: ['Aproveite a energia extra', 'Inicie novos projetos', 'Exercite-se mais intensamente', 'Socialize e tome decisões']
      },
      fertile: {
        name: 'Período Fértil',
        emoji: '🔥',
        description: 'Alta energia e criatividade',
        tips: ['Use proteção se não desejar engravidar', 'Aproveite a criatividade', 'Observe mudanças no corpo', 'Energia no máximo']
      },
      ovulation: {
        name: 'Ovulação',
        emoji: '⭐',
        description: 'Pico de energia e fertilidade',
        tips: ['Pico de fertilidade', 'Energia e libido no máximo', 'Possível dor no ovário', 'Momento ideal para concepção']
      },
      preMenstrual: {
        name: 'Pré-Menstrual',
        emoji: '💜',
        description: 'Preparação e introspecção',
        tips: ['Pratique autocuidado extra', 'Exercícios leves ajudam', 'Seja paciente consigo mesma', 'Mantenha dieta equilibrada']
      },
    };
    
    return phaseMap[theme.phase] || phaseMap.menstrual;
  };

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getMotivationalMessage = () => {
    const messages = {
      menstrual: 'Tempo de se reconectar consigo mesma 🌸',
      postMenstrual: 'Energia renovada, mundo nas suas mãos! 🌱',
      fertile: 'Você está radiante e poderosa! 🔥',
      ovulation: 'Você é pura energia e vitalidade! ⭐',
      preMenstrual: 'Sua sensibilidade é um superpoder 💜',
    };
    return messages[(theme?.phase as keyof typeof messages) ?? 'menstrual'] || messages.menstrual;
  };

  const quickActions = [
    { 
      key: 'calendar', 
      icon: '📅', 
      label: 'Calendário', 
      description: 'Ciclo',
      route: '/calendar',
      gradient: ['#58D68D', '#27AE60'] as const
    },
    { 
      key: 'analytics', 
      icon: '📊', 
      label: 'Estatísticas', 
      description: 'Insights',
      route: '/analytics',
      gradient: ['#BB86FC', '#8E44AD'] as const
    },
  ];

  if (!theme) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#FEFEFE' }]}>
        <LinearGradient
          colors={['#FF6B9D', '#FFB4D6']}
          style={styles.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.Text 
            style={[
              styles.loadingText,
              {
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            ✨ Carregando sua jornada...
          </Animated.Text>
        </LinearGradient>
      </View>
    );
  }

  const phaseInfo = getPhaseInfo();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isLightMode ? 'dark-content' : 'light-content'} />
      
      {/* Sistema de partículas */}
      <ParticleSystem
        particleColor={theme.colors.particles}
        opacity={isLightMode ? 0.4 : 0.6}
        count={15}
        enabled={true}
      />

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header de Boas-vindas */}
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {userProfile?.name || 'Usuária'}! 👋
            </Text>
          </View>
          
          <Text style={[styles.motivationalMessage, { color: theme.colors.text.tertiary }]}>
            {getMotivationalMessage()}
          </Text>
        </Animated.View>

        {/* Card Principal do Ciclo */}
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <Card variant="glass" style={styles.mainCycleCard}>
            <LinearGradient
              colors={theme.colors.gradients.primary as [import('react-native').ColorValue, import('react-native').ColorValue]}
              style={styles.cycleCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cycleCardContent}>
                {/* Header da Fase */}
                <View style={styles.phaseHeader}>
                  <Animated.Text 
                    style={[
                      styles.phaseEmoji,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    {phaseInfo.emoji}
                  </Animated.Text>
                  <View style={styles.phaseTextContainer}>
                    <Text style={styles.phaseName}>{phaseInfo.name}</Text>
                    <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
                  </View>
                </View>

                {/* Informações do Ciclo */}
                <View style={styles.cycleStatsContainer}>
                  <View style={styles.cycleStat}>
                    <Text style={styles.cycleStatLabel}>Dia do Ciclo</Text>
                    <Text style={styles.cycleStatValue}>{cycleInfo?.currentDay || 1}</Text>
                  </View>
                  
                  <View style={styles.cycleStat}>
                    <Text style={styles.cycleStatLabel}>Intensidade</Text>
                    <Text style={styles.cycleStatValue}>{Math.round((phaseProgress || 0.7) * 100)}%</Text>
                  </View>
                </View>

                {/* Progresso da Fase */}
                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>Progresso da Fase</Text>
                  <ProgressBar
                    progress={phaseProgress || 0.7}
                    height={10}
                    animated={true}
                    gradient={false}
                    style={styles.progressBar}
                  />
                </View>
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Cards de Informações Rápidas */}
        <Animated.View 
          style={[
            styles.infoCardsSection,
            { 
              opacity: cardsOpacity,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            📊 Resumo do Ciclo
          </Text>
          
          <View style={styles.infoCardsGrid}>
            <Card variant="elevated" style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <LinearGradient
                  colors={['#FFE5F0', '#F8BBD9']}
                  style={styles.infoCardIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.infoCardEmoji}>📅</Text>
                </LinearGradient>
                <Text style={[styles.infoCardTitle, { color: theme.colors.text.primary }]}>
                  Próxima Menstruação
                </Text>
                <Text style={[styles.infoCardValue, { color: theme.colors.primary }]}>
                  {cycleInfo?.daysUntilNextPeriod === 0 ? 'Hoje!' : 
                   cycleInfo?.daysUntilNextPeriod === 1 ? 'Amanhã' :
                   `${cycleInfo?.daysUntilNextPeriod || 0} dias`}
                </Text>
              </View>
            </Card>

            <Card variant="elevated" style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <LinearGradient
                  colors={['#FEF2F2', '#FCA5A5']}
                  style={styles.infoCardIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.infoCardEmoji}>🎯</Text>
                </LinearGradient>
                <Text style={[styles.infoCardTitle, { color: theme.colors.text.primary }]}>
                  Chance de Gravidez
                </Text>
                <Text style={[styles.infoCardValue, { color: theme.colors.primary }]}>
                  {cycleInfo?.pregnancyChance || 0}%
                </Text>
              </View>
            </Card>
          </View>
        </Animated.View>

        {/* Ações Rápidas */}
        <Animated.View 
          style={[
            styles.quickActionsSection,
            { opacity: cardsOpacity }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            ⚡ Ações Rápidas
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={action.key}
                style={{
                  opacity: cardsOpacity,
                  transform: [
                    {
                      translateY: cardsOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.8}
                >
                  <Card variant="glass" style={styles.quickActionCard}>
                    <LinearGradient
                      colors={action.gradient}
                      style={styles.quickActionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.quickActionContent}>
                        <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                        <Text style={styles.quickActionLabel}>
                          {action.label}
                        </Text>
                        <Text style={styles.quickActionDescription}>
                          {action.description}
                        </Text>
                      </View>
                    </LinearGradient>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Dicas da Fase */}
        <Animated.View 
          style={[
            styles.tipsSection,
            { opacity: cardsOpacity }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            💡 Dicas para {phaseInfo.name}
          </Text>
          
          <Card variant="minimal" gradient style={styles.tipsCard}>
            <View style={styles.tipsContent}>
              {phaseInfo.tips.map((tip, index) => (
                <Animated.View 
                  key={index} 
                  style={[
                    styles.tipItem,
                    {
                      opacity: cardsOpacity,
                      transform: [
                        {
                          translateX: cardsOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.tipDot}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={[styles.tipText, { color: theme.colors.text.primary }]}>
                    {tip}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* Botão de Configurações */}
        <Animated.View 
          style={[
            styles.settingsSection,
            { opacity: cardsOpacity }
          ]}
        >
          <Button
            title="Configurações Avançadas"
            onPress={() => router.push('/settings')}
            variant="secondary"
            icon="⚙️"
            style={styles.settingsButton}
          />
        </Animated.View>

        {/* Espaçamento inferior */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  welcomeSection: {
    paddingVertical: 20,
    zIndex: 10,
  },
  greetingContainer: {
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  motivationalMessage: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  mainCycleCard: {
    marginBottom: 30,
    overflow: 'hidden',
  },
  cycleCardGradient: {
    borderRadius: 20,
    padding: 25,
  },
  cycleCardContent: {
    alignItems: 'center',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
  },
  phaseEmoji: {
    fontSize: 40,
    marginRight: 20,
  },
  phaseTextContainer: {
    flex: 1,
  },
  phaseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  phaseDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cycleStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
  },
  cycleStat: {
    alignItems: 'center',
  },
  cycleStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cycleStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  progressBar: {
    width: '85%',
  },
  infoCardsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  infoCardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    width: (width - 60) / 2,
    padding: 18,
  },
  infoCardContent: {
    alignItems: 'center',
  },
  infoCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoCardEmoji: {
    fontSize: 24,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 16,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 80) / 3,
  },
  quickActionCard: {
    aspectRatio: 0.85,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flex: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  quickActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickActionDescription: {
    fontSize: 11,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipsCard: {
    padding: 22,
  },
  tipsContent: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  settingsSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  bottomSpacer: {
    height: 40,
  },
}); 