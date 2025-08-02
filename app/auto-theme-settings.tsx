// app/auto-theme-settings.tsx - CONFIGURAÇÕES DE TEMA AUTOMÁTICO
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem, ThemeVariant } from '../hooks/useThemeSystem';
import { CyclePhase } from '../hooks/useAdaptiveTheme';

const PHASE_INFO = {
  menstrual: {
    name: 'Menstruação',
    icon: '🌹',
    description: 'Período menstrual - tema rosa para conforto',
    color: '#FF6B9D',
  },
  postMenstrual: {
    name: 'Pós-Menstrual',
    icon: '🌿',
    description: 'Renovação e energia - tema verde natural',
    color: '#66BB6A',
  },
  fertile: {
    name: 'Período Fértil',
    icon: '🌸',
    description: 'Fertilidade - tema cereja delicado',
    color: '#FFB3D9',
  },
  ovulation: {
    name: 'Ovulação',
    icon: '🌅',
    description: 'Pico de energia - tema pôr do sol vibrante',
    color: '#FF8A65',
  },
  preMenstrual: {
    name: 'Pré-Menstrual',
    icon: '💜',
    description: 'TPM - tema lavanda para calma',
    color: '#9C88FF',
  },
};

const THEME_OPTIONS = [
  { key: 'rose', name: 'Rosa Elegante', icon: '🌹' },
  { key: 'lavender', name: 'Lavanda Suave', icon: '💜' },
  { key: 'sunset', name: 'Pôr do Sol', icon: '🌅' },
  { key: 'ocean', name: 'Oceano Sereno', icon: '🌊' },
  { key: 'forest', name: 'Floresta Mística', icon: '🌿' },
  { key: 'cherry', name: 'Cerejeira', icon: '🌸' },
];

interface PhaseThemeCardProps {
  phase: CyclePhase;
  selectedTheme: ThemeVariant;
  onThemeChange: (theme: ThemeVariant) => void;
  isEnabled: boolean;
}

const PhaseThemeCard: React.FC<PhaseThemeCardProps> = ({
  phase,
  selectedTheme,
  onThemeChange,
  isEnabled,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const phaseInfo = PHASE_INFO[phase];
  const selectedThemeInfo = THEME_OPTIONS.find(t => t.key === selectedTheme);

  return (
    <View style={[styles.phaseCard, { opacity: isEnabled ? 1 : 0.5 }]}>
      <View style={styles.phaseHeader}>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseIcon}>{phaseInfo.icon}</Text>
          <View>
            <Text style={styles.phaseName}>{phaseInfo.name}</Text>
            <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.themeSelector, { backgroundColor: phaseInfo.color }]}
          onPress={() => setShowPicker(!showPicker)}
          disabled={!isEnabled}
        >
          <Text style={styles.themeSelectorIcon}>{selectedThemeInfo?.icon}</Text>
          <Text style={styles.themeSelectorText}>{selectedThemeInfo?.name}</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <View style={styles.themePicker}>
          {THEME_OPTIONS.map((theme) => (
            <TouchableOpacity
              key={theme.key}
              style={[
                styles.themeOption,
                selectedTheme === theme.key && styles.themeOptionSelected,
              ]}
              onPress={() => {
                onThemeChange(theme.key as ThemeVariant);
                setShowPicker(false);
              }}
            >
              <Text style={styles.themeOptionIcon}>{theme.icon}</Text>
              <Text style={styles.themeOptionText}>{theme.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function AutoThemeSettingsScreen() {
  const { theme, isLightMode } = useThemeSystem();
  const themeSystem = useThemeSystem();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [localAutoThemeEnabled, setLocalAutoThemeEnabled] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  // Carrega o estado inicial do tema automático
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('cycleThemeSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setLocalAutoThemeEnabled(parsed.autoThemeEnabled || false);
          console.log('🔄 Estado inicial carregado:', parsed.autoThemeEnabled);
        }
      } catch (error) {
        console.error('Erro ao carregar estado inicial:', error);
      }
    };
    
    loadInitialState();
  }, []);

  useEffect(() => {
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

  // Força atualização do estado quando o componente é focado
  useEffect(() => {
    const forceRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    const interval = setInterval(forceRefresh, 1000);
    return () => clearInterval(interval);
  }, []);

  // Log do estado para debug
  useEffect(() => {
    const cycleTheme = themeSystem?.cycleTheme;
    const systemEnabled = cycleTheme?.isEnabled || false;
    
    // Atualiza o estado local quando o sistema mudar
    setLocalAutoThemeEnabled(systemEnabled);
    
    console.log('🔍 Estado do tema automático:', {
      isEnabled: systemEnabled,
      localState: localAutoThemeEnabled,
      refreshKey,
      hasThemeSystem: !!themeSystem,
      hasCycleTheme: !!cycleTheme
    });
  }, [refreshKey, themeSystem, localAutoThemeEnabled]);

  const handleToggleAutoTheme = async () => {
    if (!themeSystem?.cycleTheme) return;
    
    setIsLoading(true);
    const newState = !localAutoThemeEnabled;
    
    // Atualiza o estado local imediatamente para responsividade
    setLocalAutoThemeEnabled(newState);
    
    try {
      await themeSystem.cycleTheme.toggleAutoTheme();
      
      // Força refresh do componente e feedback do usuário
      setTimeout(async () => {
        setRefreshKey(prev => prev + 1);
        
        // Verifica o novo estado após a mudança
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (newState) {
          Alert.alert(
            '🌸 Tema Automático Ativado!',
            'Agora seus temas vão mudar automaticamente conforme seu ciclo menstrual. Você pode personalizar cada fase abaixo.',
            [{ text: 'Entendi', style: 'default' }]
          );
        } else {
          Alert.alert(
            '🎨 Tema Automático Desativado',
            'Você voltou ao controle manual dos temas. Suas configurações personalizadas foram salvas.',
            [{ text: 'OK', style: 'default' }]
          );
        }
        
        console.log(`🔄 Estado do tema automático após toggle: ${newState}`);
      }, 300);
    } catch (error) {
      console.error('Erro ao alternar tema automático:', error);
      // Reverte o estado local em caso de erro
      setLocalAutoThemeEnabled(!newState);
      Alert.alert('Erro', 'Não foi possível alterar as configurações.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhaseThemeChange = async (phase: CyclePhase, newTheme: ThemeVariant) => {
    if (!themeSystem?.cycleTheme) return;
    
    try {
      await themeSystem.cycleTheme.updatePhaseMapping(phase, newTheme);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a configuração.');
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Restaurar Padrões?',
      'Isso vai restaurar os temas padrão para cada fase do ciclo. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            if (themeSystem?.cycleTheme) {
              await themeSystem.cycleTheme.resetDefaults();
            }
          },
        },
      ]
    );
  };

  if (!theme || !themeSystem) return null;

  const cycleTheme = themeSystem.cycleTheme;
  // Usa o estado local para responsividade imediata
  const isAutoThemeEnabled = localAutoThemeEnabled;

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
            🌙 Tema Automático
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Temas que mudam com seu ciclo
          </Text>
        </View>

        <View style={styles.headerSpacer} />
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Switch Principal */}
          <View style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.mainSwitchContainer}>
              <View style={styles.mainSwitchContent}>
                <Text style={[styles.mainSwitchTitle, { color: theme.colors.text.primary }]}>
                  🔄 Tema Automático
                </Text>
                <Text style={[styles.mainSwitchDescription, { color: theme.colors.text.secondary }]}>
                  Muda automaticamente conforme seu ciclo menstrual
                </Text>
              </View>
              <Switch
                key={`auto-theme-switch-${refreshKey}`}
                value={isAutoThemeEnabled}
                onValueChange={handleToggleAutoTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={isAutoThemeEnabled ? '#FFFFFF' : theme.colors.text.tertiary}
                disabled={isLoading}
              />
            </View>

            {isAutoThemeEnabled && (
              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: theme.colors.primary }]}>
                  ✨ Fase atual: {PHASE_INFO[themeSystem.currentPhase]?.name}
                </Text>
                <Text style={[styles.statusText, { color: theme.colors.text.secondary }]}>
                  Tema sugerido: {cycleTheme?.currentAutoTheme || 'Rose'}
                </Text>
              </View>
            )}
          </View>

          {/* Configurações por Fase */}
          {isAutoThemeEnabled && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                🎨 Personalizar Temas por Fase
              </Text>

              {(Object.keys(PHASE_INFO) as CyclePhase[]).map((phase) => (
                <PhaseThemeCard
                  key={phase}
                  phase={phase}
                  selectedTheme={cycleTheme?.getThemeForPhase(phase) || 'rose'}
                  onThemeChange={(newTheme) => handlePhaseThemeChange(phase, newTheme)}
                  isEnabled={isAutoThemeEnabled}
                />
              ))}

              {/* Botão de Reset */}
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: theme.colors.text.secondary }]}
                onPress={handleResetDefaults}
              >
                <Text style={[styles.resetButtonText, { color: theme.colors.text.secondary }]}>
                  🔄 Restaurar Temas Padrão
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Informações */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
              💡 Como Funciona
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              O sistema monitora automaticamente sua fase do ciclo menstrual e aplica o tema correspondente. 
              Cada fase tem cores e flores específicas que refletem seu estado emocional e físico natural.
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              • 🌹 Menstruação: Rosa para conforto{'\n'}
              • 🌿 Pós-menstrual: Verde para renovação{'\n'}
              • 🌸 Fértil: Cereja para delicadeza{'\n'}
              • 🌅 Ovulação: Pôr do sol para energia{'\n'}
              • 💜 Pré-menstrual: Lavanda para calma
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
  headerSpacer: {
    width: 40,
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
  mainCard: {
    borderRadius: 16,
    padding: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  phaseCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  phaseDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  themeSelectorIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  themeSelectorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  themePicker: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  themeOptionSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  themeOptionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  themeOptionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  resetButton: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
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