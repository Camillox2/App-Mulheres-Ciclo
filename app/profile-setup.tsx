// app/profile-setup.tsx - VERSÃO COMPLETAMENTE CORRIGIDA
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { ParticleSystem } from '../components/ParticleSystem';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// ===== COMPONENTES SEPARADOS PARA MELHOR ORGANIZAÇÃO =====

const ScreenHeader = ({ style }: { style: any }) => (
  <Animated.View style={[styles.header, style]}>
    <Text style={styles.title}>Vamos nos conhecer! 👋</Text>
    <Text style={styles.subtitle}>
      Para começar, nos diga seu nome e escolha uma foto.
    </Text>
  </Animated.View>
);

const ImageSelector = ({ 
  profileImage, 
  onSelect, 
  animatedStyle, 
  imageStyle, 
  glowStyle 
}: any) => (
  <Animated.View style={[styles.imageSection, animatedStyle]}>
    <View style={styles.imageContainer}>
      {/* Glow Effect */}
      <Animated.View style={[styles.imageGlow, glowStyle]} />
      
      {/* Imagem Principal */}
      <Animated.View style={[styles.imageCircle, imageStyle]}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Feather name="camera" size={40} color="white" />
            <Text style={styles.placeholderText}>Adicionar foto</Text>
          </View>
        )}
      </Animated.View>

      {/* Botão de Toque - CORRIGIDO */}
      <TouchableOpacity
        style={styles.imageButton}
        onPress={onSelect}
        activeOpacity={0.8}
      >
        <View style={styles.imageButtonOverlay}>
          <Feather name="edit-2" size={20} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  </Animated.View>
);

const NameInput = ({ name, setName, animatedStyle }: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Animated.View style={[styles.inputSection, animatedStyle]}>
      <Text style={styles.label}>Como podemos te chamar?</Text>
      <AnimatedBlurView 
        intensity={isFocused ? 60 : 40} 
        tint="light" 
        style={[
          styles.inputBlurView,
          isFocused && styles.inputFocused
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            name ? styles.textInputWithContent : styles.textInputEmpty
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome ou apelido"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={30}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
      </AnimatedBlurView>
      
      {/* Contador de caracteres */}
      <Text style={styles.characterCount}>
        {name.length}/30
      </Text>
    </Animated.View>
  );
};

const ContinueButton = ({ 
  name, 
  isLoading, 
  onContinue, 
  animatedStyle 
}: any) => {
  const buttonPressScale = useSharedValue(1);
  const isEnabled = name.trim().length >= 2;

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonPressScale.value }],
      opacity: withTiming(isEnabled ? 1 : 0.5, { duration: 300 }),
    };
  });

  const handlePress = () => {
    if (!isEnabled || isLoading) return;
    
    buttonPressScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onContinue();
  };

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <AnimatedTouchableOpacity
        style={[styles.continueButton, buttonAnimatedStyle]}
        onPress={handlePress}
        disabled={!isEnabled || isLoading}
        activeOpacity={1}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.25)']}
          style={styles.buttonGradient}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                Continuar
              </Text>
              <Feather name="arrow-right" size={20} color="white" />
            </>
          )}
        </LinearGradient>
      </AnimatedTouchableOpacity>
      
      <Text style={styles.progressText}>Passo 1 de 2</Text>
    </Animated.View>
  );
};

const ImagePickerModal = ({ 
  isVisible, 
  onClose, 
  onSelectCamera, 
  onSelectGallery 
}: any) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <Animated.View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>Escolha sua foto</Text>
            <Text style={styles.modalSubtitle}>
              Selecione de onde quer pegar a imagem.
            </Text>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity 
                style={styles.modalOption} 
                onPress={onSelectCamera}
                activeOpacity={0.8}
              >
                <View style={styles.modalOptionIcon}>
                  <Feather name="camera" size={24} color="#D63384" />
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionText}>Tirar Foto</Text>
                  <Text style={styles.modalOptionSubtext}>
                    Use a câmera do seu celular
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption} 
                onPress={onSelectGallery}
                activeOpacity={0.8}
              >
                <View style={styles.modalOptionIcon}>
                  <Feather name="image" size={24} color="#D63384" />
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
                  <Text style={styles.modalOptionSubtext}>
                    Selecione uma foto existente
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

// ===== COMPONENTE PRINCIPAL =====

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animações
  const progress = useSharedValue(0);
  const imageScale = useSharedValue(1);
  const glowAnimation = useSharedValue(0);
  
  const totalAnimationDuration = 1400;

  // Listeners do teclado
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Animações iniciais
  useEffect(() => {
    progress.value = withTiming(1, {
      duration: totalAnimationDuration,
      easing: Easing.out(Easing.exp),
    });

    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Funções de imagem
  const takePicture = useCallback(async () => {
    setModalVisible(false);
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Precisamos de permissão para acessar a câmera!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setProfileImage(result.assets[0].uri);
        animateImageSelect();
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
    }
  }, []);

  const pickImage = useCallback(async () => {
    setModalVisible(false);
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Precisamos de permissão para acessar a galeria!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setProfileImage(result.assets[0].uri);
        animateImageSelect();
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
    }
  }, []);

  const animateImageSelect = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    imageScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
  }, []);

  const handleContinue = useCallback(async () => {
    if (!name.trim() || name.trim().length < 2) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Por favor, digite um nome com pelo menos 2 caracteres.');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const userProfile = {
        name: name.trim(),
        profileImage,
        setupDate: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Pequeno delay para feedback visual
      setTimeout(() => {
        router.push('/cycle-setup');
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar suas informações. Tente novamente.');
      setIsLoading(false);
    }
  }, [name, profileImage]);

  // Estilos animados
  const createAnimatedStyle = (delay: number) => {
    const itemAnimationDuration = 800;
    return useAnimatedStyle(() => {
      const startRange = delay / totalAnimationDuration;
      const endRange = (delay + itemAnimationDuration) / totalAnimationDuration;
      return {
        opacity: interpolate(progress.value, [startRange, endRange], [0, 1], 'clamp'),
        transform: [{ 
          translateY: interpolate(progress.value, [startRange, endRange], [40, 0], 'clamp') 
        }],
      };
    });
  };

  const headerStyle = createAnimatedStyle(0);
  const imageSectionStyle = createAnimatedStyle(200);
  const inputSectionStyle = createAnimatedStyle(400);
  const buttonSectionStyle = createAnimatedStyle(600);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowAnimation.value, [0, 1], [0.2, 0.8]),
    shadowRadius: interpolate(glowAnimation.value, [0, 1], [10, 25]),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#D63384', '#FFB4D6', '#8E44AD']}
        style={styles.gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      >
        {/* Partículas de fundo */}
        <View style={styles.particleContainer}>
          <ParticleSystem 
            particleColor="rgba(255, 255, 255, 0.4)" 
            count={12} 
            enabled={!isModalVisible} 
          />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(keyboardHeight, 40) }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Conteúdo Principal */}
            <View style={styles.contentWrapper}>
              <ScreenHeader style={headerStyle} />
              
              <ImageSelector
                profileImage={profileImage}
                onSelect={() => setModalVisible(true)}
                animatedStyle={imageSectionStyle}
                imageStyle={imageAnimatedStyle}
                glowStyle={glowStyle}
              />
              
              <NameInput 
                name={name} 
                setName={setName} 
                animatedStyle={inputSectionStyle} 
              />
            </View>

            {/* Botão Continuar - Fixo na parte inferior */}
            <ContinueButton
              name={name}
              isLoading={isLoading}
              onContinue={handleContinue}
              animatedStyle={buttonSectionStyle}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal de Seleção de Imagem */}
        <ImagePickerModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSelectCamera={takePicture}
          onSelectGallery={pickImage}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

// ===== ESTILOS =====

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D63384',
  },
  gradient: {
    flex: 1,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    minHeight: height * 0.7,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 25,
    maxWidth: '95%',
  },

  // Seção da Imagem
  imageSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  imageContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  imageCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  imageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D63384',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageButtonOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Seção do Input
  inputSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputBlurView: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputFocused: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  textInput: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 18 : 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  textInputWithContent: {
    textAlign: 'left',
  },
  textInputEmpty: {
    textAlign: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 8,
  },

  // Botão Continuar
  buttonContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  continueButton: {
    borderRadius: 30,
    width: '100%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2C2C2C',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  modalOptions: {
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
  },
  modalOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(214, 51, 132, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  modalOptionSubtext: {
    fontSize: 14,
    color: '#666',
  },
  modalCancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#D63384',
    fontSize: 17,
    fontWeight: '600',
  },
});