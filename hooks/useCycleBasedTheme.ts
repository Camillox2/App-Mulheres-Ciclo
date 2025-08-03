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
  const [isUpdating, setIsUpdating] = useState(false);

  // Carrega configurações salvas
  const loadSettings = useCallback(async () => {
    if (isLoading === false) return; // Evita múltiplas execuções
    
    try {
      console.log('🔄 Carregando configurações...');
      const savedSettings = await AsyncStorage.getItem('cycleThemeSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        console.log('🔄 Configurações encontradas:', parsed);
        setSettings(parsed);
      } else {
        console.log('🔄 Usando configurações padrão');
        const defaultSettings = {
          autoThemeEnabled: false,
          phaseThemeMapping: DEFAULT_PHASE_THEME_MAPPING,
          lastThemeUpdate: '',
          manualOverride: false,
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Carrega configurações APENAS uma vez
  useEffect(() => {
    if (isLoading) {
      loadSettings();
    }
  }, []);

  // Atualiza fase atual periodicamente
  useEffect(() => {
    if (!isLoading) {
      getCurrentCyclePhase();
      
      // Atualiza a fase a cada 5 minutos para detectar mudanças
      const interval = setInterval(getCurrentCyclePhase, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, getCurrentCyclePhase]);

  // Aplica tema automaticamente quando necessário
  useEffect(() => {
    if (!isLoading && settings.autoThemeEnabled && !settings.manualOverride) {
      console.log('🔄 Verificando se precisa aplicar tema automático...');
      applyAutoTheme();
    }
  }, [settings.autoThemeEnabled, settings.phaseThemeMapping, currentPhase, isLoading, settings.manualOverride, applyAutoTheme]);


  // Salva configurações
  const saveSettings = useCallback(async (newSettings: Partial<CycleThemeSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      console.log('💾 Salvando configurações:', updatedSettings);
      await AsyncStorage.setItem('cycleThemeSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      console.log('✅ Configurações salvas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar configurações de tema automático:', error);
      throw error;
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
      
      console.log(`🌸 Aplicando tema automático: ${newTheme} para fase ${phase}`);
      
      // Salva o tema selecionado
      await AsyncStorage.setItem('selectedThemeVariant', newTheme);
      await AsyncStorage.setItem('themeLastChanged', Date.now().toString());
      
      // Atualiza a data da última atualização
      await saveSettings({ 
        lastThemeUpdate: today,
        manualOverride: false,
      });

      console.log(`✅ Tema automático aplicado com sucesso: ${newTheme}`);
      
      return newTheme;
    } catch (error) {
      console.error('❌ Erro ao aplicar tema automático:', error);
      return null;
    }
  }, [settings, getCurrentCyclePhase, saveSettings]);

  // Ativa/desativa tema automático
  const toggleAutoTheme = useCallback(async () => {
    if (isUpdating) {
      console.log('⏳ Toggle já em progresso, ignorando...');
      return settings.autoThemeEnabled;
    }
    
    setIsUpdating(true);
    
    try {
      // Le o estado atual diretamente do storage para ter certeza
      const currentStorageData = await AsyncStorage.getItem('cycleThemeSettings');
      const currentStorageState = currentStorageData ? JSON.parse(currentStorageData) : settings;
      const currentState = currentStorageState.autoThemeEnabled;
      const newState = !currentState;
      
      console.log(`🔄 TOGGLE: ${currentState} → ${newState}`);
      
      // Cria nova configuração completa
      const updatedSettings = {
        ...currentStorageState,
        autoThemeEnabled: newState,
        manualOverride: false,
      };
      
      // Salva de forma atômica
      await AsyncStorage.setItem('cycleThemeSettings', JSON.stringify(updatedSettings));
      console.log('💾 SALVO:', updatedSettings);
      
      // Força atualização do estado local
      setSettings(updatedSettings);
      
      // Retorna o novo estado para confirmação
      console.log(`✅ TOGGLE COMPLETO: ${newState}`);
      return newState;
      
    } catch (error) {
      console.error('❌ ERRO no toggle:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [settings, isUpdating]);

  // Personaliza mapeamento de fases para temas
  const updatePhaseThemeMapping = useCallback(async (phase: CyclePhase, theme: ThemeVariant) => {
    try {
      console.log(`🎨 INICIANDO atualização mapeamento: ${phase} → ${theme}`);
      console.log(`🔍 Estado atual: autoEnabled=${settings.autoThemeEnabled}, currentPhase=${currentPhase}, targetPhase=${phase}`);
      
      // Primeiro, atualiza o mapeamento
      const newMapping = { ...settings.phaseThemeMapping, [phase]: theme };
      console.log('📝 Novo mapeamento:', newMapping);
      
      // Salva o novo mapeamento
      await saveSettings({ phaseThemeMapping: newMapping });
      console.log('💾 Mapeamento salvo no settings');
      
      // Se o tema automático está ativo e estamos na fase que foi alterada, aplica imediatamente
      if (settings.autoThemeEnabled && currentPhase === phase) {
        console.log(`🚀 APLICANDO TEMA IMEDIATAMENTE: ${theme} para fase atual ${phase}`);
        
        // Salva de forma sequencial para garantir que funcione
        await AsyncStorage.setItem('selectedThemeVariant', theme);
        console.log('💾 selectedThemeVariant salvo:', theme);
        
        await AsyncStorage.setItem('themeLastChanged', Date.now().toString());
        console.log('💾 themeLastChanged atualizado');
        
        // Força reload em todos os sistemas
        await AsyncStorage.setItem('forceThemeReload', Date.now().toString());
        console.log('🔄 forceThemeReload disparado');
        
        console.log(`✅ TEMA APLICADO COM SUCESSO: ${theme}`);
      } else {
        console.log(`⏭️ Não aplicando agora: autoEnabled=${settings.autoThemeEnabled}, isCurrentPhase=${currentPhase === phase}`);
      }
      
      console.log(`✅ Mapeamento completamente atualizado: ${phase} → ${theme}`);
    } catch (error) {
      console.error('❌ ERRO CRÍTICO ao atualizar mapeamento:', error);
      throw error;
    }
  }, [settings, currentPhase, saveSettings]);

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