// hooks/useGlobalParticles.ts - SISTEMA GLOBAL DE PARTÍCULAS
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParticleType } from '../components/AdvancedParticleSystem';

export interface GlobalParticleSettings {
  enabled: boolean;
  particleType: ParticleType;
  count: number;
  windForce: number;
  gravityStrength: number;
  bounceEnabled: boolean;
}

const DEFAULT_SETTINGS: GlobalParticleSettings = {
  enabled: false,
  particleType: 'falling',
  count: 6,
  windForce: 1,
  gravityStrength: 1,
  bounceEnabled: true,
};

export const useGlobalParticles = () => {
  const [settings, setSettings] = useState<GlobalParticleSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Carrega configurações salvas
  useEffect(() => {
    loadSettings();
  }, []);

  // Listener para mudanças nas configurações (igual ao tema)
  useEffect(() => {
    const checkForChanges = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('globalParticleSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          const newSettings = { ...DEFAULT_SETTINGS, ...parsed };
          
          // Compara com configurações atuais
          if (JSON.stringify(newSettings) !== JSON.stringify(settings)) {
            console.log('🎨 useGlobalParticles: Detectou mudança:', newSettings);
            setSettings(newSettings);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar mudanças das partículas:', error);
      }
    };

    // Verifica mudanças a cada 500ms (igual ao tema)
    const interval = setInterval(checkForChanges, 500);
    return () => clearInterval(interval);
  }, [settings]);

  // Listener para forceParticleReload (igual ao tema)
  useEffect(() => {
    const checkForForceReload = async () => {
      try {
        const forceReload = await AsyncStorage.getItem('forceParticleReload');
        const lastCheck = await AsyncStorage.getItem('lastParticleReloadCheck') || '0';
        
        if (forceReload && forceReload !== lastCheck) {
          console.log('🔄 useGlobalParticles: Recebeu forceParticleReload, recarregando...');
          await AsyncStorage.setItem('lastParticleReloadCheck', forceReload);
          await loadSettings();
        }
      } catch (error) {
        console.error('Erro ao verificar forceParticleReload:', error);
      }
    };

    const interval = setInterval(checkForForceReload, 200);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('globalParticleSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        const newSettings = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(newSettings);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações das partículas:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar configurações (igual ao tema)
  const updateSettings = useCallback(async (newSettings: GlobalParticleSettings) => {
    try {
      await AsyncStorage.setItem('globalParticleSettings', JSON.stringify(newSettings));
      
      // Força atualização global (igual ao tema)
      await AsyncStorage.setItem('forceParticleReload', Date.now().toString());
      
      setSettings(newSettings);
      console.log('🎨 Configurações de partículas atualizadas globalmente:', newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações das partículas:', error);
    }
  }, []);

  return {
    // Estado atual
    settings,
    loading,
    
    // Métodos de controle
    updateSettings,
    
    // Flags convenientes
    isEnabled: settings.enabled,
  };
};