// components/GlobalParticleSystem.tsx - SISTEMA GLOBAL DE PARTÍCULAS
import React from 'react';
import { AdvancedParticleSystem } from './AdvancedParticleSystem';
import { useGlobalParticles } from '../hooks/useGlobalParticles';

export const GlobalParticleSystem: React.FC = () => {
  const { settings, loading } = useGlobalParticles();

  if (loading || !settings.enabled) {
    return null;
  }

  console.log('🌍 Renderizando partículas globais:', settings.particleType, settings.count);

  return (
    <AdvancedParticleSystem
      key={`global-particles-${settings.particleType}-${settings.count}`}
      enabled={settings.enabled}
      count={settings.count}
      particleType={settings.particleType}
      interactive={false} // Sempre não interativo globalmente
      windForce={settings.windForce}
      gravityStrength={settings.gravityStrength}
      bounceEnabled={settings.bounceEnabled}
    />
  );
};