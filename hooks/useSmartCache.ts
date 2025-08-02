// hooks/useSmartCache.ts - CACHE INTELIGENTE PARA ASYNCSTORAGE
import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version: string;
  size: number;
}

interface CacheConfig {
  defaultTTL: number; // Time to live em milliseconds
  maxSize: number; // Tamanho máximo em bytes
  enableCompression: boolean;
  enableEncryption: boolean;
  version: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  itemCount: number;
  lastCleanup: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 24 * 60 * 60 * 1000, // 24 horas
  maxSize: 10 * 1024 * 1024, // 10MB
  enableCompression: false,
  enableEncryption: false,
  version: '1.0'
};

export const useSmartCache = (config: Partial<CacheConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
    itemCount: 0,
    lastCleanup: Date.now()
  });
  
  const [isReady, setIsReady] = useState(false);
  const statsRef = useRef(stats);
  
  // Prefixo para chaves do cache
  const CACHE_PREFIX = '__smart_cache__';
  const STATS_KEY = '__cache_stats__';

  useEffect(() => {
    loadStats();
    performStartupTasks();
  }, []);

  // Atualizar ref quando stats mudam
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem(STATS_KEY);
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      }
      setIsReady(true);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do cache:', error);
      setIsReady(true);
    }
  };

  const saveStats = async (newStats: CacheStats) => {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Erro ao salvar estatísticas do cache:', error);
    }
  };

  const performStartupTasks = async () => {
    try {
      // Verificar se precisa fazer limpeza
      const now = Date.now();
      const lastCleanup = statsRef.current.lastCleanup;
      const cleanupInterval = 6 * 60 * 60 * 1000; // 6 horas
      
      if (now - lastCleanup > cleanupInterval) {
        await cleanup();
      }
      
      // Calcular estatísticas atuais
      await recalculateStats();
    } catch (error) {
      console.error('Erro nas tarefas de inicialização:', error);
    }
  };

  const generateCacheKey = (key: string): string => {
    return `${CACHE_PREFIX}${key}`;
  };

  const calculateSize = (data: any): number => {
    return JSON.stringify(data).length * 2; // Aproximação (UTF-16)
  };

  const compressData = (data: any): string => {
    // Implementação simples de compressão (em uma implementação real, use uma biblioteca)
    const jsonString = JSON.stringify(data);
    // Por enquanto, apenas retorna o JSON (implementar LZ-string ou similar)
    return jsonString;
  };

  const decompressData = (compressed: string): any => {
    // Implementação simples de descompressão
    return JSON.parse(compressed);
  };

  const get = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const cacheKey = generateCacheKey(key);
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) {
        // Cache miss
        const newStats = {
          ...statsRef.current,
          misses: statsRef.current.misses + 1
        };
        await saveStats(newStats);
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Verificar expiração
      if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
        await AsyncStorage.removeItem(cacheKey);
        const newStats = {
          ...statsRef.current,
          misses: statsRef.current.misses + 1,
          size: Math.max(0, statsRef.current.size - cacheItem.size),
          itemCount: Math.max(0, statsRef.current.itemCount - 1)
        };
        await saveStats(newStats);
        return null;
      }

      // Verificar versão
      if (cacheItem.version !== fullConfig.version) {
        await AsyncStorage.removeItem(cacheKey);
        const newStats = {
          ...statsRef.current,
          misses: statsRef.current.misses + 1,
          size: Math.max(0, statsRef.current.size - cacheItem.size),
          itemCount: Math.max(0, statsRef.current.itemCount - 1)
        };
        await saveStats(newStats);
        return null;
      }

      // Cache hit
      const newStats = {
        ...statsRef.current,
        hits: statsRef.current.hits + 1
      };
      await saveStats(newStats);

      // Descomprimir se necessário
      let data = cacheItem.data;
      if (fullConfig.enableCompression && typeof cacheItem.data === 'string') {
        data = decompressData(cacheItem.data);
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter item do cache:', error);
      return null;
    }
  }, [fullConfig.version, fullConfig.enableCompression]);

  const set = useCallback(async <T>(
    key: string, 
    data: T, 
    options: { ttl?: number; priority?: 'low' | 'normal' | 'high' } = {}
  ): Promise<boolean> => {
    try {
      const cacheKey = generateCacheKey(key);
      const ttl = options.ttl || fullConfig.defaultTTL;
      const expiresAt = ttl > 0 ? Date.now() + ttl : undefined;
      
      // Comprimir dados se habilitado
      let processedData: any = data;
      if (fullConfig.enableCompression) {
        processedData = compressData(data);
      }

      const cacheItem: CacheItem<T> = {
        data: processedData,
        timestamp: Date.now(),
        expiresAt,
        version: fullConfig.version,
        size: calculateSize(processedData)
      };

      // Verificar se excede o tamanho máximo
      const itemSize = calculateSize(cacheItem);
      if (itemSize > fullConfig.maxSize / 2) {
        console.warn(`Item muito grande para cache: ${key} (${itemSize} bytes)`);
        return false;
      }

      // Verificar se há espaço suficiente
      const currentSize = statsRef.current.size;
      if (currentSize + itemSize > fullConfig.maxSize) {
        const freedSpace = await evictItems(itemSize);
        if (freedSpace < itemSize) {
          console.warn('Não foi possível liberar espaço suficiente no cache');
          return false;
        }
      }

      // Verificar se já existe (para atualizar estatísticas)
      const existing = await AsyncStorage.getItem(cacheKey);
      const existingSize = existing ? calculateSize(JSON.parse(existing)) : 0;

      // Salvar no cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));

      // Atualizar estatísticas
      const newStats = {
        ...statsRef.current,
        size: statsRef.current.size - existingSize + itemSize,
        itemCount: existing ? statsRef.current.itemCount : statsRef.current.itemCount + 1
      };
      await saveStats(newStats);

      return true;
    } catch (error) {
      console.error('Erro ao salvar item no cache:', error);
      return false;
    }
  }, [fullConfig.defaultTTL, fullConfig.maxSize, fullConfig.version, fullConfig.enableCompression]);

  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      const cacheKey = generateCacheKey(key);
      const existing = await AsyncStorage.getItem(cacheKey);
      
      if (existing) {
        const cacheItem: CacheItem<any> = JSON.parse(existing);
        await AsyncStorage.removeItem(cacheKey);
        
        const newStats = {
          ...statsRef.current,
          size: Math.max(0, statsRef.current.size - cacheItem.size),
          itemCount: Math.max(0, statsRef.current.itemCount - 1)
        };
        await saveStats(newStats);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao remover item do cache:', error);
      return false;
    }
  }, []);

  const evictItems = async (spaceNeeded: number): Promise<number> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length === 0) return 0;

      // Obter informações de todos os itens do cache
      const cacheItems = await Promise.all(
        cacheKeys.map(async (key) => {
          try {
            const data = await AsyncStorage.getItem(key);
            if (data) {
              const item: CacheItem<any> = JSON.parse(data);
              return { key, item };
            }
          } catch (error) {
            return null;
          }
          return null;
        })
      );

      const validItems = cacheItems.filter(item => item !== null) as Array<{
        key: string;
        item: CacheItem<any>;
      }>;

      // Ordenar por critério de remoção (LRU + expiração)
      validItems.sort((a, b) => {
        // Primeiro, itens expirados
        const aExpired = a.item.expiresAt && Date.now() > a.item.expiresAt;
        const bExpired = b.item.expiresAt && Date.now() > b.item.expiresAt;
        
        if (aExpired && !bExpired) return -1;
        if (!aExpired && bExpired) return 1;
        
        // Depois, por timestamp (mais antigo primeiro)
        return a.item.timestamp - b.item.timestamp;
      });

      let freedSpace = 0;
      const itemsToRemove = [];

      // Selecionar itens para remoção
      for (const { key, item } of validItems) {
        itemsToRemove.push(key);
        freedSpace += item.size;
        
        if (freedSpace >= spaceNeeded) break;
      }

      // Remover itens selecionados
      if (itemsToRemove.length > 0) {
        await AsyncStorage.multiRemove(itemsToRemove);
        
        const newStats = {
          ...statsRef.current,
          size: Math.max(0, statsRef.current.size - freedSpace),
          itemCount: Math.max(0, statsRef.current.itemCount - itemsToRemove.length)
        };
        await saveStats(newStats);
      }

      return freedSpace;
    } catch (error) {
      console.error('Erro ao remover itens do cache:', error);
      return 0;
    }
  };

  const cleanup = useCallback(async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
      
      const expiredKeys = [];
      let freedSpace = 0;
      
      for (const key of cacheKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const cacheItem: CacheItem<any> = JSON.parse(data);
            
            // Verificar expiração ou versão
            const isExpired = cacheItem.expiresAt && Date.now() > cacheItem.expiresAt;
            const isOutdated = cacheItem.version !== fullConfig.version;
            
            if (isExpired || isOutdated) {
              expiredKeys.push(key);
              freedSpace += cacheItem.size;
            }
          }
        } catch (error) {
          // Item corrompido, remover
          expiredKeys.push(key);
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
        
        const newStats = {
          ...statsRef.current,
          size: Math.max(0, statsRef.current.size - freedSpace),
          itemCount: Math.max(0, statsRef.current.itemCount - expiredKeys.length),
          lastCleanup: Date.now()
        };
        await saveStats(newStats);
        
        console.log(`🧹 Cache limpo: ${expiredKeys.length} itens removidos, ${freedSpace} bytes liberados`);
      }
    } catch (error) {
      console.error('Erro na limpeza do cache:', error);
    }
  }, [fullConfig.version]);

  const clear = useCallback(async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
      const newStats = {
        hits: 0,
        misses: 0,
        size: 0,
        itemCount: 0,
        lastCleanup: Date.now()
      };
      await saveStats(newStats);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }, []);

  const recalculateStats = async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
      
      let totalSize = 0;
      let validItems = 0;
      
      for (const key of cacheKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const cacheItem: CacheItem<any> = JSON.parse(data);
            totalSize += cacheItem.size;
            validItems++;
          }
        } catch (error) {
          // Item corrompido, será removido na próxima limpeza
        }
      }
      
      const newStats = {
        ...statsRef.current,
        size: totalSize,
        itemCount: validItems
      };
      await saveStats(newStats);
    } catch (error) {
      console.error('Erro ao recalcular estatísticas:', error);
    }
  };

  const getHitRate = (): number => {
    const total = stats.hits + stats.misses;
    return total > 0 ? (stats.hits / total) * 100 : 0;
  };

  return {
    // Estado
    isReady,
    stats,
    
    // Operações principais
    get,
    set,
    remove,
    
    // Gerenciamento
    cleanup,
    clear,
    recalculateStats,
    
    // Utilitários
    getHitRate: getHitRate(),
    sizePercentage: (stats.size / fullConfig.maxSize) * 100
  };
};