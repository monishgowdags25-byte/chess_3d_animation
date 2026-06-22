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

// Import individual high-definition piece images
import kingHd from './assets/king_hd.png';
import queenHd from './assets/queen_hd.png';
import bishopHd from './assets/bishop_hd.png';
import knightHd from './assets/knight_hd.png';
import pawnHd from './assets/pawn_hd.png';

export default function App() {
  const { darkWood, lightWood } = useWoodTextures();
  const [viewMode, setViewMode] = useState('3d'); // Default to 3D to showcase the live interaction
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState('king');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const piecesList = ['king', 'queen', 'bishop', 'knight', 'pawn'];

  const pieceImages = {
    king: kingHd,
    queen: queenHd,
    bishop: bishopHd,
    knight: knightHd,
    pawn: pawnHd,
  };

  const handlePrevPiece = () => {
    const currentIndex = piecesList.indexOf(selectedPiece);
    const prevIndex = (currentIndex - 1 + piecesList.length) % piecesList.length;
    setSelectedPiece(piecesList[prevIndex]);
  };

  const handleNextPiece = () => {
    const currentIndex = piecesList.indexOf(selectedPiece);
    const nextIndex = (currentIndex + 1) % piecesList.length;
    setSelectedPiece(piecesList[nextIndex]);
  };

  const triggerReset = () => {
    setAnimationKey(prev => prev + 1);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoggedIn(true);

    // Full screen confetti burst on login success!
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#cb997e', '#ddbea9', '#ffe8d6', '#6b5b52', '#b07d62'],
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  const characterDescriptions = {
    king: {
      name: 'King Arthur',
      tagline: 'The Noble Guardian',
      desc: 'Arthur stands tall at the center, ensuring the court remains safe and organized.',
    },
    queen: {
      name: 'Queen Gwen',
      tagline: 'The Brilliant Tactician',
      desc: 'Gwen coordinates moves with speed and elegance across the board.',
    },
    bishop: {
      name: 'Bishop Barnaby',
      tagline: 'The Wise Mystic',
      desc: 'Barnaby observes from the wings, shielding passwords with a hood.',
    },
    knight: {
      name: 'Knight Buster',
      tagline: 'The Swift Scout',
      desc: 'Buster leaps past barriers to secure the perimeter with sharp alert eyes.',
    },
    pawn: {
      name: 'Pawn Pip',
      tagline: 'The Optimistic Helper',
      desc: 'Pip welcomes all travelers with a cheerful grin, taking things step by step.',
    }
  };

  return (
    <main className="app-container split-screen">
      {/* Background Subtle Gradient overlay */}
      <div className="bg-gradient" />

      {/* LEFT PANEL: Login Form Interface */}
      <section className="login-side-panel">
        <header className="login-header">
          <div className="logo-badge">🛡️ Chess Portal</div>
          <h1>CHESS MATES</h1>
          <p className="subtitle">Enter the grand archives and select your board companion.</p>
        </header>

        {isLoggedIn ? (
          /* Logged In Welcome Screen */
          <div className="glass-panel login-card welcome-card animate-fade-in">
            <div className="success-icon">🏆</div>
            <h2>Welcome Back, Companion!</h2>
            <p className="welcome-desc">
              You have successfully entered the realm, escorted by <strong>{characterDescriptions[selectedPiece].name}</strong>.
            </p>
            
            <div className="companion-avatar-view">
              <img src={pieceImages[selectedPiece]} alt={selectedPiece} className="avatar-img" />
              <h4>{characterDescriptions[selectedPiece].name}</h4>
              <span className="companion-tagline">{characterDescriptions[selectedPiece].tagline}</span>
            </div>

            <button className="btn-primary full-width" onClick={handleLogout}>
              Leave Realm 🚪
            </button>
          </div>
        ) : (
          /* Login Form Card */
          <form className="glass-panel login-card animate-fade-in" onSubmit={handleLoginSubmit}>
            <h2>Account Access</h2>
            
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <input
                id="email"
                type="text"
                placeholder="companion@chess.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Secret Scroll (Password)</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
              />
              <span className="password-hint">🔍 Watch the pieces as you enter your secret scroll!</span>
            </div>

            {/* Companion Selection Row */}
            <div className="companion-selector">
              <label>Select Your Board Companion</label>
              <div className="companion-grid">
                {piecesList.map((piece) => (
                  <button
                    key={piece}
                    type="button"
                    className={`companion-btn ${selectedPiece === piece ? 'active' : ''}`}
                    onClick={() => setSelectedPiece(piece)}
                    title={characterDescriptions[piece].name}
                  >
                    <span className="btn-icon">
                      {piece === 'king' && '👑'}
                      {piece === 'queen' && '👑'}
                      {piece === 'bishop' && '⛪'}
                      {piece === 'knight' && '🐴'}
                      {piece === 'pawn' && '♟️'}
                    </span>
                    <span className="btn-label">{piece.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary full-width">
              Enter the Realm 🔑
            </button>
          </form>
        )}

        {/* Selected Companion Personality Card */}
        <div className="glass-panel companion-card animate-fade-in">
          <h4>Companion Status</h4>
          <h3>{characterDescriptions[selectedPiece].name}</h3>
          <span className="spec-label">{characterDescriptions[selectedPiece].tagline}</span>
          <p className="companion-desc">{characterDescriptions[selectedPiece].desc}</p>
        </div>
      </section>

      {/* RIGHT PANEL: 3D Visualizer & 2D Art Gallery */}
      <section className="display-side-panel">
        
        {/* Gallery/Scene Toggle at the top of display panel */}
        <div className="display-header-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => setViewMode('2d')}
            >
              2D HD Art
            </button>
            <button 
              className={`toggle-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              3D Live Scene
            </button>
          </div>
        </div>

        {/* 3D Real-time Render View */}
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
                <King wood={darkWood} isLocked={isPasswordFocused} />
                <Queen wood={lightWood} isLocked={isPasswordFocused} />
                <Bishop wood={darkWood} isLocked={isPasswordFocused} />
                <Knight wood={darkWood} isLocked={isPasswordFocused} />
                <Pawn wood={lightWood} isLocked={isPasswordFocused} />
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
            
            {/* Replay drop intro control */}
            <button className="btn-replay-intro" onClick={triggerReset} title="Replay drop entrance">
              💫 Replay Entrance
            </button>
          </div>
        )}

        {/* 2D High-Definition Art Gallery View (Individual Portrait Mode) */}
        {viewMode === '2d' && (
          <div className="hd-gallery-wrapper animate-fade-in">
            <div className="hd-image-frame portrait-frame">
              <img 
                src={pieceImages[selectedPiece]} 
                alt={characterDescriptions[selectedPiece].name} 
                className="hd-image portrait-image" 
              />
              
              {/* Arrow Navigation controls overlayed inside the frame */}
              <button 
                className="nav-arrow-btn prev-btn" 
                onClick={handlePrevPiece}
                title="Previous Character"
              >
                ⟨
              </button>
              <button 
                className="nav-arrow-btn next-btn" 
                onClick={handleNextPiece}
                title="Next Character"
              >
                ⟩
              </button>

              {/* Float text badge indicating the piece */}
              <div className="piece-title-overlay">
                <span>{characterDescriptions[selectedPiece].name.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
