// components/LoadingState.tsx - COMPONENTES DE LOADING MELHORADOS
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeSystem } from '../hooks/useThemeSystem';

const { width } = Dimensions.get('window');

interface LoadingStateProps {
  message?: string;
  type?: 'default' | 'pulse' | 'shimmer' | 'dots' | 'cycle';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  type = 'default',
  size = 'medium',
  color
}) => {
  const { theme } = useThemeSystem();
  const primaryColor = color || theme.colors.primary;

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { containerSize: 40, fontSize: 12, padding: 10 };
      case 'large':
        return { containerSize: 80, fontSize: 18, padding: 30 };
      default:
        return { containerSize: 60, fontSize: 16, padding: 20 };
    }
  };

  const sizeConfig = getSizeConfig();

  switch (type) {
    case 'pulse':
      return <PulseLoader message={message} color={primaryColor} config={sizeConfig} />;
    case 'shimmer':
      return <ShimmerLoader message={message} color={primaryColor} config={sizeConfig} />;
    case 'dots':
      return <DotsLoader message={message} color={primaryColor} config={sizeConfig} />;
    case 'cycle':
      return <CycleLoader message={message} color={primaryColor} config={sizeConfig} />;
    default:
      return <DefaultLoader message={message} color={primaryColor} config={sizeConfig} />;
  }
};

// Loading padrão com rotação
const DefaultLoader: React.FC<{
  message: string;
  color: string;
  config: any;
}> = ({ message, color, config }) => {
  const { theme } = useThemeSystem();
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();
    return () => rotateAnimation.stop();
  }, []);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: config.containerSize,
            height: config.containerSize,
            borderColor: `${color}30`,
            borderTopColor: color,
            transform: [{ rotate }],
          },
        ]}
      />
      <Text style={[styles.message, { color: theme.colors.text.secondary, fontSize: config.fontSize }]}>
        {message}
      </Text>
    </View>
  );
};

// Loading com pulso
const PulseLoader: React.FC<{
  message: string;
  color: string;
  config: any;
}> = ({ message, color, config }) => {
  const { theme } = useThemeSystem();
  const pulseValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            width: config.containerSize,
            height: config.containerSize,
            backgroundColor: color,
            opacity: pulseValue,
          },
        ]}
      />
      <Text style={[styles.message, { color: theme.colors.text.secondary, fontSize: config.fontSize }]}>
        {message}
      </Text>
    </View>
  );
};

// Loading com shimmer
const ShimmerLoader: React.FC<{
  message: string;
  color: string;
  config: any;
}> = ({ message, color, config }) => {
  const { theme } = useThemeSystem();
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      <View style={[styles.shimmerContainer, { width: config.containerSize * 2, height: config.containerSize / 2 }]}>
        <View style={[styles.shimmerBackground, { backgroundColor: `${color}20` }]} />
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', `${color}60`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <Text style={[styles.message, { color: theme.colors.text.secondary, fontSize: config.fontSize }]}>
        {message}
      </Text>
    </View>
  );
};

// Loading com pontos animados
const DotsLoader: React.FC<{
  message: string;
  color: string;
  config: any;
}> = ({ message, color, config }) => {
  const { theme } = useThemeSystem();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (dotValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotValue, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dotValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 200),
      createDotAnimation(dot3, 400),
    ];

    animations.forEach(anim => anim.start());
    return () => animations.forEach(anim => anim.stop());
  }, []);

  const dotSize = config.containerSize / 6;

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      <View style={styles.dotsContainer}>
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                backgroundColor: color,
                opacity: dot,
                transform: [
                  {
                    scale: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.message, { color: theme.colors.text.secondary, fontSize: config.fontSize }]}>
        {message}
      </Text>
    </View>
  );
};

// Loading temático do ciclo menstrual
const CycleLoader: React.FC<{
  message: string;
  color: string;
  config: any;
}> = ({ message, color, config }) => {
  const { theme } = useThemeSystem();
  const cycleValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const cycleAnimation = Animated.loop(
      Animated.timing(cycleValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    cycleAnimation.start();
    pulseAnimation.start();

    return () => {
      cycleAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const rotate = cycleValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { padding: config.padding }]}>
      <Animated.View
        style={[
          styles.cycleContainer,
          {
            width: config.containerSize,
            height: config.containerSize,
            transform: [{ rotate }, { scale: pulseValue }],
          },
        ]}
      >
        <LinearGradient
          colors={[color, `${color}60`, color]}
          style={styles.cycleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cycleEmoji}>🌸</Text>
        </LinearGradient>
      </Animated.View>
      <Text style={[styles.message, { color: theme.colors.text.secondary, fontSize: config.fontSize }]}>
        {message}
      </Text>
    </View>
  );
};

// Componente de loading para listas (Skeleton)
export const SkeletonLoader: React.FC<{
  lines?: number;
  height?: number;
  width?: string;
}> = ({ lines = 3, height = 20, width = '100%' }) => {
  const { theme } = useThemeSystem();
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeletonLine,
            {
              height,
              width: index === lines - 1 ? '70%' : width as any,
              backgroundColor: theme.colors.surface,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
    marginBottom: 15,
  },
  message: {
    textAlign: 'center',
    fontWeight: '500',
  },
  pulseCircle: {
    borderRadius: 50,
    marginBottom: 15,
  },
  shimmerContainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 15,
  },
  shimmerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 3,
  },
  cycleContainer: {
    borderRadius: 50,
    marginBottom: 15,
    overflow: 'hidden',
  },
  cycleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cycleEmoji: {
    fontSize: 24,
  },
  skeletonContainer: {
    padding: 15,
  },
  skeletonLine: {
    borderRadius: 4,
    marginBottom: 10,
  },
});