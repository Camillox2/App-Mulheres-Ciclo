// components/SidebarDrawer.tsx
import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.85;

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

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const menuItemsOpacity = useRef(new Animated.Value(0)).current;
  const profileScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      StatusBar.setBarStyle(isLightMode ? 'dark-content' : 'light-content');
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.stagger(50, [
          Animated.timing(profileScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(menuItemsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(menuItemsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(profileScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

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
        
        const lastPeriod = moment(cycle.lastPeriodDate);
        const today = moment();
        const dayOfCycle = today.diff(lastPeriod, 'days') + 1;
        setCurrentDayOfCycle(((dayOfCycle - 1) % cycle.averageCycleLength) + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleNavigation = (screen: string) => {
    onClose();
    setTimeout(() => {
      router.push(`/${screen}` as any);
    }, 300);
  };

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

  const menuItems = [
    { key: 'home', icon: '🏠', label: 'Início', screen: 'home' },
    { key: 'calendar', icon: '📅', label: 'Calendário', screen: 'calendar' },
    { key: 'records', icon: '📝', label: 'Registros', screen: 'records' },
    { key: 'analytics', icon: '📊', label: 'Estatísticas', screen: 'analytics' },
    { key: 'settings', icon: '⚙️', label: 'Configurações', screen: 'settings' },
  ];

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
        <LinearGradient
          colors={theme.colors.gradients.primary as [string, string, ...string[]]}
          style={styles.drawerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <BlurView intensity={20} style={styles.blurView}>
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Header com perfil */}
              <Animated.View
                style={[
                  styles.profileSection,
                  { transform: [{ scale: profileScale }] },
                ]}
              >
                <View style={styles.profileImageContainer}>
                  {userProfile?.profileImage ? (
                    <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImageText}>
                        {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.phaseHalo, { backgroundColor: `${theme.colors.accent}40` }]} />
                </View>

                <Text style={styles.userName}>
                  Olá, {userProfile?.name || 'Usuária'}!
                </Text>
                <Text style={styles.phaseDescription}>
                  {getPhaseDescription()}
                </Text>
              </Animated.View>

              {/* Informações do ciclo */}
              <View style={styles.cycleInfoCard}>
                <LinearGradient
                  colors={[
                    `${theme.colors.primary}15`,
                    `${theme.colors.primary}08`,
                  ]}
                  style={styles.cycleInfoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cycleInfoRow}>
                    <Text style={[styles.cycleInfoLabel, { color: theme.colors.primary }]}>
                      Dia do Ciclo
                    </Text>
                    <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>
                      {currentDayOfCycle}
                    </Text>
                  </View>
                  <View style={styles.cycleInfoRow}>
                    <Text style={[styles.cycleInfoLabel, { color: theme.colors.primary }]}>
                      Próxima Menstruação
                    </Text>
                    <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>
                      {getNextPeriodDays() === 0 ? 'Hoje!' : `${getNextPeriodDays()} dias`}
                    </Text>
                  </View>
                  
                  {/* Barra de progresso do ciclo */}
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: `${theme.colors.primary}20` }]}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${(currentDayOfCycle / (cycleData?.averageCycleLength || 28)) * 100}%`,
                            backgroundColor: theme.colors.primary,
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.colors.secondary }]}>
                      Progresso do Ciclo
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Menu Items */}
              <Animated.View style={[styles.menuContainer, { opacity: menuItemsOpacity }]}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.menuItem,
                      {
                        backgroundColor: currentScreen === item.screen 
                          ? `${theme.colors.primary}20` 
                          : 'transparent',
                        borderLeftColor: currentScreen === item.screen 
                          ? theme.colors.primary 
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleNavigation(item.screen)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        {
                          color: currentScreen === item.screen 
                            ? theme.colors.primary 
                            : theme.colors.secondary,
                          fontWeight: currentScreen === item.screen ? '600' : '500',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {currentScreen === item.screen && (
                      <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]} />
                    )}
                  </TouchableOpacity>
                ))}
              </Animated.View>

              {/* Configurações rápidas */}
              <View style={styles.quickSettings}>
                <Text style={[styles.quickSettingsTitle, { color: theme.colors.primary }]}>
                  Configurações Rápidas
                </Text>
                
                <TouchableOpacity
                  style={[styles.quickSettingItem, { backgroundColor: `${theme.colors.primary}10` }]}
                  onPress={toggleMode}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickSettingIcon}>
                    {isLightMode ? '🌙' : '☀️'}
                  </Text>
                  <Text style={[styles.quickSettingLabel, { color: theme.colors.primary }]}>
                    Modo {isLightMode ? 'Escuro' : 'Claro'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.secondary }]}>
                  EntrePhases v1.0.0
                </Text>
                <Text style={[styles.footerSubtext, { color: theme.colors.secondary }]}>
                  Conectada com seu ciclo 💜
                </Text>
              </View>
            </ScrollView>
          </BlurView>
        </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  drawerGradient: {
    flex: 1,
  },
  blurView: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : undefined,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 30,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  phaseHalo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -5,
    left: -5,
    zIndex: -1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  phaseDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cycleInfoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cycleInfoGradient: {
    padding: 20,
  },
  cycleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cycleInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  cycleInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 4,
    borderRadius: 16,
    borderLeftWidth: 4,
    position: 'relative',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    flex: 1,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  quickSettings: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 20,
  },
  quickSettingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    opacity: 0.8,
  },
  quickSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickSettingIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  quickSettingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    opacity: 0.7,
  },
});