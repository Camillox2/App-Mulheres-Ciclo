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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const ScreenHeader = ({ style }: { style: any }) => (
  <Animated.View style={[styles.header, style]}>
    <Text style={styles.title}>Vamos nos conhecer!</Text>
    <Text style={styles.subtitle}>
      Para começar, nos diga seu nome e escolha uma foto.
    </Text>
  </Animated.View>
);

// --- INÍCIO DA ALTERAÇÃO ---
// O componente foi reestruturado para evitar conflitos de animação com o toque.
const ImageSelector = ({ profileImage, onSelect, animatedStyle, imageStyle, glowStyle }: any) => (
  <Animated.View style={[styles.imageSection, animatedStyle]}>
    <View style={styles.imageContainer}>
      {/* Os elementos visuais (brilho e círculo da imagem) continuam animados como antes. */}
      <Animated.View style={[styles.imageGlow, glowStyle]} />
      <Animated.View style={[styles.imageCircle, imageStyle]}>
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Feather name="camera" size={40} color="white" />
            <Text style={styles.placeholderText}>Adicionar foto</Text>
          </View>
        )}
      </Animated.View>

      {/* A MUDANÇA PRINCIPAL ESTÁ AQUI:
        Este Pressable é uma camada invisível posicionada sobre a imagem.
        Como ele não é animado, o evento de toque é capturado de forma mais confiável,
        evitando que as animações abaixo (brilho, escala) interfiram.
      */}
      <Pressable
        onPress={onSelect}
        style={styles.touchableOverlay}
      />
    </View>
  </Animated.View>
);
// --- FIM DA ALTERAÇÃO ---


const NameInput = ({ name, setName, animatedStyle }: any) => (
  <Animated.View style={[styles.inputSection, animatedStyle]}>
    <Text style={styles.label}>Como podemos te chamar?</Text>
    <AnimatedBlurView intensity={50} tint="light" style={styles.inputBlurView}>
      <TextInput
        style={[styles.textInput, name ? styles.textInputAlignLeft : {}]}
        value={name}
        onChangeText={setName}
        placeholder="Seu nome ou apelido"
        placeholderTextColor="rgba(255, 255, 255, 0.7)"
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={30}
      />
    </AnimatedBlurView>
  </Animated.View>
);

const ContinueButton = ({ name, isLoading, onContinue, animatedStyle }: any) => {
  const buttonPressScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonPressScale.value }],
    };
  });

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <AnimatedTouchableOpacity
        style={[styles.continueButton, { opacity: name.trim() ? 1 : 0.6 }, buttonAnimatedStyle]}
        onPress={onContinue}
        disabled={!name.trim() || isLoading}
        activeOpacity={1}
        onPressIn={() => (buttonPressScale.value = withSpring(0.98))}
        onPressOut={() => (buttonPressScale.value = withSpring(1))}
      >
        <LinearGradient
            colors={['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.2)']}
            style={styles.buttonGradient}
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.continueButtonText}>Continuar</Text>
            )}
        </LinearGradient>
      </AnimatedTouchableOpacity>
      <Text style={styles.progressText}>Passo 1 de 2</Text>
    </Animated.View>
  );
};

const ImagePickerModal = ({ isVisible, onClose, onSelectCamera, onSelectGallery }: any) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
    >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
            <Pressable style={styles.modalContent}>
                <Text style={styles.modalTitle}>Escolha sua foto</Text>
                <Text style={styles.modalSubtitle}>Selecione de onde quer pegar a imagem.</Text>
                <TouchableOpacity style={styles.modalOption} onPress={onSelectCamera}>
                    <Feather name="camera" size={22} color="#D63384" />
                    <Text style={styles.modalOptionText}>Tirar Foto com a Câmera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={onSelectGallery}>
                    <Feather name="image" size={22} color="#D63384" />
                    <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalOption, styles.modalCancelOption]} onPress={onClose}>
                    <Text style={[styles.modalOptionText, styles.modalCancelText]}>Cancelar</Text>
                </TouchableOpacity>
            </Pressable>
        </Pressable>
    </Modal>
);

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const progress = useSharedValue(0);
  const imageScale = useSharedValue(1);
  const glowAnimation = useSharedValue(0);
  
  const totalAnimationDuration = 1400;

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: totalAnimationDuration,
      easing: Easing.out(Easing.exp),
    });

    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [progress, glowAnimation]);

  const takePicture = useCallback(async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets?.[0]?.uri || null);
      animateImageSelect();
    }
  }, []);

  const pickImage = useCallback(async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets?.[0]?.uri || null);
      animateImageSelect();
    }
  }, []);

  const animateImageSelect = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    imageScale.value = withSpring(1.1, { damping: 10, stiffness: 300 }, () => {
      imageScale.value = withSpring(1);
    });
  }, [imageScale]);

  const handleContinue = useCallback(async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const userProfile = { name: name.trim(), profileImage, setupDate: new Date().toISOString() };
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      router.push('/cycle-setup');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [name, profileImage]);

  const createAnimatedStyle = (delay: number) => {
    const itemAnimationDuration = 800;
    return useAnimatedStyle(() => {
      const startRange = delay / totalAnimationDuration;
      const endRange = (delay + itemAnimationDuration) / totalAnimationDuration;
      return {
        opacity: interpolate(progress.value, [startRange, endRange], [0, 1], 'clamp'),
        transform: [{ translateY: interpolate(progress.value, [startRange, endRange], [40, 0], 'clamp') }],
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
    shadowOpacity: interpolate(glowAnimation.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#D63384', '#FFB4D6', '#8E44AD']}
        style={styles.gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      >
        <View style={styles.particleContainer}>
            <ParticleSystem particleColor="rgba(255, 255, 255, 0.4)" count={12} enabled={!isModalVisible} />
        </View>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={60}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            bounces={false}
          >
            <View>
                <ScreenHeader style={headerStyle} />
                <ImageSelector
                  profileImage={profileImage}
                  onSelect={() => {
                    console.log('Botão de imagem pressionado!');
                    setModalVisible(true);
                  }}
                  animatedStyle={imageSectionStyle}
                  imageStyle={imageAnimatedStyle}
                  glowStyle={glowStyle}
                />
                <NameInput name={name} setName={setName} animatedStyle={inputSectionStyle} />
            </View>
            <ContinueButton
              name={name}
              isLoading={isLoading}
              onContinue={handleContinue}
              animatedStyle={buttonSectionStyle}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
      <ImagePickerModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCamera={takePicture}
        onSelectGallery={pickImage}
      />
    </SafeAreaView>
  );
}

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
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingTop: Platform.OS === 'ios' ? 20 : 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
    imageSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    label: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
        marginBottom: 15,
        textAlign: 'center',
    },
    imageContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    touchableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: 'rgba(255, 0, 0, 0.3)', // Descomente para visualizar a área de toque
        zIndex: 1, // Garante que a camada de toque fique por cima
    },
    imageGlow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'white',
        shadowColor: 'white',
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
        elevation: 15,
    },
    imageCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        width: '100%',
        height: '100%',
    },
    placeholderText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    inputSection: {
        marginBottom: 40,
    },
    inputBlurView: {
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    textInput: {
        fontSize: 18,
        color: 'white',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 18 : 14,
        backgroundColor: 'transparent',
    },
    textInputAlignLeft: {
        textAlign: 'left',
    },
    buttonContainer: {
        alignItems: 'center',
        paddingBottom: 20,
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
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 25,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f5',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    modalOptionText: {
        fontSize: 17,
        fontWeight: '600',
        marginLeft: 15,
        color: '#333'
    },
    modalCancelOption: {
        backgroundColor: 'transparent',
        marginTop: 10,
        justifyContent: 'center'
    },
    modalCancelText: {
        color: '#D63384',
        marginLeft: 0,
    }
});
