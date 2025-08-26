import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    loadNotificationSettings,
    NotificationSettings,
    saveNotificationSettings,
    sendTestNotification
} from '../hooks/notifications';
import { useThemeSystem } from '../hooks/useThemeSystem';

interface UserProfile {
 name: string;
 profileImage?: string;
 setupDate: string;
}

interface CycleData {
 lastPeriodDate: string;
 averageCycleLength: number;
 averagePeriodLength: number;
 setupDate: string;
}

export default function SettingsScreen() {
 const { theme, toggleMode, isLightMode } = useThemeSystem();
 const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
 const [cycleData, setCycleData] = useState<CycleData | null>(null);
 const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
 const [showEditProfile, setShowEditProfile] = useState(false);
 const [showEditCycle, setShowEditCycle] = useState(false);
 const [editName, setEditName] = useState('');
 const [editCycleLength, setEditCycleLength] = useState(28);
 const [editPeriodLength, setEditPeriodLength] = useState(5);
 const [widgetEnabled, setWidgetEnabled] = useState(false);

 useEffect(() => {
  loadUserData();
  loadNotifications();
  loadWidgetSettings();
 }, []);

 const loadUserData = async () => {
  try {
   const profileData = await AsyncStorage.getItem('userProfile');
   const cycleInfo = await AsyncStorage.getItem('cycleData');

   if (profileData) {
    const profile: UserProfile = JSON.parse(profileData);
    setUserProfile(profile);
    setEditName(profile.name);
   }

   if (cycleInfo) {
    const cycle: CycleData = JSON.parse(cycleInfo);
    setCycleData(cycle);
    setEditCycleLength(cycle.averageCycleLength);
    setEditPeriodLength(cycle.averagePeriodLength);
   }
  } catch (error) {
   console.error('Erro ao carregar dados:', error);
  }
 };

 const loadNotifications = async () => {
  try {
   const settings = await loadNotificationSettings();
   setNotificationSettings(settings);
  } catch (error) {
   console.error('Erro ao carregar configurações de notificação:', error);
  }
 };

 const loadWidgetSettings = async () => {
  try {
   const widgetData = await AsyncStorage.getItem('widgetSettings');
   if (widgetData) {
    const settings = JSON.parse(widgetData);
    setWidgetEnabled(settings.enabled || false);
   }
  } catch (error) {
   console.error('Erro ao carregar configurações do widget:', error);
  }
 };

 const handleEditProfile = async () => {
  if (!userProfile) {
   Alert.alert('Erro', 'Perfil de usuário não encontrado.');
   return;
  }

  if (!editName.trim()) {
   Alert.alert('Erro', 'Nome não pode estar vazio');
   return;
  }

  try {
   const updatedProfile = {
    ...userProfile,
    name: editName.trim(),
   };

   await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
   setUserProfile(updatedProfile);
   setShowEditProfile(false);
   Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  } catch (error) {
   console.error('Erro ao atualizar perfil:', error);
   Alert.alert('Erro', 'Não foi possível atualizar o perfil');
  }
 };

 const handleEditCycle = async () => {
  if (!cycleData) {
   Alert.alert('Erro', 'Dados do ciclo não encontrados.');
   return;
  }

  try {
   const updatedCycle = {
    ...cycleData,
    averageCycleLength: editCycleLength,
    averagePeriodLength: editPeriodLength,
   };

   await AsyncStorage.setItem('cycleData', JSON.stringify(updatedCycle));
   setCycleData(updatedCycle);
   setShowEditCycle(false);
   Alert.alert('Sucesso', 'Dados do ciclo atualizados com sucesso!');
  } catch (error) {
   console.error('Erro ao atualizar ciclo:', error);
   Alert.alert('Erro', 'Não foi possível atualizar os dados do ciclo');
  }
 };

 const handleNotificationSettingChange = async (key: keyof NotificationSettings, value: any) => {
  if (!notificationSettings) return;

  const updatedSettings = {
   ...notificationSettings,
   [key]: value,
  };

  setNotificationSettings(updatedSettings);
  await saveNotificationSettings(updatedSettings);
 };

 const handleTestNotification = async () => {
  try {
   await sendTestNotification();
   Alert.alert('Sucesso', 'Notificação de teste enviada!');
  } catch (error) {
   Alert.alert('Erro', 'Não foi possível enviar a notificação de teste');
  }
 };

 const handleChangeProfileImage = async () => {
  Alert.alert(
   'Trocar foto',
   'Como você gostaria de atualizar sua foto?',
   [
    {
     text: 'Câmera',
     onPress: takePicture,
    },
    {
     text: 'Galeria',
     onPress: pickImage,
    },
    {
     text: 'Remover foto',
     onPress: removeImage,
     style: 'destructive',
    },
    {
     text: 'Cancelar',
     style: 'cancel',
    },
   ]
  );
 };

 const takePicture = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
   Alert.alert('Permissão de câmera necessária');
   return;
  }

  const result = await ImagePicker.launchCameraAsync({
   mediaTypes: ImagePicker.MediaTypeOptions.Images,
   allowsEditing: true,
   aspect: [1, 1],
   quality: 0.8,
  });

  if (!result.canceled && result.assets) {
   updateProfileImage(result.assets[0].uri);
  }
 };

 const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
   Alert.alert('Permissão da galeria necessária');
   return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
   mediaTypes: ImagePicker.MediaTypeOptions.Images,
   allowsEditing: true,
   aspect: [1, 1],
   quality: 0.8,
  });

  if (!result.canceled && result.assets) {
   updateProfileImage(result.assets[0].uri);
  }
 };

 const removeImage = () => {
  updateProfileImage(undefined);
 };

 const handleWidgetSettingChange = async (enabled: boolean) => {
  try {
   const settings = { enabled };
   await AsyncStorage.setItem('widgetSettings', JSON.stringify(settings));
   setWidgetEnabled(enabled);
   
   if (enabled) {
    Alert.alert(
     '📱 Widget Ativado',
     `Agora você pode adicionar o widget do Entre Fases à tela inicial do seu celular!

Para adicionar:
Android: Mantenha pressionado na tela inicial > Widgets > Entre Fases
iOS: Mantenha pressionado na tela inicial > + > Entre Fases`,
     [{ text: 'Entendi!' }]
    );
   }
  } catch (error) {
   console.error('Erro ao salvar configurações do widget:', error);
   Alert.alert('Erro', 'Não foi possível salvar as configurações do widget');
  }
};

const updateProfileImage = async (imageUri?: string) => {
  if (!userProfile) {
   Alert.alert('Erro', 'Não foi possível atualizar a foto pois o perfil não foi carregado.');
   return;
  }

  try {
   const updatedProfile = {
    ...userProfile,
    profileImage: imageUri,
   };

   await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
   setUserProfile(updatedProfile);
   Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
  } catch (error) {
   console.error('Erro ao atualizar foto:', error);
   Alert.alert('Erro', 'Não foi possível atualizar a foto');
  }
 };

 const handleClearData = () => {
  Alert.alert(
   'Limpar Dados',
   'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.',
   [
    {
     text: 'Cancelar',
     style: 'cancel',
    },
    {
     text: 'Limpar',
     style: 'destructive',
     onPress: async () => {
      try {
       await AsyncStorage.multiRemove([
        'userProfile',
        'cycleData',
        'dailyRecords',
        'setupCompleted',
        'isFirstTime',
        'notificationSettings',
       ]);
       Alert.alert('Dados limpos', 'Todos os dados foram removidos.', [
        {
         text: 'OK',
         onPress: () => router.replace('/welcome'),
        },
       ]);
      } catch (error) {
       console.error('Erro ao limpar dados:', error);
       Alert.alert('Erro', 'Não foi possível limpar os dados');
      }
     },
    },
   ]
  );
 };

 const handleExportData = async () => {
  try {
   // Usando sistema de backup simplificado
   const { createBackup, shareBackup } = require('../hooks/useSimpleBackup').useSimpleBackup();
   
   Alert.alert(
    'Exportar Dados',
    'Como você gostaria de exportar seus dados?',
    [
     {
      text: 'Compartilhar Backup',
      onPress: async () => {
       try {
        await shareBackup();
        Alert.alert('Sucesso', 'Backup compartilhado com sucesso!');
       } catch (error) {
        Alert.alert('Erro', 'Não foi possível compartilhar o backup');
       }
      }
     },
     {
      text: 'Criar Backup Local',
      onPress: async () => {
       try {
        const backupId = await createBackup();
        if (backupId) {
         Alert.alert('Sucesso', `Backup criado: ${backupId}`);
        }
       } catch (error) {
        Alert.alert('Erro', 'Não foi possível criar o backup');
       }
      }
     },
     { text: 'Cancelar', style: 'cancel' }
    ]
   );
  } catch (error) {
   console.error('Erro ao exportar dados:', error);
   Alert.alert('Erro', 'Não foi possível exportar os dados');
  }
 };


 if (!theme) {
  return (
   <View style={styles.loadingContainer}>
    <Text>Carregando...</Text>
   </View>
  );
 }

 return (
  <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
   <View style={styles.header}>
    <Text style={[styles.title, { color: theme.colors.primary }]}> 
     Configurações
    </Text>
    <View style={styles.headerSpacer} />
   </View>

   <ScrollView style={styles.content}>
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
     <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      👤 Perfil
     </Text>
     <View style={styles.profileContainer}>
      <TouchableOpacity onPress={handleChangeProfileImage}>
       {userProfile?.profileImage ? (
        <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
       ) : (
        <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
         <Text style={styles.profileImageText}>
          {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
         </Text>
        </View>
       )}
      </TouchableOpacity>
      <View style={styles.profileInfo}>
       <Text style={[styles.profileName, { color: theme.colors.primary }]}>
        {userProfile?.name || 'Usuária'}
       </Text>
       <Text style={[styles.profileDate, { color: theme.colors.secondary }]}>
        Membro desde {userProfile?.setupDate ?
         new Date(userProfile.setupDate).toLocaleDateString() : 'hoje'}
       </Text>
      </View>
      <TouchableOpacity
       style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
       onPress={() => setShowEditProfile(true)}
      >
       <Text style={styles.editButtonText}>✏️</Text>
      </TouchableOpacity>
     </View>
    </View>
    
    {/* Seção de Temas Personalizados */}
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
     <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      🎨 Personalização
     </Text>
     <View style={styles.themeButtons}>
      <TouchableOpacity
       style={[styles.themeButton, { backgroundColor: theme.colors.accent }]}
       onPress={() => router.push('/theme-settings')}
      >
       <Text style={styles.themeButtonIcon}>🌹</Text>
       <Text style={[styles.themeButtonText, { color: theme.colors.text.primary }]}>
        Temas Personalizados
       </Text>
       <Text style={[styles.themeButtonSubtext, { color: theme.colors.text.secondary }]}>
        Escolha cores e estilos
       </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
       style={[styles.themeButton, { backgroundColor: theme.colors.accent }]}
       onPress={() => router.push('/auto-theme-settings')}
      >
       <Text style={styles.themeButtonIcon}>🌙</Text>
       <Text style={[styles.themeButtonText, { color: theme.colors.text.primary }]}>
        Tema Automático
       </Text>
       <Text style={[styles.themeButtonSubtext, { color: theme.colors.text.secondary }]}>
        Muda com seu ciclo
       </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
       style={[styles.themeButton, { backgroundColor: theme.colors.accent }]}
       onPress={() => router.push('/custom-theme-editor')}
      >
       <Text style={styles.themeButtonIcon}>🎨</Text>
       <Text style={[styles.themeButtonText, { color: theme.colors.text.primary }]}>
        Editor de Cores
       </Text>
       <Text style={[styles.themeButtonSubtext, { color: theme.colors.text.secondary }]}>
        Crie seu próprio tema
       </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
       style={[styles.themeButton, { backgroundColor: theme.colors.accent }]}
       onPress={() => router.push('/theme-gallery')}
      >
       <Text style={styles.themeButtonIcon}>🎭</Text>
       <Text style={[styles.themeButtonText, { color: theme.colors.text.primary }]}>
        Galeria de Temas
       </Text>
       <Text style={[styles.themeButtonSubtext, { color: theme.colors.text.secondary }]}>
        Seus temas salvos
       </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
       style={[styles.themeButton, { backgroundColor: theme.colors.accent }]}
       onPress={() => router.push('/seasonal-themes')}
      >
       <Text style={styles.themeButtonIcon}>🌸</Text>
       <Text style={[styles.themeButtonText, { color: theme.colors.text.primary }]}>
        Temas Sazonais
       </Text>
       <Text style={[styles.themeButtonSubtext, { color: theme.colors.text.secondary }]}>
        Primavera, verão, outono, inverno
       </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
       style={[styles.themeButton, { backgroundColor: theme.colors.accent }]}
       onPress={() => router.push('/particle-playground')}
      >
       <Text style={styles.themeButtonIcon}>✨</Text>
       <Text style={[styles.themeButtonText, { color: theme.colors.text.primary }]}>
        Playground de Partículas
       </Text>
       <Text style={[styles.themeButtonSubtext, { color: theme.colors.text.secondary }]}>
        Experimente efeitos avançados
       </Text>
      </TouchableOpacity>
     </View>
    </View>

    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
     <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      📅 Dados do Ciclo
     </Text>
     <View style={styles.cycleInfo}>
      <View style={styles.cycleInfoRow}>
       <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>
        Duração do ciclo:
       </Text>
       <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>
        {cycleData?.averageCycleLength || 28} dias
       </Text>
      </View>
      <View style={styles.cycleInfoRow}>
       <Text style={[styles.cycleInfoLabel, { color: theme.colors.secondary }]}>
        Duração da menstruação:
       </Text>
       <Text style={[styles.cycleInfoValue, { color: theme.colors.primary }]}>
        {cycleData?.averagePeriodLength || 5} dias
       </Text>
      </View>
      <TouchableOpacity
       style={[styles.editCycleButton, { backgroundColor: theme.colors.primary }]}
       onPress={() => setShowEditCycle(true)}
      >
       <Text style={styles.editCycleButtonText}>Editar Dados do Ciclo</Text>
      </TouchableOpacity>
     </View>
    </View>

    {notificationSettings && (
     <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
       🔔 Notificações
      </Text>
      <View style={styles.settingRow}>
       <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: theme.colors.primary }]}>
         Lembrete de Menstruação
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.secondary }]}>
         Aviso {notificationSettings.periodReminderDays} dias antes
        </Text>
       </View>
       <Switch
        value={notificationSettings.periodReminder}
        onValueChange={(value) => handleNotificationSettingChange('periodReminder', value)}
        trackColor={{ false: '#767577', true: theme.colors.primary }}
        thumbColor={notificationSettings.periodReminder ? theme.colors.accent : '#f4f3f4'}
       />
      </View>

      <View style={styles.settingRow}>
       <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: theme.colors.primary }]}>
         Lembrete de Ovulação
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.secondary }]}>
         Aviso {notificationSettings.ovulationReminderDays} dia antes
        </Text>
       </View>
       <Switch
        value={notificationSettings.ovulationReminder}
        onValueChange={(value) => handleNotificationSettingChange('ovulationReminder', value)}
        trackColor={{ false: '#767577', true: theme.colors.primary }}
        thumbColor={notificationSettings.ovulationReminder ? theme.colors.accent : '#f4f3f4'}
       />
      </View>

      <View style={styles.settingRow}>
       <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: theme.colors.primary }]}>
         Janela Fértil
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.secondary }]}>
         Aviso quando iniciar período fértil
        </Text>
       </View>
       <Switch
        value={notificationSettings.fertileWindowReminder}
        onValueChange={(value) => handleNotificationSettingChange('fertileWindowReminder', value)}
        trackColor={{ false: '#767577', true: theme.colors.primary }}
        thumbColor={notificationSettings.fertileWindowReminder ? theme.colors.accent : '#f4f3f4'}
       />
      </View>

      <TouchableOpacity
       style={[styles.notificationTestButton, { backgroundColor: theme.colors.primary }]}
       onPress={handleTestNotification}
      >
       <Text style={styles.notificationTestButtonText}>🧪 Testar Notificação</Text>
      </TouchableOpacity>
     </View>
    )}

    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
     <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      🎨 Aparência
     </Text>
     <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
       <Text style={[styles.settingLabel, { color: theme.colors.primary }]}>
        Modo Escuro
       </Text>
       <Text style={[styles.settingDescription, { color: theme.colors.secondary }]}>
        Alterna entre tema claro e escuro
       </Text>
      </View>
      <Switch
       value={!isLightMode}
       onValueChange={toggleMode}
       trackColor={{ false: '#767577', true: theme.colors.primary }}
       thumbColor={!isLightMode ? theme.colors.accent : '#f4f3f4'}
      />
     </View>
     <View style={styles.themeInfo}>
      <Text style={[styles.themeInfoText, { color: theme.colors.secondary }]}>
       💡 As cores do app se adaptam automaticamente às suas fases do ciclo menstrual
      </Text>
     </View>
    </View>

    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
     <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      � Widget
     </Text>
     <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
       <Text style={[styles.settingLabel, { color: theme.colors.primary }]}>
        Widget na Tela Inicial
       </Text>
       <Text style={[styles.settingDescription, { color: theme.colors.secondary }]}>
        Mostra informações do seu ciclo na tela inicial
       </Text>
      </View>
      <Switch
       value={widgetEnabled}
       onValueChange={handleWidgetSettingChange}
       trackColor={{ false: '#767577', true: theme.colors.primary }}
       thumbColor={widgetEnabled ? theme.colors.accent : '#f4f3f4'}
      />
     </View>
     {widgetEnabled && (
      <View style={styles.widgetInfo}>
       <Text style={[styles.widgetInfoText, { color: theme.colors.secondary }]}>
        🎯 O widget mostra sua fase atual, dias do ciclo, próxima menstruação e chance de gravidez
       </Text>
       <Text style={[styles.widgetInfoText, { color: theme.colors.secondary }]}>
        📲 Toque no widget para abrir o app rapidamente
       </Text>
      </View>
     )}
    </View>

    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
     <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      �💾 Dados
     </Text>
     <TouchableOpacity
      style={[styles.dataButton, { backgroundColor: theme.colors.background }]}
      onPress={handleExportData}
     >
      <Text style={styles.dataButtonEmoji}>📤</Text>
      <Text style={[styles.dataButtonText, { color: theme.colors.primary }]}>
       Exportar Dados
      </Text>
     </TouchableOpacity>
     <TouchableOpacity
      style={[styles.dataButton, styles.dangerButton]}
      onPress={handleClearData}
     >
      <Text style={styles.dataButtonEmoji}>🗑️</Text>
      <Text style={styles.dangerButtonText}>
       Limpar Todos os Dados
      </Text>
     </TouchableOpacity>
    </View>

    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
     <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
      ℹ️ Sobre
     </Text>
     <Text style={[styles.aboutText, { color: theme.colors.secondary }]}>
      Entre Fases v1.0.1{'\n'}
      Seu companheiro inteligente para acompanhar o ciclo menstrual{'\n\n'}
      Feito com 💜 especialmente para você
     </Text>
    </View>
   </ScrollView>

   <Modal
    animationType="slide"
    transparent={true}
    visible={showEditProfile}
    onRequestClose={() => setShowEditProfile(false)}
   >
    <View style={styles.modalOverlay}>
     <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
       Editar Perfil
      </Text>
      <View style={styles.modalBody}>
       <Text style={[styles.inputLabel, { color: theme.colors.secondary }]}>
        Nome:
       </Text>
       <TextInput
        style={[styles.textInput, {
         backgroundColor: theme.colors.background,
         color: theme.colors.primary,
         borderColor: theme.colors.primary
        }]}
        value={editName}
        onChangeText={setEditName}
        placeholder="Digite seu nome"
        placeholderTextColor={theme.colors.secondary}
       />
      </View>
      <View style={styles.modalButtons}>
       <TouchableOpacity
        style={[styles.modalSaveButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleEditProfile}
       >
        <Text style={styles.modalSaveButtonText}>Salvar</Text>
       </TouchableOpacity>
       <TouchableOpacity
        style={[styles.modalCancelButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setShowEditProfile(false)}
       >
        <Text style={styles.modalCancelButtonText}>Cancelar</Text>
       </TouchableOpacity>
      </View>
     </View>
    </View>
   </Modal>

   <Modal
    animationType="slide"
    transparent={true}
    visible={showEditCycle}
    onRequestClose={() => setShowEditCycle(false)}
   >
    <View style={styles.modalOverlay}>
     <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
       Editar Dados do Ciclo
      </Text>
      <View style={styles.modalBody}>
       <Text style={[styles.inputLabel, { color: theme.colors.secondary }]}>
        Duração do ciclo (dias):
       </Text>
       <View style={styles.numberInputContainer}>
        <TouchableOpacity
         style={[styles.numberButton, { backgroundColor: theme.colors.primary }]}
         onPress={() => setEditCycleLength(Math.max(21, editCycleLength - 1))}
        >
         <Text style={styles.numberButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.numberValue, { color: theme.colors.primary }]}>
         {editCycleLength}
        </Text>
        <TouchableOpacity
         style={[styles.numberButton, { backgroundColor: theme.colors.primary }]}
         onPress={() => setEditCycleLength(Math.min(35, editCycleLength + 1))}
        >
         <Text style={styles.numberButtonText}>+</Text>
        </TouchableOpacity>
       </View>
       <Text style={[styles.inputLabel, { color: theme.colors.secondary }]}>
        Duração da menstruação (dias):
       </Text>
       <View style={styles.numberInputContainer}>
        <TouchableOpacity
         style={[styles.numberButton, { backgroundColor: theme.colors.primary }]}
         onPress={() => setEditPeriodLength(Math.max(3, editPeriodLength - 1))}
        >
         <Text style={styles.numberButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.numberValue, { color: theme.colors.primary }]}>
         {editPeriodLength}
        </Text>
        <TouchableOpacity
         style={[styles.numberButton, { backgroundColor: theme.colors.primary }]}
         onPress={() => setEditPeriodLength(Math.min(8, editPeriodLength + 1))}
        >
         <Text style={styles.numberButtonText}>+</Text>
        </TouchableOpacity>
       </View>
      </View>
      <View style={styles.modalButtons}>
       <TouchableOpacity
        style={[styles.modalSaveButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleEditCycle}
       >
        <Text style={styles.modalSaveButtonText}>Salvar</Text>
       </TouchableOpacity>
       <TouchableOpacity
        style={[styles.modalCancelButton, { backgroundColor: theme.colors.secondary }]}
        onPress={() => setShowEditCycle(false)}
       >
        <Text style={styles.modalCancelButtonText}>Cancelar</Text>
       </TouchableOpacity>
      </View>
     </View>
    </View>
   </Modal>
  </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
 },
 loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 },
 header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingVertical: 15,
 },
 backButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
 },
 backButtonText: {
  fontSize: 20,
  fontWeight: 'bold',
 },
 title: {
  fontSize: 20,
  fontWeight: 'bold',
 },
 headerSpacer: {
  width: 40,
 },
 content: {
  flex: 1,
  paddingHorizontal: 20,
 },
 section: {
  borderRadius: 15,
  padding: 20,
  marginBottom: 20,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
 },
 sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
 },
 profileContainer: {
  flexDirection: 'row',
  alignItems: 'center',
 },
 profileImage: {
  width: 60,
  height: 60,
  borderRadius: 30,
 },
 profileImagePlaceholder: {
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
 },
 profileImageText: {
  color: 'white',
  fontSize: 24,
  fontWeight: 'bold',
 },
 profileInfo: {
  flex: 1,
  marginLeft: 15,
 },
 profileName: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 4,
 },
 profileDate: {
  fontSize: 14,
 },
 editButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
 },
 editButtonText: {
  fontSize: 16,
 },
 cycleInfo: {
  gap: 15,
 },
 cycleInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
 },
 cycleInfoLabel: {
  fontSize: 16,
 },
 cycleInfoValue: {
  fontSize: 16,
  fontWeight: 'bold',
 },
 editCycleButton: {
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: 'center',
  marginTop: 10,
 },
 editCycleButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
 },
 settingRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
  paddingBottom: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#eee'
 },
 settingInfo: {
  flex: 1,
  marginRight: 10
 },
 settingLabel: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
 },
 settingDescription: {
  fontSize: 14,
 },
 notificationTestButton: {
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: 'center',
  marginTop: 15,
 },
 notificationTestButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
 },
 themeInfo: {
  marginTop: 10,
  padding: 15,
  backgroundColor: 'rgba(128,128,128,0.1)',
  borderRadius: 12,
 },
 themeInfoText: {
  fontSize: 14,
  lineHeight: 20,
  textAlign: 'center',
 },
 dataButton: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 15,
  borderRadius: 12,
  marginBottom: 10,
 },
 dataButtonEmoji: {
  fontSize: 20,
  marginRight: 15,
 },
 dataButtonText: {
  fontSize: 16,
  fontWeight: '600',
 },
 // Estilos para botões de tema
 themeButtons: {
  gap: 12,
 },
 themeButton: {
  borderRadius: 12,
  padding: 16,
  alignItems: 'center',
 },
 themeButtonIcon: {
  fontSize: 28,
  marginBottom: 8,
 },
 themeButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 4,
 },
 themeButtonSubtext: {
  fontSize: 12,
  textAlign: 'center',
 },
 dangerButton: {
  backgroundColor: '#dc3545',
 },
 dangerButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
 },
 aboutText: {
  fontSize: 14,
  lineHeight: 20,
  textAlign: 'center',
 },
 modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
 },
 modalContent: {
  width: '90%',
  borderRadius: 20,
  padding: 25,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
 },
 modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 20,
 },
 modalBody: {
  marginBottom: 20,
 },
 inputLabel: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 8,
 },
 textInput: {
  borderWidth: 1,
  borderRadius: 12,
  padding: 15,
  fontSize: 16,
 },
 numberInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
 },
 numberButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
 },
 numberButtonText: {
  color: 'white',
  fontSize: 20,
  fontWeight: 'bold',
 },
 numberValue: {
  fontSize: 20,
  fontWeight: 'bold',
  marginHorizontal: 30,
  textAlign: 'center',
  minWidth: 40,
 },
 modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
 },
 modalSaveButton: {
  flex: 1,
  borderRadius: 12,
  paddingVertical: 15,
  alignItems: 'center',
  marginRight: 10,
 },
 modalSaveButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
 },
 modalCancelButton: {
  flex: 1,
  borderRadius: 12,
  paddingVertical: 15,
  alignItems: 'center',
  marginLeft: 10,
 },
 modalCancelButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
 },
 widgetInfo: {
  marginTop: 10,
  padding: 12,
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 8,
 },
 widgetInfoText: {
  fontSize: 13,
  lineHeight: 18,
  marginBottom: 5,
 },
});