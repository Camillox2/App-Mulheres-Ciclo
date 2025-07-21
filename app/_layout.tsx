// app/_layout.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, StatusBar } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

import { GlobalHeader } from '../components/GlobalHeader';
import { SidebarDrawer } from '../components/Sidebar';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';

SplashScreen.preventAutoHideAsync();

const DRAWER_WIDTH_PERCENT = 0.80;

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const segments = useSegments();
  const { theme, isDarkMode } = useAdaptiveTheme();
  const dimensions = useWindowDimensions();
  const DRAWER_WIDTH = dimensions.width * DRAWER_WIDTH_PERCENT;

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    translateX.value = withTiming(0, { duration: 300 });
    runOnJS(setDrawerState)(true);
  }, [translateX]);

  const closeDrawer = useCallback((callback?: () => void) => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 }, (isFinished) => {
      if (isFinished) {
        runOnJS(setDrawerState)(false);
        if (callback) {
          runOnJS(callback)();
        }
      }
    });
  }, [translateX, DRAWER_WIDTH]);

  const gestureHandler = (event: any) => {
    'worklet';
    const currentPos = translateX.value;
    const newX = currentPos + event.translationX;
    translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, newX));

    if (event.state === 5) {
      if (event.velocityX > 500 || translateX.value > -DRAWER_WIDTH / 2) {
        translateX.value = withTiming(0);
        runOnJS(setDrawerState)(true);
      } else {
        translateX.value = withTiming(-DRAWER_WIDTH);
        runOnJS(setDrawerState)(false);
      }
    }
  };

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 1], Extrapolate.CLAMP),
    zIndex: isDrawerOpen ? 100 : -1,
  }));

  const screensWithoutHeader = ['index', 'welcome', 'profile-setup', 'cycle-setup'];
  const currentScreen = segments[segments.length - 1] || 'index';
  const shouldShowHeader = !screensWithoutHeader.includes(currentScreen);

  useEffect(() => {
    if (isDrawerOpen) {
      closeDrawer();
    }
  }, [currentScreen]);

  if (!appReady || !theme) {
    return null;
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SidebarDrawer
        animatedStyle={animatedSidebarStyle}
        onClose={closeDrawer}
        currentScreen={currentScreen}
      />
      
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={[-10, 40]}
        failOffsetY={[-15, 15]}
        enabled={shouldShowHeader}
      >
        <Animated.View style={styles.contentContainer}>
          {shouldShowHeader && (
            <GlobalHeader
              onMenuPress={isDrawerOpen ? closeDrawer : openDrawer}
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
      </PanGestureHandler>
      
      {isDrawerOpen && (
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeDrawer()} />
        </Animated.View>
      )}
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
  },
});