import React from 'react';

export default function Lighting() {
  return (
    <>
      {/* Soft warm ambient lighting for general room bounce */}
      <ambientLight intensity={1.2} color="#fffcf0" />

      {/* Warm sunlight coming from top-left, casting soft, rich shadows */}
      <directionalLight
        position={[-8, 12, 6]}
        intensity={2.8}
        color="#fff4e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-8, 8, 8, -8, 0.1, 40]}
        />
      </directionalLight>

      {/* Subtle rim light from the right/back to accentuate contours and polished lacquer edges */}
      <pointLight
        position={[8, 4, -6]}
        intensity={1.5}
        color="#ffffff"
        distance={25}
        decay={2}
      />

      {/* Gentle bounce light from the board surface (upwards) */}
      <directionalLight
        position={[0, -5, 0]}
        intensity={0.4}
        color="#cb997e"
      />
    </>
  );
}
