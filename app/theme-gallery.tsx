// app/theme-gallery.tsx - GALERIA DE TEMAS PERSONALIZADOS
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
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem } from '../hooks/useThemeSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface CustomThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  particles: string;
  border: string;
}

interface CustomTheme {
  id: string;
  name: string;
  colors: {
    light: CustomThemeColors;
    dark: CustomThemeColors;
  };
  createdAt: string;
  isDefault?: boolean;
}

interface ThemeCardProps {
  theme: CustomTheme;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  animationDelay: number;
  currentMode: 'light' | 'dark';
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  animationDelay,
  currentMode,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const themeColors = theme.colors[currentMode];

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
    outputRange: [0, 0.4],
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
              backgroundColor: themeColors.primary,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      <TouchableOpacity
        style={[
          styles.themeCardContent,
          {
            backgroundColor: themeColors.surface,
            borderColor: isSelected ? themeColors.primary : 'transparent',
            borderWidth: isSelected ? 3 : 0,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Header do card */}
        <LinearGradient
          colors={[themeColors.primary, themeColors.secondary]}
          style={styles.themeCardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.themeCardTitle}>{theme.name}</Text>
          <Text style={styles.themeCardDate}>
            {new Date(theme.createdAt).toLocaleDateString()}
          </Text>
        </LinearGradient>

        {/* Preview das cores */}
        <View style={styles.colorPreview}>
          <View style={styles.colorRow}>
            <View style={[styles.colorDot, { backgroundColor: themeColors.primary }]} />
            <View style={[styles.colorDot, { backgroundColor: themeColors.secondary }]} />
            <View style={[styles.colorDot, { backgroundColor: themeColors.accent }]} />
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorDot, { backgroundColor: themeColors.particles }]} />
            <View style={[styles.colorDot, { backgroundColor: themeColors.text.primary }]} />
            <View style={[styles.colorDot, { backgroundColor: themeColors.background }]} />
          </View>
        </View>

        {/* Badge de selecionado */}
        {isSelected && (
          <View style={[styles.selectedBadge, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.selectedBadgeText}>✓ Aplicado</Text>
          </View>
        )}

        {/* Botões de ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: themeColors.accent }]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          
          {!theme.isDefault && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ThemeGalleryScreen() {
  const { theme, isLightMode } = useThemeSystem();
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCustomThemes();
    
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

  const loadCustomThemes = async () => {
    try {
      const savedThemes = await AsyncStorage.getItem('customThemes');
      const currentThemeId = await AsyncStorage.getItem('selectedCustomThemeId');
      
      if (savedThemes) {
        const themes: CustomTheme[] = JSON.parse(savedThemes);
        setCustomThemes(themes);
      }
      
      if (currentThemeId) {
        setSelectedThemeId(currentThemeId);
      }
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = async (themeId: string) => {
    try {
      await AsyncStorage.setItem('selectedCustomThemeId', themeId);
      setSelectedThemeId(themeId);
      
      Alert.alert(
        '✨ Tema Aplicado!',
        'Seu tema personalizado foi aplicado com sucesso.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível aplicar o tema.');
    }
  };

  const handleDeleteTheme = (themeId: string, themeName: string) => {
    Alert.alert(
      'Excluir Tema',
      `Tem certeza que deseja excluir o tema "${themeName}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedThemes = customThemes.filter(t => t.id !== themeId);
              await AsyncStorage.setItem('customThemes', JSON.stringify(updatedThemes));
              setCustomThemes(updatedThemes);
              
              if (selectedThemeId === themeId) {
                await AsyncStorage.removeItem('selectedCustomThemeId');
                setSelectedThemeId(null);
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o tema.');
            }
          },
        },
      ]
    );
  };

  const handleEditTheme = (theme: CustomTheme) => {
    // TODO: Implementar edição de tema existente
    Alert.alert(
      'Editar Tema',
      'Funcionalidade em desenvolvimento. Por enquanto, crie um novo tema baseado neste.',
      [{ text: 'OK' }]
    );
  };

  if (!theme) return null;

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
            🎭 Galeria de Temas
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Seus temas personalizados
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/custom-theme-editor')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              Carregando temas...
            </Text>
          </View>
        ) : customThemes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎨</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              Nenhum Tema Personalizado
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.text.secondary }]}>
              Crie seu primeiro tema personalizado tocando no botão + acima
            </Text>
            
            <TouchableOpacity
              style={[styles.createFirstButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/custom-theme-editor')}
            >
              <Text style={styles.createFirstButtonText}>✨ Criar Meu Primeiro Tema</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              📚 Meus Temas ({customThemes.length})
            </Text>

            <View style={styles.themesGrid}>
              {customThemes.map((customTheme, index) => (
                <ThemeCard
                  key={customTheme.id}
                  theme={customTheme}
                  isSelected={selectedThemeId === customTheme.id}
                  onSelect={() => handleSelectTheme(customTheme.id)}
                  onDelete={() => handleDeleteTheme(customTheme.id, customTheme.name)}
                  onEdit={() => handleEditTheme(customTheme)}
                  animationDelay={index * 100}
                  currentMode={isLightMode ? 'light' : 'dark'}
                />
              ))}
            </View>

            {/* Dica */}
            <View style={[styles.tipContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.tipTitle, { color: theme.colors.text.primary }]}>
                💡 Dica
              </Text>
              <Text style={[styles.tipText, { color: theme.colors.text.secondary }]}>
                Toque em um tema para aplicá-lo. Use os botões ✏️ para editar e 🗑️ para excluir.
                Temas aplicados ficam destacados com uma borda colorida.
              </Text>
            </View>
          </ScrollView>
        )}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  createFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  themesGrid: {
    gap: 16,
    marginBottom: 30,
  },
  themeCard: {
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
  themeCardHeader: {
    padding: 16,
    alignItems: 'center',
  },
  themeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  themeCardDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  colorPreview: {
    padding: 16,
    gap: 8,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    justifyContent: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    fontSize: 16,
  },
  tipContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});