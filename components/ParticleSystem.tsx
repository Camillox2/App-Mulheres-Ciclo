// components/ParticleSystem.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  initialX: number;
  initialY: number;
  initialScale: number;
  animations: Animated.CompositeAnimation[];
}

interface ParticleSystemProps {
  particleColor: string;
  opacity?: number;
  count?: number;
  duration?: number;
  enabled?: boolean;
}

const { width, height } = Dimensions.get('window');

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleColor,
  opacity = 0.6,
  count = 15,
  duration = 8000,
  enabled = true,
}) => {
  const particles = useRef<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (!enabled) {
      stopAllAnimations();
      return;
    }

    initializeParticles();
    startAnimations();

    return () => {
      stopAllAnimations();
    };
  }, [count, opacity, duration, enabled, particleColor]);

  const stopAllAnimations = () => {
    animationsRef.current.forEach(animation => {
      animation.stop();
    });
    animationsRef.current = [];
  };

  const initializeParticles = () => {
    // Para as animações existentes antes de recriar
    stopAllAnimations();

    particles.current = Array.from({ length: count }, (_, index) => {
      const initialX = Math.random() * width;
      const initialY = Math.random() * height;
      const initialOpacity = Math.random() * opacity;
      const initialScale = Math.random() * 0.5 + 0.5;

      return {
        id: index,
        x: new Animated.Value(initialX),
        y: new Animated.Value(initialY),
        opacity: new Animated.Value(initialOpacity),
        scale: new Animated.Value(initialScale),
        initialX: initialX,
        initialY: initialY,
        initialScale: initialScale,
        animations: [],
      };
    });
  };

  const createFloatAnimation = (particle: Particle): Animated.CompositeAnimation => {
    const floatDistance = 40 + Math.random() * 20; // 40-60px
    const baseDuration = duration / 6;
    const randomVariation = Math.random() * 1000;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(particle.y, {
          toValue: particle.initialY - floatDistance,
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
        Animated.timing(particle.y, {
          toValue: particle.initialY + floatDistance * 2,
          duration: (baseDuration + randomVariation) * 2,
          useNativeDriver: false,
        }),
        Animated.timing(particle.y, {
          toValue: particle.initialY - floatDistance,
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
      ])
    );
  };

  const createHorizontalAnimation = (particle: Particle): Animated.CompositeAnimation => {
    const driftDistance = 60 + Math.random() * 30; // 60-90px
    const baseDuration = duration / 4;
    const randomVariation = Math.random() * 1500;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(particle.x, {
          toValue: Math.min(width - 20, particle.initialX + driftDistance),
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
        Animated.timing(particle.x, {
          toValue: Math.max(20, particle.initialX - driftDistance * 2),
          duration: (baseDuration + randomVariation) * 2,
          useNativeDriver: false,
        }),
        Animated.timing(particle.x, {
          toValue: particle.initialX + driftDistance,
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
      ])
    );
  };

  const createOpacityAnimation = (particle: Particle): Animated.CompositeAnimation => {
    const minOpacity = opacity * 0.2;
    const maxOpacity = opacity * 0.8;
    const baseDuration = duration / 8;
    const randomVariation = Math.random() * 1000;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: minOpacity,
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
        Animated.timing(particle.opacity, {
          toValue: maxOpacity,
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
      ])
    );
  };

  const createScaleAnimation = (particle: Particle): Animated.CompositeAnimation => {
    const baseScale = particle.initialScale;
    const scaleVariation = 0.3;
    const baseDuration = duration / 10;
    const randomVariation = Math.random() * 500;

    return Animated.loop(
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: baseScale + scaleVariation,
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
        Animated.timing(particle.scale, {
          toValue: baseScale - scaleVariation,
          duration: baseDuration + randomVariation,
          useNativeDriver: false,
        }),
      ])
    );
  };

  const startAnimations = () => {
    particles.current.forEach((particle, index) => {
      const delay = index * 200 + Math.random() * 1000;

      // Cria todas as animações para esta partícula
      const floatAnim = createFloatAnimation(particle);
      const horizontalAnim = createHorizontalAnimation(particle);
      const opacityAnim = createOpacityAnimation(particle);
      const scaleAnim = createScaleAnimation(particle);

      // Adiciona ao array de animações ativas
      const particleAnimations = [floatAnim, horizontalAnim, opacityAnim, scaleAnim];
      animationsRef.current.push(...particleAnimations);

      // Inicia as animações com delay
      setTimeout(() => {
        if (enabled) {
          floatAnim.start();
          horizontalAnim.start();
          opacityAnim.start();
          scaleAnim.start();
        }
      }, delay);
    });
  };

  if (!enabled) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: [{ scale: particle.scale }],
              backgroundColor: particleColor,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
});