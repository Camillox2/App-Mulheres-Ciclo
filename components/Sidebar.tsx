import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.80;
const ANIMATION_DURATION = 250; // Reduzido para mais rapidez

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

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose, currentScreen }) => {
  const { theme, toggleMode, isLightMode } = useAdaptiveTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [currentDayOfCycle, setCurrentDayOfCycle] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { key: 'home', icon: '🏠', label: 'Início', screen: 'home' },
    { key: 'calendar', icon: '📅', label: 'Calendário', screen: 'calendar' },
    { key: 'records', icon: '📝', label: 'Registros', screen: 'records' },
    { key: 'analytics', icon: '📊', label: 'Estatísticas', screen: 'analytics' },
    { key: 'settings', icon: '⚙️', label: 'Configurações', screen: 'settings' },
  ];

  const loadUserData = useCallback(async () => {
    try {
      const [profileData, cycleInfo] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('cycleData')
      ]);
      
      if (profileData) setUserProfile(JSON.parse(profileData));
      
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

  const handleNavigation = useCallback((screen: string) => {
    if (isNavigating || currentScreen === screen) {
      onClose();
      return;
    }
    
    setIsNavigating(true);
    onClose();

    // Adiciona um pequeno delay para a animação de fechar começar
    setTimeout(() => {
      requestAnimationFrame(() => {
        router.push(`/${screen}` as any);
        setTimeout(() => setIsNavigating(false), 100); // Previne cliques duplos
      });
    }, 50);

  }, [currentScreen, isNavigating, onClose]);

  useEffect(() => {
    const toValue = isOpen ? 0 : -DRAWER_WIDTH;
    const opacityValue = isOpen ? 1 : 0;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: opacityValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, loadUserData]);

  const getPhaseDescription = () => {
    if (!theme) return 'Carregando...';
    const descriptions: Record<string, string> = {
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
    return Math.max(0, nextPeriod.diff(moment(), 'days'));
  };

  const getProgressPercentage = () => {
    if (!cycleData) return 0;
    return Math.min(100, (currentDayOfCycle / cycleData.averageCycleLength) * 100);
  };

  if (!theme) return null;

  return (
    <>
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity, pointerEvents: isOpen ? 'auto' : 'none' }]}
      >
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }], backgroundColor: theme.colors.surface }]}>
          <LinearGradient
            colors={[theme.colors.background, theme.colors.surface, theme.colors.surface]}
            style={styles.drawerContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.profileSection}>
                  <View style={styles.profileContainer}>
                    <View style={styles.profileImageContainer}>
                      {userProfile?.profileImage ? (
                        <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
                      ) : (
                        <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                          <Text style={styles.profileImageText}>{userProfile?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                        </View>
                      )}
                      <View style={[styles.statusIndicator, { backgroundColor: theme.colors.primary }]} />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>Olá,</Text>
                      <Text style={[styles.userName, { color: theme.colors.text.primary }]} numberOfLines={1}>{userProfile?.name || 'Usuária'}!</Text>
                      <Text style={[styles.phaseDescription, { color: theme.colors.text.tertiary }]}>{getPhaseDescription()}</Text>
                    </View>
                  </View>

                  <View style={[styles.cycleCard, { backgroundColor: `${theme.colors.primary}10` }]}>
                    <View style={styles.cycleHeader}>
                      <Text style={[styles.cycleTitle, { color: theme.colors.text.primary }]}>Ciclo Atual</Text>
                      <Text style={styles.phaseEmoji}>
                        {theme.phase === 'menstrual' ? '🌸' : theme.phase === 'postMenstrual' ? '🌱' : theme.phase === 'fertile' ? '🔥' : theme.phase === 'ovulation' ? '⭐' : '💜'}
                      </Text>
                    </View>
                    <View style={styles.cycleStats}>
                      <View style={styles.cycleStat}>
                        <Text style={[styles.cycleStatValue, { color: theme.colors.primary }]}>{currentDayOfCycle}</Text>
                        <Text style={[styles.cycleStatLabel, { color: theme.colors.text.secondary }]}>Dia</Text>
                      </View>
                      <View style={styles.cycleStat}>
                        <Text style={[styles.cycleStatValue, { color: theme.colors.primary }]}>{getNextPeriodDays()}</Text>
                        <Text style={[styles.cycleStatLabel, { color: theme.colors.text.secondary }]}>Próx. Período</Text>
                      </View>
                    </View>
                    <View style={styles.progressSection}>
                      <View style={[styles.progressBar, { backgroundColor: `${theme.colors.primary}20` }]}>
                        <View style={[styles.progressFill, { width: `${getProgressPercentage()}%`, backgroundColor: theme.colors.primary }]} />
                      </View>
                      <Text style={[styles.progressText, { color: theme.colors.text.tertiary }]}>{Math.round(getProgressPercentage())}% do ciclo</Text>
                    </View>
                  </View>
              </View>

              <View style={styles.menuSection}>
                <Text style={[styles.menuTitle, { color: theme.colors.text.primary }]}>Navegação</Text>
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.key} 
                    item={item} 
                    currentScreen={currentScreen} 
                    onPress={handleNavigation} 
                    isNavigating={isNavigating} 
                  />
                ))}
                <TouchableOpacity
                  style={[styles.menuItem, styles.themeToggleItem, { backgroundColor: `${theme.colors.primary}08` }]}
                  onPress={toggleMode}
                  activeOpacity={0.6}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuIcon}>{isLightMode ? '🌙' : '☀️'}</Text>
                    <Text style={[styles.menuLabel, { color: theme.colors.text.secondary }]}>Modo {isLightMode ? 'Escuro' : 'Claro'}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>EntrePhases v1.0.0</Text>
                <Text style={[styles.footerSubtext, { color: theme.colors.text.tertiary }]}>Conectada com seu ciclo 💜</Text>
              </View>
            </ScrollView>
          </LinearGradient>
      </Animated.View>
    </>
  );
};

// Componente de item de menu otimizado com React.memo
interface MenuItemProps {
  item: {
    key: string;
    icon: string;
    label: string;
    screen: string;
  };
  currentScreen: string;
  onPress: (screen: string) => void;
  isNavigating: boolean;
}

const MenuItem = memo(({ item, currentScreen, onPress, isNavigating }: MenuItemProps) => {
  const { theme } = useAdaptiveTheme();
  const isActive = currentScreen === item.screen;

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { 
          backgroundColor: isActive && theme ? `${theme.colors.primary}15` : 'transparent',
          paddingVertical: 10, // Aumenta a área de clique verticalmente
          paddingHorizontal: 15, // Aumenta a área de clique horizontalmente
        }
      ]}
      onPress={() => onPress(item.screen)}
      activeOpacity={0.6}
      disabled={isNavigating}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <Text
          style={[
            styles.menuLabel,
            {
              color: isActive
                ? theme?.colors.primary ?? '#000'
                : theme?.colors.text.secondary ?? '#000',
              fontWeight: isActive ? '600' : '500',
            },
          ]}
        >
          {item.label}
        </Text>
      </View>
      {isActive && theme && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]} />}
    </TouchableOpacity>
  );
});

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
  overlayTouchable: { flex: 1 },
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
  drawerContainer: { flex: 1 },
  content: { flex: 1, paddingVertical: 20 },
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
  profileImageContainer: { position: 'relative', marginRight: 15 },
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
  profileImageText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
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
  profileInfo: { flex: 1 },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  phaseDescription: { fontSize: 13, fontWeight: '500' },
  cycleCard: { borderRadius: 16, padding: 16 },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cycleTitle: { fontSize: 16, fontWeight: '600' },
  phaseEmoji: { fontSize: 20 },
  cycleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  cycleStat: { alignItems: 'center' },
  cycleStatValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  cycleStatLabel: { fontSize: 12, fontWeight: '500' },
  progressSection: { alignItems: 'center' },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '500' },
  menuSection: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  menuItem: { borderRadius: 16, marginBottom: 6, position: 'relative' },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuIcon: { fontSize: 22, marginRight: 16, width: 28, textAlign: 'center' },
  menuLabel: { fontSize: 17, flex: 1, lineHeight: 20 },
  activeIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeToggleItem: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12, // Ajustado para alinhar melhor
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20, // Aumentado para mais espaço
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  footerSubtext: { fontSize: 11, fontWeight: '400' },
});

export { SidebarDrawer };