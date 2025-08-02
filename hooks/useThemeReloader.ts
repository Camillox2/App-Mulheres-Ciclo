// hooks/useThemeReloader.ts - HOOK PARA FORÇAR ATUALIZAÇÃO DE TEMA EM TEMPO REAL
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useThemeReloader = () => {
  const [themeVersion, setThemeVersion] = useState(0);

  // Incrementa versão para forçar re-render de todos os componentes
  const forceThemeUpdate = () => {
    setThemeVersion(prev => prev + 1);
  };

  // Listener para mudanças no tema
  useEffect(() => {
    const themeChangeListener = () => {
      forceThemeUpdate();
    };

    // Simular listener (em uma implementação real, você usaria um EventEmitter)
    const interval = setInterval(async () => {
      try {
        const themeTimestamp = await AsyncStorage.getItem('themeLastChanged');
        const currentTimestamp = await AsyncStorage.getItem('currentThemeTimestamp') || '0';
        
        if (themeTimestamp && themeTimestamp !== currentTimestamp) {
          await AsyncStorage.setItem('currentThemeTimestamp', themeTimestamp);
          forceThemeUpdate();
        }
      } catch (error) {
        console.error('Erro ao verificar mudança de tema:', error);
      }
    }, 500); // Verifica a cada 500ms

    return () => clearInterval(interval);
  }, []);

  return {
    themeVersion,
    forceThemeUpdate
  };
};