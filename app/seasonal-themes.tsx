// app/seasonal-themes.tsx - TELA DOS TEMAS SAZONAIS
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem } from '../hooks/useThemeSystem';
import {
  SeasonalTheme,
  SEASONAL_THEME_CONFIGS,
  getCurrentSeason,
  getSeasonalThemeColors,
  getSeasonalParticles,
} from '../constants/seasonalThemes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SeasonalCardProps {
  season: SeasonalTheme;
  isActive: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  animationDelay: number;
  currentMode: 'light' | 'dark';
}

const SeasonalCard: React.FC<SeasonalCardProps> = ({
  season,
  isActive,
  isCurrent,
  onSelect,
  animationDelay,
  currentMode,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const config = SEASONAL_THEME_CONFIGS[season];
  const colors = getSeasonalThemeColors(season, currentMode, 'menstrual');

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: animationDelay + 200,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationDelay]);

  useEffect(() => {
    if (isActive || isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isActive, isCurrent]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <Animated.View
      style={[
        styles.seasonCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Glow effect */}
      {(isActive || isCurrent) && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: colors.primary,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      <TouchableOpacity
        style={[
          styles.seasonCardContent,
          {
            backgroundColor: colors.surface,
            borderColor: isActive ? colors.primary : (isCurrent ? colors.secondary : 'transparent'),
            borderWidth: (isActive || isCurrent) ? 3 : 0,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Header com gradiente */}
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.seasonCardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.seasonIcon}>{config.icon}</Text>
          <Text style={styles.seasonName}>{config.name}</Text>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Atual</Text>
            </View>
          )}
        </LinearGradient>

        {/* Conteúdo */}
        <View style={styles.seasonContent}>
          <Text style={[styles.seasonDescription, { color: colors.text.secondary }]}>
            {config.description}
          </Text>
          
          <View style={styles.seasonInfo}>
            <Text style={[styles.seasonLabel, { color: colors.text.tertiary }]}>
              Meses: {config.months.map(m => {
                const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                                 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                return monthNames[m - 1];
              }).join(', ')}
            </Text>
          </View>

          {/* Preview das partículas */}
          <View style={styles.particlePreview}>
            <Text style={[styles.particleLabel, { color: colors.text.tertiary }]}>
              Partículas:
            </Text>
            <View style={styles.particleList}>
              {config.specialParticles.slice(0, 6).map((particle, index) => (
                <Text key={index} style={styles.particleEmoji}>{particle}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Status badges */}
        {isActive && (
          <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.statusBadgeText}>✓ Ativo</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SeasonalThemesScreen() {
  const { theme, isLightMode } = useThemeSystem();
  const [seasonalThemeEnabled, setSeasonalThemeEnabled] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<SeasonalTheme | null>(null);
  const [loading, setLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const currentSeason = getCurrentSeason();

  useEffect(() => {
    loadSeasonalSettings();
    
    Animated.stagger(200, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadSeasonalSettings = async () => {
    try {
      const [enabled, selected] = await Promise.all([
        AsyncStorage.getItem('seasonalThemeEnabled'),
        AsyncStorage.getItem('selectedSeasonalTheme'),
      ]);
      
      setSeasonalThemeEnabled(enabled === 'true');
      if (selected) {
        setSelectedSeason(selected as SeasonalTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações sazonais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSeasonalTheme = async () => {
    const newState = !seasonalThemeEnabled;
    
    try {
      await AsyncStorage.setItem('seasonalThemeEnabled', newState.toString());
      setSeasonalThemeEnabled(newState);
      
      if (newState && !selectedSeason) {
        // Se ativou mas não tinha tema selecionado, usa o atual
        await handleSelectSeason(currentSeason);
      } else if (!newState) {
        // Se desativou, remove o tema sazonal ativo
        await AsyncStorage.removeItem('activeSeasonalTheme');
        await AsyncStorage.setItem('forceThemeReload', Date.now().toString());
      }
      
      Alert.alert(
        newState ? '🌸 Temas Sazonais Ativados!' : '⏸️ Temas Sazonais Desativados',
        newState 
          ? 'Seus temas agora mudam automaticamente conforme as estações do ano.'
          : 'Voltando para o sistema de temas normal. Reinicie o app para ver as mudanças.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar as configurações.');
    }
  };

  const handleSelectSeason = async (season: SeasonalTheme) => {
    try {
      await AsyncStorage.setItem('selectedSeasonalTheme', season);
      setSelectedSeason(season);
      
      if (!seasonalThemeEnabled) {
        await AsyncStorage.setItem('seasonalThemeEnabled', 'true');
        setSeasonalThemeEnabled(true);
      }

      // Força o sistema de temas a recarregar aplicando o tema sazonal
      const colors = getSeasonalThemeColors(season, isLightMode ? 'light' : 'dark', 'menstrual');
      
      // Aplica o tema sazonal como tema customizado temporário
      const seasonalThemeData = {
        id: `seasonal_${season}`,
        name: SEASONAL_THEME_CONFIGS[season].name,
        colors: {
          light: {
            primary: colors.primary,
            secondary: colors.secondary,
            accent: colors.accent,
            background: colors.background,
            surface: colors.surface,
            text: colors.text,
            particles: colors.particles,
            border: colors.border,
          },
          dark: {
            ...getSeasonalThemeColors(season, 'dark', 'menstrual'),
          }
        },
        createdAt: new Date().toISOString(),
        isSeasonal: true
      };

      // Força atualização global dos temas
      await AsyncStorage.setItem('forceThemeReload', Date.now().toString());
      await AsyncStorage.setItem('activeSeasonalTheme', JSON.stringify(seasonalThemeData));
      
      const config = SEASONAL_THEME_CONFIGS[season];
      Alert.alert(
        `${config.icon} Tema ${config.name} Aplicado!`,
        `Tema sazonal "${config.name}" foi aplicado globalmente. Reinicie o app para ver todas as mudanças.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aplicar o tema sazonal.');
    }
  };

  const resetToCurrentSeason = async () => {
    await handleSelectSeason(currentSeason);
  };

  if (!theme) return null;

  const activeParticles = selectedSeason ? getSeasonalParticles(selectedSeason) : ['🌸', '✨', '🌈'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isLightMode ? 'dark-content' : 'light-content'} />
      

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            🌸 Temas Sazonais
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Temas que mudam com as estações
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.autoButton, { backgroundColor: theme.colors.accent }]}
          onPress={resetToCurrentSeason}
        >
          <Text style={styles.autoButtonText}>🔄</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Switch Principal */}
      <View style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.mainSwitchContainer}>
          <View style={styles.mainSwitchContent}>
            <Text style={[styles.mainSwitchTitle, { color: theme.colors.text.primary }]}>
              🌍 Temas Sazonais Automáticos
            </Text>
            <Text style={[styles.mainSwitchDescription, { color: theme.colors.text.secondary }]}>
              Temas que se adaptam às estações do ano
            </Text>
          </View>
          <Switch
            value={seasonalThemeEnabled}
            onValueChange={handleToggleSeasonalTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={seasonalThemeEnabled ? '#FFFFFF' : theme.colors.text.tertiary}
          />
        </View>

        {seasonalThemeEnabled && (
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>
              ✨ Estação atual: {SEASONAL_THEME_CONFIGS[currentSeason].season}
            </Text>
            <Text style={[styles.statusText, { color: theme.colors.text.secondary }]}>
              Tema ativo: {selectedSeason ? SEASONAL_THEME_CONFIGS[selectedSeason].name : 'Nenhum'}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            🗓️ Estações do Ano
          </Text>

          <View style={styles.seasonsGrid}>
            {(Object.keys(SEASONAL_THEME_CONFIGS) as SeasonalTheme[]).map((season, index) => (
              <SeasonalCard
                key={season}
                season={season}
                isActive={selectedSeason === season}
                isCurrent={currentSeason === season}
                onSelect={() => handleSelectSeason(season)}
                animationDelay={index * 100}
                currentMode={isLightMode ? 'light' : 'dark'}
              />
            ))}
          </View>

          {/* Informações */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
              🌿 Como Funcionam os Temas Sazonais
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Os temas sazonais se adaptam às estações do ano, criando uma experiência visual única para cada período:
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              • 🌸 <Text style={{fontWeight: 'bold'}}>Primavera</Text>: Tons pastéis e flores delicadas{'\n'}
              • ☀️ <Text style={{fontWeight: 'bold'}}>Verão</Text>: Cores quentes e vibrantes{'\n'}
              • 🍂 <Text style={{fontWeight: 'bold'}}>Outono</Text>: Tons terrosos e acolhedores{'\n'}
              • ❄️ <Text style={{fontWeight: 'bold'}}>Inverno</Text>: Tons frios e cristalinos
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Cada tema se adapta às suas fases do ciclo menstrual, mantendo a harmonia entre natureza e corpo.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  autoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoButtonText: {
    fontSize: 18,
  },
  mainCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  mainSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainSwitchContent: {
    flex: 1,
    marginRight: 15,
  },
  mainSwitchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mainSwitchDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  seasonsGrid: {
    gap: 16,
    marginBottom: 30,
  },
  seasonCard: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    zIndex: -1,
  },
  seasonCardContent: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  seasonCardHeader: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  seasonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  seasonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  seasonContent: {
    padding: 20,
  },
  seasonDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  seasonInfo: {
    marginBottom: 16,
  },
  seasonLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  particlePreview: {
    alignItems: 'center',
    gap: 8,
  },
  particleLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  particleList: {
    flexDirection: 'row',
    gap: 4,
  },
  particleEmoji: {
    fontSize: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});