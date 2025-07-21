// components/GlobalHeader.tsx - OTIMIZADO PARA TEMA DARK
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
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
  const { theme, isDarkMode } = useAdaptiveTheme();
  const insets = useSafeAreaInsets();
  const menuIconRotation = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const phaseIndicatorScale = useRef(new Animated.Value(1)).current;

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

  // StatusBar sempre chamado - CORRIGIDO
  useEffect(() => {
    if (theme) {
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content', true);
      if (StatusBar.setBackgroundColor) {
        StatusBar.setBackgroundColor(theme.colors.background, true);
      }
    }
  }, [isDarkMode, theme]);

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
      fertile: '🔥',
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[
          theme.colors.surface,
          `${theme.colors.surface}F8`,
          `${theme.colors.surface}E5`,
        ]}
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
                backgroundColor: theme.colors.primary,
                width: `${(theme.intensity || 0.7) * 100}%`,
                shadowColor: theme.colors.primary,
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          />
        </View>

        <View style={[styles.headerContent, { paddingTop: insets.top + 10 }]}>
          {/* Botão Menu / Voltar */}
          {currentScreen === 'home' ? (
            <TouchableOpacity
              style={[
                styles.menuButton,
                { 
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: `${theme.colors.primary}30`,
                }
              ]}
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.menuIconContainer,
                  { transform: [{ rotate: menuIconRotate }] },
                ]}
              >
                <View style={[styles.menuLine, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.menuLine, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.menuLine, { backgroundColor: theme.colors.primary }]} />
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.menuButton,
                { 
                  backgroundColor: `${theme.colors.primary}20`,
                  borderColor: `${theme.colors.primary}30`,
                }
              ]}
              onPress={() => router.replace('/home')}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}

          {/* Logo Central */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoContent,
                { transform: [{ scale: logoScale }] },
              ]}
            >
              <Text style={styles.phaseEmoji}>{getPhaseEmoji()}</Text>
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
              colors={theme.colors.gradients.primary as [string, string]}
              style={[
                styles.phaseCircle,
                {
                  shadowColor: theme.colors.primary,
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
            `${theme.colors.primary}06`,
            `${theme.colors.primary}02`,
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
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
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