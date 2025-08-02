// app/custom-theme-editor.tsx - EDITOR DE CORES PERSONALIZADO
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem } from '../hooks/useThemeSystem';
import { ColorPicker } from '../components/ColorPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const COLOR_ELEMENTS = [
  { key: 'primary', name: 'Cor Principal', description: 'Botões e destaques' },
  { key: 'secondary', name: 'Cor Secundária', description: 'Elementos de apoio' },
  { key: 'accent', name: 'Cor de Destaque', description: 'Acentos e detalhes' },
  { key: 'background', name: 'Fundo', description: 'Cor de fundo principal' },
  { key: 'surface', name: 'Superfície', description: 'Cards e modais' },
  { key: 'text.primary', name: 'Texto Principal', description: 'Títulos e textos importantes' },
  { key: 'text.secondary', name: 'Texto Secundário', description: 'Subtítulos e descrições' },
  { key: 'text.tertiary', name: 'Texto Terciário', description: 'Textos de apoio' },
  { key: 'particles', name: 'Partículas', description: 'Cor das flores e partículas' },
  { key: 'border', name: 'Bordas', description: 'Contornos e separadores' },
];

// Tema base para começar
const DEFAULT_LIGHT_THEME: CustomThemeColors = {
  primary: '#FF6B9D',
  secondary: '#FFB4D6',
  accent: '#FF8FAB',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },
  particles: '#FFB4D6',
  border: '#E5E7EB',
};

const DEFAULT_DARK_THEME: CustomThemeColors = {
  primary: '#FF6B9D',
  secondary: '#BE185D',
  accent: '#831843',
  background: '#0F0A0D',
  surface: '#1F1419',
  text: {
    primary: '#FECDD3',
    secondary: '#FDA4AF',
    tertiary: '#FB7185',
  },
  particles: '#BE185D',
  border: '#44262F',
};

export default function CustomThemeEditorScreen() {
  const { theme: currentTheme, isLightMode } = useThemeSystem();
  const [customTheme, setCustomTheme] = useState<CustomTheme>({
    id: Date.now().toString(),
    name: 'Meu Tema Personalizado',
    colors: {
      light: { ...DEFAULT_LIGHT_THEME },
      dark: { ...DEFAULT_DARK_THEME },
    },
    createdAt: new Date().toISOString(),
  });

  const [editingMode, setEditingMode] = useState<'light' | 'dark'>('light');
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<CustomThemeColors>(DEFAULT_LIGHT_THEME);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [themeName, setThemeName] = useState('Meu Tema Personalizado');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

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

    // Inicializa preview com tema atual
    updatePreview();
  }, []);

  useEffect(() => {
    updatePreview();
  }, [customTheme, editingMode]);

  const updatePreview = () => {
    const modeColors = customTheme.colors[editingMode];
    setPreviewTheme(modeColors);
  };

  const getNestedValue = (obj: any, path: string): string => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '#000000';
  };

  const setNestedValue = (obj: any, path: string, value: string): any => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
    return { ...obj };
  };

  const handleColorChange = (elementKey: string, color: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [editingMode]: setNestedValue(prev.colors[editingMode], elementKey, color),
      },
    }));
  };

  const handleElementPress = (elementKey: string) => {
    setEditingElement(elementKey);
    setShowColorPicker(true);
  };

  const handleSaveTheme = async () => {
    try {
      const savedThemes = await AsyncStorage.getItem('customThemes');
      const themes: CustomTheme[] = savedThemes ? JSON.parse(savedThemes) : [];
      
      const themeToSave = {
        ...customTheme,
        name: themeName,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      themes.push(themeToSave);
      await AsyncStorage.setItem('customThemes', JSON.stringify(themes));

      Alert.alert(
        '✨ Tema Salvo!',
        `Seu tema "${themeName}" foi salvo com sucesso. Você pode aplicá-lo na galeria de temas.`,
        [
          { text: 'Ver Galeria', onPress: () => router.push('/theme-gallery') },
          { text: 'Continuar Editando', style: 'cancel' },
        ]
      );

      setShowSaveModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o tema.');
    }
  };

  const generateRandomTheme = () => {
    const colors = [
      '#FF6B9D', '#9C88FF', '#FF8A65', '#4FC3F7', '#66BB6A', '#FFD54F',
      '#E91E63', '#8B5CF6', '#F97316', '#0284C7', '#059669', '#EAB308',
    ];

    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
    
    const newTheme: CustomTheme = {
      ...customTheme,
      colors: {
        light: {
          ...DEFAULT_LIGHT_THEME,
          primary: randomColor(),
          secondary: randomColor(),
          accent: randomColor(),
          particles: randomColor(),
        },
        dark: {
          ...DEFAULT_DARK_THEME,
          primary: randomColor(),
          secondary: randomColor(),
          accent: randomColor(),
          particles: randomColor(),
        },
      },
    };

    setCustomTheme(newTheme);
  };

  if (!currentTheme) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: previewTheme.background }]}>
      <StatusBar barStyle={editingMode === 'light' ? 'dark-content' : 'light-content'} />
      

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
          style={[styles.backButton, { backgroundColor: previewTheme.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: previewTheme.primary }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: previewTheme.text.primary }]}>
            🎨 Editor de Temas
          </Text>
          <Text style={[styles.subtitle, { color: previewTheme.text.secondary }]}>
            Crie seu tema personalizado
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.randomButton, { backgroundColor: previewTheme.accent }]}
          onPress={generateRandomTheme}
        >
          <Text style={styles.randomButtonText}>🎲</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modo Light/Dark Toggle */}
      <View style={[styles.modeToggle, { backgroundColor: previewTheme.surface }]}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            editingMode === 'light' && { backgroundColor: previewTheme.primary },
          ]}
          onPress={() => setEditingMode('light')}
        >
          <Text style={[
            styles.modeButtonText,
            { color: editingMode === 'light' ? '#FFFFFF' : previewTheme.text.secondary }
          ]}>
            ☀️ Light
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            editingMode === 'dark' && { backgroundColor: previewTheme.primary },
          ]}
          onPress={() => setEditingMode('dark')}
        >
          <Text style={[
            styles.modeButtonText,
            { color: editingMode === 'dark' ? '#FFFFFF' : previewTheme.text.secondary }
          ]}>
            🌙 Dark
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview Card */}
      <Animated.View
        style={[
          styles.previewCard,
          { backgroundColor: previewTheme.surface, opacity: contentAnim },
        ]}
      >
        <LinearGradient
          colors={[previewTheme.primary, previewTheme.secondary]}
          style={styles.previewGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.previewTitle}>Preview do Tema</Text>
          <Text style={styles.previewSubtitle}>Como seu tema vai ficar</Text>
        </LinearGradient>
        
        <View style={styles.previewContent}>
          <Text style={[styles.previewText, { color: previewTheme.text.primary }]}>
            Texto Principal
          </Text>
          <Text style={[styles.previewText, { color: previewTheme.text.secondary }]}>
            Texto Secundário
          </Text>
          <View style={[styles.previewButton, { backgroundColor: previewTheme.accent }]}>
            <Text style={styles.previewButtonText}>Botão de Exemplo</Text>
          </View>
        </View>
      </Animated.View>

      {/* Lista de Elementos Editáveis */}
      <Animated.View style={[styles.content, { opacity: contentAnim }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { color: previewTheme.text.primary }]}>
            🎯 Elementos do Tema
          </Text>

          {COLOR_ELEMENTS.map((element) => {
            const currentColor = getNestedValue(customTheme.colors[editingMode], element.key);
            
            return (
              <TouchableOpacity
                key={element.key}
                style={[styles.colorElement, { backgroundColor: previewTheme.surface }]}
                onPress={() => handleElementPress(element.key)}
              >
                <View style={styles.colorElementInfo}>
                  <Text style={[styles.colorElementName, { color: previewTheme.text.primary }]}>
                    {element.name}
                  </Text>
                  <Text style={[styles.colorElementDescription, { color: previewTheme.text.secondary }]}>
                    {element.description}
                  </Text>
                </View>
                
                <View style={styles.colorElementRight}>
                  <View style={[styles.colorSample, { backgroundColor: currentColor }]} />
                  <Text style={[styles.colorCode, { color: previewTheme.text.tertiary }]}>
                    {currentColor.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Botões de Ação */}
      <View style={[styles.actionButtons, { backgroundColor: previewTheme.surface }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: previewTheme.accent }]}
          onPress={() => setShowSaveModal(true)}
        >
          <Text style={styles.actionButtonText}>💾 Salvar Tema</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Seleção de Cor */}
      <Modal
        visible={showColorPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowColorPicker(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingElement ? COLOR_ELEMENTS.find(e => e.key === editingElement)?.name : 'Cor'}
            </Text>
            <TouchableOpacity onPress={() => setShowColorPicker(false)}>
              <Text style={styles.modalDone}>Pronto</Text>
            </TouchableOpacity>
          </View>
          
          <ColorPicker
            initialColor={editingElement ? getNestedValue(customTheme.colors[editingMode], editingElement) : '#FF6B9D'}
            onColorChange={(color) => {
              if (editingElement) {
                handleColorChange(editingElement, color);
              }
            }}
            width={350}
            height={250}
            showPresets={true}
          />
        </SafeAreaView>
      </Modal>

      {/* Modal de Salvar */}
      <Modal
        visible={showSaveModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.saveModalOverlay}>
          <View style={[styles.saveModal, { backgroundColor: previewTheme.surface }]}>
            <Text style={[styles.saveModalTitle, { color: previewTheme.text.primary }]}>
              💾 Salvar Tema
            </Text>
            
            <TextInput
              style={[styles.saveModalInput, { 
                backgroundColor: previewTheme.background,
                color: previewTheme.text.primary,
                borderColor: previewTheme.border,
              }]}
              value={themeName}
              onChangeText={setThemeName}
              placeholder="Nome do seu tema"
              placeholderTextColor={previewTheme.text.tertiary}
            />
            
            <View style={styles.saveModalButtons}>
              <TouchableOpacity
                style={[styles.saveModalButton, { backgroundColor: previewTheme.border }]}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={[styles.saveModalButtonText, { color: previewTheme.text.secondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveModalButton, { backgroundColor: previewTheme.primary }]}
                onPress={handleSaveTheme}
              >
                <Text style={styles.saveModalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  randomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  randomButtonText: {
    fontSize: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  previewGradient: {
    padding: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  previewContent: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '500',
  },
  previewButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  previewButtonText: {
    color: '#FFFFFF',
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
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  colorElement: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  colorElementInfo: {
    flex: 1,
  },
  colorElementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  colorElementDescription: {
    fontSize: 12,
  },
  colorElementRight: {
    alignItems: 'center',
    gap: 4,
  },
  colorSample: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  colorCode: {
    fontSize: 10,
    fontWeight: '500',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalDone: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  saveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveModal: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  saveModalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  saveModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});