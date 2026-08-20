import { create } from 'zustand';
import type { BirthInput, GalacticReport } from './types';

type State = {
  birth: Partial<BirthInput>;
  report: GalacticReport | null;
  loading: boolean;
  error: string | null;
  setBirth: (patch: Partial<BirthInput>) => void;
  reset: () => void;
  setReport: (r: GalacticReport | null) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;
};

export const useSoulStore = create<State>((set) => ({
  birth: { birthTimeKnown: true },
  report: null,
  loading: false,
  error: null,
  setBirth: (patch) => set((s) => ({ birth: { ...s.birth, ...patch } })),
  reset: () => set({ birth: { birthTimeKnown: true }, report: null, error: null }),
  setReport: (report) => set({ report }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
