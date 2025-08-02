// components/ColorPicker.tsx - SELETOR DE CORES AVANÇADO
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { 
  PanGestureHandler,
  TapGestureHandler,
  State,
  PanGestureHandlerGestureEvent, 
  TapGestureHandlerGestureEvent 
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ColorPickerProps {
  onColorChange: (color: string) => void;
  initialColor?: string;
  width?: number;
  height?: number;
  showPresets?: boolean;
}

interface HSV {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
}

// Conversão HSV para RGB
const hsvToRgb = (h: number, s: number, v: number): string => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `rgb(${r}, ${g}, ${b})`;
};

// Conversão RGB para HSV
const rgbToHsv = (r: number, g: number, b: number): HSV => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return { h, s, v };
};

// Parse cor inicial
const parseColor = (color: string): HSV => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return rgbToHsv(r, g, b);
  }
  return { h: 0, s: 1, v: 1 };
};

// Cores predefinidas populares
const PRESET_COLORS = [
  '#FF6B9D', '#FFB4D6', '#FF8FAB', // Rosas
  '#9C88FF', '#C4B5FD', '#A78BFA', // Roxos
  '#FF8A65', '#FFAB91', '#FF7043', // Laranjas
  '#4FC3F7', '#81D4FA', '#29B6F6', // Azuis
  '#66BB6A', '#A5D6A7', '#4CAF50', // Verdes
  '#FFD54F', '#FFF176', '#FFCC02', // Amarelos
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
  initialColor = '#FF6B9D',
  width = 280,
  height = 200,
  showPresets = true,
}) => {
  const initialHsv = parseColor(initialColor);
  
  const hue = useSharedValue(initialHsv.h);
  const saturation = useSharedValue(initialHsv.s);
  const brightness = useSharedValue(initialHsv.v);
  
  const pickerX = useSharedValue(initialHsv.s * (width * 0.8));
  const pickerY = useSharedValue((1 - initialHsv.v) * (height * 0.6));
  const hueX = useSharedValue((initialHsv.h / 360) * (width * 0.8));

  const updateColor = (h: number, s: number, v: number) => {
    const color = hsvToRgb(h, s, v);
    onColorChange(color);
  };

  // Gesture handler para o picker principal (saturação/brilho)
  const mainGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context: any) => {
      context.startX = pickerX.value;
      context.startY = pickerY.value;
    },
    onActive: (event, context: any) => {
      const maxX = width * 0.8;
      const maxY = height * 0.6;
      
      pickerX.value = Math.max(0, Math.min(maxX, context.startX + event.translationX));
      pickerY.value = Math.max(0, Math.min(maxY, context.startY + event.translationY));
      
      saturation.value = pickerX.value / maxX;
      brightness.value = 1 - (pickerY.value / maxY);
      
      runOnJS(updateColor)(hue.value, saturation.value, brightness.value);
    },
  });

  // Gesture handler para o slider de matiz
  const hueGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context: any) => {
      context.startX = hueX.value;
    },
    onActive: (event, context: any) => {
      const maxX = width * 0.8;
      hueX.value = Math.max(0, Math.min(maxX, context.startX + event.translationX));
      hue.value = (hueX.value / maxX) * 360;
      
      runOnJS(updateColor)(hue.value, saturation.value, brightness.value);
    },
  });

  // Estilos animados
  const pickerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pickerX.value - 10 },
      { translateY: pickerY.value - 10 },
    ],
  }));

  const huePickerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hueX.value - 8 }],
  }));

  const currentColorStyle = useAnimatedStyle(() => {
    const color = hsvToRgb(hue.value, saturation.value, brightness.value);
    return { backgroundColor: color };
  });

  const mainGradientStyle = useAnimatedStyle(() => {
    const pureHue = hsvToRgb(hue.value, 1, 1);
    return { backgroundColor: pureHue };
  });

  return (
    <View style={[styles.container, { width }]}>
      {/* Picker Principal (Saturação/Brilho) */}
      <View style={[styles.mainPicker, { width: width * 0.8, height: height * 0.6 }]}>
        <Animated.View style={[styles.mainPickerBackground, mainGradientStyle]} />
        
        {/* Gradiente de saturação (esquerda para direita) */}
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Gradiente de brilho (cima para baixo) */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <PanGestureHandler onGestureEvent={mainGestureHandler}>
          <Animated.View style={[styles.picker, pickerStyle]} />
        </PanGestureHandler>
      </View>

      {/* Slider de Matiz */}
      <View style={[styles.hueContainer, { width: width * 0.8 }]}>
        <LinearGradient
          colors={[
            '#FF0000', '#FF7F00', '#FFFF00', '#7FFF00',
            '#00FF00', '#00FF7F', '#00FFFF', '#007FFF',
            '#0000FF', '#7F00FF', '#FF00FF', '#FF007F', '#FF0000'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.hueSlider}
        />
        
        <PanGestureHandler onGestureEvent={hueGestureHandler}>
          <Animated.View style={[styles.huePickerThumb, huePickerStyle]} />
        </PanGestureHandler>
      </View>

      {/* Preview da Cor Atual */}
      <View style={styles.currentColorContainer}>
        <Animated.View style={[styles.currentColor, currentColorStyle]} />
        <Text style={styles.currentColorLabel}>Cor Atual</Text>
      </View>

      {/* Cores Predefinidas */}
      {showPresets && (
        <View style={styles.presetsContainer}>
          <Text style={styles.presetsLabel}>Cores Populares</Text>
          <View style={styles.presetsGrid}>
            {PRESET_COLORS.map((color, index) => (
              <TapGestureHandler
                key={index}
                onHandlerStateChange={(event) => {
                  if (event.nativeEvent.state === State.END) {
                    const hsv = parseColor(color);
                    hue.value = hsv.h;
                    saturation.value = hsv.s;
                    brightness.value = hsv.v;
                    
                    pickerX.value = hsv.s * (width * 0.8);
                    pickerY.value = (1 - hsv.v) * (height * 0.6);
                    hueX.value = (hsv.h / 360) * (width * 0.8);
                    
                    onColorChange(color);
                  }
                }}
              >
                <Animated.View style={[styles.presetColor, { backgroundColor: color }]} />
              </TapGestureHandler>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  mainPicker: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mainPickerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  picker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  hueContainer: {
    height: 30,
    justifyContent: 'center',
  },
  hueSlider: {
    height: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  huePickerThumb: {
    position: 'absolute',
    width: 16,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  currentColorContainer: {
    alignItems: 'center',
    gap: 8,
  },
  currentColor: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currentColorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  presetsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  presetsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  presetColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});