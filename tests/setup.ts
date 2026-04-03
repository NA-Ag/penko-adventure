
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock LocalStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Canvas (for Visualizer tests)
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn((x, y, w, h) => ({
      data: new Array(w * h * 4).fill(0),
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  };
}) as any;

// --- AUDIO MOCKS ---

// Mock MediaDevices (Microphone)
const mockMediaStream = {
  getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }])
};

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(mockMediaStream)
  },
  writable: true
});

// Mock AudioContext
window.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: () => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    type: 'sine'
  }),
  createGain: () => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
  }),
  createMediaStreamSource: vi.fn().mockReturnValue({ connect: vi.fn() }),
  createAnalyser: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn()
  }),
  createScriptProcessor: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    onaudioprocess: null
  }),
  createBufferSource: vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn()
  }),
  audioWorklet: {
    addModule: vi.fn().mockResolvedValue(undefined)
  },
  decodeAudioData: vi.fn().mockResolvedValue({}),
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
  close: vi.fn()
})) as any;

// Mock AudioWorkletNode
(window as any).AudioWorkletNode = vi.fn().mockImplementation(() => ({
  port: {
    onmessage: null,
    postMessage: vi.fn()
  },
  connect: vi.fn(),
  disconnect: vi.fn()
}));

// Mock OfflineAudioContext (for Resampling)
window.OfflineAudioContext = vi.fn().mockImplementation(() => ({
  createBufferSource: vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn()
  }),
  destination: {},
  startRendering: vi.fn().mockResolvedValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(16000))
  })
})) as any;

// Mock AudioBuffer
window.AudioBuffer = vi.fn().mockImplementation(() => ({
  copyToChannel: vi.fn(),
  getChannelData: vi.fn().mockReturnValue(new Float32Array(100))
})) as any;

// Mock SpeechRecognition (Browser Native)
(window as any).SpeechRecognition = class MockSpeechRecognition {
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  lang = 'en-US';
};
(window as any).webkitSpeechRecognition = (window as any).SpeechRecognition;
