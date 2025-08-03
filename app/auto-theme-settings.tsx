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
  Modal,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem, ThemeVariant } from '../hooks/useThemeSystem';
import { CyclePhase } from '../hooks/useAdaptiveTheme';
import { useCycleBasedTheme } from '../hooks/useCycleBasedTheme';

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
          <View style={styles.phaseTextContainer}>
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
  const cycleTheme = useCycleBasedTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState<'enabled' | 'disabled'>('enabled');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  // Recarrega estado quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Tela auto-theme-settings ganhou foco');
      // Força um refresh do estado do cicleTheme
      if (cycleTheme) {
        setTimeout(() => {
          console.log('🔄 Estado atual do auto theme:', cycleTheme.settings.autoThemeEnabled);
        }, 100);
      }
    }, [cycleTheme])
  );

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

  const handleToggleAutoTheme = async () => {
    if (!cycleTheme || isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('🔄 UI: Executando toggle...');
      
      // Executa o toggle e confia no resultado
      const newState = await cycleTheme.toggleAutoTheme();
      console.log(`🔄 UI: Resultado do toggle: ${newState}`);
      
      // Mostra modal de sucesso baseado no resultado retornado
      setSuccessModalType(newState ? 'enabled' : 'disabled');
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('❌ UI: Erro:', error);
      Alert.alert('Erro', 'Não foi possível alterar as configurações.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhaseThemeChange = async (phase: CyclePhase, newTheme: ThemeVariant) => {
    if (!cycleTheme) return;
    
    try {
      console.log(`🔄 UI: Alterando tema da fase ${phase} para ${newTheme}`);
      
      // Atualiza o mapeamento
      await cycleTheme.updatePhaseThemeMapping(phase, newTheme);
      
      // Força atualização do tema se necessário
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`✅ UI: Tema da fase ${phase} alterado para ${newTheme}`);
      
      // Mostra feedback visual discreto
      if (cycleTheme.currentPhase === phase && cycleTheme.settings.autoThemeEnabled) {
        // Se mudou a fase atual, mostra confirmação
        setSuccessModalType('enabled');
        setShowSuccessModal(true);
        
        // Esconde o modal automaticamente após 1.5s
        setTimeout(() => setShowSuccessModal(false), 1500);
      }
      
    } catch (error) {
      console.error('❌ UI: Erro ao alterar tema da fase:', error);
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
            if (cycleTheme) {
              await cycleTheme.resetToDefaults();
            }
          },
        },
      ]
    );
  };

  if (!theme || !cycleTheme) return null;

  // Usa o estado do hook diretamente
  const isAutoThemeEnabled = cycleTheme.settings.autoThemeEnabled;

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
                value={isAutoThemeEnabled}
                onValueChange={handleToggleAutoTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={isAutoThemeEnabled ? '#FFFFFF' : theme.colors.text.tertiary}
                disabled={isLoading}
                style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
              />
            </View>

            {isAutoThemeEnabled && (
              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: theme.colors.primary }]}>
                  ✨ Fase atual: {PHASE_INFO[cycleTheme.currentPhase]?.name}
                </Text>
                <Text style={[styles.statusText, { color: theme.colors.text.secondary }]}>
                  Tema sugerido: {cycleTheme.getThemeForPhase(cycleTheme.currentPhase)}
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
                  selectedTheme={cycleTheme.getThemeForPhase(phase)}
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

      {/* Modal de Sucesso */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successModal, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={
                successModalType === 'enabled' 
                  ? ['#FF6B9D20', '#FFB3D920', '#FF6B9D10']
                  : ['#9C88FF20', '#C8B5FF20', '#9C88FF10']
              }
              style={styles.successModalGradient}
            >
              <Text style={styles.successIcon}>
                {successModalType === 'enabled' ? '🌸' : '🎨'}
              </Text>
              
              <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>
                {successModalType === 'enabled' ? 'Tema Automático Ativado!' : 'Tema Automático Desativado'}
              </Text>
              
              <Text style={[styles.successMessage, { color: theme.colors.text.secondary }]}>
                {successModalType === 'enabled' 
                  ? 'Agora seus temas vão mudar automaticamente conforme seu ciclo menstrual. Você pode personalizar cada fase abaixo.'
                  : 'Você voltou ao controle manual dos temas. Suas configurações personalizadas foram salvas.'
                }
              </Text>
              
              <TouchableOpacity
                style={[styles.successButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.successButtonText}>
                  {successModalType === 'enabled' ? 'Vamos personalizar! ✨' : 'Perfeito! 👌'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
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
    padding: 16,
    marginBottom: 16,
  },
  phaseHeader: {
    flexDirection: 'column',
    gap: 12,
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginBottom: 8,
  },
  phaseIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  phaseTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  phaseDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  themeSelectorIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  themeSelectorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  themePicker: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 100,
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
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  successModalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  successButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});