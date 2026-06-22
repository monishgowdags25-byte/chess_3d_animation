import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Bishop({ wood }) {
  const groupRef = useRef();
  const eyeLidsRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();

  // Spring entrance animation variables
  const currentY = useRef(6);
  const velocityY = useRef(0);
  const isSettled = useRef(false);
  const delay = 0.4; // Staggered drop

  // Blinking/sleepy eyes logic
  const blinkTimer = useRef(Math.random() * 4 + 3);
  const blinkDuration = 0.12;

  // Generate Bishop lower body Lathe profile points (up to collar)
  const bodyPoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0.001, 0));
    pts.push(new THREE.Vector2(0.50, 0));
    pts.push(new THREE.Vector2(0.50, 0.10));
    pts.push(new THREE.Vector2(0.44, 0.15));
    pts.push(new THREE.Vector2(0.40, 0.20));
    pts.push(new THREE.Vector2(0.42, 0.28));
    pts.push(new THREE.Vector2(0.35, 0.34));
    
    // Stem
    pts.push(new THREE.Vector2(0.22, 0.7));
    pts.push(new THREE.Vector2(0.19, 1.1));
    pts.push(new THREE.Vector2(0.20, 1.4));
    
    // Collar ring
    pts.push(new THREE.Vector2(0.38, 1.62));
    pts.push(new THREE.Vector2(0.40, 1.72));
    pts.push(new THREE.Vector2(0.28, 1.82));
    return pts;
  }, []);

  // Generate head profile points (hooded part)
  const headPoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0.28, 1.82));
    pts.push(new THREE.Vector2(0.38, 2.0));
    pts.push(new THREE.Vector2(0.41, 2.22));
    pts.push(new THREE.Vector2(0.36, 2.45));
    pts.push(new THREE.Vector2(0.24, 2.65));
    pts.push(new THREE.Vector2(0.06, 2.75));
    return pts;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Spring-based entrance drop
    if (!isSettled.current) {
      if (t > delay) {
        const k = 90;
        const c = 9.5;
        const diff = 0 - currentY.current;
        const force = diff * k;
        velocityY.current += (force - velocityY.current * c) * delta;
        currentY.current += velocityY.current * delta;

        if (Math.abs(diff) < 0.005 && Math.abs(velocityY.current) < 0.005) {
          currentY.current = 0;
          isSettled.current = true;
        }
      }
    }

    // 2. Idle Bobbing & tilting
    const bob = Math.sin(t * 1.6 + 1.0) * 0.05;
    const tiltZ = Math.sin(t * 0.8 + 1.0) * 0.015;
    const tiltX = Math.cos(t * 0.6 + 1.0) * 0.01;
    groupRef.current.position.y = currentY.current + bob;
    groupRef.current.rotation.z = tiltZ;
    groupRef.current.rotation.x = tiltX;

    // 3. Blinking logic (specifically sleepy blinking)
    blinkTimer.current -= delta;
    let lidScaleY = 1.0;
    if (blinkTimer.current <= 0) {
      const progress = Math.abs(blinkTimer.current) / blinkDuration;
      if (progress >= 1.0) {
        blinkTimer.current = Math.random() * 5 + 4;
      } else {
        // scale lids to cover eyes completely
        lidScaleY = 1.0 + 0.9 * Math.sin(progress * Math.PI);
      }
    }
    if (eyeLidsRef.current) {
      eyeLidsRef.current.scale.y = lidScaleY;
    }
  });

  const woodMaterial = (
    <meshStandardMaterial
      map={wood.map}
      roughnessMap={wood.roughnessMap}
      bumpMap={wood.bumpMap}
      bumpScale={0.006}
      roughness={0.12}
      metalness={0.05}
    />
  );

  return (
    <group ref={groupRef} position={[-2.6, 6, -1.0]}>
      {/* 360-degree Lower Body */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[bodyPoints, 32]} />
        {woodMaterial}
      </mesh>

      {/* Hood Cowl Left Half (from phi = Math.PI * 1.06 to 1.94 PI) */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[headPoints, 24, Math.PI * 1.05, Math.PI * 0.90]} />
        {woodMaterial}
      </mesh>

      {/* Hood Cowl Right Half (from phi = 0.05 PI to 0.95 PI) */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[headPoints, 24, Math.PI * 0.05, Math.PI * 0.90]} />
        {woodMaterial}
      </mesh>

      {/* Top sphere finial of the hood cowl */}
      <mesh castShadow receiveShadow position={[0, 2.82, 0]}>
        <sphereGeometry args={[0.075, 12, 12]} />
        {woodMaterial}
      </mesh>

      {/* 
        Dark Recessed Inner Head Chamber
        Provides the dark backing for the vertical slot.
      */}
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.8, 16]} />
        <meshStandardMaterial color="#1a0f0a" roughness={0.8} />
      </mesh>

      {/* Peering Sleepy Eyes Group inside the slit */}
      <group position={[0, 2.22, 0.16]}>
        {/* Left Eye */}
        <group position={[-0.08, 0, 0.06]}>
          {/* White Sclera */}
          <mesh>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color="#eee8e2" roughness={0.5} />
          </mesh>
          {/* Sleepy half-closed pupil */}
          <mesh position={[0.005, -0.01, 0.045]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.1} />
          </mesh>
          {/* Catchlight */}
          <mesh position={[0.015, 0.005, 0.075]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.08, 0, 0.06]}>
          {/* White Sclera */}
          <mesh>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color="#eee8e2" roughness={0.5} />
          </mesh>
          {/* Sleepy half-closed pupil */}
          <mesh position={[-0.005, -0.01, 0.045]}>
            <sphereGeometry args={[0.038, 8, 8]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.1} />
          </mesh>
          {/* Catchlight */}
          <mesh position={[-0.015, 0.005, 0.075]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* 
          Sleepy Eyelids Hood (scales down to blink)
          Drawn as two dark planes representing heavy lids.
        */}
        <group ref={eyeLidsRef} position={[0, 0.04, 0.08]}>
          <mesh position={[-0.08, 0, 0]}>
            <boxGeometry args={[0.13, 0.05, 0.02]} />
            {woodMaterial}
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.13, 0.05, 0.02]} />
            {woodMaterial}
          </mesh>
        </group>
      </group>
    </group>
  );
}
