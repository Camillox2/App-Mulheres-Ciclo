import React, { useEffect, useRef, memo, useMemo } from 'react';
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
  count = 15, // Reduzido de 26 para 15
  duration = 12000, // Aumentado para movimentos mais suaves
  enabled = true,
}) => {
  // Memoiza as partículas para evitar recriações desnecessárias
  const particles = useMemo(() => {
    const particleArray: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const initialX = Math.random() * width;
      const initialY = Math.random() * height;
      particleArray.push({
        id: i,
        x: new Animated.Value(initialX),
        y: new Animated.Value(initialY),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(Math.random() * 0.4 + 0.6), // Tamanhos mais consistentes
        initialX,
        initialY,
      });
    }
    return particleArray;
  }, [count]);
  
  const animations = useRef<Animated.CompositeAnimation[]>([]).current;

  const stopAnimations = () => {
    animations.forEach(anim => anim.stop());
    animations.length = 0;
  };

  const startAnimations = () => {
    stopAnimations(); // Garante que animações anteriores sejam paradas

    particles.forEach((particle, index) => {
      const randomDuration = duration + Math.random() * 2000; // Reduzido variação
      const randomDelay = Math.random() * 1500; // Reduzido delay

      // Movimento mais sutil e suave
      const toX = particle.initialX + (Math.random() - 0.5) * 60; // Reduzido de 80 para 60
      const toY = particle.initialY + (Math.random() - 0.5) * 60;

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
              toValue: opacity * 0.8, // Reduzida opacidade para menos distração
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

      // Use requestAnimationFrame para melhor performance
      const timeoutId = setTimeout(() => {
        if (enabled) {
          requestAnimationFrame(() => {
            anim.start();
          });
        }
      }, randomDelay);
    });
  };

  useEffect(() => {
    if (enabled) {
      // Delay pequeno para evitar sobrecarregar o render inicial
      const timeoutId = setTimeout(() => {
        startAnimations();
      }, 300);
      return () => {
        clearTimeout(timeoutId);
        stopAnimations();
      };
    } else {
      stopAnimations();
    }
  }, [enabled, opacity, particleColor]); // Removido count e duration das dependências

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
    width: 4, // Reduzido de 6 para 4
    height: 4,
    borderRadius: 2,
    shadowColor: 'transparent', // Remove sombras para melhor performance
  },
});

export const ParticleSystem = memo(ParticleSystemComponent);