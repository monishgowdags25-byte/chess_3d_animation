import React from 'react';
import { Environment as DreiEnvironment, Sparkles } from '@react-three/drei';

export default function Environment() {
  return (
    <>
      {/* 
        Provides realistic HDRI reflections for PBR materials (glossy eyes and varnished wood).
        We don't show the background of the HDRI directly to keep the background clean and neutral.
      */}
      <DreiEnvironment preset="apartment" />

      {/* Floating dust particles catching the warm sunlight beams */}
      <Sparkles
        count={65}
        scale={[14, 8, 12]}
        size={2.2}
        speed={0.15}
        color="#ffe6bc"
        opacity={0.7}
      />
    </>
  );
}
