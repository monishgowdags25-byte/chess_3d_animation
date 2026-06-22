import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Queen({ wood, position = [-1.4, 0, 0.5] }) {
  const groupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const pupilLeftRef = useRef();
  const pupilRightRef = useRef();

  // Spring entrance animation variables
  const currentY = useRef(6);
  const velocityY = useRef(0);
  const isSettled = useRef(false);
  const delay = 0.2; // Staggered drop after King

  // Blinking state
  const blinkTimer = useRef(Math.random() * 3 + 2.5);
  const blinkDuration = 0.15;

  // Eye movement state
  const eyeMoveTimer = useRef(Math.random() * 2 + 1.5);
  const targetEyeRotation = useRef({ x: 0, y: 0 });
  const currentEyeRotation = useRef({ x: 0, y: 0 });

  // Generate Queen Lathe profile points
  const points = useMemo(() => {
    const pts = [];
    // Base
    pts.push(new THREE.Vector2(0.001, 0));
    pts.push(new THREE.Vector2(0.52, 0));
    pts.push(new THREE.Vector2(0.52, 0.10));
    pts.push(new THREE.Vector2(0.44, 0.16));
    pts.push(new THREE.Vector2(0.40, 0.20));
    pts.push(new THREE.Vector2(0.42, 0.28));
    pts.push(new THREE.Vector2(0.36, 0.34));
    
    // Stem (slighter/curvier than king)
    pts.push(new THREE.Vector2(0.20, 0.7));
    pts.push(new THREE.Vector2(0.17, 1.2));
    pts.push(new THREE.Vector2(0.19, 1.6));
    
    // Collar
    pts.push(new THREE.Vector2(0.40, 1.85));
    pts.push(new THREE.Vector2(0.42, 1.95));
    pts.push(new THREE.Vector2(0.28, 2.05));
    
    // Head bowl
    pts.push(new THREE.Vector2(0.38, 2.25));
    pts.push(new THREE.Vector2(0.38, 2.52));
    pts.push(new THREE.Vector2(0.24, 2.70));
    pts.push(new THREE.Vector2(0.001, 2.72));
    return pts;
  }, []);

  // Lathe points for the flared crown collar
  const crownPoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0.16, 2.70));
    pts.push(new THREE.Vector2(0.36, 3.02));
    pts.push(new THREE.Vector2(0.33, 3.05));
    pts.push(new THREE.Vector2(0.14, 2.73));
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

    // 2. Idle Bobbing & tilting (out of phase with King)
    const bob = Math.sin(t * 1.6 + 0.5) * 0.05;
    const tiltZ = Math.sin(t * 0.8 + 0.5) * 0.015;
    const tiltX = Math.cos(t * 0.6 + 0.5) * 0.01;
    groupRef.current.position.y = currentY.current + bob;
    groupRef.current.rotation.z = tiltZ;
    groupRef.current.rotation.x = tiltX;

    // 3. Blinking logic
    blinkTimer.current -= delta;
    let eyeScaleY = 1.0;
    if (blinkTimer.current <= 0) {
      const progress = Math.abs(blinkTimer.current) / blinkDuration;
      if (progress >= 1.0) {
        blinkTimer.current = Math.random() * 4 + 3.5;
      } else {
        eyeScaleY = 0.05 + 0.95 * Math.sin(progress * Math.PI);
      }
    }
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
    }

    // 4. Eye movement (follows pupil looking around)
    eyeMoveTimer.current -= delta;
    if (eyeMoveTimer.current <= 0) {
      eyeMoveTimer.current = Math.random() * 3 + 2;
      targetEyeRotation.current = {
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.12,
      };
    }
    currentEyeRotation.current.x += (targetEyeRotation.current.x - currentEyeRotation.current.x) * 0.1;
    currentEyeRotation.current.y += (targetEyeRotation.current.y - currentEyeRotation.current.y) * 0.1;
    
    if (pupilLeftRef.current && pupilRightRef.current) {
      pupilLeftRef.current.position.x = currentEyeRotation.current.y;
      pupilLeftRef.current.position.y = currentEyeRotation.current.x;
      pupilRightRef.current.position.x = currentEyeRotation.current.y;
      pupilRightRef.current.position.y = currentEyeRotation.current.x;
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

  // Spikes for the crown
  const crownSpikes = useMemo(() => {
    const spikes = [];
    const count = 7;
    const radius = 0.345;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      spikes.push(
        <group key={i} position={[x, 3.03, z]} rotation={[0, -angle, 0.15]}>
          <mesh castShadow receiveShadow>
            <coneGeometry args={[0.04, 0.10, 6]} />
            {woodMaterial}
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            {woodMaterial}
          </mesh>
        </group>
      );
    }
    return spikes;
  }, [woodMaterial]);

  return (
    <group ref={groupRef} position={position}>
      {/* Queen Base and Head */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 32]} />
        {woodMaterial}
      </mesh>

      {/* Flared Crown Rim */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[crownPoints, 32]} />
        {woodMaterial}
      </mesh>

      {/* Crown Spikes */}
      {crownSpikes}

      {/* Center Crown Jewel Sphere */}
      <mesh castShadow receiveShadow position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        {woodMaterial}
      </mesh>

      {/* Facial Features Group */}
      <group position={[0, 2.38, 0.32]}>
        {/* Left Eye */}
        <group ref={leftEyeRef} position={[-0.14, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#0b0b0b" roughness={0.02} />
          </mesh>
          <group ref={pupilLeftRef}>
            <mesh position={[0.025, 0.025, 0.075]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.015, -0.015, 0.082]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Right Eye */}
        <group ref={rightEyeRef} position={[0.14, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#0b0b0b" roughness={0.02} />
          </mesh>
          <group ref={pupilRightRef}>
            <mesh position={[0.025, 0.025, 0.075]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.015, -0.015, 0.082]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Blushing Pink Cheeks under eyes */}
        <mesh position={[-0.20, -0.09, -0.02]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#ffa8b8" roughness={0.9} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.20, -0.09, -0.02]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#ffa8b8" roughness={0.9} transparent opacity={0.8} />
        </mesh>

        {/* Smiling Mouth */}
        <mesh position={[0, -0.12, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.07, 0.015, 8, 24, Math.PI * 0.95]} />
          <meshStandardMaterial color="#2d1910" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
