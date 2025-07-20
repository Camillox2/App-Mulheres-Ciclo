// app/_layout.tsx - VERSÃO ATUALIZADA COM TEMA DARK
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useSegments, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { setupNotificationListeners, requestNotificationPermissions } from '../hooks/notifications';
import { GlobalHeader } from '../components/GlobalHeader';
import { SidebarDrawer } from '../components/Sidebar';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import React from 'react';

// Previne a tela de splash de esconder automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const segments = useSegments();
  const { theme, isDarkMode } = useAdaptiveTheme();

  // Determina a tela atual baseada nos segments
  const getCurrentScreen = () => {
    const screen = segments[segments.length - 1] || 'index';
    return screen;
  };

  // Telas que não devem mostrar o header/drawer
  const screensWithoutHeader = ['index', 'welcome', 'profile-setup', 'cycle-setup'];
  const currentScreen = getCurrentScreen();
  const shouldShowHeader = !screensWithoutHeader.includes(currentScreen);

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Carrega fontes personalizadas (opcional)
        // await Font.loadAsync({
        //   'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        // });

        // Configura sistema de notificações
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          console.log('Permissões de notificação concedidas');
        } else {
          console.log('Permissões de notificação negadas');
        }

        // Configura listeners de notificação
        const notificationListeners = setupNotificationListeners();

        // Aguarda um pouco para garantir que tudo carregou
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setAppReady(true);
        
        // Cleanup function retornada pelo useEffect
        return () => {
          notificationListeners.remove();
        };
        
      } catch (error) {
        console.warn('Erro ao carregar recursos:', error);
        setAppReady(true); // Continua mesmo com erro
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    loadResources();
  }, []);

  // Fecha o drawer quando muda de tela
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [currentScreen]);

  const handleMenuPress = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  if (!appReady) {
    return null; // Ou um loading screen customizado
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[
        styles.appContainer, 
        { 
          backgroundColor: theme?.colors.background || (isDarkMode ? '#0A0A0F' : '#FFFFFF')
        }
      ]}>
        
        {/* Header Global (apenas em telas específicas) */}
        {shouldShowHeader && (
          <GlobalHeader
            onMenuPress={handleMenuPress}
            isMenuOpen={isDrawerOpen}
            currentScreen={currentScreen}
          />
        )}

        {/* Stack Navigator */}
        <View style={styles.stackContainer}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
              animationDuration: 300,
              // Configurações específicas para tema dark
              contentStyle: {
                backgroundColor: theme?.colors.background || (isDarkMode ? '#0A0A0F' : '#FFFFFF'),
              },
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="welcome" 
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen 
              name="profile-setup" 
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="cycle-setup" 
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="home" 
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen 
              name="calendar" 
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="records" 
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="analytics" 
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen 
              name="settings" 
              options={{
                animation: 'slide_from_right',
              }}
            />
          </Stack>
        </View>

        {/* Sidebar Drawer (apenas em telas específicas) */}
        {shouldShowHeader && (
          <SidebarDrawer
            isOpen={isDrawerOpen}
            onClose={handleDrawerClose}
            currentScreen={currentScreen}
          />
        )}

        {/* Status Bar configurado para tema dark */}
        <StatusBar 
          style={isDarkMode ? 'light' : 'dark'} 
          backgroundColor={theme?.colors.background || (isDarkMode ? '#0A0A0F' : '#FFFFFF')}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
});