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
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';

SplashScreen.preventAutoHideAsync();

const DRAWER_WIDTH_PERCENT = 0.80;
const SWIPE_THRESHOLD = 10;
const SWIPE_VELOCITY_THRESHOLD = 800;

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const segments = useSegments();
  const { theme, isDarkMode } = useAdaptiveTheme();
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
  }, [translateX, DRAWER_WIDTH, setDrawerState]);

  // Gesture para abrir/fechar o drawer
  const panGesture = Gesture.Pan()
    .activeOffsetX([-SWIPE_THRESHOLD, SWIPE_THRESHOLD])
    .failOffsetY([-5, 5])
    .onStart(() => {
      gestureX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newX = gestureX.value + event.translationX;
      translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, newX));
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const currentPosition = translateX.value;
      
      if (velocity > SWIPE_VELOCITY_THRESHOLD || (velocity > -100 && currentPosition > -DRAWER_WIDTH / 2)) {
        openDrawer();
      } else {
        closeDrawer();
      }
    });

  // Animações dos estilos
  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-DRAWER_WIDTH, 0],
      [0, 1],
      Extrapolate.CLAMP
    ),
    pointerEvents: translateX.value > -DRAWER_WIDTH + 10 ? 'auto' : 'none',
  }));

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
  const currentScreen = segments[segments.length - 1] || 'index';
  const shouldShowHeader = !screensWithoutHeader.includes(currentScreen);
  const shouldShowSidebar = !screensWithoutSidebar.includes(currentScreen);

  useEffect(() => {
    // Fecha o drawer quando muda de tela ou quando está em tela sem sidebar
    if (isDrawerOpen && (!shouldShowSidebar || currentScreen !== segments[segments.length - 1])) {
      closeDrawer();
    }
  }, [currentScreen, shouldShowSidebar, isDrawerOpen, segments]);

  if (!appReady || !theme) {
    return null;
  }

  // Cria gesture condicionalmente
  const conditionalPanGesture = shouldShowSidebar ? panGesture : Gesture.Pan().enabled(false);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Sidebar - só renderiza se permitido */}
      {shouldShowSidebar && (
        <>
          <SidebarDrawer
            animatedStyle={animatedSidebarStyle}
            onClose={closeDrawer}
            currentScreen={currentScreen}
          />
          {/* Overlay */}
          <Animated.View style={[styles.overlay, animatedOverlayStyle]} pointerEvents="box-none">
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeDrawer()} />
          </Animated.View>
        </>
      )}
      
      {/* Conteúdo principal com gesture condicional */}
      <GestureDetector gesture={conditionalPanGesture}>
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
      </GestureDetector>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
});