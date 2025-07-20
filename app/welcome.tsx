// app/welcome.tsx
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  SafeAreaView 
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  const slides = [
    {
      emoji: '🌸',
      title: 'Bem-vinda ao EntrePhases',
      subtitle: 'Seu companheiro inteligente para acompanhar seu ciclo menstrual',
      description: 'Descubra uma nova forma de se conectar com seu corpo e entender seus ritmos naturais.'
    },
    {
      emoji: '🎨',
      title: 'Cores que se Adaptam',
      subtitle: 'Interface que muda com suas fases',
      description: 'Nosso app se transforma visualmente conforme seu ciclo, criando uma experiência única e pessoal.'
    },
    {
      emoji: '📅',
      title: 'Previsões Inteligentes',
      subtitle: 'Saiba o que esperar de cada dia',
      description: 'Receba insights sobre fertilidade, sintomas e mudanças de humor baseados no seu histórico.'
    },
    {
      emoji: '💝',
      title: 'Feito com Amor',
      subtitle: 'Criado especialmente para você',
      description: 'Um presente especial, desenvolvido com carinho para acompanhar sua jornada de autoconhecimento.'
    }
  ];

  useEffect(() => {
    // Animação de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Animação ao trocar de slide
    Animated.timing(slideAnim, {
      toValue: currentSlide,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    try {
      // Marca que não é mais a primeira vez
      await AsyncStorage.setItem('isFirstTime', 'false');
      router.push('/profile-setup');
    } catch (error) {
      console.error('Erro ao salvar primeiro acesso:', error);
      router.push('/profile-setup');
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FFB4D6', '#FF6B9D']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim }
          ]}
        >
          {/* Indicadores de progresso */}
          <View style={styles.progressContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  { 
                    backgroundColor: index <= currentSlide ? 'white' : 'rgba(255,255,255,0.3)',
                    transform: [{ scale: index === currentSlide ? 1.2 : 1 }]
                  }
                ]}
              />
            ))}
          </View>

          {/* Conteúdo do slide atual */}
          <View style={styles.slideContent}>
            <Text style={styles.emoji}>{currentSlideData.emoji}</Text>
            
            <Text style={styles.title}>{currentSlideData.title}</Text>
            
            <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
            
            <Text style={styles.description}>{currentSlideData.description}</Text>
          </View>

          {/* Botões de navegação */}
          <View style={styles.buttonContainer}>
            {currentSlide > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentSlide(currentSlide - 1)}
              >
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={nextSlide}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Começar' : 'Próximo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Skip para quem quer pular */}
          {currentSlide < slides.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.skipButtonText}>Pular introdução</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Decoração de fundo */}
        <View style={styles.backgroundDecoration}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  nextButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 15,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: 200,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle3: {
    position: 'absolute',
    top: 300,
    left: width * 0.7,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});