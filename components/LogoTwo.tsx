import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function LogoTwo({ style }: { style?: any }) {
  return (
    <Image
      source={require('../assets/images/logoTwo.png')}
      style={[styles.logo, style]}
      resizeMode="contain"
      accessibilityLabel="Logo Entre Fases"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
});
