// components/GlobalHeader.tsx - VERSÃO OTIMIZADA COM BOTÃO RESPONSIVO
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem } from '../hooks/useThemeSystem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface GlobalHeaderProps {
  onMenuPress: () => void;
  isMenuOpen: boolean;
  currentScreen?: string;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  onMenuPress,
  isMenuOpen,
  currentScreen = 'Home',
}) => {
  const { theme, isDarkMode } = useThemeSystem();
  const insets = useSafeAreaInsets();
  const menuIconRotation = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const phaseIndicatorScale = useRef(new Animated.Value(1)).current;
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Força atualização quando o tema muda
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Animação do ícone do menu
  useEffect(() => {
    Animated.timing(menuIconRotation, {
      toValue: isMenuOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  // Animação da logo (pulse suave)
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.03,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Animação do indicador de fase
  useEffect(() => {
    const phaseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(phaseIndicatorScale, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(phaseIndicatorScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    phaseAnimation.start();

    return () => phaseAnimation.stop();
  }, [theme?.phase]);

  // StatusBar - Força atualização do tema
  useEffect(() => {
    if (theme) {
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
      if (StatusBar.setBackgroundColor) {
        StatusBar.setBackgroundColor(theme.colors.background, true);
      }
    }
  }, [isDarkMode, theme, theme?.colors.background, theme?.colors.primary]);

  // Log para debug
  useEffect(() => {
    console.log('🎨 GlobalHeader - Tema atualizado:', {
      primary: theme?.colors.primary,
      background: theme?.colors.background,
      phase: theme?.phase
    });
  }, [theme]);

  if (!theme) return null;

  const menuIconRotate = menuIconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  type PhaseType = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

  const getPhaseEmoji = () => {
    const emojiMap: Record<PhaseType, string> = {
      menstrual: '🌸',
      postMenstrual: '🌱',
      fertile: '�',
      ovulation: '⭐',
      preMenstrual: '💜',
    };
    return emojiMap[theme.phase as PhaseType];
  };

  const getScreenTitle = () => {
    const titles: Record<string, string> = {
      home: 'Entre Fases',
      calendar: 'Calendário',
      records: 'Registros',
      analytics: 'Estatísticas',
      settings: 'Configurações',
    };
    const key = currentScreen.toLowerCase();
    return titles[key] ?? 'Entre Fases';
  };

  const getPhaseInitial = () => {
    const initials: Record<PhaseType, string> = {
      menstrual: 'M',
      postMenstrual: 'P',
      fertile: 'F',
      ovulation: 'O',
      preMenstrual: 'PM',
    };
    return initials[theme.phase as PhaseType] || 'M';
  };

  const handleMenuPress = () => {
    setIsButtonPressed(true);
    onMenuPress();
    // Reset estado após um curto delay
    setTimeout(() => setIsButtonPressed(false), 300);
  };

  // Cores especiais para modo claro
  const getLightModeColors = () => {
    if (!isDarkMode) {
      return {
        headerGradient: ['#FFF9FC', '#FFE8F0', '#FFEEF3'] as [string, string, string],
        surfaceOverlay: '#FFFFFF',
        accentRose: '#FF6B9D',
        softRose: '#FFB4D6',
        backgroundRose: '#FFF5F8',
      };
    }
    return {
      headerGradient: [theme.colors.surface, `${theme.colors.surface}F8`, `${theme.colors.surface}E5`] as [string, string, string],
      surfaceOverlay: theme.colors.surface,
      accentRose: theme.colors.primary,
      softRose: theme.colors.secondary,
      backgroundRose: theme.colors.background,
    };
  };

  const lightColors = getLightModeColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? theme.colors.background : lightColors.backgroundRose }]}>
      <LinearGradient
        colors={lightColors.headerGradient}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Indicador de intensidade da fase */}
        <View style={styles.phaseIndicator}>
          <View
            style={[
              styles.phaseBar,
              {
                backgroundColor: lightColors.accentRose,
                width: `${(theme.intensity || 0.7) * 100}%`,
                shadowColor: lightColors.accentRose,
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          />
        </View>

        <View style={[styles.headerContent, { paddingTop: insets.top + 10 }]}>
          {/* Botão Menu / Voltar - OTIMIZADO */}
          {currentScreen === 'home' ? (
            <Pressable
              style={({ pressed }) => [
                styles.menuButton,
                { 
                  backgroundColor: pressed || isButtonPressed ? 
                    lightColors.accentRose : 
                    `${lightColors.accentRose}20`,
                  borderColor: `${lightColors.accentRose}30`,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
              onPress={handleMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View
                style={[
                  styles.menuIconContainer,
                  { transform: [{ rotate: menuIconRotate }] },
                ]}
              >
                {isMenuOpen ? (
                  <Ionicons 
                    name="close" 
                    size={22} 
                    color={isButtonPressed ? 'white' : lightColors.accentRose} 
                  />
                ) : (
                  <>
                    <View style={[styles.menuLine, { 
                      backgroundColor: isButtonPressed ? 'white' : lightColors.accentRose 
                    }]} />
                    <View style={[styles.menuLine, { 
                      backgroundColor: isButtonPressed ? 'white' : lightColors.accentRose 
                    }]} />
                    <View style={[styles.menuLine, { 
                      backgroundColor: isButtonPressed ? 'white' : lightColors.accentRose 
                    }]} />
                  </>
                )}
              </Animated.View>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.menuButton,
                { 
                  backgroundColor: pressed ? 
                    lightColors.accentRose : 
                    `${lightColors.accentRose}20`,
                  borderColor: `${lightColors.accentRose}30`,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                }
              ]}
              onPress={() => router.replace('/home')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {({ pressed }) => (
                <Ionicons 
                  name="arrow-back" 
                  size={24} 
                  color={pressed ? 'white' : lightColors.accentRose} 
                />
              )}
            </Pressable>
          )}

          {/* Logo Central */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoContent,
                { transform: [{ scale: logoScale }] },
              ]}
            >
              <Text style={[styles.logoText, { color: theme.colors.text.primary }]}> 
                {getScreenTitle()}
              </Text>
              <Text style={[styles.logoSubtext, { color: theme.colors.text.tertiary }]}> 
                {theme.phase === 'menstrual' ? 'Renovação' :
                 theme.phase === 'postMenstrual' ? 'Energia' :
                 theme.phase === 'fertile' ? 'Criatividade' :
                 theme.phase === 'ovulation' ? 'Vitalidade' : 'Introspecção'}
              </Text>
            </Animated.View>
          </View>

          {/* Indicador de Fase */}
          <Animated.View 
            style={[
              styles.phaseIndicatorContainer,
              { transform: [{ scale: phaseIndicatorScale }] }
            ]}
          >
            <LinearGradient
              colors={isDarkMode ? 
                theme.colors.gradients.primary as [string, string] : 
                [lightColors.accentRose, lightColors.softRose] as [string, string]}
              style={[
                styles.phaseCircle,
                {
                  shadowColor: lightColors.accentRose,
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.phaseText}>
                {getPhaseInitial()}
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Sombra inferior sutil */}
        <LinearGradient
          colors={[
            'transparent',
            `${lightColors.accentRose}06`,
            `${lightColors.accentRose}02`,
          ]}
          style={styles.shadowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    zIndex: 1000,
    elevation: 10,
  },
  headerContainer: {
    position: 'relative',
  },
  phaseIndicator: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  phaseBar: {
    height: '100%',
    borderRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 25,
    height: 80,
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLine: {
    height: 2,
    width: 18,
    borderRadius: 1,
    marginVertical: 2,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  logoSubtext: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
  },
  phaseIndicatorContainer: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  phaseText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shadowGradient: {
    height: 6,
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
  },
});