import { create } from 'zustand';
import type { BirthInput, GalacticReport } from './types';
import { writeSakinSummary } from './sakin-summary';

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
  // Sakin'in Galaktik Kimlik kartındaki Ruh Profili özeti, rapor NEREDEN
  // yüklenirse yüklensin (profil, karne, geçmiş) burada yazılır.
  // ⚠️ NEDEN BURADA (Eyl 2026 regresyonu): özet eskiden yalnızca karne
  // (/report) sayfasında yazılıyordu. 15 Eyl'de ilk açılış profil sayfasına
  // alınınca karneye girmeyen kullanıcıda özet HİÇ oluşmadı ve Sakin'deki
  // Galaktik Kimlik kartı Ruh Profili satırları olmadan eski haline döndü.
  setReport: (report) => {
    if (report) writeSakinSummary(report);
    set({ report });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
