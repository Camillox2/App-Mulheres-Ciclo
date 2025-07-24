import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  initialX: number;
  initialY: number;
}

interface ParticleSystemProps {
  particleColor: string;
  opacity?: number;
  count?: number;
  duration?: number;
  enabled?: boolean;
}

const { width, height } = Dimensions.get('window');

const ParticleSystemComponent: React.FC<ParticleSystemProps> = ({
  particleColor,
  opacity = 0.6,
  count = 26,
  duration = 10000,
  enabled = true,
}) => {
  const particles = useRef<Particle[]>([]).current;
  const animations = useRef<Animated.CompositeAnimation[]>([]).current;

  // Inicializa as partículas apenas uma vez ou quando a contagem muda
  if (particles.length !== count) {
    particles.length = 0; // Limpa o array
    for (let i = 0; i < count; i++) {
      const initialX = Math.random() * width;
      const initialY = Math.random() * height;
      particles.push({
        id: i,
        x: new Animated.Value(initialX),
        y: new Animated.Value(initialY),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(Math.random() * 0.5 + 0.5),
        initialX,
        initialY,
      });
    }
  }

  const stopAnimations = () => {
    animations.forEach(anim => anim.stop());
    animations.length = 0;
  };

  const startAnimations = () => {
    stopAnimations(); // Garante que animações anteriores sejam paradas

    particles.forEach((particle, index) => {
      const randomDuration = duration + Math.random() * 3000;
      const randomDelay = Math.random() * 2000;

      const toX = particle.initialX + (Math.random() - 0.5) * 80;
      const toY = particle.initialY + (Math.random() - 0.5) * 80;

      const anim = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(particle.x, {
              toValue: toX,
              duration: randomDuration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: toY,
              duration: randomDuration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: opacity,
              duration: randomDuration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.x, {
              toValue: particle.initialX,
              duration: randomDuration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: particle.initialY,
              duration: randomDuration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: randomDuration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );

      animations.push(anim);

      setTimeout(() => {
        if (enabled) {
          anim.start();
        }
      }, randomDelay);
    });
  };

  useEffect(() => {
    if (enabled) {
      startAnimations();
    } else {
      stopAnimations();
    }

    return () => {
      stopAnimations();
    };
  }, [enabled, count, duration, opacity, particleColor]);

  if (!enabled) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              backgroundColor: particleColor,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export const ParticleSystem = memo(ParticleSystemComponent);