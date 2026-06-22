import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function King({ wood }) {
  const groupRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const pupilLeftRef = useRef();
  const pupilRightRef = useRef();

  // Spring entrance animation variables
  const currentY = useRef(6);
  const velocityY = useRef(0);
  const isSettled = useRef(false);
  const delay = 0.0; // King drops first

  // Blinking state
  const blinkTimer = useRef(Math.random() * 3 + 2);
  const blinkDuration = 0.15;

  // Eye movement state
  const eyeMoveTimer = useRef(Math.random() * 2 + 1);
  const targetEyeRotation = useRef({ x: 0, y: 0 });
  const currentEyeRotation = useRef({ x: 0, y: 0 });

  // Generate King Lathe profile points
  const points = useMemo(() => {
    const pts = [];
    // Base rim
    pts.push(new THREE.Vector2(0.001, 0));
    pts.push(new THREE.Vector2(0.60, 0));
    pts.push(new THREE.Vector2(0.60, 0.12));
    pts.push(new THREE.Vector2(0.52, 0.18));
    pts.push(new THREE.Vector2(0.48, 0.22));
    pts.push(new THREE.Vector2(0.50, 0.32));
    pts.push(new THREE.Vector2(0.44, 0.38));
    
    // Stem
    pts.push(new THREE.Vector2(0.26, 0.8));
    pts.push(new THREE.Vector2(0.22, 1.3));
    pts.push(new THREE.Vector2(0.24, 1.8));
    
    // Upper Collar
    pts.push(new THREE.Vector2(0.48, 2.0));
    pts.push(new THREE.Vector2(0.50, 2.15));
    pts.push(new THREE.Vector2(0.38, 2.25));
    
    // Head bowl
    pts.push(new THREE.Vector2(0.46, 2.45));
    pts.push(new THREE.Vector2(0.48, 2.75));
    pts.push(new THREE.Vector2(0.30, 2.95));
    pts.push(new THREE.Vector2(0.001, 2.98));
    return pts;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Spring-based entrance drop
    if (!isSettled.current) {
      if (t > delay) {
        const k = 90; // stiffness
        const c = 9.5;  // damping
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
    const bob = Math.sin(t * 1.6) * 0.05;
    const tiltZ = Math.sin(t * 0.8) * 0.015;
    const tiltX = Math.cos(t * 0.6) * 0.01;
    groupRef.current.position.y = currentY.current + bob;
    groupRef.current.rotation.z = tiltZ;
    groupRef.current.rotation.x = tiltX;

    // 3. Blinking logic
    blinkTimer.current -= delta;
    let eyeScaleY = 1.0;
    if (blinkTimer.current <= 0) {
      const progress = Math.abs(blinkTimer.current) / blinkDuration;
      if (progress >= 1.0) {
        blinkTimer.current = Math.random() * 4 + 3; // Reset
      } else {
        eyeScaleY = 0.05 + 0.95 * Math.sin(progress * Math.PI);
      }
    }
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY;
      rightEyeRef.current.scale.y = eyeScaleY;
    }

    // 4. Subtle eye movement (pupils looking around)
    eyeMoveTimer.current -= delta;
    if (eyeMoveTimer.current <= 0) {
      eyeMoveTimer.current = Math.random() * 3 + 2;
      targetEyeRotation.current = {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.15,
      };
    }
    // Interpolate eye rotation
    currentEyeRotation.current.x += (targetEyeRotation.current.x - currentEyeRotation.current.x) * 0.1;
    currentEyeRotation.current.y += (targetEyeRotation.current.y - currentEyeRotation.current.y) * 0.1;
    
    if (pupilLeftRef.current && pupilRightRef.current) {
      pupilLeftRef.current.position.x = currentEyeRotation.current.y;
      pupilLeftRef.current.position.y = currentEyeRotation.current.x;
      pupilRightRef.current.position.x = currentEyeRotation.current.y;
      pupilRightRef.current.position.y = currentEyeRotation.current.x;
    }
  });

  // Share wood material properties
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
    <group ref={groupRef} position={[0, 6, 0]}>
      {/* Main King Body Lathe */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 32]} />
        {woodMaterial}
      </mesh>

      {/* Cross Finial on top of the head */}
      <group position={[0, 3.25, 0]}>
        {/* Base of Cross */}
        <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.15, 12]} />
          {woodMaterial}
        </mesh>
        {/* Vertical Post */}
        <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.13, 0.38, 0.11]} />
          {woodMaterial}
        </mesh>
        {/* Horizontal Bar */}
        <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
          <boxGeometry args={[0.34, 0.12, 0.11]} />
          {woodMaterial}
        </mesh>
      </group>

      {/* Facial Features Group */}
      {/* Eyes placed on the head bulge (around Y = 2.6, looking forward +Z) */}
      <group position={[0, 2.58, 0.40]}>
        {/* Left Eye */}
        <group ref={leftEyeRef} position={[-0.17, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#0b0b0b" roughness={0.02} />
          </mesh>
          {/* Pupil Catchlights */}
          <group ref={pupilLeftRef}>
            <mesh position={[0.03, 0.03, 0.09]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.02, -0.02, 0.10]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Right Eye */}
        <group ref={rightEyeRef} position={[0.17, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#0b0b0b" roughness={0.02} />
          </mesh>
          {/* Pupil Catchlights */}
          <group ref={pupilRightRef}>
            <mesh position={[0.03, 0.03, 0.09]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.02, -0.02, 0.10]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>

        {/* Eyebrows */}
        <mesh position={[-0.17, 0.16, -0.02]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.12, 0.025, 0.02]} />
          <meshStandardMaterial color="#2d1910" roughness={0.6} />
        </mesh>
        <mesh position={[0.17, 0.16, -0.02]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.12, 0.025, 0.02]} />
          <meshStandardMaterial color="#2d1910" roughness={0.6} />
        </mesh>

        {/* Smile (Torus) */}
        <mesh position={[0, -0.18, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.10, 0.018, 8, 24, Math.PI * 0.9]} />
          <meshStandardMaterial color="#2d1910" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
