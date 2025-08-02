// components/Sidebar.tsx - VERSÃO OTIMIZADA COM ANIMAÇÕES FLUIDAS
import React, { useCallback, memo, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useThemeSystem } from '../hooks/useThemeSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.80;

interface SidebarDrawerProps {
  animatedStyle: any;
  onClose: (callback?: () => void) => void;
  currentScreen: string;
}

interface UserProfile {
  name: string;
  profileImage?: string;
}

const menuItems = [
  { key: 'home', icon: '🏠', label: 'Início', screen: 'home' },
  { key: 'calendar', icon: '📅', label: 'Calendário', screen: 'calendar' },
  { key: 'records', icon: '📝', label: 'Registros', screen: 'records' },
  { key: 'super-analytics', icon: '📈', label: 'Super Analytics', screen: 'super-analytics' },
  { key: 'theme-settings', icon: '🎨', label: 'Temas', screen: 'theme-settings' },
  { key: 'settings', icon: '⚙️', label: 'Configurações', screen: 'settings' },
];

// Componente MenuItem refatorado com melhor responsividade
const MenuItem = memo(({ item, currentScreen, onPress }: any) => {
  const { theme } = useThemeSystem();
  const isActive = currentScreen === item.screen;
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = useCallback(() => {
    console.log('MenuItem pressed:', item.screen);
    onPress(item.screen);
  }, [item.screen, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isPressed ? 0.95 : 1, { damping: 15 }) }],
    backgroundColor: withTiming(
      isActive ? `${theme?.colors.primary}20` : 'transparent',
      { duration: 200 }
    ),
  }));

  if (!theme) return null;

  return (
    <Animated.View style={[styles.menuItemContainer, animatedStyle]}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.7}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <View style={styles.menuItemContent}>
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <Text
            style={[
              styles.menuLabel,
              {
                color: isActive ? theme.colors.primary : theme.colors.text.secondary,
                fontWeight: isActive ? '700' : '500',
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
        {isActive && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  animatedStyle,
  onClose,
  currentScreen,
}) => {
  const { theme, toggleMode, isLightMode } = useThemeSystem();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const profileData = await AsyncStorage.getItem('userProfile');
        if (profileData) setUserProfile(JSON.parse(profileData));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadUserData();
  }, []);

  const handleNavigation = useCallback((screen: string) => {
    console.log('handleNavigation called with screen:', screen);
    console.log('currentScreen:', currentScreen);
    
    // Fecha a sidebar primeiro
    onClose();
    
    // Se já está na tela, não navega
    if (currentScreen === screen) {
      console.log('Already on screen:', screen);
      return;
    }
    
    // Navega para a nova tela
    console.log('Navigating to:', screen);
    try {
      router.push(`/${screen}` as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [currentScreen, onClose]);

  const handleThemeToggle = useCallback(() => {
    console.log('Theme toggle pressed');
    try {
      toggleMode();
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  }, [toggleMode]);

  if (!theme) return null;

  return (
    <Animated.View
      style={[
        styles.drawer,
        animatedStyle,
        { backgroundColor: theme.colors.surface }
      ]}
      pointerEvents="box-none" // Permite que os filhos recebam toques
    >
      {/* Blur background para iOS */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={40}
          style={StyleSheet.absoluteFill}
          tint={theme.colors.background.includes('#0') ? 'dark' : 'light'}
        />
      )}
      
      <LinearGradient
        colors={[
          theme.colors.surface,
          `${theme.colors.surface}F0`,
          theme.colors.background,
        ]}
        style={styles.drawerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        pointerEvents="box-none" // Permite que os filhos recebam toques
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Section com animação */}
          <Animated.View style={styles.profileSection}>
            <View style={styles.profileContainer}>
              <Animated.View style={styles.profileImageContainer}>
                {userProfile?.profileImage ? (
                  <Image
                    source={{ uri: userProfile.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.profileImagePlaceholder,
                      { backgroundColor: theme.colors.primary }
                    ]}
                  >
                    <Text style={styles.profileImageText}>
                      {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <Animated.View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: theme.colors.primary }
                  ]}
                />
              </Animated.View>
              
              <View style={styles.profileInfo}>
                <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
                  Olá,
                </Text>
                <Text
                  style={[styles.userName, { color: theme.colors.text.primary }]}
                  numberOfLines={1}
                >
                  {userProfile?.name || 'Usuária'}!
                </Text>
                <Text
                  style={[styles.phaseText, { color: theme.colors.primary }]}
                >
                  {theme.phase === 'menstrual' ? '🌸 Menstruação' :
                   theme.phase === 'postMenstrual' ? '🌱 Pós-menstrual' :
                   theme.phase === 'fertile' ? '🔥 Período fértil' :
                   theme.phase === 'ovulation' ? '⭐ Ovulação' : '💜 Pré-menstrual'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.key}
                style={{
                  opacity: 1,
                  transform: [{
                    translateX: 0,
                  }],
                }}
              >
                <MenuItem
                  item={item}
                  currentScreen={currentScreen}
                  onPress={handleNavigation}
                />
              </Animated.View>
            ))}
            
            {/* Theme Toggle */}
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.themeToggle}
              onPress={handleThemeToggle}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuIcon}>
                  {isLightMode ? '🌙' : '☀️'}
                </Text>
                <Text
                  style={[
                    styles.menuLabel,
                    { color: theme.colors.text.secondary }
                  ]}
                >
                  Modo {isLightMode ? 'Escuro' : 'Claro'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>
              Entre Fases v1.0.0
            </Text>
            <Text style={[styles.footerSubtext, { color: theme.colors.text.tertiary }]}>
              Feito com 💜 para você
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    zIndex: 50, // Reduzido de 999 para 50
    elevation: 8, // Reduzido de 24 para 8
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  drawerContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImageText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 24,
  },
  menuItemContainer: {
    borderRadius: 12,
    marginBottom: 6, // Aumentado de 4 para 6
    overflow: 'hidden',
  },
  menuItem: {
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 56, // Altura mínima para facilitar toque
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18, // Aumentado de 16 para 18
    paddingHorizontal: 16,
    minHeight: 56, // Garante área de toque adequada
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    flex: 1,
    lineHeight: 20,
  },
  activeIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  themeToggle: {
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 56, // Altura mínima para facilitar toque
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 11,
    marginTop: 4,
  },
});