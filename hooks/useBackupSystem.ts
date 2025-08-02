// hooks/useBackupSystem.ts - SISTEMA DE BACKUP AUTOMÁTICO
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Imports condicionais para evitar erro no build
let FileSystem: any = null;
let DocumentPicker: any = null; 
let Sharing: any = null;

try {
  FileSystem = require('expo-file-system');
  DocumentPicker = require('expo-document-picker');
  Sharing = require('expo-sharing');
} catch (error) {
  console.warn('Módulos de backup não disponíveis:', error);
}
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
    analyticsData: any;
  };
  metadata: {
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
    appVersion: string;
  };
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupDate: string;
  cloudSyncEnabled: boolean;
  maxBackupFiles: number;
}

export const useBackupSystem = () => {
  const [backupSettings, setBackupSettings] = useState<BackupSettings>({
    autoBackupEnabled: true,
    backupFrequency: 'weekly',
    lastBackupDate: '',
    cloudSyncEnabled: false,
    maxBackupFiles: 5
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupHistory, setBackupHistory] = useState<string[]>([]);

  useEffect(() => {
    loadBackupSettings();
    loadBackupHistory();
    checkAutoBackup();
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

  const getAllAppData = async (): Promise<BackupData['data']> => {
    const keys = [
      'userProfile',
      'cycleData', 
      'dailyRecords',
      'notificationSettings',
      'selectedThemeVariant',
      'themeMode',
      'analyticsCache'
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
      },
      analyticsData: data.analyticsCache
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
          dateRange: {
            start: records.length > 0 ? 
              moment(Math.min(...records.map(r => moment(r.date).valueOf()))).format('YYYY-MM-DD') : 
              moment().format('YYYY-MM-DD'),
            end: records.length > 0 ? 
              moment(Math.max(...records.map(r => moment(r.date).valueOf()))).format('YYYY-MM-DD') : 
              moment().format('YYYY-MM-DD')
          },
          appVersion: '1.0.0'
        }
      };

      const backupId = `backup_${moment().format('YYYYMMDD_HHmmss')}`;
      const fileName = `${backupId}.json`;
      
      // Salvar backup localmente (apenas se FileSystem disponível)
      if (FileSystem) {
        const backupPath = `${FileSystem.documentDirectory}backups/`;
        
        // Criar diretório se não existir
        const dirInfo = await FileSystem.getInfoAsync(backupPath);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(backupPath, { intermediates: true });
        }
        
        const filePath = `${backupPath}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
      }
      
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

  const exportBackup = useCallback(async (backupId?: string): Promise<boolean> => {
    try {
      if (!FileSystem || !Sharing) {
        throw new Error('Sistema de backup não disponível');
      }

      let targetBackupId = backupId;
      
      if (!targetBackupId) {
        // Criar novo backup se não especificado
        const newBackupId = await createBackup();
        if (!newBackupId) return false;
        targetBackupId = newBackupId;
      }
      
      const fileName = `${targetBackupId}.json`;
      const backupPath = `${FileSystem.documentDirectory}backups/${fileName}`;
      
      // Verificar se o arquivo existe
      const fileInfo = await FileSystem.getInfoAsync(backupPath);
      if (!fileInfo.exists) {
        throw new Error('Arquivo de backup não encontrado');
      }
      
      // Compartilhar arquivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupPath, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar backup do Entre Fases'
        });
        return true;
      } else {
        throw new Error('Compartilhamento não disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      throw error;
    }
  }, [createBackup]);

  const importBackup = useCallback(async (): Promise<boolean> => {
    try {
      if (!DocumentPicker || !FileSystem) {
        throw new Error('Sistema de import não disponível');
      }

      setIsRestoring(true);
      
      // Selecionar arquivo
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'cancel') {
        return false;
      }

      // Ler conteúdo do arquivo
      const fileContent = await FileSystem.readAsStringAsync(result.uri);
      const backupData: BackupData = JSON.parse(fileContent);
      
      // Validar formato do backup
      if (!backupData.version || !backupData.data) {
        throw new Error('Formato de backup inválido');
      }
      
      // Restaurar dados
      await restoreFromBackup(backupData);
      
      console.log('✅ Backup restaurado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao importar backup:', error);
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
      { key: 'themeMode', value: data.themeSettings?.mode },
      { key: 'analyticsCache', value: data.analyticsData }
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
      if (FileSystem) {
        const fileName = `${backupId}.json`;
        const backupPath = `${FileSystem.documentDirectory}backups/${fileName}`;
        
        // Deletar arquivo
        await FileSystem.deleteAsync(backupPath, { idempotent: true });
      }
      
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
      if (!FileSystem) {
        return null;
      }

      const fileName = `${backupId}.json`;
      const backupPath = `${FileSystem.documentDirectory}backups/${fileName}`;
      
      const fileContent = await FileSystem.readAsStringAsync(backupPath);
      const backupData: BackupData = JSON.parse(fileContent);
      
      return {
        id: backupId,
        timestamp: backupData.timestamp,
        totalRecords: backupData.metadata.totalRecords,
        dateRange: backupData.metadata.dateRange,
        size: fileContent.length
      };
    } catch (error) {
      console.error('Erro ao obter informações do backup:', error);
      return null;
    }
  }, []);

  return {
    // Estados
    backupSettings,
    isBackingUp,
    isRestoring,
    backupHistory,

    // Ações
    createBackup,
    exportBackup,
    importBackup,
    deleteBackup,
    saveBackupSettings,
    getBackupInfo,

    // Utilitários
    checkAutoBackup
  };
};