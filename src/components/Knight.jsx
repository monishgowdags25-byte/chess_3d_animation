import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Knight({ wood }) {
  const groupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const pupilLeftRef = useRef();
  const pupilRightRef = useRef();

  // Spring entrance animation variables
  const currentY = useRef(6);
  const velocityY = useRef(0);
  const isSettled = useRef(false);
  const delay = 0.6; // Staggered drop

  // Blinking state
  const blinkTimer = useRef(Math.random() * 3 + 2.8);
  const blinkDuration = 0.15;

  // Eye movement state
  const eyeMoveTimer = useRef(Math.random() * 2 + 2);
  const targetEyeRotation = useRef({ x: 0, y: 0 });
  const currentEyeRotation = useRef({ x: 0, y: 0 });

  // Generate Knight Lathe base points (up to mid-stem)
  const basePoints = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0.001, 0));
    pts.push(new THREE.Vector2(0.52, 0));
    pts.push(new THREE.Vector2(0.52, 0.10));
    pts.push(new THREE.Vector2(0.46, 0.15));
    pts.push(new THREE.Vector2(0.42, 0.20));
    pts.push(new THREE.Vector2(0.44, 0.32));
    pts.push(new THREE.Vector2(0.35, 0.45));
    pts.push(new THREE.Vector2(0.32, 0.50));
    pts.push(new THREE.Vector2(0.001, 0.52));
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
    const bob = Math.sin(t * 1.6 + 1.5) * 0.05;
    const tiltZ = Math.sin(t * 0.8 + 1.5) * 0.015;
    const tiltX = Math.cos(t * 0.6 + 1.5) * 0.01;
    groupRef.current.position.y = currentY.current + bob;
    groupRef.current.rotation.z = tiltZ;
    groupRef.current.rotation.x = tiltX;

    // 3. Blinking logic
    blinkTimer.current -= delta;
    let eyeScaleY = 1.0;
    if (blinkTimer.current <= 0) {
      const progress = Math.abs(blinkTimer.current) / blinkDuration;
      if (progress >= 1.0) {
        blinkTimer.current = Math.random() * 4 + 3.8;
      } else {
        eyeScaleY = 0.05 + 0.95 * Math.sin(progress * Math.PI);
      }
    }
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
    }

    // 4. Eye movement tracking the mouse pointer smoothly
    const targetX = state.pointer.x * 0.024;
    const targetY = state.pointer.y * 0.016;
    
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
      bumpScale={0.006}
      roughness={0.12}
      metalness={0.05}
    />
  );

  return (
    <group ref={groupRef} position={[1.6, 6, -0.4]}>
      {/* 360-degree Lower Base */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[basePoints, 32]} />
        {woodMaterial}
      </mesh>

      {/* Horse Neck */}
      <mesh castShadow receiveShadow position={[0, 0.78, -0.06]} rotation={[0.18, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 0.64, 16]} />
        {woodMaterial}
      </mesh>

      {/* Horse Head Skull Sphere */}
      <mesh castShadow receiveShadow position={[0, 1.25, -0.04]}>
        <sphereGeometry args={[0.30, 16, 16]} />
        {woodMaterial}
      </mesh>

      {/* Cheek Bulges */}
      <mesh castShadow position={[-0.14, 1.22, -0.02]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        {woodMaterial}
      </mesh>
      <mesh castShadow position={[0.14, 1.22, -0.02]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        {woodMaterial}
      </mesh>

      {/* Sloping Snout/Muzzle */}
      <group position={[0, 1.16, 0.20]} rotation={[0.34, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.14, 0.18, 0.44, 16]} />
          {woodMaterial}
        </mesh>
        {/* Soft rounded nose tip */}
        <mesh castShadow position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.145, 16, 16]} />
          {woodMaterial}
        </mesh>
      </group>

      {/* Nostril indentations */}
      <mesh position={[-0.07, 1.03, 0.38]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#2d1910" roughness={0.8} />
      </mesh>
      <mesh position={[0.07, 1.03, 0.38]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#2d1910" roughness={0.8} />
      </mesh>

      {/* Stylized mane on the back of neck */}
      <group>
        <mesh castShadow position={[0, 0.95, -0.25]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.08, 0.55, 0.20]} />
          {woodMaterial}
        </mesh>
        <mesh castShadow position={[0, 1.30, -0.26]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.08, 0.45, 0.18]} />
          {woodMaterial}
        </mesh>
      </group>

      {/* Pointy Ears */}
      <mesh castShadow position={[-0.10, 1.54, -0.12]} rotation={[-0.2, 0.1, -0.15]}>
        <coneGeometry args={[0.05, 0.22, 5]} />
        {woodMaterial}
      </mesh>
      <mesh castShadow position={[0.10, 1.54, -0.12]} rotation={[-0.2, -0.1, 0.15]}>
        <coneGeometry args={[0.05, 0.22, 5]} />
        {woodMaterial}
      </mesh>

      {/* Mouth curve details */}
      <mesh position={[0, 0.92, 0.31]} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[0.10, 0.015, 8, 12, Math.PI * 0.4]} />
        <meshStandardMaterial color="#2d1910" roughness={0.6} />
      </mesh>

      {/* Eyes placed on the sides of the horse head looking forward/sideways */}
      {/* Left Eye */}
      <group ref={leftEyeRef} position={[-0.20, 1.30, 0.11]} rotation={[0.0, -0.35, 0]}>
        {/* Eye White */}
        <mesh castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#eee8e2" roughness={0.5} />
        </mesh>
        {/* Pupil */}
        <group ref={pupilLeftRef}>
          <mesh position={[0.0, 0.0, 0.055]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.1} />
          </mesh>
          <mesh position={[0.015, 0.015, 0.092]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        {/* Eyebrow Arch */}
        <mesh position={[0, 0.11, 0.02]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.11, 0.022, 0.02]} />
          <meshStandardMaterial color="#2d1910" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Eye */}
      <group ref={rightEyeRef} position={[0.20, 1.30, 0.11]} rotation={[0.0, 0.35, 0]}>
        {/* Eye White */}
        <mesh castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#eee8e2" roughness={0.5} />
        </mesh>
        {/* Pupil */}
        <group ref={pupilRightRef}>
          <mesh position={[0.0, 0.0, 0.055]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.1} />
          </mesh>
          <mesh position={[-0.015, 0.015, 0.092]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        {/* Eyebrow Arch */}
        <mesh position={[0, 0.11, 0.02]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.11, 0.022, 0.02]} />
          <meshStandardMaterial color="#2d1910" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
