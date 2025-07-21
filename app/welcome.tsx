import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  FlatList,
  ViewToken,
  Image,
} from 'react-native';
import logoTwo from '../assets/images/logoFour.png';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParticleSystem } from '../components/ParticleSystem';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

import { ColorValue } from 'react-native';

const slides: {
  key: string;
  image: any; // Use 'any' for image source
  title: string;
  subtitle: string;
  description: string;
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
}[] = [
  {
    key: '1',
    image: logoTwo,
    title: 'Bem-vinda ao Entre Fases',
    subtitle: 'Seu guia inteligente para o ciclo menstrual.',
    description: 'Aqui começa uma jornada de autoconhecimento. Entenda seus ritmos, abrace suas fases e floresça em cada uma delas.',
    colors: ['#E55D87', '#5FC3E4'] as const,
  },
  {
    key: '2',
    image: logoTwo,
    title: 'Cores que se Adaptam',
    subtitle: 'Uma interface que reflete seu estado interior.',
    description: 'Nossa paleta de cores se transforma com você, criando uma experiência visual que espelha sua energia e humor a cada fase do ciclo.',
    colors: ['#5FC3E4', '#f5af19'] as const,
  },
  {
  key: '3',
    image: logoTwo,
    title: 'Previsões e Insights',
    subtitle: 'Saiba o que esperar de cada dia.',
    description: 'Receba previsões precisas sobre sua menstruação, período fértil e ovulação, além de dicas personalizadas para seu bem-estar.',
    colors: ['#f5af19', '#f12711'] as const,
  },
  {
    key: '4',
    image: logoTwo,
    title: 'Sua Jornada, Sua Privacidade',
    subtitle: 'Seus dados são seus, e de mais ninguém.',
    description: 'Levamos sua privacidade a sério. Todos os seus registros são armazenados de forma segura apenas no seu dispositivo, garantindo total confidencialidade.',
    colors: ['#f12711', '#8E44AD'] as const,
  },
  {
    key: '5',
    image: logoTwo,
    title: 'Feito com Amor',
    subtitle: 'Um presente para sua jornada.',
    description: 'O Entre Fases foi criado com carinho para ser seu companheiro diário, apoiando seu bem-estar e celebrando a beleza de ser mulher.',
    colors: ['#8E44AD', '#E55D87'] as const,
  },
];

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const OnboardingSlide = ({ item, scrollX, index }: { item: typeof slides[0], scrollX: Animated.Value, index: number }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const contentOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.2, 1, 0.2],
    extrapolate: 'clamp',
  });

  const contentScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  const emojiTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.5, 0, -width * 0.5],
    extrapolate: 'clamp',
  });

  const textTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.8, 0, -width * 0.8],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.slideContent, { transform: [{ scale: contentScale }] }]}> 
      <Animated.View style={[styles.emoji, { opacity: contentOpacity, transform: [{ translateX: emojiTranslateX }] }]}> 
        <Image source={item.image} style={{ width: 200, height: 200, resizeMode: 'contain' }} />
      </Animated.View>
      <Animated.View style={{ opacity: contentOpacity, transform: [{ translateX: textTranslateX }] }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const Background = ({ scrollX }: { scrollX: Animated.Value }) => {
  return (
    <View style={[StyleSheet.absoluteFillObject]}>
      {slides.map((slide, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View key={slide.key} style={[StyleSheet.absoluteFillObject, { opacity }]}>
            <LinearGradient
              colors={slide.colors}
              style={styles.gradient}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const Footer = ({ scrollX, onNextPress, onSkipPress, currentIndex }: { scrollX: Animated.Value, onNextPress: () => void, onSkipPress: () => void, currentIndex: number }) => {
  const isLastSlide = currentIndex === slides.length - 1;

  const buttonScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.footer}>
      <View style={styles.progressContainer}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.6, 1],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.progressDot,
                { transform: [{ scale }], opacity }
              ]}
            />
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.nextButtonContainer}
        onPress={onNextPress}
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.nextButton, { transform: [{ scale: buttonScale }] }]}>
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Começar Jornada' : 'Próximo'}
          </Text>
          <Ionicons
            name={isLastSlide ? "sparkles-outline" : "arrow-forward-outline"}
            size={22}
            color="#E55D87"
            style={{ marginLeft: 8 }}
          />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={onSkipPress}>
        <Text style={styles.skipButtonText}>
          {isLastSlide ? ' ' : 'Pular introdução'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('isFirstTime', 'false');
      router.replace('/profile-setup');
    } catch (error) {
      console.error('Erro ao salvar primeiro acesso:', error);
      router.replace('/profile-setup');
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index ?? 0;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [currentIndex]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Background scrollX={scrollX} />
      <ParticleSystem particleColor="rgba(255, 255, 255, 0.4)" count={12} enabled />

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }) => <OnboardingSlide item={item} scrollX={scrollX} index={index} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.key}
        scrollEventThrottle={16}
        decelerationRate="fast"
      />

      <Footer
        scrollX={scrollX}
        onNextPress={handleNext}
        onSkipPress={handleGetStarted}
        currentIndex={currentIndex}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E55D87',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  slideContent: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  emoji: {
    width: 160,
    height: 160,
    borderRadius: 90,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    shadowOpacity: 1,
    bottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
        bottom: 40,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
        bottom: 40,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 26,
        bottom: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    
  },
  progressContainer: {
    flexDirection: 'row',
    height: 16,
    marginBottom: 30,
    justifyContent: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor: 'white',
    bottom: -5,
  },
  nextButtonContainer: {
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 40,
    minWidth: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    color: '#E55D87',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
    height: 30,
    justifyContent: 'center',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});