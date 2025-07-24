// components/ImprovedCalendarModal.tsx - MODAL APRIMORADO CONFORME PLANO
import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAdaptiveTheme } from '../hooks/useAdaptiveTheme';
import { DayInfo } from '../hooks/cycleCalculations';
import { PHASE_INFO } from '../constants/appConstants';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const logoFour = require('../assets/images/logoFour.png');

interface ImprovedCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  dayInfo: DayInfo | null;
}

const BEAUTIFUL_COLORS = {
  menstrual: {
    gradient: ['#FF9A9E', '#FECFEF'],
    primary: '#FF6B9D',
    text: '#FFFFFF'
  },
  postMenstrual: {
    gradient: ['#A8E6CF', '#DCEDC1'],
    primary: '#27AE60',
    text: '#FFFFFF'
  },
  fertile: {
    gradient: ['#FFB347', '#FFD93D'],
    primary: '#FF8C42',
    text: '#FFFFFF'
  },
  ovulation: {
    gradient: ['#FFE066', '#FFF176'],
    primary: '#FFC107',
    text: '#2C2C2C'
  },
  preMenstrual: {
    gradient: ['#B39DDB', '#E1BEE7'],
    primary: '#9C27B0',
    text: '#FFFFFF'
  }
};

const ImprovedCalendarModal: React.FC<ImprovedCalendarModalProps> = ({
  visible,
  onClose,
  dayInfo,
}) => {
  const { theme } = useAdaptiveTheme();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [maxModalHeight, setMaxModalHeight] = useState(height * 0.85);

  // Calcula altura dinâmica baseada na tela
  useEffect(() => {
    const screenHeight = Dimensions.get('window').height;
    const safeMaxHeight = screenHeight * 0.85; // 85% da tela
    setMaxModalHeight(safeMaxHeight);
  }, []);

  // Animações de entrada e saída
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim, scaleAnim]);

  const handleContentSizeChange = useCallback((contentWidth: number, height: number) => {
    setContentHeight(height);
  }, []);

  const calculateDynamicHeight = useCallback(() => {
    const headerHeight = 120; // Header fixo
    const buttonHeight = 60; // Botão de fechar
    const padding = 40; // Padding total
    const baseContentHeight = 200; // Conteúdo mínimo
    
    const totalNeededHeight = headerHeight + buttonHeight + padding + Math.max(baseContentHeight, contentHeight);
    
    // Limita entre 40% e 85% da tela
    const minHeight = height * 0.4;
    const calculatedHeight = Math.min(maxModalHeight, Math.max(minHeight, totalNeededHeight));
    
    return calculatedHeight;
  }, [contentHeight, maxModalHeight]);

  if (!dayInfo || !theme) return null;

  const phaseInfo = PHASE_INFO[dayInfo.phase];
  const phaseColors = BEAUTIFUL_COLORS[dayInfo.phase];
  const dynamicHeight = calculateDynamicHeight();

  // Dados adicionais para o modal aprimorado
  const additionalInfo = [
    {
      icon: '📅',
      label: 'Dia do Ciclo',
      value: `${dayInfo.dayOfCycle}º dia`,
      color: phaseColors.primary,
    },
    {
      icon: '🎯',
      label: 'Chance de Gravidez',
      value: `${dayInfo.pregnancyChance}%`,
      color: dayInfo.pregnancyChance > 25 ? '#E74C3C' : dayInfo.pregnancyChance > 10 ? '#F39C12' : '#27AE60',
    },
    {
      icon: '🌸',
      label: 'Intensidade da Fase',
      value: `${Math.round(dayInfo.phaseIntensity * 100)}%`,
      color: phaseColors.primary,
    },
    {
      icon: dayInfo.isToday ? '⭐' : '📆',
      label: dayInfo.isToday ? 'Hoje' : 'Data',
      value: dayInfo.date.format('dddd'),
      color: dayInfo.isToday ? '#FFD700' : theme.colors.text.secondary,
    },
  ];

  const fertilityLevel = dayInfo.pregnancyChance > 25 ? 'Alta' : 
                       dayInfo.pregnancyChance > 10 ? 'Média' : 'Baixa';

  const fertilityColor = dayInfo.pregnancyChance > 25 ? '#E74C3C' : 
                        dayInfo.pregnancyChance > 10 ? '#F39C12' : '#27AE60';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.improvedModal,
            {
              backgroundColor: theme.colors.surface,
              height: dynamicHeight,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Header com Gradient */}
          <LinearGradient
            colors={phaseColors.gradient as [string, string, ...string[]]}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Botão de fechar aprimorado */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BlurView
                intensity={30}
                style={styles.closeButtonBlur}
                tint="light"
              >
                <Text style={styles.closeButtonText}>×</Text>
              </BlurView>
            </TouchableOpacity>

            {/* Conteúdo do header */}
            <View style={styles.headerContent}>
              <Image source={logoFour} style={styles.modalLogo} />
              <Text style={styles.modalDate}>
                {dayInfo.date.format('DD')}
              </Text>
              <Text style={styles.modalDayName}>
                {dayInfo.date.format('dddd, DD [de] MMMM')}
              </Text>
              
              {/* Badge da fase */}
              <View style={[styles.phaseBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.phaseBadgeText}>
                  {phaseInfo.name}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* ScrollView com conteúdo dinâmico */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            onContentSizeChange={handleContentSizeChange}
            scrollEventThrottle={16}
          >
            {/* Seção de informações principais */}
            <View style={styles.infoGrid}>
              {additionalInfo.map((info, index) => (
                <View key={index} style={[styles.infoCard, { backgroundColor: theme.colors.background }]}>
                  <Text style={styles.infoIcon}>{info.icon}</Text>
                  <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                    {info.label}
                  </Text>
                  <Text style={[styles.infoValue, { color: info.color }]}>
                    {info.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Seção de fertilidade com gráfico visual */}
            <View style={[styles.fertilitySection, { backgroundColor: `${fertilityColor}15` }]}>
              <View style={styles.fertilitySectionHeader}>
                <Text style={[styles.fertilitySectionTitle, { color: theme.colors.text.primary }]}>
                  🎯 Nível de Fertilidade
                </Text>
                <View style={[styles.fertilityBadge, { backgroundColor: fertilityColor }]}>
                  <Text style={styles.fertilityBadgeText}>{fertilityLevel}</Text>
                </View>
              </View>
              
              {/* Barra de progresso da fertilidade */}
              <View style={styles.fertilityProgressContainer}>
                <View style={[styles.fertilityProgressBg, { backgroundColor: `${fertilityColor}20` }]}>
                  <View
                    style={[
                      styles.fertilityProgress,
                      {
                        backgroundColor: fertilityColor,
                        width: `${dayInfo.pregnancyChance * 2.5}%`, // Max 100%
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.fertilityPercentage, { color: fertilityColor }]}>
                  {dayInfo.pregnancyChance}%
                </Text>
              </View>
            </View>

            {/* Seção da fase com descrição */}
            <View style={[styles.phaseSection, { borderLeftColor: phaseInfo.color }]}>
              <Text style={[styles.phaseName, { color: theme.colors.text.primary }]}>
                {phaseInfo.name}
              </Text>
              <Text style={[styles.phaseDescription, { color: theme.colors.text.secondary }]}>
                {phaseInfo.description}
              </Text>
            </View>

            {/* Dicas aprimoradas */}
            <View style={[styles.tipsSection, { backgroundColor: `${phaseInfo.color}1A` }]}>
              <Text style={[styles.tipsTitle, { color: phaseInfo.color }]}>
                💡 Dicas para {phaseInfo.name}
              </Text>
              {phaseInfo.tips.slice(0, 3).map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: phaseInfo.color }]} />
                  <Text style={[styles.tipText, { color: theme.colors.text.primary }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>

            {/* Seção de ações rápidas */}
            <View style={styles.quickActionsSection}>
              <Text style={[styles.quickActionsTitle, { color: theme.colors.text.primary }]}>
                ⚡ Ações Rápidas
              </Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}>
                  <Text style={styles.quickActionIcon}>📝</Text>
                  <Text style={[styles.quickActionLabel, { color: theme.colors.text.primary }]}>
                    Registrar Sintoma
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.colors.surface }]}>
                  <Text style={styles.quickActionIcon}>💭</Text>
                  <Text style={[styles.quickActionLabel, { color: theme.colors.text.primary }]}>
                    Adicionar Nota
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Espaçamento inferior */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  improvedModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 24,
    position: 'relative',
    minHeight: 120,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  modalLogo: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  modalDate: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalDayName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  phaseBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  phaseBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  infoCard: {
    width: (width - 72) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fertilitySection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  fertilitySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fertilitySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  fertilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fertilityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fertilityProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fertilityProgressBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  fertilityProgress: {
    height: '100%',
    borderRadius: 4,
  },
  fertilityPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
  },
  phaseSection: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginBottom: 24,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  phaseDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  tipsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    flex: 1,
  },
  quickActionsSection: {
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ImprovedCalendarModal;