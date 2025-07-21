// hooks/useSidebarData.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useAdaptiveTheme } from './useAdaptiveTheme';

interface UserProfile {
  name: string;
  profileImage?: string;
}

interface CycleData {
  lastPeriodDate: string;
  averageCycleLength: number;
  averagePeriodLength: number;
}

export const useSidebarData = () => {
  const { theme } = useAdaptiveTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  
  const loadUserData = useCallback(async () => {
    try {
      const [profileData, cycleInfo] = await Promise.all([
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('cycleData')
      ]);
      
      if (profileData) setUserProfile(JSON.parse(profileData));
      if (cycleInfo) setCycleData(JSON.parse(cycleInfo));
    } catch (error) {
      console.error('Erro ao carregar dados para a sidebar:', error);
    }
  }, []);
  
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const getPhaseDescription = () => {
    if (!theme) return 'Carregando...';
    const descriptions: Record<string, string> = {
      menstrual: 'Período de renovação',
      postMenstrual: 'Energia renovada',
      fertile: 'Criatividade em alta',
      ovulation: 'Pico de energia',
      preMenstrual: 'Momento de introspecção',
    };
    return descriptions[theme.phase] || 'Fase atual';
  };

  const getNextPeriodDays = () => {
    if (!cycleData) return 0;
    const lastPeriod = moment(cycleData.lastPeriodDate);
    const nextPeriod = lastPeriod.clone().add(cycleData.averageCycleLength, 'days');
    return Math.max(0, nextPeriod.diff(moment(), 'days'));
  };

  const getProgressPercentage = () => {
    if (!cycleData) return 0;
    const lastPeriod = moment(cycleData.lastPeriodDate);
    const today = moment();
    const dayOfCycle = today.diff(lastPeriod, 'days') + 1;
    const currentDay = ((dayOfCycle - 1) % cycleData.averageCycleLength) + 1;
    return Math.min(100, (currentDay / cycleData.averageCycleLength) * 100);
  };

  return { userProfile, getPhaseDescription, getNextPeriodDays, getProgressPercentage };
};