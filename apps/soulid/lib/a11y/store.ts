'use client';

import { create } from 'zustand';

export type MotionPref = 'auto' | 'reduced' | 'full';

const KEY = 'soulprofile.motion';

function osPrefersReduced(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applyDom(resolved: 'reduced' | 'full') {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.motion = resolved;
}

function effective(pref: MotionPref): 'reduced' | 'full' {
  if (pref === 'reduced') return 'reduced';
  if (pref === 'full') return 'full';
  return osPrefersReduced() ? 'reduced' : 'full';
}

type State = {
  pref: MotionPref;
  resolved: 'reduced' | 'full';
  setPref: (p: MotionPref) => void;
};

export const useMotionStore = create<State>((set) => ({
  pref: 'auto',
  resolved: 'full',
  setPref: (pref) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, pref);
    const resolved = effective(pref);
    applyDom(resolved);
    set({ pref, resolved });
  },
}));

export function initMotion() {
  if (typeof window === 'undefined') return;
  const stored = (localStorage.getItem(KEY) as MotionPref | null) ?? 'auto';
  const pref: MotionPref = stored === 'auto' || stored === 'reduced' || stored === 'full' ? stored : 'auto';
  const resolved = effective(pref);
  applyDom(resolved);
  useMotionStore.setState({ pref, resolved });

  if (pref === 'auto' && typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) => {
      if (useMotionStore.getState().pref !== 'auto') return;
      const r: 'reduced' | 'full' = e.matches ? 'reduced' : 'full';
      applyDom(r);
      useMotionStore.setState({ resolved: r });
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', listener);
    else if (typeof mq.addListener === 'function') mq.addListener(listener);
  }
}
