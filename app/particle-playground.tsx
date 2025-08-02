// app/particle-playground.tsx - PLAYGROUND DE PARTÍCULAS INTERATIVO
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useThemeSystem } from '../hooks/useThemeSystem';
import { AdvancedParticleSystem, ParticleType } from '../components/AdvancedParticleSystem';

const PARTICLE_TYPES: { type: ParticleType; name: string; icon: string; description: string }[] = [
  { type: 'falling', name: 'Queda Suave', icon: '🌸', description: 'Partículas caem suavemente' },
  { type: 'floating', name: 'Flutuante', icon: '🎈', description: 'Partículas flutuam no ar' },
  { type: 'spiral', name: 'Espiral', icon: '🌀', description: 'Movimento em espiral hipnotizante' },
  { type: 'explosion', name: 'Explosão', icon: '💥', description: 'Explosão radiante do centro' },
  { type: 'wave', name: 'Ondas', icon: '🌊', description: 'Movimento ondulatório suave' },
  { type: 'rain', name: 'Chuva', icon: '🌧️', description: 'Chuva intensa e rápida' },
  { type: 'snow', name: 'Neve', icon: '❄️', description: 'Flocos de neve delicados' },
  { type: 'bubbles', name: 'Bolhas', icon: '🫧', description: 'Bolhas que sobem lentamente' },
  { type: 'leaves', name: 'Folhas', icon: '🍂', description: 'Folhas dançando no vento' },
  { type: 'petals', name: 'Pétalas', icon: '🌺', description: 'Pétalas românticas' },
  { type: 'stars', name: 'Estrelas', icon: '⭐', description: 'Estrelas brilhantes' },
  { type: 'hearts', name: 'Corações', icon: '💕', description: 'Corações apaixonados' },
  { type: 'magical', name: 'Mágico', icon: '✨', description: 'Efeitos mágicos cintilantes' },
  { type: 'fireflies', name: 'Vaga-lumes', icon: '🌟', description: 'Vaga-lumes piscando' },
];

interface ParticleTypeCardProps {
  config: typeof PARTICLE_TYPES[0];
  isSelected: boolean;
  onSelect: () => void;
  animationDelay: number;
}

const ParticleTypeCard: React.FC<ParticleTypeCardProps> = ({
  config,
  isSelected,
  onSelect,
  animationDelay,
}) => {
  const { theme } = useThemeSystem();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(50, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: animationDelay + 100,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationDelay]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect();
  };

  return (
    <Animated.View
      style={[
        styles.typeCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
          backgroundColor: isSelected ? theme?.colors.primary : theme?.colors.surface,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.typeCardContent}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.typeIcon}>{config.icon}</Text>
        <Text style={[
          styles.typeName,
          { color: isSelected ? '#FFFFFF' : theme?.colors.text.primary }
        ]}>
          {config.name}
        </Text>
        <Text style={[
          styles.typeDescription,
          { color: isSelected ? 'rgba(255,255,255,0.9)' : theme?.colors.text.secondary }
        ]}>
          {config.description}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ParticlePlaygroundScreen() {
  const { theme, isLightMode } = useThemeSystem();
  const [selectedType, setSelectedType] = useState<ParticleType>('falling');
  const [isInteractive, setIsInteractive] = useState(false);
  const [particleCount, setParticleCount] = useState(8);
  const [windForce, setWindForce] = useState(1);
  const [gravityStrength, setGravityStrength] = useState(1);
  const [bounceEnabled, setBounceEnabled] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const currentConfig = PARTICLE_TYPES.find(p => p.type === selectedType);

  if (!theme) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isLightMode ? 'dark-content' : 'light-content'} />
      
      {/* Sistema de partículas ativo */}
      <AdvancedParticleSystem
        enabled={true}
        count={particleCount}
        particleType={selectedType}
        interactive={isInteractive}
        windForce={windForce}
        gravityStrength={gravityStrength}
        bounceEnabled={bounceEnabled}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            ✨ Playground de Partículas
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Explore diferentes efeitos
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Status atual */}
      <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.statusTitle, { color: theme.colors.text.primary }]}>
          {currentConfig?.icon} {currentConfig?.name}
        </Text>
        <Text style={[styles.statusDescription, { color: theme.colors.text.secondary }]}>
          {currentConfig?.description}
        </Text>
        
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: theme.colors.text.tertiary }]}>
            Partículas: {particleCount} • {isInteractive ? 'Interativo' : 'Automático'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentAnim,
            transform: [
              {
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Controles */}
          <View style={[styles.controlsSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              🎛️ Controles
            </Text>
            
            {/* Interatividade */}
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { color: theme.colors.text.primary }]}>
                Modo Interativo
              </Text>
              <Switch
                value={isInteractive}
                onValueChange={setIsInteractive}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={isInteractive ? '#FFFFFF' : theme.colors.text.tertiary}
              />
            </View>
            
            {isInteractive && (
              <Text style={[styles.controlHint, { color: theme.colors.text.secondary }]}>
                💡 Toque na tela para interagir com as partículas
              </Text>
            )}

            {/* Quantidade */}
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { color: theme.colors.text.primary }]}>
                Quantidade: {particleCount}
              </Text>
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: theme.colors.accent }]}
                  onPress={() => setParticleCount(Math.max(1, particleCount - 2))}
                >
                  <Text style={styles.controlButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: theme.colors.accent }]}
                  onPress={() => setParticleCount(Math.min(20, particleCount + 2))}
                >
                  <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Efeitos físicos */}
            <View style={styles.controlRow}>
              <Text style={[styles.controlLabel, { color: theme.colors.text.primary }]}>
                Ricochete
              </Text>
              <Switch
                value={bounceEnabled}
                onValueChange={setBounceEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={bounceEnabled ? '#FFFFFF' : theme.colors.text.tertiary}
              />
            </View>
          </View>

          {/* Tipos de partículas */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            🎨 Tipos de Partículas
          </Text>

          <View style={styles.typesGrid}>
            {PARTICLE_TYPES.map((config, index) => (
              <ParticleTypeCard
                key={config.type}
                config={config}
                isSelected={selectedType === config.type}
                onSelect={() => setSelectedType(config.type)}
                animationDelay={index * 50}
              />
            ))}
          </View>

          {/* Dicas */}
          <View style={[styles.tipsSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text.primary }]}>
              💡 Dicas de Uso
            </Text>
            <Text style={[styles.tipsText, { color: theme.colors.text.secondary }]}>
              • Cada tipo de partícula tem física única{'\n'}
              • Mode interativo permite tocar para influenciar o movimento{'\n'}
              • Experimente diferentes quantidades para efeitos diversos{'\n'}
              • Alguns tipos como 'Explosão' são melhores com poucas partículas{'\n'}
              • 'Vaga-lumes' e 'Mágico' têm efeitos luminosos especiais
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10,
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  controlsSection: {
    borderRadius: 12,
    padding: 16,
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
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 8,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  typeCard: {
    width: '48%',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  tipsSection: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});