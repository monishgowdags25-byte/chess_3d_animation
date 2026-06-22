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
import piecesHd from './assets/pieces_hd.png';

export default function App() {
  const { darkWood, lightWood } = useWoodTextures();
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'
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

      {/* 3D Render View */}
      {viewMode === '3d' && (
        <div className="canvas-wrapper animate-fade-in">
          <Canvas
            shadows
            camera={{ position: [-1.8, 2.5, 5.8], fov: 42 }}
          >
            <color attach="background" args={["#e4ded5"]} />
            <fog attach="fog" args={["#e4ded5", 8, 16]} />
            <Lighting />
            <group key={animationKey} position={[0, -0.2, 0]}>
              <ChessBoard darkWood={darkWood} lightWood={lightWood} />
              <King wood={darkWood} />
              <Queen wood={lightWood} />
              <Bishop wood={darkWood} />
              <Knight wood={darkWood} />
              <Pawn wood={lightWood} />
            </group>
            <Environment />
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              target={[0, 1.0, 0]}
              maxPolarAngle={Math.PI / 2.08}
              minDistance={2.8}
              maxDistance={9}
            />
            <EffectComposer>
              <DepthOfField
                target={[0, 1.0, 0]}
                focalLength={0.32}
                bokehScale={3.5}
              />
              <Bloom
                intensity={0.4}
                luminanceThreshold={0.85}
                luminanceSmoothing={0.9}
              />
            </EffectComposer>
          </Canvas>
        </div>
      )}

      {/* 2D High-Definition Art Gallery View */}
      {viewMode === '2d' && (
        <div className="hd-gallery-wrapper animate-fade-in">
          <div className="hd-image-frame">
            <img src={piecesHd} alt="Cute Chess Mates HD" className="hd-image" />
            
            {/* Interactive Hotspots pointing to the characters in the HD image */}
            {/* Bishop (Far Left) */}
            <button 
              className={`hotspot-btn ${selectedPiece === 'bishop' ? 'active' : ''}`}
              style={{ left: '20%', top: '56%' }}
              onClick={() => setSelectedPiece('bishop')}
              title="Select Bishop"
            >
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </button>

            {/* Queen (Left Center) */}
            <button 
              className={`hotspot-btn ${selectedPiece === 'queen' ? 'active' : ''}`}
              style={{ left: '35%', top: '60%' }}
              onClick={() => setSelectedPiece('queen')}
              title="Select Queen"
            >
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </button>

            {/* King (Center) */}
            <button 
              className={`hotspot-btn ${selectedPiece === 'king' ? 'active' : ''}`}
              style={{ left: '50%', top: '44%' }}
              onClick={() => setSelectedPiece('king')}
              title="Select King"
            >
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </button>

            {/* Pawn (Front Right) */}
            <button 
              className={`hotspot-btn ${selectedPiece === 'pawn' ? 'active' : ''}`}
              style={{ left: '63%', top: '74%' }}
              onClick={() => setSelectedPiece('pawn')}
              title="Select Pawn"
            >
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </button>

            {/* Knight (Far Right) */}
            <button 
              className={`hotspot-btn ${selectedPiece === 'knight' ? 'active' : ''}`}
              style={{ left: '79%', top: '55%' }}
              onClick={() => setSelectedPiece('knight')}
              title="Select Knight"
            >
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </button>
          </div>
        </div>
      )}

      {/* Header UI Overlay */}
      <header className="app-header">
        <div className="header-badge">3D Character Showcase</div>
        <h1>Chess Mates</h1>
        <p>An interactive Pixar-style 3D recreation of chess pieces built with React Three Fiber.</p>

        {/* View Toggle Buttons */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === '3d' ? 'active' : ''}`}
            onClick={() => setViewMode('3d')}
          >
            3D Interactive
          </button>
          <button 
            className={`toggle-btn ${viewMode === '2d' ? 'active' : ''}`}
            onClick={() => setViewMode('2d')}
          >
            2D Ultra-HD Art
          </button>
        </div>
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
          {viewMode === '3d' ? (
            <button className="btn-primary" onClick={triggerReset}>
              Replay Drop Intro 💫
            </button>
          ) : (
            <div className="gallery-tag">Ultra-HD Art Mode</div>
          )}
          <p className="hint-text">
            {viewMode === '3d' 
              ? 'Drag to rotate the camera. Pinch/scroll to zoom.' 
              : 'Click the glowing hotspots to inspect individual characters.'}
          </p>
        </div>
      </div>
    </main>
  );
}
