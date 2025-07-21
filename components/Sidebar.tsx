// components/Sidebar.tsx
import React, { useCallback, memo, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.80;

interface SidebarDrawerProps {
  animatedStyle: any;
  onClose: (callback?: () => void) => void;
  currentScreen: string;
}

interface UserProfile {
  name: string;
  profileImage?: string;
}

const menuItems = [
  { key: 'home', icon: '🏠', label: 'Início', screen: 'home' },
  { key: 'calendar', icon: '📅', label: 'Calendário', screen: 'calendar' },
  { key: 'records', icon: '📝', label: 'Registos', screen: 'records' },
  { key: 'analytics', icon: '📊', label: 'Estatísticas', screen: 'analytics' },
  { key: 'settings', icon: '⚙️', label: 'Configurações', screen: 'settings' },
];

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ animatedStyle, onClose, currentScreen }) => {
  const { theme, toggleMode, isLightMode } = useAdaptiveTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const profileData = await AsyncStorage.getItem('userProfile');
        if (profileData) setUserProfile(JSON.parse(profileData));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadUserData();
  }, []);

  const handleNavigation = useCallback((screen: string) => {
    if (currentScreen === screen) {
      onClose();
      return;
    }
    onClose(() => {
      router.push(`/${screen}` as any);
    });
  }, [currentScreen, onClose]);

  if (!theme) return null;

  return (
    <Animated.View style={[styles.drawer, animatedStyle, { backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={styles.drawerContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
                <View style={styles.profileContainer}>
                  <View style={styles.profileImageContainer}>
                    {userProfile?.profileImage ? (
                      <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
                    ) : (
                      <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.profileImageText}>{userProfile?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                      </View>
                    )}
                    <View style={[styles.statusIndicator, { backgroundColor: theme.colors.primary }]} />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>Olá,</Text>
                    <Text style={[styles.userName, { color: theme.colors.text.primary }]} numberOfLines={1}>{userProfile?.name || 'Utilizadora'}!</Text>
                  </View>
                </View>
            </View>

            <View style={styles.menuSection}>
              {menuItems.map((item) => (
                <MenuItem 
                  key={item.key} 
                  item={item} 
                  currentScreen={currentScreen} 
                  onPress={handleNavigation}
                />
              ))}
              <TouchableOpacity
                style={[styles.menuItem, styles.themeToggleItem]}
                onPress={toggleMode}
                activeOpacity={0.6}
              >
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuIcon}>{isLightMode ? '🌙' : '☀️'}</Text>
                  <Text style={[styles.menuLabel, { color: theme.colors.text.secondary }]}>Modo {isLightMode ? 'Escuro' : 'Claro'}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>EntrePhases v1.0.0</Text>
            </View>
          </ScrollView>
        </LinearGradient>
    </Animated.View>
  );
};

interface MenuItemProps {
  item: {
    key: string;
    icon: string;
    label: string;
    screen: string;
  };
  currentScreen: string;
  onPress: (screen: string) => void;
}

const MenuItem = memo(({ item, currentScreen, onPress }: MenuItemProps) => {
  const { theme } = useAdaptiveTheme();
  const isActive = currentScreen === item.screen;

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: isActive && theme ? `${theme.colors.primary}15` : 'transparent' }
      ]}
      onPress={() => onPress(item.screen)}
      activeOpacity={0.6}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <Text
          style={[
            styles.menuLabel,
            {
              color: isActive ? theme?.colors.primary : theme?.colors.text.secondary,
              fontWeight: isActive ? '600' : '500',
            },
          ]}
        >
          {item.label}
        </Text>
      </View>
      {isActive && theme && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]} />}
    </TouchableOpacity>
  );
});


const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: DRAWER_WIDTH,
        height: '100%',
        zIndex: 100,
        elevation: 20,
      },
      drawerContainer: { flex: 1 },
      content: { flex: 1, paddingTop: 80 },
      profileSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      },
      profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      profileImageContainer: { position: 'relative', marginRight: 15 },
      profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      profileImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      profileImageText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
      statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: 'white',
      },
      profileInfo: { flex: 1 },
      greeting: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
      userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
      phaseDescription: { fontSize: 13, fontWeight: '500' },
      menuSection: { flex: 1, paddingHorizontal: 10, paddingTop: 20 },
      menuItem: { borderRadius: 12, marginBottom: 4, position: 'relative', },
      menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 15,
      },
      menuIcon: { fontSize: 22, marginRight: 16, width: 28, textAlign: 'center' },
      menuLabel: { fontSize: 16, flex: 1, lineHeight: 20 },
      activeIndicator: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
      },
      themeToggleItem: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.1)',
      },
      footer: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        alignItems: 'center',
      },
      footerText: { fontSize: 12, fontWeight: '500' },
});