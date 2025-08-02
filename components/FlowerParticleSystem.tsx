// components/FlowerParticleSystem.tsx - SISTEMA DE PARTÍCULAS FLORAIS
import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Dimensions, StyleSheet, Text } from 'react-native';
import { useThemeSystem } from '../hooks/useThemeSystem';

interface FlowerParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  emoji: string;
  initialX: number;
  speed: number;
}

interface FlowerParticleSystemProps {
  enabled?: boolean;
  count?: number;
  customEmojis?: string[];
}

const { width, height } = Dimensions.get('window');

// FLORES POR FASE DO CICLO E TEMA
const FLOWER_EMOJIS_BY_PHASE = {
  rose: {
    menstrual: ['🌹', '🥀', '💖', '🌺'],
    postMenstrual: ['🌸', '🌷', '🌺', '💐'],
    fertile: ['🌹', '🌺', '💕', '❤️'],
    ovulation: ['🌹', '💖', '✨', '💫'],
    preMenstrual: ['🥀', '🌸', '💜', '🌷'],
  },
  lavender: {
    menstrual: ['💜', '🔮', '✨', '🌙'],
    postMenstrual: ['💜', '🔮', '⭐', '✨'],
    fertile: ['💜', '🌟', '✨', '💫'],
    ovulation: ['🔮', '💜', '🌟', '⭐'],
    preMenstrual: ['💜', '🌙', '✨', '🔮'],
  },
  sunset: {
    menstrual: ['🌻', '🧡', '🔥', '☀️'],
    postMenstrual: ['🌻', '🌼', '🌺', '🌸'],
    fertile: ['🌻', '🔥', '❤️', '💛'],
    ovulation: ['☀️', '🌻', '✨', '🌟'],
    preMenstrual: ['🌅', '🧡', '🌻', '🌙'],
  },
  ocean: {
    menstrual: ['🌊', '💙', '🌀', '💎'],
    postMenstrual: ['🌊', '💙', '✨', '🌟'],
    fertile: ['🌊', '💙', '💎', '✨'],
    ovulation: ['🌊', '💙', '🌟', '💫'],
    preMenstrual: ['🌊', '🌀', '💙', '🌙'],
  },
  forest: {
    menstrual: ['🌿', '🍃', '💚', '🌱'],
    postMenstrual: ['🌿', '🍃', '🌱', '✨'],
    fertile: ['🌿', '💚', '🌸', '🌺'],
    ovulation: ['🌿', '💚', '✨', '🌟'],
    preMenstrual: ['🍃', '🌿', '🌙', '💚'],
  },
  cherry: {
    menstrual: ['🌸', '🌺', '💖', '🌷'],
    postMenstrual: ['🌸', '🌺', '🌷', '💐'],
    fertile: ['🌸', '💖', '🌺', '💕'],
    ovulation: ['🌸', '🌺', '✨', '🌟'],
    preMenstrual: ['🌸', '🌷', '🌙', '💜'],
  },
};

const FlowerParticleSystemComponent: React.FC<FlowerParticleSystemProps> = ({
  enabled = true,
  count = 8,
  customEmojis,
}) => {
  const { theme, selectedVariant } = useThemeSystem();
  const particles = useRef<FlowerParticle[]>([]).current;
  const animations = useRef<Animated.CompositeAnimation[]>([]).current;

  // Determina flores baseado no tema e fase
  const getFlowersForCurrentState = (): string[] => {
    if (customEmojis) return customEmojis;
    
    const variant = selectedVariant || 'rose';
    const phase = theme?.phase || 'menstrual';
    
    if (FLOWER_EMOJIS_BY_PHASE[variant]) {
      return FLOWER_EMOJIS_BY_PHASE[variant][phase] || FLOWER_EMOJIS_BY_PHASE.rose.menstrual;
    }
    
    return FLOWER_EMOJIS_BY_PHASE.rose.menstrual;
  };

  // Inicializa partículas
  const initializeParticles = () => {
    const flowers = getFlowersForCurrentState();
    particles.length = 0;
    
    for (let i = 0; i < count; i++) {
      const initialX = Math.random() * width;
      const randomEmoji = flowers[Math.floor(Math.random() * flowers.length)];
      
      particles.push({
        id: i,
        x: new Animated.Value(initialX),
        y: new Animated.Value(-50),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(Math.random() * 0.6 + 0.7),
        rotation: new Animated.Value(0),
        emoji: randomEmoji,
        initialX,
        speed: Math.random() * 2000 + 4000, // 4-6 segundos
      });
    }
  };

  const stopAnimations = () => {
    animations.forEach(anim => {
      anim.stop();
    });
    animations.length = 0;
  };

  const startAnimations = () => {
    stopAnimations();
    
    particles.forEach((particle, index) => {
      const delay = index * 800; // Espaça as partículas
      
      const fallAnimation = Animated.sequence([
        // Fade in
        Animated.timing(particle.opacity, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
        // Animação principal de queda
        Animated.parallel([
          // Queda vertical
          Animated.timing(particle.y, {
            toValue: height + 100,
            duration: particle.speed,
            useNativeDriver: true,
          }),
          // Movimento horizontal sutil (efeito vento)
          Animated.timing(particle.x, {
            toValue: particle.initialX + (Math.random() - 0.5) * 100,
            duration: particle.speed,
            useNativeDriver: true,
          }),
          // Rotação sutil
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 360,
            duration: particle.speed,
            useNativeDriver: true,
          }),
        ]),
        // Fade out
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      const loopAnimation = Animated.loop(
        Animated.sequence([
          fallAnimation,
          // Reset position
          Animated.timing(particle.y, {
            toValue: -50,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: Math.random() * width,
            duration: 0,
            useNativeDriver: true,
          }),
          // Delay antes da próxima queda
          Animated.delay(Math.random() * 3000 + 2000),
        ])
      );

      animations.push(loopAnimation);

      setTimeout(() => {
        if (enabled) {
          loopAnimation.start();
        }
      }, delay);
    });
  };

  useEffect(() => {
    initializeParticles();
  }, [count, selectedVariant, theme?.phase]);

  useEffect(() => {
    if (enabled) {
      startAnimations();
    } else {
      stopAnimations();
    }

    return () => {
      stopAnimations();
    };
  }, [enabled, particles.length]);

  if (!enabled || !theme) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                { 
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <Text style={styles.emoji}>{particle.emoji}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export const FlowerParticleSystem = memo(FlowerParticleSystemComponent);