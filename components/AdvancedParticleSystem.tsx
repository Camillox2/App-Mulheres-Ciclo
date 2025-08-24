// components/AdvancedParticleSystem.tsx - SISTEMA DE PARTÍCULAS AVANÇADO
import React, { useEffect, useRef, memo } from 'react';
import { View, Animated, Dimensions, StyleSheet, Text } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useThemeSystem } from '../hooks/useThemeSystem';

interface AdvancedParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  currentX: number; // posição atual X
  currentY: number; // posição atual Y
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  vx: number; // velocidade X
  vy: number; // velocidade Y
  gravity: number;
  bounce: number;
  type: ParticleType;
  emoji: string;
  initialX: number;
  initialY: number;
  lifetime: number;
  wind: number;
}

export type ParticleType = 
  | 'falling' | 'floating' | 'spiral' | 'explosion' | 'wave' 
  | 'rain' | 'snow' | 'bubbles' | 'leaves' | 'petals' 
  | 'stars' | 'hearts' | 'magical' | 'fireflies';

interface AdvancedParticleSystemProps {
  enabled?: boolean;
  count?: number;
  particleType?: ParticleType;
  customEmojis?: string[];
  interactive?: boolean;
  windForce?: number;
  gravityStrength?: number;
  bounceEnabled?: boolean;
}

const { width, height } = Dimensions.get('window');

// Configurações específicas para cada tipo de partícula
const PARTICLE_CONFIGS = {
  falling: {
    gravity: 0.3,
    bounce: 0.2,
    wind: 0.1,
    speed: { min: 1, max: 3 },
    lifetime: 8000,
    emojis: ['🌸', '🌺', '🌷', '🍀'],
  },
  floating: {
    gravity: -0.1,
    bounce: 0.8,
    wind: 0.3,
    speed: { min: 0.5, max: 1.5 },
    lifetime: 12000,
    emojis: ['🎈', '☁️', '🦋', '🕊️'],
  },
  spiral: {
    gravity: 0.1,
    bounce: 0.1,
    wind: 0.2,
    speed: { min: 2, max: 4 },
    lifetime: 10000,
    emojis: ['🌀', '✨', '💫', '⭐'],
  },
  explosion: {
    gravity: 0.4,
    bounce: 0.6,
    wind: 0.05,
    speed: { min: 3, max: 8 },
    lifetime: 3000,
    emojis: ['💥', '✨', '🎆', '🌟'],
  },
  wave: {
    gravity: 0.05,
    bounce: 0.3,
    wind: 0.4,
    speed: { min: 1, max: 2 },
    lifetime: 15000,
    emojis: ['🌊', '💧', '🐠', '🐚'],
  },
  rain: {
    gravity: 0.5,
    bounce: 0.1,
    wind: 0.2,
    speed: { min: 2, max: 5 },
    lifetime: 4000,
    emojis: ['💧', '☔', '🌧️', '💦'],
  },
  snow: {
    gravity: 0.1,
    bounce: 0.0,
    wind: 0.3,
    speed: { min: 0.5, max: 1.5 },
    lifetime: 20000,
    emojis: ['❄️', '🌨️', '⭐', '✨'],
  },
  bubbles: {
    gravity: -0.2,
    bounce: 0.9,
    wind: 0.1,
    speed: { min: 0.8, max: 2 },
    lifetime: 8000,
    emojis: ['🫧', '💙', '🔵', '⚪'],
  },
  leaves: {
    gravity: 0.2,
    bounce: 0.3,
    wind: 0.5,
    speed: { min: 1, max: 3 },
    lifetime: 12000,
    emojis: ['🍂', '🍁', '🌿', '🍃'],
  },
  petals: {
    gravity: 0.15,
    bounce: 0.2,
    wind: 0.4,
    speed: { min: 1, max: 2.5 },
    lifetime: 10000,
    emojis: ['🌸', '🌺', '🌷', '🌹'],
  },
  stars: {
    gravity: 0.05,
    bounce: 0.1,
    wind: 0.1,
    speed: { min: 0.5, max: 1 },
    lifetime: 25000,
    emojis: ['⭐', '🌟', '✨', '💫'],
  },
  hearts: {
    gravity: -0.05,
    bounce: 0.4,
    wind: 0.2,
    speed: { min: 0.8, max: 2 },
    lifetime: 8000,
    emojis: ['💕', '💖', '💗', '❤️'],
  },
  magical: {
    gravity: 0.1,
    bounce: 0.5,
    wind: 0.3,
    speed: { min: 1.5, max: 3 },
    lifetime: 6000,
    emojis: ['✨', '🌟', '💫', '🔮'],
  },
  fireflies: {
    gravity: 0.02,
    bounce: 0.8,
    wind: 0.4,
    speed: { min: 0.3, max: 1 },
    lifetime: 15000,
    emojis: ['✨', '💛', '🌟', '⭐'],
  },
};

const AdvancedParticleSystemComponent: React.FC<AdvancedParticleSystemProps> = ({
  enabled = true,
  count = 8,
  particleType = 'falling',
  customEmojis,
  interactive = false,
  windForce = 1,
  gravityStrength = 1,
  bounceEnabled = true,
}) => {
  const { theme, selectedVariant } = useThemeSystem();
  const particles = useRef<AdvancedParticle[]>([]).current;
  const animations = useRef<Animated.CompositeAnimation[]>([]).current;
  const windDirection = useRef(new Animated.Value(0)).current;

  const config = PARTICLE_CONFIGS[particleType];
  const emojis = customEmojis || config.emojis;
  
  console.log('🎨 AdvancedParticleSystem - particleType:', particleType, 'config:', config);

  // Inicializa partículas
  const initializeParticles = () => {
    particles.length = 0;
    
    for (let i = 0; i < count; i++) {
      const initialX = Math.random() * width;
      const initialY = particleType === 'explosion' ? height / 2 : -50;
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      const xValue = new Animated.Value(initialX);
      const yValue = new Animated.Value(initialY);
      
      const particle: AdvancedParticle = {
        id: i,
        x: xValue,
        y: yValue,
        currentX: initialX,
        currentY: initialY,
        opacity: new Animated.Value(0),
        scale: new Animated.Value(Math.random() * 0.6 + 0.7),
        rotation: new Animated.Value(0),
        vx: (Math.random() - 0.5) * config.speed.max,
        vy: Math.random() * config.speed.max + config.speed.min,
        gravity: config.gravity * gravityStrength,
        bounce: bounceEnabled ? config.bounce : 0,
        type: particleType,
        emoji: randomEmoji,
        initialX,
        initialY,
        lifetime: config.lifetime,
        wind: config.wind * windForce,
      };

      // Adiciona listeners para manter currentX e currentY atualizados
      if (interactive) {
        xValue.addListener(({ value }) => {
          particle.currentX = value;
        });
        yValue.addListener(({ value }) => {
          particle.currentY = value;
        });
      }
      
      particles.push(particle);
    }
  };

  const stopAnimations = () => {
    animations.forEach(anim => {
      anim.stop();
    });
    animations.length = 0;
  };

  const cleanupParticles = () => {
    // Remove listeners das partículas
    particles.forEach(particle => {
      particle.x.removeAllListeners();
      particle.y.removeAllListeners();
    });
    stopAnimations();
  };

  const createParticleAnimation = (particle: AdvancedParticle): Animated.CompositeAnimation => {
    const duration = particle.lifetime;
    console.log('🎬 Criando animação para tipo:', particle.type);
    
    // TESTE: usar sempre animação básica para ver se funciona
    return createPhysicsAnimation(particle, duration);
    
    // switch (particle.type) {
    //   case 'spiral':
    //     return createSpiralAnimation(particle, duration);
    //   case 'explosion':
    //     return createExplosionAnimation(particle, duration);
    //   case 'wave':
    //     return createWaveAnimation(particle, duration);
    //   case 'fireflies':
    //     return createFireflyAnimation(particle, duration);
    //   case 'floating':
    //     return createFloatingAnimation(particle, duration);
    //   default:
    //     return createPhysicsAnimation(particle, duration);
    // }
  };

  const createPhysicsAnimation = (particle: AdvancedParticle, duration: number): Animated.CompositeAnimation => {
    return Animated.sequence([
      // Fade in
      Animated.timing(particle.opacity, {
        toValue: 0.9,
        duration: 500,
        useNativeDriver: true,
      }),
      // Animação principal com física
      Animated.parallel([
        // Movimento com gravidade e vento
        Animated.timing(particle.y, {
          toValue: height + 100,
          duration: duration,
          useNativeDriver: true,
        }),
        // Movimento horizontal com vento
        Animated.timing(particle.x, {
          toValue: particle.initialX + (particle.wind * windForce * 200),
          duration: duration,
          useNativeDriver: true,
        }),
        // Rotação
        Animated.timing(particle.rotation, {
          toValue: 360 * (duration / 5000),
          duration: duration,
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
  };

  const createSpiralAnimation = (particle: AdvancedParticle, duration: number): Animated.CompositeAnimation => {
    const spiralRadius = 80;
    const centerX = particle.initialX;
    
    return Animated.sequence([
      Animated.timing(particle.opacity, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        // Movimento em espiral
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.x, {
              toValue: centerX + spiralRadius,
              duration: duration / 6,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: centerX - spiralRadius,
              duration: duration / 3,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: centerX + spiralRadius,
              duration: duration / 6,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
        // Movimento vertical
        Animated.timing(particle.y, {
          toValue: height + 50,
          duration: duration,
          useNativeDriver: true,
        }),
        // Rotação rápida
        Animated.timing(particle.rotation, {
          toValue: 1080,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),
    ]);
  };

  const createExplosionAnimation = (particle: AdvancedParticle, duration: number): Animated.CompositeAnimation => {
    const angle = (particle.id / count) * 2 * Math.PI;
    const distance = 150 + Math.random() * 100;
    const targetX = particle.initialX + Math.cos(angle) * distance;
    const targetY = particle.initialY + Math.sin(angle) * distance;
    
    return Animated.sequence([
      Animated.timing(particle.opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: targetX,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: targetY,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 1.5,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 0.5,
            duration: duration * 0.4,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.timing(particle.opacity, {
        toValue: 0,
        duration: duration * 0.3,
        useNativeDriver: true,
      }),
    ]);
  };

  const createWaveAnimation = (particle: AdvancedParticle, duration: number): Animated.CompositeAnimation => {
    const waveAmplitude = 60;
    const waveFrequency = 3;
    
    return Animated.sequence([
      Animated.timing(particle.opacity, {
        toValue: 0.7,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        // Movimento ondulatório
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.x, {
              toValue: particle.initialX + waveAmplitude,
              duration: duration / (waveFrequency * 2),
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: particle.initialX - waveAmplitude,
              duration: duration / waveFrequency,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: particle.initialX + waveAmplitude,
              duration: duration / (waveFrequency * 2),
              useNativeDriver: true,
            }),
          ]),
          { iterations: waveFrequency }
        ),
        // Movimento vertical suave
        Animated.timing(particle.y, {
          toValue: height + 50,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),
    ]);
  };

  const createFireflyAnimation = (particle: AdvancedParticle, duration: number): Animated.CompositeAnimation => {
    return Animated.sequence([
      Animated.timing(particle.opacity, {
        toValue: 0.8,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        // Movimento errático
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.x, {
              toValue: Math.random() * width,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: Math.random() * height * 0.7 + 100,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          { iterations: Math.floor(duration / 4000) }
        ),
        // Piscada como vaga-lume
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1.3,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.7,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          { iterations: Math.floor(duration / 2000) }
        ),
      ]),
    ]);
  };

  const createFloatingAnimation = (particle: AdvancedParticle, duration: number): Animated.CompositeAnimation => {
    return Animated.sequence([
      Animated.timing(particle.opacity, {
        toValue: 0.6,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        // Movimento flutuante suave
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.y, {
              toValue: particle.initialY - 30,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: particle.initialY + 30,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
          { iterations: Math.floor(duration / 6000) }
        ),
        // Deriva horizontal lenta
        Animated.timing(particle.x, {
          toValue: particle.initialX + (Math.random() - 0.5) * 200,
          duration: duration,
          useNativeDriver: true,
        }),
      ]),
    ]);
  };

  const startAnimations = () => {
    stopAnimations();
    
    particles.forEach((particle, index) => {
      const delay = particleType === 'explosion' ? 0 : index * 600;
      
      const animation = Animated.loop(
        Animated.sequence([
          createParticleAnimation(particle),
          // Reset position
          Animated.timing(particle.y, {
            toValue: particleType === 'explosion' ? height / 2 : -50,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: Math.random() * width,
            duration: 0,
            useNativeDriver: true,
          }),
          // Delay antes da próxima iteração
          Animated.delay(Math.random() * 3000 + 1000),
        ])
      );

      animations.push(animation);

      setTimeout(() => {
        if (enabled) {
          animation.start();
        }
      }, delay);
    });
  };

  // Efeito de vento global
  useEffect(() => {
    if (enabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(windDirection, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(windDirection, {
            toValue: -1,
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [enabled]);

  useEffect(() => {
    cleanupParticles();
    initializeParticles();
  }, [count, particleType, customEmojis, interactive]);

  useEffect(() => {
    if (enabled) {
      startAnimations();
    } else {
      stopAnimations();
    }

    return () => {
      cleanupParticles();
    };
  }, [enabled, particles.length]);

  // Gesture handler para interatividade
  const gestureHandler = (event: PanGestureHandlerGestureEvent) => {
    if (!interactive) return;
    
    const { x, y } = event.nativeEvent;
    
    // Cria partículas no local do toque
    particles.forEach(particle => {
      const distance = Math.sqrt(
        Math.pow(particle.currentX - x, 2) + Math.pow(particle.currentY - y, 2)
      );
      
      if (distance < 100) {
        // Aplica força de repulsão
        const force = (100 - distance) / 100;
        const angle = Math.atan2(particle.currentY - y, particle.currentX - x);
        
        const newX = particle.currentX + Math.cos(angle) * force * 50;
        const newY = particle.currentY + Math.sin(angle) * force * 50;
        
        // Atualiza posições atuais
        particle.currentX = newX;
        particle.currentY = newY;
        
        Animated.timing(particle.x, {
          toValue: newX,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        Animated.timing(particle.y, {
          toValue: newY,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  // Se não está habilitado, não renderiza nada para não interferir
  if (!enabled) {
    return null;
  }

  return (
    <View 
      style={[
        styles.container,
        { zIndex: 1 } // zIndex baixo para não interferir
      ]} 
      pointerEvents="none" // SEMPRE none para não interferir
    >
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
            <Text style={[styles.emoji, getEmojiStyle(particle.type)]}>
              {particle.emoji}
            </Text>
          </Animated.View>
        ))}
      </View>
  );
};

const getEmojiStyle = (type: ParticleType) => {
  switch (type) {
    case 'fireflies':
      return { textShadowColor: '#FFD700', textShadowRadius: 8 };
    case 'magical':
      return { textShadowColor: '#9C27B0', textShadowRadius: 6 };
    case 'explosion':
      return { textShadowColor: '#FF5722', textShadowRadius: 4 };
    case 'snow':
      return { textShadowColor: '#E3F2FD', textShadowRadius: 3 };
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, // Valor base, será sobrescrito dinamicamente se interativo
    pointerEvents: 'none', // Será sobrescrito dinamicamente
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

export const AdvancedParticleSystem = memo(AdvancedParticleSystemComponent);