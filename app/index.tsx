// app/index.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ParticleSystem } from '../components/ParticleSystem';
import { Image } from 'expo-image';
import React from 'react';

export default function IndexScreen() {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    checkFirstTime();
  }, []);

  useEffect(() => {
    if (isReady) {
      // Animação de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();

      // Animação de pulso no emoji
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isReady]);

  const checkFirstTime = async () => {
    try {
      // Verifica se é a primeira vez
      const isFirstTime = await AsyncStorage.getItem('isFirstTime');
      const userProfile = await AsyncStorage.getItem('userProfile');
      const cycleData = await AsyncStorage.getItem('cycleData');
      
      // Delay para mostrar a animação
      setTimeout(() => {
        setIsReady(true);
        
        // Navega baseado no status
        setTimeout(() => {
          if (isFirstTime === null) {
            // Primeira vez - vai para welcome
            router.replace('/welcome');
          } else if (!userProfile) {
            // Não tem perfil - vai para setup do perfil
            router.replace('/profile-setup');
          } else if (!cycleData) {
            // Não tem dados do ciclo - vai para setup do ciclo
            router.replace('/cycle-setup');
          } else {
            // Tudo configurado - vai para home
            router.replace('/home');
          }
        }, 2500);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao verificar primeiro acesso:', error);
      // Em caso de erro, assume primeira vez
      setTimeout(() => {
        router.replace('/welcome');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FFB4D6', '#FF6B9D']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Sistema de partículas */}
        <ParticleSystem
          particleColor="rgba(255, 255, 255, 0.8)"
          opacity={0.4}
          count={20}
          enabled={isReady}
        />

        {/* Conteúdo principal */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo/Ícone principal */}
          <View style={styles.logoContainer}>
            <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
              <Image
                source={require('../assets/images/logoTwo.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </Animated.View>
          </View>

          {/* Nome do app */}
          <Animated.Text style={styles.appName}>
            Entre Fases
          </Animated.Text>

          {/* Subtítulo */}
          <Animated.Text style={styles.subtitle}>
            Conectada com seu ciclo
          </Animated.Text>

          {/* Indicador de carregamento */}
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
          </View>
        </Animated.View>

        {/* Decoração de fundo */}
        <View style={styles.backgroundDecoration}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
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
    left: '70%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});