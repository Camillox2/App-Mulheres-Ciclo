// app/home.tsx - VERSÃO CORRIGIDA
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  ActivityIndicator, // Adicionado ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { ParticleSystem } from '../components/ParticleSystem';
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
  const [isLoading, setIsLoading] = useState(true);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (theme && !isLoading) {
      startAnimations();
    }
  }, [theme, isLoading]);

  useEffect(() => {
    if (cycleData) {
      try {
        const info = calculateCycleInfo(cycleData);
        setCycleInfo(info);
      } catch (error) {
        console.error('Erro ao calcular informações do ciclo:', error);
      }
    }
  }, [cycleData]);

  const startAnimations = () => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserData = async () => {
    try {
      const [profileData, cycleInfo] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('cycleData')
      ]);
      
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      
      if (cycleInfo) {
        setCycleData(JSON.parse(cycleInfo));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
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
    return messages[(theme?.phase as keyof typeof messages) || 'menstrual'];
  };

  // CORRIGINDO OS BOTÕES DE AÇÃO RÁPIDA
  const quickActions = [
    { 
      key: 'calendar', 
      icon: '📅', 
      label: 'Calendário', 
      description: 'Ver ciclo',
      route: 'calendar',
      colors: ['#58D68D', '#27AE60']
    },
    { 
      key: 'records', 
      icon: '📝', 
      label: 'Registros', 
      description: 'Anotar',
      route: 'records',
      colors: ['#FFB74D', '#FF9800']
    },
    { 
      key: 'analytics', 
      icon: '📊', 
      label: 'Estatísticas', 
      description: 'Insights',
      route: 'analytics',
      colors: ['#BB86FC', '#8E44AD']
    },
  ];

  const handleQuickAction = (route: string) => {
    try {
      console.log('Navegando para:', route);
      router.push(`/${route}` as any);
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0F' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!theme) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0F' }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparando tema...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const phaseInfo = getPhaseInfo();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
            <Text style={[styles.greeting, { color: theme.colors.text?.secondary || theme.colors.secondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text?.primary || theme.colors.primary }]}>
              {userProfile?.name || 'Usuária'}! 👋
            </Text>
          </View>
          
          <Text style={[styles.motivationalMessage, { color: theme.colors.text?.tertiary || theme.colors.secondary }]}>
            {getMotivationalMessage()}
          </Text>
        </Animated.View>

        {/* Card Principal do Ciclo */}
        <Animated.View
          style={[
            styles.cycleCardContainer,
            {
              opacity: cardsAnim,
              transform: [
                { 
                  translateY: cardsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.cycleCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={
                Array.isArray(theme.colors.gradients?.primary) &&
                theme.colors.gradients.primary.length >= 2
                  ? [
                      theme.colors.gradients.primary[0],
                      theme.colors.gradients.primary[1],
                      ...theme.colors.gradients.primary.slice(2)
                    ] as [import('react-native').ColorValue, import('react-native').ColorValue, ...import('react-native').ColorValue[]]
                  : [theme.colors.primary, theme.colors.secondary]
              }
              style={styles.cycleCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cycleCardContent}>
                {/* Header da Fase */}
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseEmoji}>
                    {phaseInfo.emoji}
                  </Text>
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
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Cards de Informações Rápidas - CORRIGIDO */}
        <Animated.View 
          style={[
            styles.infoCardsSection,
            { opacity: cardsAnim }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text?.primary || theme.colors.primary }]}>
            📊 Resumo do Ciclo
          </Text>
          
          <View style={styles.infoCardsGrid}>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.infoCardContent}>
                <View style={[styles.infoCardIcon, { backgroundColor: '#FFE5F0' }]}>
                  <Text style={styles.infoCardEmoji}>📅</Text>
                </View>
                <Text style={[styles.infoCardTitle, { color: theme.colors.text?.primary || theme.colors.primary }]}>
                  Próxima Menstruação
                </Text>
                <Text style={[styles.infoCardValue, { color: theme.colors.primary }]}>
                  {cycleInfo?.daysUntilNextPeriod === 0 ? 'Hoje!' : 
                   cycleInfo?.daysUntilNextPeriod === 1 ? 'Amanhã' :
                   `${cycleInfo?.daysUntilNextPeriod || 0} dias`}
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.infoCardContent}>
                <View style={[styles.infoCardIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Text style={styles.infoCardEmoji}>🎯</Text>
                </View>
                <Text style={[styles.infoCardTitle, { color: theme.colors.text?.primary || theme.colors.primary }]}>
                  Chance de Gravidez
                </Text>
                <Text style={[styles.infoCardValue, { color: theme.colors.primary }]}>
                  {cycleInfo?.pregnancyChance || 0}%
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Ações Rápidas - CORRIGIDAS */}
        <Animated.View 
          style={[
            styles.quickActionsSection,
            { opacity: buttonsAnim }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text?.primary || theme.colors.primary }]}>
            ⚡ Ações Rápidas
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={action.key}
                style={{
                  opacity: buttonsAnim,
                  transform: [
                    {
                      translateY: buttonsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(action.route)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}>
                    <LinearGradient
                      colors={action.colors as [import('react-native').ColorValue, import('react-native').ColorValue, ...import('react-native').ColorValue[]]}
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
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Dicas da Fase */}
        <Animated.View 
          style={[
            styles.tipsSection,
            { opacity: cardsAnim }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text?.primary || theme.colors.primary }]}>
            💡 Dicas para {phaseInfo.name}
          </Text>
          
          <View style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.tipsContent}>
              {phaseInfo.tips.slice(0, 3).map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.tipDot}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={[styles.tipText, { color: theme.colors.text?.primary || theme.colors.primary }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Botão de Configurações */}
        <Animated.View 
          style={[
            styles.settingsSection,
            { opacity: buttonsAnim }
          ]}
        >
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleQuickAction('settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
            <Text style={[styles.settingsText, { color: theme.colors.text?.secondary || theme.colors.secondary }]}>
              Configurações Avançadas
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Espaçamento inferior */}
        <View style={styles.bottomSpacer} />
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
  loadingText: {
    color: '#FFFFFF',
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
  cycleCardContainer: {
    marginBottom: 30,
  },
  cycleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: "#A831C05D",
    borderWidth: 1,
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
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});