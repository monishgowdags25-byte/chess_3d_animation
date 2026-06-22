import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Pawn({ wood, isLocked }) {
  const groupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const pupilLeftRef = useRef();
  const pupilRightRef = useRef();

  // Spring entrance animation variables
  const currentY = useRef(6);
  const velocityY = useRef(0);
  const isSettled = useRef(false);
  const delay = 0.8; // Last to drop

  // Blinking state
  const blinkTimer = useRef(Math.random() * 3 + 2.2);
  const blinkDuration = 0.15;

  // Eye movement state
  const eyeMoveTimer = useRef(Math.random() * 2 + 1.2);
  const targetEyeRotation = useRef({ x: 0, y: 0 });
  const currentEyeRotation = useRef({ x: 0, y: 0 });

  // Generate Pawn Lathe base points (up to collar)
  const basePoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0.001, 0));
    pts.push(new THREE.Vector2(0.44, 0));
    pts.push(new THREE.Vector2(0.44, 0.08));
    pts.push(new THREE.Vector2(0.38, 0.12));
    pts.push(new THREE.Vector2(0.34, 0.16));
    pts.push(new THREE.Vector2(0.36, 0.24));
    pts.push(new THREE.Vector2(0.30, 0.30));
    
    // Stem
    pts.push(new THREE.Vector2(0.18, 0.55));
    pts.push(new THREE.Vector2(0.15, 0.85));
    pts.push(new THREE.Vector2(0.16, 1.05));
    
    // Collar ring
    pts.push(new THREE.Vector2(0.30, 1.15));
    pts.push(new THREE.Vector2(0.32, 1.23));
    pts.push(new THREE.Vector2(0.20, 1.28));
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
    const bob = Math.sin(t * 1.6 + 2.0) * 0.05;
    const tiltZ = Math.sin(t * 0.8 + 2.0) * 0.015;
    const tiltX = Math.cos(t * 0.6 + 2.0) * 0.01;
    groupRef.current.position.y = currentY.current + bob;
    groupRef.current.rotation.z = tiltZ;
    groupRef.current.rotation.x = tiltX;

    // 3. Blinking logic (close eyes when isLocked is active)
    blinkTimer.current -= delta;
    let eyeScaleY = 1.0;
    if (isLocked) {
      eyeScaleY = 0.05; // Closed eyes!
    } else if (blinkTimer.current <= 0) {
      const progress = Math.abs(blinkTimer.current) / blinkDuration;
      if (progress >= 1.0) {
        blinkTimer.current = Math.random() * 4 + 3.2;
      } else {
        eyeScaleY = 0.05 + 0.95 * Math.sin(progress * Math.PI);
      }
    }
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
    }

    // 4. Eye movement tracking the mouse pointer smoothly
    const targetX = state.pointer.x * 0.035;
    const targetY = state.pointer.y * 0.025;
    
    currentEyeRotation.current.x += (targetX - currentEyeRotation.current.x) * 0.15;
    currentEyeRotation.current.y += (targetY - currentEyeRotation.current.y) * 0.15;
    
    if (pupilLeftRef.current && pupilRightRef.current) {
      pupilLeftRef.current.position.x = currentEyeRotation.current.x;
      pupilLeftRef.current.position.y = currentEyeRotation.current.y;
      pupilRightRef.current.position.x = currentEyeRotation.current.x;
      pupilRightRef.current.position.y = currentEyeRotation.current.y;
    }
  });

  const woodMaterial = (
    <meshStandardMaterial
      map={wood.map}
      roughnessMap={wood.roughnessMap}
      bumpMap={wood.bumpMap}
      bumpScale={0.005}
      roughness={0.15}
      metalness={0.05}
    />
  );

  return (
    <group ref={groupRef} position={[0.8, 6, 1.3]}>
      {/* Lathe Base */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[basePoints, 32]} />
        {woodMaterial}
      </mesh>

      {/* Sphere Head */}
      <mesh castShadow receiveShadow position={[0, 1.58, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        {woodMaterial}
      </mesh>

      {/* Facial Features Group (centered on head Y = 1.58, looking +Z) */}
      <group position={[0, 1.58, 0.23]}>
        {/* Left Eye */}
        <group ref={leftEyeRef} position={[-0.09, 0.03, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color="#0b0b0b" roughness={0.02} />
          </mesh>
          <group ref={pupilLeftRef}>
            <mesh position={[0.015, 0.015, 0.055]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.01, -0.01, 0.06]}>
              <sphereGeometry args={[0.009, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Right Eye */}
        <group ref={rightEyeRef} position={[0.09, 0.03, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial color="#0b0b0b" roughness={0.02} />
          </mesh>
          <group ref={pupilRightRef}>
            <mesh position={[0.015, 0.015, 0.055]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.01, -0.01, 0.06]}>
              <sphereGeometry args={[0.009, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Smiling Mouth */}
        <mesh position={[0, -0.07, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.055, 0.012, 8, 24, Math.PI * 0.95]} />
          <meshStandardMaterial color="#2d1910" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
