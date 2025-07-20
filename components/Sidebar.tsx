// components/Sidebar.tsx - VERSÃO CORRIGIDA E REFATORADA
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.80;
const ANIMATION_DURATION = 300;

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: string;
}

interface UserProfile {
  name: string;
  profileImage?: string;
}

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
}) => {
  const { theme, toggleMode, isLightMode } = useAdaptiveTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [currentDayOfCycle, setCurrentDayOfCycle] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  // Animações
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Menu items
  const menuItems = [
    { key: 'home', icon: '🏠', label: 'Início', screen: 'home' },
    { key: 'calendar', icon: '📅', label: 'Calendário', screen: 'calendar' },
    { key: 'records', icon: '📝', label: 'Registros', screen: 'records' },
    { key: 'analytics', icon: '📊', label: 'Estatísticas', screen: 'analytics' },
    { key: 'settings', icon: '⚙️', label: 'Configurações', screen: 'settings' },
  ];

  // Carrega dados do usuário
  const loadUserData = useCallback(async () => {
    try {
      const [profileData, cycleInfo] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('cycleData')
      ]);
      
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
      
      if (cycleInfo) {
        const cycle = JSON.parse(cycleInfo);
        setCycleData(cycle);
        
        const lastPeriod = moment(cycle.lastPeriodDate);
        const today = moment();
        const dayOfCycle = today.diff(lastPeriod, 'days') + 1;
        setCurrentDayOfCycle(((dayOfCycle - 1) % cycle.averageCycleLength) + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  // Navegação otimizada
  const handleNavigation = useCallback((screen: string) => {
    if (isNavigating || currentScreen === screen) return;
    
    setIsNavigating(true);
    onClose();
    
    // Navega imediatamente sem delay
    router.push(`/${screen}` as any);
    
    // Reset do estado após a animação
    setTimeout(() => {
      setIsNavigating(false);
    }, ANIMATION_DURATION);
  }, [currentScreen, isNavigating, onClose]);

  // Animações otimizadas
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  // Carrega dados na inicialização
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, loadUserData]);

  // Funções utilitárias
  const getPhaseDescription = () => {
    if (!theme) return 'Carregando...';
    const descriptions = {
      menstrual: 'Período de renovação',
      postMenstrual: 'Energia renovada',
      fertile: 'Criatividade em alta',
      ovulation: 'Pico de energia',
      preMenstrual: 'Momento de introspecção',
    };
    return descriptions[theme.phase];
  };

  const getNextPeriodDays = () => {
    if (!cycleData) return 0;
    const lastPeriod = moment(cycleData.lastPeriodDate);
    const nextPeriod = lastPeriod.clone().add(cycleData.averageCycleLength, 'days');
    const today = moment();
    return Math.max(0, nextPeriod.diff(today, 'days'));
  };

  const getProgressPercentage = () => {
    if (!cycleData) return 0;
    return Math.min(100, (currentDayOfCycle / cycleData.averageCycleLength) * 100);
  };

  if (!theme) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            pointerEvents: isOpen ? 'auto' : 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient
            colors={[
              theme.colors.background,
              theme.colors.surface,
              theme.colors.surface,
            ]}
            style={styles.drawerContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
              {/* Header com perfil */}
              <View style={styles.profileSection}>
                <View style={styles.profileContainer}>
                  <View style={styles.profileImageContainer}>
                    {userProfile?.profileImage ? (
                      <Image 
                        source={{ uri: userProfile.profileImage }} 
                        style={styles.profileImage} 
                      />
                    ) : (
                      <View style={[
                        styles.profileImagePlaceholder,
                        { backgroundColor: theme.colors.primary }
                      ]}>
                        <Text style={styles.profileImageText}>
                          {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: theme.colors.primary }
                    ]} />
                  </View>
                  
                  <View style={styles.profileInfo}>
                    <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
                      Olá,
                    </Text>
                    <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                      {userProfile?.name || 'Usuária'}!
                    </Text>
                    <Text style={[styles.phaseDescription, { color: theme.colors.text.tertiary }]}>
                      {getPhaseDescription()}
                    </Text>
                  </View>
                </View>

                {/* Informações do ciclo */}
                <View style={[
                  styles.cycleCard,
                  { backgroundColor: `${theme.colors.primary}10` }
                ]}>
                  <View style={styles.cycleHeader}>
                    <Text style={[styles.cycleTitle, { color: theme.colors.text.primary }]}>
                      Ciclo Atual
                    </Text>
                    <Text style={[styles.phaseEmoji]}>
                      {theme.phase === 'menstrual' ? '🌸' :
                       theme.phase === 'postMenstrual' ? '🌱' :
                       theme.phase === 'fertile' ? '🔥' :
                       theme.phase === 'ovulation' ? '⭐' : '💜'}
                    </Text>
                  </View>

                  <View style={styles.cycleStats}>
                    <View style={styles.cycleStat}>
                      <Text style={[styles.cycleStatValue, { color: theme.colors.primary }]}>
                        {currentDayOfCycle}
                      </Text>
                      <Text style={[styles.cycleStatLabel, { color: theme.colors.text.secondary }]}>
                        Dia
                      </Text>
                    </View>
                    
                    <View style={styles.cycleStat}>
                      <Text style={[styles.cycleStatValue, { color: theme.colors.primary }]}>
                        {getNextPeriodDays() === 0 ? '0' : getNextPeriodDays()}
                      </Text>
                      <Text style={[styles.cycleStatLabel, { color: theme.colors.text.secondary }]}>
                        {getNextPeriodDays() === 0 ? 'Hoje!' : 'Dias'}
                      </Text>
                    </View>
                  </View>

                  {/* Barra de progresso */}
                  <View style={styles.progressSection}>
                    <View style={[
                      styles.progressBar,
                      { backgroundColor: `${theme.colors.primary}20` }
                    ]}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${getProgressPercentage()}%`,
                            backgroundColor: theme.colors.primary,
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.colors.text.tertiary }]}>
                      {Math.round(getProgressPercentage())}% do ciclo
                    </Text>
                  </View>
                </View>
              </View>

              {/* Menu de navegação */}
              <ScrollView 
                style={styles.menuSection}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <Text style={[styles.menuTitle, { color: theme.colors.text.primary }]}>
                  Navegação
                </Text>
                
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: currentScreen === item.screen 
                          ? `${theme.colors.primary}15` 
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleNavigation(item.screen)}
                    activeOpacity={0.7}
                    disabled={isNavigating}
                  >
                    <View style={styles.menuItemContent}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                      <Text
                        style={[
                          styles.menuLabel,
                          {
                            color: currentScreen === item.screen 
                              ? theme.colors.primary 
                              : theme.colors.text.secondary,
                            fontWeight: currentScreen === item.screen ? '600' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    
                    {currentScreen === item.screen && (
                      <View style={[
                        styles.activeIndicator,
                        { backgroundColor: theme.colors.primary }
                      ]} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Configurações rápidas */}
              <View style={styles.quickSettings}>
                <Text style={[styles.quickSettingsTitle, { color: theme.colors.text.primary }]}>
                  Configurações
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.quickSettingItem,
                    { backgroundColor: `${theme.colors.primary}10` }
                  ]}
                  onPress={toggleMode}
                  activeOpacity={0.7}
                >
                  <Text style={styles.settingIcon}>
                    {isLightMode ? '🌙' : '☀️'}
                  </Text>
                  <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                    Modo {isLightMode ? 'Escuro' : 'Claro'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>
                  EntrePhases v1.0.0
                </Text>
                <Text style={[styles.footerSubtext, { color: theme.colors.text.tertiary }]}>
                  Conectada com seu ciclo 💜
                </Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: height,
    zIndex: 1000,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  safeArea: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  
  // Profile Section
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phaseDescription: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Cycle Card
  cycleCard: {
    borderRadius: 16,
    padding: 16,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cycleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  phaseEmoji: {
    fontSize: 20,
  },
  cycleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  cycleStat: {
    alignItems: 'center',
  },
  cycleStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cycleStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  // Menu Section
  menuSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  menuItem: {
    borderRadius: 12,
    marginBottom: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  // Quick Settings
  quickSettings: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickSettingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  quickSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 22,
    textAlign: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    fontWeight: '400',
  },
});