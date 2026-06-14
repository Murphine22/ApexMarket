import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI preferences that drive the "psychological engineering" layer.
export const useUiStore = create(
  persist(
    (set) => ({
      // Cognitive narrowing: blur the background during focus modes (e.g. audits).
      focusMode: false,
      // Multi-sensory anchoring: harmonic sound cue on high-value actions.
      soundEnabled: true,
      // Respect reduced-motion preference for accessibility.
      reduceMotion: false,
      sidebarOpen: true,

      toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
      setFocusMode: (v) => set({ focusMode: v }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleReduceMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'apexmarket_ui' }
  )
);
