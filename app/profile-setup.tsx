// app/profile-setup.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar suas fotos para você escolher uma foto de perfil.'
      );
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    Alert.alert(
      'Escolher foto',
      'Como você gostaria de adicionar sua foto?',
      [
        {
          text: 'Câmera',
          onPress: takePicture,
        },
        {
          text: 'Galeria',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de câmera necessária');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      animateImageSelect();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      animateImageSelect();
    }
  };

  const animateImageSelect = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Nome necessário', 'Por favor, digite seu nome para continuar.');
      return;
    }

    setIsLoading(true);

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
      Alert.alert('Erro', 'Não foi possível salvar seu perfil. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FFB4D6', '#FF6B9D']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Vamos nos conhecer! 😊</Text>
            <Text style={styles.subtitle}>
              Conte-nos um pouco sobre você para personalizar sua experiência
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Foto de perfil */}
            <View style={styles.imageSection}>
              <Text style={styles.label}>Sua foto (opcional)</Text>
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={selectImage}
              >
                <Animated.View
                  style={[
                    styles.imageCircle,
                    { transform: [{ scale: scaleAnim }] }
                  ]}
                >
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderEmoji}>📷</Text>
                      <Text style={styles.placeholderText}>Adicionar foto</Text>
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Nome */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Como você gostaria de ser chamada?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Digite seu nome aqui"
                  placeholderTextColor="rgba(255, 107, 157, 0.5)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={30}
                />
              </View>
            </View>
          </View>

          {/* Botão continuar */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                { opacity: name.trim() ? 1 : 0.6 }
              ]}
              onPress={handleContinue}
              disabled={!name.trim() || isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? 'Salvando...' : 'Continuar'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.progressText}>1 de 2 - Perfil</Text>
          </View>
        </KeyboardAvoidingView>

        {/* Decoração */}
        <View style={styles.decoration}>
          <View style={styles.decorationCircle1} />
          <View style={styles.decorationCircle2} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 40,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.9,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  placeholderImage: {
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  placeholderText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  inputSection: {
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  textInput: {
    fontSize: 18,
    color: '#FF6B9D',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 60,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueButtonText: {
    color: '#FF6B9D',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
  },
  decoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  decorationCircle1: {
    position: 'absolute',
    top: 150,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: 200,
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});