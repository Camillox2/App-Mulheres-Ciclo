// components/GlobalHeader.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';

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
  const { theme } = useAdaptiveTheme();
  const menuIconRotation = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const phaseIndicatorWidth = useRef(new Animated.Value(0)).current;

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
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Animação do indicador de fase
  useEffect(() => {
    if (theme) {
      Animated.timing(phaseIndicatorWidth, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [theme]);

  const menuIconRotate = menuIconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  type PhaseType = 'menstrual' | 'postMenstrual' | 'fertile' | 'ovulation' | 'preMenstrual';

  const getPhaseEmoji = () => {
    if (!theme) return '🌸';
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
    const titles: Record<'home' | 'calendar' | 'records' | 'analytics' | 'settings', string> = {
      home: 'Entre Fases',
      calendar: 'Calendário',
      records: 'Registros',
      analytics: 'Estatísticas',
      settings: 'Configurações',
    };
    const key = currentScreen.toLowerCase() as keyof typeof titles;
    return titles[key] ?? 'EntrePhases';
  };

  if (!theme) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[
          theme.colors.surface,
          `${theme.colors.surface}F5`,
          `${theme.colors.surface}E8`,
        ]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Indicador de fase superior */}
        <View style={styles.phaseIndicator}>
          <Animated.View
            style={[
              styles.phaseBar,
              {
                backgroundColor: theme.colors.primary,
                width: phaseIndicatorWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${(theme.intensity || 0.7) * 100}%`],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.headerContent}>
          {/* Botão Menu */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: `${theme.colors.primary}15` }]}
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

          {/* Logo Central */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoContent,
                { transform: [{ scale: logoScale }] },
              ]}
            >
              <Text style={styles.phaseEmoji}>{getPhaseEmoji()}</Text>
              <Text style={[styles.logoText, { color: theme.colors.primary }]}>
                {getScreenTitle()}
              </Text>
            </Animated.View>
          </View>

          {/* Indicador de Fase */}
          <View style={styles.phaseIndicatorContainer}>
            <View
              style={[
                styles.phaseCircle,
                { 
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                },
              ]}
            >
              <Text style={styles.phaseText}>
                {theme.phase === 'menstrual' ? 'M' :
                 theme.phase === 'postMenstrual' ? 'P' :
                 theme.phase === 'fertile' ? 'F' :
                 (theme.phase as PhaseType) === 'ovulation' ? 'O' :
                 (theme.phase as PhaseType) === 'preMenstrual' ? 'PR' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Sombra inferior */}
        <LinearGradient
          colors={[
            'transparent',
            `${theme.colors.primary}08`,
            `${theme.colors.primary}03`,
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
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  phaseBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: 60,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 20,
    height: 16,
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
    fontSize: 20,
    marginBottom: 2,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  phaseIndicatorContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shadowGradient: {
    height: 8,
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
  },
});