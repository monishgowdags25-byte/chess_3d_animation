import React from 'react';
import { RoundedBox } from '@react-three/drei';

export default function ChessBoard({ darkWood, lightWood }) {
  const squares = [];
  const size = 8;
  const squareWidth = 1.25;
  const offset = (size - 1) * squareWidth / 2;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isDark = (r + c) % 2 === 1;
      const x = c * squareWidth - offset;
      const z = r * squareWidth - offset;
      const wood = isDark ? darkWood : lightWood;

      squares.push(
        <RoundedBox
          key={`${r}-${c}`}
          args={[squareWidth - 0.03, 0.2, squareWidth - 0.03]} // Slight gap for clear seams
          radius={0.015} // Small bevel for highlights
          smoothness={4}
          position={[x, -0.1, z]}
          receiveShadow
        >
          <meshStandardMaterial
            map={wood.map}
            roughnessMap={wood.roughnessMap}
            bumpMap={wood.bumpMap}
            bumpScale={0.005}
            roughness={0.15}
            metalness={0.05}
          />
        </RoundedBox>
      );
    }
  }

  // Outer border dimensions
  const boardSize = size * squareWidth;
  const borderWidth = 0.5;
  const borderHeight = 0.24; // Slightly taller than the squares for a lip
  const borderOuter = boardSize + borderWidth * 2;

  return (
    <group>
      {/* 8x8 Grid of wood squares */}
      {squares}

      {/* Board Outer Border Frame (Dark Wood) */}
      {/* North Border */}
      <RoundedBox
        args={[borderOuter, borderHeight, borderWidth]}
        radius={0.02}
        position={[0, -0.08, -(boardSize / 2 + borderWidth / 2)]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={darkWood.map}
          roughnessMap={darkWood.roughnessMap}
          bumpMap={darkWood.bumpMap}
          bumpScale={0.005}
          roughness={0.12}
        />
      </RoundedBox>

      {/* South Border */}
      <RoundedBox
        args={[borderOuter, borderHeight, borderWidth]}
        radius={0.02}
        position={[0, -0.08, (boardSize / 2 + borderWidth / 2)]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={darkWood.map}
          roughnessMap={darkWood.roughnessMap}
          bumpMap={darkWood.bumpMap}
          bumpScale={0.005}
          roughness={0.12}
        />
      </RoundedBox>

      {/* West Border */}
      <RoundedBox
        args={[borderWidth, borderHeight, boardSize]}
        radius={0.02}
        position={[-(boardSize / 2 + borderWidth / 2), -0.08, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={darkWood.map}
          roughnessMap={darkWood.roughnessMap}
          bumpMap={darkWood.bumpMap}
          bumpScale={0.005}
          roughness={0.12}
        />
      </RoundedBox>

      {/* East Border */}
      <RoundedBox
        args={[borderWidth, borderHeight, boardSize]}
        radius={0.02}
        position={[(boardSize / 2 + borderWidth / 2), -0.08, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          map={darkWood.map}
          roughnessMap={darkWood.roughnessMap}
          bumpMap={darkWood.bumpMap}
          bumpScale={0.005}
          roughness={0.12}
        />
      </RoundedBox>
    </group>
  );
}
