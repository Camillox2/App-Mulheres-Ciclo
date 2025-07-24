// app/theme-settings.tsx - TELA DE SELEÇÃO DE TEMAS PERSONALIZADOS
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { ParticleSystem } from '../components/ParticleSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// TEMA VARIANTS CONFORME PLANO
const THEME_VARIANTS = {
  rose: {
    name: 'Rosa Elegante',
    icon: '🌹',
    description: 'Feminino e sofisticado',
    baseColors: {
      primary: '#FF6B9D',
      secondary: '#FFB4D6',
      accent: '#FF8FAB',
      background: '#FFF5F8',
      gradients: ['#FFE5F0', '#FF6B9D'] as const,
    }
  },
  lavender: {
    name: 'Lavanda Suave',
    icon: '💜',
    description: 'Calmo e relaxante',
    baseColors: {
      primary: '#9C88FF',
      secondary: '#C4B5FD',
      accent: '#A78BFA',
      background: '#F8F5FF',
      gradients: ['#F5F3FF', '#9C88FF'] as const,
    }
  },
  sunset: {
    name: 'Pôr do Sol',
    icon: '🌅',
    description: 'Quente e energético',
    baseColors: {
      primary: '#FF8A65',
      secondary: '#FFAB91',
      accent: '#FF7043',
      background: '#FFF8F5',
      gradients: ['#FFE0B2', '#FF8A65'] as const,
    }
  },
  ocean: {
    name: 'Oceano Sereno',
    icon: '🌊',
    description: 'Fresco e tranquilo',
    baseColors: {
      primary: '#4FC3F7',
      secondary: '#81D4FA',
      accent: '#29B6F6',
      background: '#F5FCFF',
      gradients: ['#E1F5FE', '#4FC3F7'] as const,
    }
  },
  forest: {
    name: 'Floresta Mística',
    icon: '🌿',
    description: 'Natural e revigorante',
    baseColors: {
      primary: '#66BB6A',
      secondary: '#A5D6A7',
      accent: '#4CAF50',
      background: '#F5FFF5',
      gradients: ['#E8F5E8', '#66BB6A'] as const,
    }
  },
  cherry: {
    name: 'Cerejeira',
    icon: '🌸',
    description: 'Delicado e primaveril',
    baseColors: {
      primary: '#F48FB1',
      secondary: '#F8BBD9',
      accent: '#E91E63',
      background: '#FFF0F5',
      gradients: ['#FCE4EC', '#F48FB1'] as const,
    }
  },
};

interface ThemeVariantCardProps {
  variant: keyof typeof THEME_VARIANTS;
  themeData: typeof THEME_VARIANTS[keyof typeof THEME_VARIANTS];
  isSelected: boolean;
  onSelect: () => void;
  animationDelay: number;
}

const ThemeVariantCard: React.FC<ThemeVariantCardProps> = ({
  variant,
  themeData,
  isSelected,
  onSelect,
  animationDelay,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

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
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isSelected]);

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
    outputRange: [0, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.themeCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Glow effect para tema selecionado */}
      {isSelected && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              backgroundColor: themeData.baseColors.primary,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      <TouchableOpacity
        style={[
          styles.themeCardContent,
          {
            borderColor: isSelected ? themeData.baseColors.primary : 'transparent',
            borderWidth: isSelected ? 3 : 0,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={themeData.baseColors.gradients}
          style={styles.themeCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header do card */}
          <View style={styles.themeCardHeader}>
            <Text style={styles.themeIcon}>{themeData.icon}</Text>
            <Text style={[styles.themeName, { color: themeData.baseColors.primary }]}>
              {themeData.name}
            </Text>
          </View>

          {/* Preview das cores */}
          <View style={styles.colorPreview}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: themeData.baseColors.primary },
              ]}
            />
            <View
              style={[
                styles.colorDot,
                { backgroundColor: themeData.baseColors.secondary },
              ]}
            />
            <View
              style={[
                styles.colorDot,
                { backgroundColor: themeData.baseColors.accent },
              ]}
            />
          </View>

          {/* Descrição */}
          <Text style={[styles.themeDescription, { color: themeData.baseColors.primary }]}>
            {themeData.description}
          </Text>

          {/* Badge de selecionado */}
          {isSelected && (
            <View style={[styles.selectedBadge, { backgroundColor: themeData.baseColors.primary }]}>
              <Text style={styles.selectedBadgeText}>✓ Selecionado</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ThemeSettingsScreen() {
  const { theme, isLightMode } = useAdaptiveTheme();
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEME_VARIANTS>('rose');
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCurrentTheme();
    
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

  const loadCurrentTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedThemeVariant');
      if (savedTheme && THEME_VARIANTS[savedTheme as keyof typeof THEME_VARIANTS]) {
        setSelectedTheme(savedTheme as keyof typeof THEME_VARIANTS);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const handleThemeSelect = useCallback((variant: keyof typeof THEME_VARIANTS) => {
    setSelectedTheme(variant);
    setPreviewMode(true);
  }, []);

  const handleApplyTheme = async () => {
    setIsLoading(true);
    
    try {
      await AsyncStorage.setItem('selectedThemeVariant', selectedTheme);
      
      // Simula aplicação do tema
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Volta para settings ou home
      router.back();
    } catch (error) {
      console.error('Erro ao aplicar tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewMode(false);
    loadCurrentTheme();
  };

  if (!theme) return null;

  const currentVariant = THEME_VARIANTS[selectedTheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isLightMode ? 'dark-content' : 'light-content'} />
      
      {/* Sistema de partículas */}
      <ParticleSystem
        particleColor={currentVariant.baseColors.primary}
        opacity={0.3}
        count={12}
        enabled={true}
      />

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
            🎨 Temas Personalizados
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Escolha o estilo que combina com você
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Preview atual */}
      {previewMode && (
        <Animated.View
          style={[
            styles.previewBanner,
            { backgroundColor: currentVariant.baseColors.primary },
            { opacity: contentAnim },
          ]}
        >
          <Text style={styles.previewText}>
            🔍 Visualizando: {currentVariant.name}
          </Text>
        </Animated.View>
      )}

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
          {/* Grid de temas */}
          <View style={styles.themesGrid}>
            {Object.entries(THEME_VARIANTS).map(([variant, themeData], index) => (
              <ThemeVariantCard
                key={variant}
                variant={variant as keyof typeof THEME_VARIANTS}
                themeData={themeData}
                isSelected={selectedTheme === variant}
                onSelect={() => handleThemeSelect(variant as keyof typeof THEME_VARIANTS)}
                animationDelay={index * 100}
              />
            ))}
          </View>

          {/* Informações sobre adaptação às fases */}
          <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
              🌙 Adaptação Inteligente
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              Seu tema se adapta automaticamente às fases do seu ciclo menstrual, 
              criando uma experiência única e conectada com seu ritmo natural.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Botões de ação */}
      {previewMode && (
        <Animated.View
          style={[
            styles.actionButtons,
            { backgroundColor: theme.colors.surface },
            { opacity: contentAnim },
          ]}
        >
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.text.secondary }]}
            onPress={handleCancelPreview}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.text.secondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: currentVariant.baseColors.primary }]}
            onPress={handleApplyTheme}
            disabled={isLoading}
          >
            <LinearGradient
              colors={currentVariant.baseColors.gradients}
              style={styles.applyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <Text style={styles.applyButtonText}>⌛ Aplicando...</Text>
              ) : (
                <Text style={styles.applyButtonText}>✨ Aplicar Tema</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  headerSpacer: {
    width: 40,
  },
  previewBanner: {
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
  },
  previewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  themeCard: {
    width: (width - 60) / 2,
    marginBottom: 20,
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
  themeCardContent: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  themeCardGradient: {
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  themeCardHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  themeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  themeDescription: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});