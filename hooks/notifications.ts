import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { CycleData, calculateCycleInfo } from './cycleCalculations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  periodReminder: boolean;
  periodReminderDays: number; 
  ovulationReminder: boolean;
  ovulationReminderDays: number; 
  dailyReminder: boolean;
  dailyReminderTime: string; 
  fertileWindowReminder: boolean;
  lateReminder: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  periodReminder: true,
  periodReminderDays: 2,
  ovulationReminder: true,
  ovulationReminderDays: 1,
  dailyReminder: false,
  dailyReminderTime: '20:00',
  fertileWindowReminder: true,
  lateReminder: true,
};

const NOTIFICATION_CONFIG = {
  periodReminder: {
    title: '🌸 Menstruação se aproxima',
    body: (days: number) => `Sua menstruação está prevista para ${days === 1 ? 'amanhã' : `em ${days} dias`}. Que tal preparar seus produtos de higiene?`,
  },
  ovulationReminder: {
    title: '⭐ Ovulação se aproxima',
    body: (days: number) => `Sua ovulação está prevista para ${days === 1 ? 'amanhã' : `em ${days} dias`}. Período de maior fertilidade!`,
  },
  fertileWindowReminder: {
    title: '🔥 Janela fértil iniciou',
    body: () => 'Sua janela fértil começou hoje! Este é o período de maior chance de gravidez.',
  },
  lateReminder: {
    title: '⏰ Ciclo em atraso',
    body: () => 'Sua menstruação está atrasada. Considere fazer um teste ou consultar um médico se necessário.',
  },
  dailyReminder: {
    title: '💜 EntrePhases',
    body: () => 'Como você está se sentindo hoje? Que tal registrar seus sintomas?',
  },
};

// Removido: versão antiga da função scheduleNotification

const scheduleNotification = async (
  content: Notifications.NotificationContentInput,
  trigger: Notifications.NotificationTriggerInput
) => {
  try {
    await Notifications.scheduleNotificationAsync({ 
      content, 
      trigger 
    });
  } catch (error) {
    console.error('Falha ao agendar a notificação:', error);
  }
};

// Função corrigida para agendar notificações de ciclo
const scheduleCycleNotification = async (
  type: 'periodReminder' | 'ovulationReminder' | 'fertileWindowReminder' | 'lateReminder',
  date: moment.Moment,
  daysBefore: number = 0
) => {
  const reminderDate = date.clone().subtract(daysBefore, 'days').set({ 
    hour: 9, 
    minute: 0, 
    second: 0, 
    millisecond: 0 
  });
  if (reminderDate.isBefore(moment())) {
    return;
  }
  const config = NOTIFICATION_CONFIG[type];
  let bodyText: string;
  if (type === 'periodReminder' || type === 'ovulationReminder') {
    bodyText = config.body(daysBefore);
  } else {
    bodyText = config.body(0);
  }
  await scheduleNotification(
    {
      title: config.title,
      body: bodyText,
      data: { type },
    },
    {
      channelId: 'default',
      seconds: Math.max(1, Math.floor((reminderDate.toDate().getTime() - Date.now()) / 1000)),
      repeats: false,
    }
  );
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissões de notificação:', error);
    return false;
  }
};

export const loadNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Erro ao carregar configurações de notificação:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    await scheduleAllNotifications(); 
  } catch (error) {
    console.error('Erro ao salvar configurações de notificação:', error);
  }
};

export const scheduleAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const settings = await loadNotificationSettings();
    const cycleDataString = await AsyncStorage.getItem('cycleData');
    
    if (!cycleDataString) {
      console.log('Dados do ciclo não encontrados, não agendando notificações');
      return;
    }

    let cycleData: CycleData;
    try {
      cycleData = JSON.parse(cycleDataString);
    } catch (error) {
      console.error('Erro ao decodificar dados do ciclo:', error);
      return;
    }

    const currentCycleInfo = calculateCycleInfo(cycleData);
    if (settings.lateReminder) {
      await scheduleCycleNotification(
        'lateReminder', 
        currentCycleInfo.nextPeriodDate.clone().add(3, 'days')
      );
    }

    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const futureDate = moment().add(monthOffset, 'month');
      const futureCycleInfo = calculateCycleInfo(cycleData, futureDate.toDate());

      if (settings.periodReminder) {
        await scheduleCycleNotification(
          'periodReminder', 
          futureCycleInfo.nextPeriodDate, 
          settings.periodReminderDays
        );
      }

      if (settings.ovulationReminder) {
        await scheduleCycleNotification(
          'ovulationReminder', 
          futureCycleInfo.ovulationDate, 
          settings.ovulationReminderDays
        );
      }

      if (settings.fertileWindowReminder) {
        await scheduleCycleNotification(
          'fertileWindowReminder', 
          futureCycleInfo.ovulationDate.clone().subtract(5, 'days')
        );
      }
    }

    if (settings.dailyReminder) {
      const [hour, minute] = settings.dailyReminderTime.split(':').map(Number);
      if (
        typeof hour === 'number' && !isNaN(hour) &&
        typeof minute === 'number' && !isNaN(minute)
      ) {
        await scheduleNotification(
          {
            title: NOTIFICATION_CONFIG.dailyReminder.title,
            body: NOTIFICATION_CONFIG.dailyReminder.body(),
            data: { type: 'dailyReminder' },
          },
          {
            channelId: 'default',
            repeats: true,
            hour,
            minute,
          }
        );
      } else {
        console.warn('Horário do lembrete diário inválido:', settings.dailyReminderTime);
      }
    }

    console.log('Todas as notificações foram reagendadas com sucesso');
  } catch (error) {
    console.error('Erro ao agendar notificações:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações foram canceladas');
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
};

export const listScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    return [];
  }
};

export const setupNotificationListeners = () => {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificação recebida:', notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Resposta da notificação:', response);
    
    const notificationType = response.notification.request.content.data?.type;
    
    switch (notificationType) {
      case 'periodReminder':
        break;
      case 'ovulationReminder':
        break;
      case 'dailyReminder':
        break;
      default:
        break;
    }
  });

  return {
    remove: () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    },
  };
};

export const sendTestNotification = async (): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Notificação de Teste',
        body: 'Esta é uma notificação de teste do EntrePhases!',
        data: { type: 'test' },
      },
      trigger: null, 
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
  }
};