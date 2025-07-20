import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { setupNotificationListeners, requestNotificationPermissions } from '../hooks/notifications';
import React from 'react';

// Previne a tela de splash de esconder automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Carrega fontes personalizadas (opcionais - pode usar fontes do sistema)
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

        // Pequeno delay para mostrar a splash screen
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Cleanup function retornada pelo useEffect
        return () => {
          notificationListeners.remove();
        };
        
      } catch (error) {
        console.warn('Erro ao carregar recursos:', error);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    loadResources();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="cycle-setup" />
        <Stack.Screen name="home" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="records" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="settings" />
      </Stack>
    </GestureHandlerRootView>
  );
}