import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, DepthOfField, Bloom } from '@react-three/postprocessing';
import { useWoodTextures } from './components/ProceduralWood';
import ChessBoard from './components/ChessBoard';
import King from './components/King';
import Queen from './components/Queen';
import Bishop from './components/Bishop';
import Knight from './components/Knight';
import Pawn from './components/Pawn';
import Lighting from './components/Lighting';
import Environment from './components/Environment';
import confetti from 'canvas-confetti';

export default function App() {
  const { darkWood, lightWood } = useWoodTextures();
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState('king');

  const triggerReset = () => {
    setAnimationKey(prev => prev + 1);
    
    // Play a mini confetti pop for celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#cb997e', '#ddbea9', '#ffe8d6', '#6b5b52'],
    });
  };

  const characterDescriptions = {
    king: {
      name: 'The King (Arthur)',
      personality: 'Leader of the court. Majestic, warm, and highly polished. Has a big heart and a friendly smile, standing tall at the center of the board.',
      wood: 'Rich Varnished Mahogany (Dark Wood)',
    },
    queen: {
      name: 'The Queen (Gwen)',
      personality: 'Graceful and bright. Adorned with a delicate pointed crown, she has rosy blushing cheeks and coordinates the strategy with elegance.',
      wood: 'Lacquered Soft Maple (Light Wood)',
    },
    bishop: {
      name: 'The Bishop (Barnaby)',
      personality: 'The quiet philosopher. Hooded under a split cowl, he peers out sleepily and thoughtfully from the shadows, analyzing the field.',
      wood: 'Rich Varnished Mahogany (Dark Wood)',
    },
    knight: {
      name: 'The Knight (Barnaby)',
      personality: 'The energetic scout. A spirited horse character looking around with wide-eyed curiosity, ready to leap over obstacles at any moment.',
      wood: 'Rich Varnished Mahogany (Dark Wood)',
    },
    pawn: {
      name: 'The Pawn (Pip)',
      personality: 'The cheerful rookie. The smallest piece on the board, but overflowing with optimism and a wide, friendly grin. He always takes things one step at a time.',
      wood: 'Lacquered Soft Maple (Light Wood)',
    }
  };

  return (
    <main className="app-container">
      {/* Background Subtle Gradient overlay */}
      <div className="bg-gradient" />

      {/* R3F Canvas for the 3D Render */}
      <div className="canvas-wrapper">
        <Canvas
          shadows
          camera={{ position: [-1.8, 2.5, 5.8], fov: 42 }}
        >
          {/* Neutral Warm Studio Background Color */}
          <color attach="background" args={["#e4ded5"]} />
          
          {/* Soft fog to blend the board edges into the background */}
          <fog attach="fog" args={["#e4ded5", 8, 16]} />

          {/* Lighting Rig */}
          <Lighting />

          {/* Dynamic 3D Scene content (keyed to reset animations) */}
          <group key={animationKey} position={[0, -0.2, 0]}>
            <ChessBoard darkWood={darkWood} lightWood={lightWood} />
            <King wood={darkWood} />
            <Queen wood={lightWood} />
            <Bishop wood={darkWood} />
            <Knight wood={darkWood} />
            <Pawn wood={lightWood} />
          </group>

          {/* Sparkles / Dust and HDR reflections */}
          <Environment />

          {/* 
            Orbit Controls: 
            User can rotate/pan around, focused on the King's torso height.
            Damping is active for premium smooth inertia.
          */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            target={[0, 1.0, 0]}
            maxPolarAngle={Math.PI / 2.08} // Prevent camera going below the board
            minDistance={2.8}
            maxDistance={9}
          />

          {/* Cinematic Depth of Field and Bloom for Sunlight Glow */}
          <EffectComposer>
            <DepthOfField
              target={[0, 1.0, 0]} // Focus on the King
              focalLength={0.32}     // Shallow depth of field
              bokehScale={3.5}       // Beautiful bokeh blur size
            />
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Header UI Overlay */}
      <header className="app-header">
        <div className="header-badge">3D Character Showcase</div>
        <h1>Chess Mates</h1>
        <p>An interactive Pixar-style 3D recreation of chess pieces built with React Three Fiber.</p>
      </header>

      {/* Interactive Control & Info Panel */}
      <div className="glass-panel info-panel">
        <div className="character-tabs">
          {Object.keys(characterDescriptions).map((key) => (
            <button
              key={key}
              className={`tab-btn ${selectedPiece === key ? 'active' : ''}`}
              onClick={() => setSelectedPiece(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="character-info">
          <h3>{characterDescriptions[selectedPiece].name}</h3>
          <p className="personality-text">{characterDescriptions[selectedPiece].personality}</p>
          <div className="wood-spec">
            <span className="spec-label">Material Spec: </span>
            <span className="spec-value">{characterDescriptions[selectedPiece].wood}</span>
          </div>
        </div>

        <div className="action-row">
          <button className="btn-primary" onClick={triggerReset}>
            Replay Drop Intro 💫
          </button>
          <p className="hint-text">Drag to rotate the camera. Pinch/scroll to zoom.</p>
        </div>
      </div>
    </main>
  );
}
