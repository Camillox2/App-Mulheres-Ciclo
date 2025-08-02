// app/_layout.tsx - VERSÃO CORRIGIDA COM GESTOS E ANIMAÇÕES FLUIDAS
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, StatusBar } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

import { GlobalHeader } from '../components/GlobalHeader';
import { SidebarDrawer } from '../components/Sidebar';
import { useThemeSystem } from '../hooks/useThemeSystem';

SplashScreen.preventAutoHideAsync();

const DRAWER_WIDTH_PERCENT = 0.80;
const SWIPE_THRESHOLD = 10;
const SWIPE_VELOCITY_THRESHOLD = 800;

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const segments = useSegments();
  
  // SEMPRE chama os hooks na mesma ordem
  const { theme, isDarkMode } = useThemeSystem();
  
  // Log para debug do tema no layout
  useEffect(() => {
    if (theme) {
      console.log('🏠 Layout - Tema aplicado:', {
        primary: theme.colors.primary,
        background: theme.colors.background
      });
    }
  }, [theme]);
  
  const dimensions = useWindowDimensions();
  const DRAWER_WIDTH = dimensions.width * DRAWER_WIDTH_PERCENT;

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const gestureX = useSharedValue(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  const setDrawerState = useCallback((isOpen: boolean) => {
    setIsDrawerOpen(isOpen);
  }, []);

  const openDrawer = useCallback(() => {
    'worklet';
    // Atualiza o estado imediatamente para evitar duplo clique
    runOnJS(setDrawerState)(true);
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
      mass: 0.3,
      velocity: 0,
    });
  }, [translateX, setDrawerState]);

  const closeDrawer = useCallback((callback?: () => void) => {
    'worklet';
    
    // Force reset se necessário
    if (translateX.value > -DRAWER_WIDTH) {
      translateX.value = withSpring(-DRAWER_WIDTH, {
        damping: 20,
        stiffness: 300,
        mass: 0.3,
        velocity: 0,
      }, (isFinished) => {
        if (isFinished) {
          runOnJS(setDrawerState)(false);
          if (callback) {
            runOnJS(callback)();
          }
        }
      });
    } else {
      // Já está fechado, só atualiza o estado
      runOnJS(setDrawerState)(false);
      if (callback) {
        runOnJS(callback)();
      }
    }
  }, [translateX, DRAWER_WIDTH, setDrawerState]);

  // Gesture otimizado para swipe da esquerda - VERSÃO MELHORADA
  const panGesture = Gesture.Pan()
    .minDistance(1) // Muito sensível
    .maxPointers(1)
    .onStart((event) => {
      gestureX.value = translateX.value;
      console.log('🖐️ Gesto iniciado - X:', event.x, 'Y:', event.y, 'DrawerPos:', translateX.value);
    })
    .onUpdate((event) => {
      // Só permite o gesto se começar próximo à borda esquerda
      if (event.absoluteX < 100 || translateX.value > -DRAWER_WIDTH + 50) {
        const newX = gestureX.value + event.translationX;
        
        // Para abrir: movimento para direita
        if (event.translationX > 0) {
          translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, newX));
        }
        // Para fechar: movimento para esquerda quando já está aberto
        else if (translateX.value > -DRAWER_WIDTH + 10) {
          translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, newX));
        }
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const currentPosition = translateX.value;
      
      console.log('🏁 Gesto finalizado:', {
        velocity,
        currentPosition,
        threshold: -DRAWER_WIDTH / 2,
        absoluteX: event.absoluteX
      });
      
      // Decisão baseada em velocidade e posição
      if (velocity > 500 && velocity > 0) {
        // Swipe rápido para direita = abrir
        console.log('➡️ Swipe rápido - Abrindo');
        openDrawer();
      } else if (velocity < -500 && velocity < 0) {
        // Swipe rápido para esquerda = fechar
        console.log('⬅️ Swipe rápido - Fechando');
        closeDrawer();
      } else if (currentPosition > -DRAWER_WIDTH / 2) {
        // Mais da metade aberto = abrir
        console.log('📖 Mais da metade - Abrindo');
        openDrawer();
      } else {
        // Caso contrário = fechar
        console.log('📕 Menos da metade - Fechando');
        closeDrawer();
      }
    });

  // Animações dos estilos
  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const isVisible = translateX.value > -DRAWER_WIDTH + 50;
    return {
      opacity: interpolate(
        translateX.value,
        [-DRAWER_WIDTH, 0],
        [0, 0.6],
        Extrapolate.CLAMP
      ),
      pointerEvents: isVisible ? 'auto' : 'none',
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(
        translateX.value,
        [-DRAWER_WIDTH, 0],
        [0, 60],
        Extrapolate.CLAMP
      )
    }],
  }));

  const screensWithoutHeader = ['index', 'welcome', 'profile-setup', 'cycle-setup'];
  const screensWithoutSidebar = ['index', 'welcome', 'profile-setup', 'cycle-setup'];
  const screensWithoutGesture = []; // Removido restrições para permitir gesto em todas as telas
  const currentScreen = segments[segments.length - 1] || 'index';
  const shouldShowHeader = !screensWithoutHeader.includes(currentScreen);
  const shouldShowSidebar = !screensWithoutSidebar.includes(currentScreen);
  const shouldShowGesture = shouldShowSidebar; // Simplificado

  useEffect(() => {
    // Fecha o drawer quando muda de tela ou quando está em tela sem sidebar
    if (isDrawerOpen && (!shouldShowSidebar || currentScreen !== segments[segments.length - 1])) {
      closeDrawer();
    }
    
    // Reset da flag de animação quando muda de tela
    isAnimatingRef.current = false;
  }, [currentScreen, shouldShowSidebar, isDrawerOpen, segments, closeDrawer]);

  if (!appReady || !theme) {
    return null;
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Gesture detector - ÁREA EXPANDIDA para melhor detecção */}
      {shouldShowSidebar && (
        <GestureDetector gesture={panGesture}>
          <Animated.View 
            style={[
              styles.gestureArea,
              { 
                left: 0,
                top: shouldShowHeader ? 80 : 0,
                width: isDrawerOpen ? '100%' : 80,
                height: '100%',
                position: 'absolute',
                zIndex: isDrawerOpen ? 0 : 10,
                backgroundColor: 'transparent',
              }
            ]} 
          />
        </GestureDetector>
      )}
      
      {/* Sidebar - só renderiza se permitido */}
      {shouldShowSidebar && (
        <>
          {/* Overlay - com zIndex menor que sidebar */}
          <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
            <Pressable 
              style={StyleSheet.absoluteFill} 
              onPress={() => closeDrawer()}
              hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
            />
          </Animated.View>
          
          <SidebarDrawer
            animatedStyle={animatedSidebarStyle}
            onClose={closeDrawer}
            currentScreen={currentScreen}
          />
        </>
      )}
      
      {/* Conteúdo principal SEM gesture detector */}
      <Animated.View style={[styles.contentContainer, shouldShowSidebar ? animatedContentStyle : {}]}>
          {shouldShowHeader && (
            <GlobalHeader
              onMenuPress={() => {
                // Previne múltiplos cliques durante animação
                if (isAnimatingRef.current) return;
                
                isAnimatingRef.current = true;
                
                if (isDrawerOpen) {
                  closeDrawer();
                } else {
                  openDrawer();
                }
                
                // Reset flag após a animação
                setTimeout(() => {
                  isAnimatingRef.current = false;
                }, 300);
              }}
              isMenuOpen={isDrawerOpen}
              currentScreen={currentScreen}
            />
          )}
          <View style={styles.stackContainer}>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen name="welcome" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
          </View>
        </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 30, // Menor que sidebar (50) mas maior que gesture (1)
  },
  gestureArea: {
    backgroundColor: 'transparent',
  },
});