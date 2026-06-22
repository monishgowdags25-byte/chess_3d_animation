import { useMemo } from 'react';
import * as THREE from 'three';

// Simple 2D value noise implementation
function createNoise() {
  const size = 256;
  const p = new Uint8Array(size * 2);
  for (let i = 0; i < size; i++) p[i] = Math.floor(Math.random() * 256);
  for (let i = 0; i < size; i++) p[size + i] = p[i];
  
  return function noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    
    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];
    
    const x1 = aa + u * (ba - aa);
    const x2 = ab + u * (bb - ab);
    
    return (x1 + v * (x2 - x1)) / 255;
  };
}

const noise = createNoise();

function woodGrain(x, y, isDark) {
  // Offset center of rings slightly to make grain look organic and off-center
  const cx = 0.2;
  const cy = -0.15;
  const dx = x - cx;
  const dy = y - cy;
  
  // Calculate distance
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Apply multi-octave noise to distort coordinates
  const n1 = noise(x * 8, y * 8) * 0.45;
  const n2 = noise(x * 32, y * 32) * 0.08;
  const distortedDist = dist * 5.5 + n1 + n2;
  
  // Conic sine rings
  let ring = (Math.sin(distortedDist * Math.PI * 2) + 1) * 0.5;
  
  // Add fine micro-wood fibers
  const fibers = noise(x * 150, y * 150) * 0.15;
  
  // Blend rings and micro-fibers
  let value = ring * 0.8 + fibers;
  value = Math.max(0, Math.min(1, value));
  
  return { value };
}

export function createWoodTexture(isDark) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const { value } = woodGrain(nx, ny, isDark);
      
      let r, g, b;
      if (isDark) {
        // Deep mahogany dark wood: Base is rich dark reddish-brown, grain is near black
        // Base: rgb(110, 60, 36)
        // Grain: rgb(52, 24, 12)
        r = Math.floor(110 - value * 58);
        g = Math.floor(60 - value * 36);
        b = Math.floor(36 - value * 24);
      } else {
        // Soft maple light wood: Base is cream-beige, grain is light caramel-tan
        // Base: rgb(238, 218, 192)
        // Grain: rgb(196, 160, 128)
        r = Math.floor(238 - value * 42);
        g = Math.floor(218 - value * 58);
        b = Math.floor(192 - value * 64);
      }
      
      const idx = (y * size + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1.5);
  
  // Roughness Map (varnish: shiny base, slightly rougher grain)
  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');
  const rImgData = rCtx.createImageData(size, size);
  const rData = rImgData.data;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const { value } = woodGrain(nx, ny, isDark);
      
      // Base roughness 0.05 (very glossy/lacquered), grain roughness rises to 0.15
      const roughnessVal = Math.floor((0.05 + value * 0.12) * 255);
      
      const idx = (y * size + x) * 4;
      rData[idx] = roughnessVal;
      rData[idx + 1] = roughnessVal;
      rData[idx + 2] = roughnessVal;
      rData[idx + 3] = 255;
    }
  }
  rCtx.putImageData(rImgData, 0, 0);
  const roughnessTexture = new THREE.CanvasTexture(rCanvas);
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.RepeatWrapping;
  roughnessTexture.repeat.set(1, 1.5);

  // Bump Map (recessed grain pores)
  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d');
  const bImgData = bCtx.createImageData(size, size);
  const bData = bImgData.data;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      const { value } = woodGrain(nx, ny, isDark);
      
      // Bump height: 255 (top surface) for base, dipping to 210 for grain pores
      const bumpVal = Math.floor((1.0 - value * 0.18) * 255);
      
      const idx = (y * size + x) * 4;
      bData[idx] = bumpVal;
      bData[idx + 1] = bumpVal;
      bData[idx + 2] = bumpVal;
      bData[idx + 3] = 255;
    }
  }
  bCtx.putImageData(bImgData, 0, 0);
  const bumpTexture = new THREE.CanvasTexture(bCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(1, 1.5);
  
  return { map: texture, roughnessMap: roughnessTexture, bumpMap: bumpTexture };
}

export function useWoodTextures() {
  return useMemo(() => {
    const darkWood = createWoodTexture(true);
    const lightWood = createWoodTexture(false);
    return { darkWood, lightWood };
  }, []);
}
