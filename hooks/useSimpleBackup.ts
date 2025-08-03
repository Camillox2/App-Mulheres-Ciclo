// hooks/useSimpleBackup.ts - SISTEMA DE BACKUP SIMPLIFICADO
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Alert } from 'react-native';
import moment from 'moment';

interface BackupData {
  version: string;
  timestamp: string;
  data: {
    userProfile: any;
    cycleData: any;
    dailyRecords: any[];
    notificationSettings: any;
    themeSettings: any;
  };
  metadata: {
    totalRecords: number;
    appVersion: string;
  };
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string;
  maxBackupFiles: number;
}

export const useSimpleBackup = () => {
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackupEnabled: true,
    backupFrequency: 'weekly',
    lastBackupDate: '',
    maxBackupFiles: 5
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupHistory, setBackupHistory] = useState<string[]>([]);

  useEffect(() => {
    loadBackupSettings();
    loadBackupHistory();
  }, []);

  const loadBackupSettings = async () => {
    try {
      const settingsStr = await AsyncStorage.getItem('backupSettings');
      if (settingsStr) {
        setBackupSettings(JSON.parse(settingsStr));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de backup:', error);
    }
  };

  const saveBackupSettings = async (newSettings: Partial<BackupSettings>) => {
    try {
      const updatedSettings = { ...backupSettings, ...newSettings };
      setBackupSettings(updatedSettings);
      await AsyncStorage.setItem('backupSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações de backup:', error);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const historyStr = await AsyncStorage.getItem('backupHistory');
      if (historyStr) {
        setBackupHistory(JSON.parse(historyStr));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de backup:', error);
    }
  };

  const addToBackupHistory = async (backupId: string) => {
    try {
      const newHistory = [backupId, ...backupHistory].slice(0, backupSettings.maxBackupFiles);
      setBackupHistory(newHistory);
      await AsyncStorage.setItem('backupHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erro ao atualizar histórico:', error);
    }
  };

  const getAllAppData = async (): Promise<BackupData['data']> => {
    const keys = [
      'userProfile',
      'cycleData', 
      'dailyRecords',
      'notificationSettings',
      'selectedThemeVariant',
      'themeMode'
    ];

    const data: any = {};
    
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        data[key] = value ? JSON.parse(value) : null;
      } catch (error) {
        console.error(`Erro ao obter ${key}:`, error);
        data[key] = null;
      }
    }

    return {
      userProfile: data.userProfile,
      cycleData: data.cycleData,
      dailyRecords: data.dailyRecords || [],
      notificationSettings: data.notificationSettings,
      themeSettings: {
        selectedVariant: data.selectedThemeVariant,
        mode: data.themeMode
      }
    };
  };

  const createBackup = useCallback(async (isAutomatic = false): Promise<string | null> => {
    try {
      setIsBackingUp(true);
      
      const appData = await getAllAppData();
      const records = appData.dailyRecords || [];
      
      const backupData: BackupData = {
        version: '1.0',
        timestamp: moment().toISOString(),
        data: appData,
        metadata: {
          totalRecords: records.length,
          appVersion: '1.0.1'
        }
      };

      const backupId = `backup_${moment().format('YYYYMMDD_HHmmss')}`;
      
      // Salvar backup no AsyncStorage
      await AsyncStorage.setItem(`backup_${backupId}`, JSON.stringify(backupData));
      
      // Atualizar configurações e histórico
      await saveBackupSettings({ lastBackupDate: moment().toISOString() });
      await addToBackupHistory(backupId);
      
      console.log(`✅ Backup ${isAutomatic ? 'automático' : 'manual'} criado: ${backupId}`);
      
      return backupId;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    } finally {
      setIsBackingUp(false);
    }
  }, [backupSettings, backupHistory]);

  const shareBackup = useCallback(async (backupId?: string): Promise<boolean> => {
    try {
      let targetBackupId = backupId;
      
      if (!targetBackupId) {
        // Criar novo backup se não especificado
        const newBackupId = await createBackup();
        if (!newBackupId) return false;
        targetBackupId = newBackupId;
      }
      
      // Buscar backup do AsyncStorage
      const backupData = await AsyncStorage.getItem(`backup_${targetBackupId}`);
      if (!backupData) {
        throw new Error('Backup não encontrado');
      }

      // Compartilhar como texto
      const shareContent = `📱 Backup Entre Fases - ${targetBackupId}

⚠️ IMPORTANTE: Este backup contém seus dados pessoais. Compartilhe apenas com pessoas de confiança.

Para restaurar:
1. Copie todo este texto
2. Abra o app Entre Fases
3. Vá em Configurações > Backup
4. Cole o texto no campo de restauração

--- INÍCIO DO BACKUP ---
${backupData}
--- FIM DO BACKUP ---

Gerado em: ${moment().format('DD/MM/YYYY HH:mm')}`;

      await Share.share({
        message: shareContent,
        title: 'Backup Entre Fases'
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar backup:', error);
      throw error;
    }
  }, [createBackup]);

  const restoreFromText = useCallback(async (backupText: string): Promise<boolean> => {
    try {
      setIsRestoring(true);
      
      // Extrair JSON do texto compartilhado
      const startMarker = '--- INÍCIO DO BACKUP ---';
      const endMarker = '--- FIM DO BACKUP ---';
      
      const startIndex = backupText.indexOf(startMarker);
      const endIndex = backupText.indexOf(endMarker);
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Formato de backup inválido');
      }
      
      const jsonText = backupText
        .substring(startIndex + startMarker.length, endIndex)
        .trim();
      
      const backupData: BackupData = JSON.parse(jsonText);
      
      // Validar formato do backup
      if (!backupData.version || !backupData.data) {
        throw new Error('Dados de backup inválidos');
      }
      
      // Restaurar dados
      await restoreFromBackup(backupData);
      
      console.log('✅ Backup restaurado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const restoreFromBackup = async (backupData: BackupData) => {
    const { data } = backupData;
    
    // Restaurar cada tipo de dado
    const restoreOperations = [
      { key: 'userProfile', value: data.userProfile },
      { key: 'cycleData', value: data.cycleData },
      { key: 'dailyRecords', value: data.dailyRecords },
      { key: 'notificationSettings', value: data.notificationSettings },
      { key: 'selectedThemeVariant', value: data.themeSettings?.selectedVariant },
      { key: 'themeMode', value: data.themeSettings?.mode }
    ];

    for (const operation of restoreOperations) {
      if (operation.value !== null && operation.value !== undefined) {
        try {
          await AsyncStorage.setItem(operation.key, JSON.stringify(operation.value));
        } catch (error) {
          console.error(`Erro ao restaurar ${operation.key}:`, error);
        }
      }
    }
  };

  const deleteBackup = useCallback(async (backupId: string): Promise<boolean> => {
    try {
      // Remover do AsyncStorage
      await AsyncStorage.removeItem(`backup_${backupId}`);
      
      // Remover do histórico
      const newHistory = backupHistory.filter(id => id !== backupId);
      setBackupHistory(newHistory);
      await AsyncStorage.setItem('backupHistory', JSON.stringify(newHistory));
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar backup:', error);
      return false;
    }
  }, [backupHistory]);

  const getBackupInfo = useCallback(async (backupId: string) => {
    try {
      const backupDataStr = await AsyncStorage.getItem(`backup_${backupId}`);
      if (!backupDataStr) return null;
      
      const backupData: BackupData = JSON.parse(backupDataStr);
      
      return {
        id: backupId,
        timestamp: backupData.timestamp,
        totalRecords: backupData.metadata.totalRecords,
        size: backupDataStr.length
      };
    } catch (error) {
      console.error('Erro ao obter informações do backup:', error);
      return null;
    }
  }, []);

  const checkAutoBackup = async () => {
    if (!backupSettings.autoBackupEnabled || !backupSettings.lastBackupDate) {
      return;
    }

    const lastBackup = moment(backupSettings.lastBackupDate);
    const now = moment();
    const shouldBackup = (() => {
      switch (backupSettings.backupFrequency) {
        case 'daily':
          return now.diff(lastBackup, 'days') >= 1;
        case 'weekly':
          return now.diff(lastBackup, 'weeks') >= 1;
        case 'monthly':
          return now.diff(lastBackup, 'months') >= 1;
        default:
          return false;
      }
    })();

    if (shouldBackup) {
      console.log('🔄 Iniciando backup automático...');
      await createBackup(true);
    }
  };

  return {
    // Estados
    backupSettings,
    isBackingUp,
    isRestoring,
    backupHistory,

    // Ações principais
    createBackup,
    shareBackup,
    restoreFromText,
    deleteBackup,
    saveBackupSettings,
    getBackupInfo,

    // Utilitários
    checkAutoBackup
  };
};