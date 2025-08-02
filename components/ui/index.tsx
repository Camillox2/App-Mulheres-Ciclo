// components/ui/index.tsx - VERSÃO CORRIGIDA SEM ERROS
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useThemeSystem } from '../../hooks/useThemeSystem';

const { width } = Dimensions.get('window');

// ===============================
// TYPES
// ===============================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'minimal' | 'glass';
  style?: ViewStyle;
  onPress?: () => void;
  gradient?: boolean;
}

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: 'default' | 'floating';
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  label?: string;
  error?: string;
  icon?: string;
}

interface ProgressBarProps {
  progress: number;
  height?: number;
  animated?: boolean;
  gradient?: boolean;
  style?: ViewStyle;
  color?: string;
}

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

// ===============================
// BUTTON COMPONENT
// ===============================

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useThemeSystem();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  if (!theme) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 };
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 28, fontSize: 18 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16 };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: 1.5,
          textColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: `${theme.colors.primary}15`,
          textColor: theme.colors.primary,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          textColor: 'white',
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          textColor: 'white',
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const buttonStyle = {
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles,
    ...variantStyles,
  };

  const ButtonContent = () => (
    <View style={styles.buttonContent}>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.textColor} />
      ) : (
        <>
          {icon && (
            <Text style={[styles.buttonIcon, { color: variantStyles.textColor }]}>
              {icon}
            </Text>
          )}
          <Text
            style={[
              styles.buttonText,
              { color: variantStyles.textColor, fontSize: sizeStyles.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={style}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FFB4D6'] as [import('react-native').ColorValue, import('react-native').ColorValue]}
            style={[buttonStyle, { backgroundColor: undefined, borderWidth: 0 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ButtonContent />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[buttonStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <ButtonContent />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ===============================
// CARD COMPONENT
// ===============================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  gradient = false,
}) => {
  const { theme } = useThemeSystem();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  };

  if (!theme) return null;

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: 16,
      padding: 20,
    };

    const shadows = {
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
      },
      minimal: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      glass: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    };

    return {
      ...baseStyle,
      ...shadows[variant],
    };
  };

  const cardStyle = getCardStyle();

  const CardWrapper = ({ children: cardChildren }: { children: React.ReactNode }) => {
    if (variant === 'glass') {
      return (
        <View style={[cardStyle, style]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={40}
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 16,
                  backgroundColor: `${theme.colors.surface}80`,
                },
              ]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 16,
                  backgroundColor: `${theme.colors.surface}CC`,
                },
              ]}
            />
          )}
          <View style={{ zIndex: 1 }}>{cardChildren}</View>
        </View>
      );
    }

    if (gradient) {
      return (
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA'] as [import('react-native').ColorValue, import('react-native').ColorValue]}
          style={[cardStyle, style]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {cardChildren}
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          cardStyle,
          {
            backgroundColor: theme.colors.surface,
          },
          style,
        ]}
      >
        {cardChildren}
      </View>
    );
  };

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <CardWrapper>{children}</CardWrapper>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <CardWrapper>{children}</CardWrapper>;
};

// ===============================
// INPUT COMPONENT
// ===============================

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  label,
  error,
  icon,
}) => {
  const { theme } = useThemeSystem();
  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  useEffect(() => {
    if (value) {
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value]);

  if (!theme) return null;

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surface, theme.colors.primary],
  });

  const inputContainerStyle = {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
  };

  if (variant === 'floating') {
    const labelTop = labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    });

    const labelScale = labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.8],
    });

    return (
      <View style={[styles.inputWrapper, style]}>
        <Animated.View
          style={[
            inputContainerStyle,
            {
              borderColor,
            },
          ]}
        >
          {icon && (
            <Text style={[styles.inputIcon, { color: theme.colors.secondary }]}>
              {icon}
            </Text>
          )}
          <View style={styles.inputContent}>
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  color: theme.colors.secondary,
                  top: labelTop,
                  transform: [{ scale: labelScale }],
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              {label || placeholder}
            </Animated.Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.colors.primary,
                  marginTop: 8,
                },
                inputStyle,
              ]}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              multiline={multiline}
              numberOfLines={numberOfLines}
              placeholderTextColor="transparent"
            />
          </View>
        </Animated.View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.inputWrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.primary }]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          inputContainerStyle,
          {
            borderColor,
          },
        ]}
      >
        {icon && (
          <Text style={[styles.inputIcon, { color: theme.colors.secondary }]}>
            {icon}
          </Text>
        )}
        <TextInput
          style={[
            styles.textInput,
            {
              color: theme.colors.primary,
              flex: 1,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.secondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ===============================
// PROGRESS BAR COMPONENT
// ===============================

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  animated = true,
  gradient = true,
  style,
}) => {
  const { theme } = useThemeSystem();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated]);

  if (!theme) return null;

  const progressWidth = animated
    ? progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, width], // animate from 0 to full width
      })
    : Math.max(0, Math.min(width, progress * width)); // clamp between 0 and full width

  return (
    <View
      style={[
        styles.progressContainer,
        {
          height,
          backgroundColor: `${theme.colors.primary}20`,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progressFill,
          {
            width: progressWidth,
            height: height - 2,
            borderRadius: (height - 2) / 2,
          },
        ]}
      >
        {gradient ? (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary] as [import('react-native').ColorValue, import('react-native').ColorValue]}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ) : (
          <View
            style={[
              styles.progressGradient,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

// ===============================
// LOADING SPINNER COMPONENT
// ===============================

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  style,
}) => {
  const { theme } = useThemeSystem();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    rotation.start();

    return () => rotation.stop();
  }, []);

  if (!theme) return null;

  const sizes = {
    small: 20,
    medium: 32,
    large: 48,
  };

  const spinnerSize = sizes[size];
  const spinnerColor = color || theme.colors.primary;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          width: spinnerSize,
          height: spinnerSize,
          transform: [{ rotate }],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderWidth: 2,
            borderColor: `${spinnerColor}20`,
            borderTopColor: spinnerColor,
          },
        ]}
      />
    </Animated.View>
  );
};

// ===============================
// STYLES
// ===============================

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  buttonText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContent: {
    flex: 1,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 4,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '400',
    minHeight: 20,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    color: '#EF4444',
  },
  progressContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 1,
    top: 1,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  spinner: {
    // Styles are set dynamically in component
  },
});

// ===============================
// EXPORTS
// ===============================

export default {
  Button,
  Card,
  Input,
  ProgressBar,
  LoadingSpinner,
};