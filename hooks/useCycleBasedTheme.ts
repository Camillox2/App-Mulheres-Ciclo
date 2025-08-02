// hooks/useCycleBasedTheme.ts - SISTEMA AUTOMÁTICO DE TEMAS BASEADO NO CICLO
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { CyclePhase } from './useAdaptiveTheme';
import { ThemeVariant } from './useThemeSystem';

interface CycleThemeSettings {
  autoThemeEnabled: boolean;
  phaseThemeMapping: Record<CyclePhase, ThemeVariant>;
  lastThemeUpdate: string;
  manualOverride: boolean;
}

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

const DEFAULT_PHASE_THEME_MAPPING: Record<CyclePhase, ThemeVariant> = {
  menstrual: 'rose',      // Rosa para menstruação
  postMenstrual: 'forest', // Verde para pós-menstrual (renovação)
  fertile: 'cherry',      // Rosa claro para período fértil
  ovulation: 'sunset',    // Amarelo/laranja para ovulação (energia)
  preMenstrual: 'lavender', // Roxo para TPM (calma)
};

export const useCycleBasedTheme = () => {
  const [settings, setSettings] = useState<CycleThemeSettings>({
    autoThemeEnabled: false,
    phaseThemeMapping: DEFAULT_PHASE_THEME_MAPPING,
    lastThemeUpdate: '',
    manualOverride: false,
  });
  const [currentPhase, setCurrentPhase] = useState<CyclePhase>('menstrual');
  const [isLoading, setIsLoading] = useState(true);

  // Carrega configurações salvas
  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('cycleThemeSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        console.log('🔄 Configurações carregadas:', parsed);
      } else {
        console.log('🔄 Nenhuma configuração salva encontrada, usando padrões');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de tema automático:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega configurações iniciais uma única vez
  useEffect(() => {
    loadSettings();
  }, []);

  // Listener para mudanças nas configurações (simplificado)
  useEffect(() => {
    if (isLoading) return; // Não verifica durante carregamento inicial
    
    const checkForSettingsChanges = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('cycleThemeSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Atualiza apenas se realmente mudou
          if (JSON.stringify(parsed) !== JSON.stringify(settings)) {
            console.log('🔄 Configurações mudaram externamente, atualizando...');
            setSettings(parsed);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar mudanças de configuração:', error);
      }
    };

    const interval = setInterval(checkForSettingsChanges, 2000);
    return () => clearInterval(interval);
  }, [settings, isLoading]);

  // Salva configurações
  const saveSettings = useCallback(async (newSettings: Partial<CycleThemeSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem('cycleThemeSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações de tema automático:', error);
    }
  }, [settings]);

  // Calcula a fase atual do ciclo
  const getCurrentCyclePhase = useCallback(async (): Promise<CyclePhase> => {
    try {
      const cycleData = await AsyncStorage.getItem('cycleData');
      if (!cycleData) return 'menstrual';

      const { lastPeriodDate, averageCycleLength, averagePeriodLength }: CycleData = JSON.parse(cycleData);
      const lastPeriod = moment(lastPeriodDate);
      const today = moment();
      const daysSinceLastPeriod = today.diff(lastPeriod, 'days');
      const dayOfCycle = (daysSinceLastPeriod % averageCycleLength) + 1;
      
      const ovulationDay = averageCycleLength - 14;
      
      let phase: CyclePhase;
      if (dayOfCycle <= averagePeriodLength) {
        phase = 'menstrual';
      } else if (dayOfCycle < ovulationDay - 2) {
        phase = 'postMenstrual';
      } else if (dayOfCycle >= ovulationDay - 1 && dayOfCycle <= ovulationDay + 1) {
        if (dayOfCycle === ovulationDay) {
          phase = 'ovulation';
        } else {
          phase = 'fertile';
        }
      } else {
        phase = 'preMenstrual';
      }

      setCurrentPhase(phase);
      return phase;
    } catch (error) {
      console.error('Erro ao calcular fase do ciclo:', error);
      return 'menstrual';
    }
  }, []);

  // Aplica tema automaticamente baseado na fase
  const applyAutoTheme = useCallback(async (force = false) => {
    if (!settings.autoThemeEnabled && !force) return null;

    try {
      const phase = await getCurrentCyclePhase();
      const today = moment().format('YYYY-MM-DD');
      
      // Verifica se já atualizou hoje (evita múltiplas atualizações)
      if (settings.lastThemeUpdate === today && !force) {
        return settings.phaseThemeMapping[phase];
      }

      const newTheme = settings.phaseThemeMapping[phase];
      
      // Salva o tema selecionado
      await AsyncStorage.setItem('selectedThemeVariant', newTheme);
      
      // Atualiza a data da última atualização
      await saveSettings({ 
        lastThemeUpdate: today,
        manualOverride: false,
      });

      console.log(`🌸 Tema automático aplicado: ${newTheme} para fase ${phase}`);
      
      return newTheme;
    } catch (error) {
      console.error('Erro ao aplicar tema automático:', error);
      return null;
    }
  }, [settings, getCurrentCyclePhase, saveSettings]);

  // Ativa/desativa tema automático
  const toggleAutoTheme = useCallback(async () => {
    const newState = !settings.autoThemeEnabled;
    
    try {
      // Salva primeiro no AsyncStorage
      const updatedSettings = { ...settings, autoThemeEnabled: newState };
      await AsyncStorage.setItem('cycleThemeSettings', JSON.stringify(updatedSettings));
      
      // Atualiza o estado local
      setSettings(updatedSettings);
      
      console.log(`🔄 Tema automático ${newState ? 'ATIVADO' : 'DESATIVADO'} e salvo`);
      
      if (newState) {
        // Se ativou, aplica tema imediatamente
        await applyAutoTheme(true);
      }
      
    } catch (error) {
      console.error('Erro ao alternar tema automático:', error);
      throw error; // Propaga o erro para a UI
    }
  }, [settings, applyAutoTheme]);

  // Personaliza mapeamento de fases para temas
  const updatePhaseThemeMapping = useCallback(async (phase: CyclePhase, theme: ThemeVariant) => {
    const newMapping = { ...settings.phaseThemeMapping, [phase]: theme };
    await saveSettings({ phaseThemeMapping: newMapping });
  }, [settings.phaseThemeMapping, saveSettings]);

  // Detecta mudança manual de tema
  const setManualOverride = useCallback(async (isManual: boolean) => {
    await saveSettings({ manualOverride: isManual });
  }, [saveSettings]);

  // Verifica se deve atualizar tema diariamente
  const checkDailyThemeUpdate = useCallback(async () => {
    if (!settings.autoThemeEnabled || settings.manualOverride) return;
    
    const today = moment().format('YYYY-MM-DD');
    if (settings.lastThemeUpdate !== today) {
      await applyAutoTheme();
    }
  }, [settings, applyAutoTheme]);

  // Reinicia para temas padrão
  const resetToDefaults = useCallback(async () => {
    await saveSettings({
      phaseThemeMapping: DEFAULT_PHASE_THEME_MAPPING,
      manualOverride: false,
      lastThemeUpdate: '',
    });
  }, [saveSettings]);

  // Inicialização
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Verifica atualizações diárias
  useEffect(() => {
    if (!isLoading) {
      checkDailyThemeUpdate();
      
      // Configura verificação a cada hora
      const interval = setInterval(checkDailyThemeUpdate, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, checkDailyThemeUpdate]);

  return {
    // Estado
    settings,
    currentPhase,
    isLoading,
    
    // Métodos principais
    toggleAutoTheme,
    applyAutoTheme,
    updatePhaseThemeMapping,
    setManualOverride,
    resetToDefaults,
    getCurrentCyclePhase,
    
    // Utilitários
    getThemeForPhase: (phase: CyclePhase) => settings.phaseThemeMapping[phase],
    isAutoThemeActive: settings.autoThemeEnabled && !settings.manualOverride,
    defaultMapping: DEFAULT_PHASE_THEME_MAPPING,
  };
};