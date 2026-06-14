import { clsx } from 'clsx';

export const cn = (...args) => clsx(...args);

export const currency = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
    Number(n) || 0
  );

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-US').format(Number(n) || 0);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const isLowStock = (p) => p.stock <= (p.lowStockThreshold ?? 10);
export const isOutOfStock = (p) => p.stock <= 0;

// Multi-sensory anchoring: a short harmonic chime via the Web Audio API.
let audioCtx;
export function playChime(enabled = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.36);
    });
  } catch {
    /* audio not available */
  }
}

// Subtle haptic-like feedback on supported devices.
export function haptic(pattern = 18) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
