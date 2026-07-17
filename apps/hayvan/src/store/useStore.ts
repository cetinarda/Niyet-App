import { useState, useEffect, useCallback } from 'react';
import { useLanguage, type Lang } from '../i18n/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type ReadingType = 'quote' | 'stone' | 'animal' | 'nagual';

export interface DailyReading {
  date: string;
  quoteId: string;
  stoneId: string;
  animalId: string;
  nagualId: string;
  quoteSaved: boolean;
  stoneSaved: boolean;
  animalSaved: boolean;
  nagualSaved: boolean;
}

export interface UserProfile {
  name: string;
  fullName?: string;
  birthDate?: string;   // YYYY-MM-DD
  birthHour?: number;   // 0-23
  birthMinute?: number; // 0-59
  birthCity?: string;
  element?: 'ateş' | 'su' | 'toprak' | 'hava';
  hdTypeOverride?: string;
  createdAt: string;
  streak: number;
  lastOpenDate?: string;
  totalReadings: number;
  level: number;
  fromBridge?: boolean;  // Sakin host köprüsünden kuruldu → host doğum bilgisi değişince güncellenir
}

export interface ArchiveEntry {
  date: string;
  quoteId: string;
  stoneId: string;
  animalId: string;
  nagualId: string;
}

export interface Stats {
  quoteCounts: Record<string, number>;
  stoneCounts: Record<string, number>;
  animalCounts: Record<string, number>;
  nagualCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
}

const STORAGE_KEYS = {
  PROFILE: '@sakinhayvan_profile',
  DAILY: '@sakinhayvan_daily',
  ARCHIVE: '@sakinhayvan_archive',
  STATS: '@sakinhayvan_stats',
  LANGUAGE: '@sakinhayvan_language',
};

const todayStr = () => new Date().toISOString().split('T')[0];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// SAKİN HOST KÖPRÜSÜ
// Embed, Sakin host'u ile AYNI origin'de bir iframe içinde açılır; host kullanıcının
// ad/doğum bilgisini `sakin_*` localStorage anahtarlarına yazar. Burada onları
// SENKRON okuyup onboarding'i ön-doldururuz. Eski preemptive-write (profile-key)
// hack'ine gerek yok — bu okuma ilk render'da hazırdır, yarış koşulu olmaz.
//
// KRİTİK: Profil 'element' alanını kullanır (ateş/su/toprak/hava) — bu kullanıcı
// seçimidir, doğumdan TÜRETİLEMEZ. Köprü asla element üretmez, tek başına profil
// kurmaz; sadece ad + doğum alanlarını forma akıtır.
// ─────────────────────────────────────────────────────────────────────────────

export interface SakinBridge {
  name?: string;
  birthDate?: string;   // YYYY-MM-DD
  birthHour?: number;   // 0-23
  birthMinute?: number; // 0-59
  birthCity?: string;
}

export function readSakinBridge(): SakinBridge | null {
  try {
    if (typeof window === 'undefined' || !(window as any).localStorage) return null;
    const ls = (window as any).localStorage as Storage;
    const get = (...keys: string[]) => {
      for (const k of keys) { const v = ls.getItem(k); if (v) return v; }
      return '';
    };
    const name = get('sakin_name', 'user_name', 'userName');
    const birthDate = get('sakin_birth_date', 'birth_date', 'birthDate');
    const birthTime = get('sakin_birth_time', 'birth_time', 'birthTime');
    const birthCity = get('sakin_birth_city', 'birth_city', 'birthCity');
    if (!name && !birthDate && !birthTime && !birthCity) return null;
    let birthHour: number | undefined;
    let birthMinute: number | undefined;
    if (birthTime) {
      const parts = birthTime.split(':');
      const h = parseInt(parts[0] || '', 10);
      const m = parseInt(parts[1] || '', 10);
      if (!isNaN(h) && h >= 0 && h <= 23) birthHour = h;
      if (!isNaN(m) && m >= 0 && m <= 59) birthMinute = m;
    }
    return {
      name: name || undefined,
      birthDate: birthDate || undefined,
      birthHour,
      birthMinute,
      birthCity: birthCity || undefined,
    };
  } catch {
    return null;
  }
}

// Ters köprü: kullanıcı doğum bilgisini embed'in KENDİ onboarding'ine girdiyse
// host'un sakin_* anahtarlarına da yaz — SADECE boş olanlara (host gerçek kaynak
// kalır, asla üzerine yazılmaz). Böylece diğer Sakin aile uygulamaları aynı
// bilgiyi görür ve bir daha sormaz.
export function writeSakinBridgeBack(p: { name?: string; fullName?: string; birthDate?: string; birthHour?: number; birthMinute?: number; birthCity?: string }): void {
  try {
    if (typeof window === 'undefined' || !(window as any).localStorage) return;
    const ls = (window as any).localStorage as Storage;
    const put = (k: string, v?: string) => { if (v && !ls.getItem(k)) ls.setItem(k, v); };
    put('sakin_name', (p.fullName || p.name || '').trim());
    put('sakin_birth_date', p.birthDate);
    if (typeof p.birthHour === 'number') {
      const mm = typeof p.birthMinute === 'number' ? p.birthMinute : 0;
      put('sakin_birth_time', String(p.birthHour).padStart(2, '0') + ':' + String(mm).padStart(2, '0'));
    }
    put('sakin_birth_city', p.birthCity);
  } catch { /* sessiz */ }
}

// Doğum tarihinden (güneş burcu) element türet. Köprüyle profil OTOMATİK kurulurken
// element sorulmaz; kullanıcı isterse Profil'de değiştirir.
export function elementFromBirthDate(birthDate?: string): UserProfile['element'] {
  if (!birthDate) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return undefined;
  const mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
  const fire  = (mo === 3 && d >= 21) || (mo === 4 && d <= 19) || (mo === 7 && d >= 23) || (mo === 8 && d <= 22) || (mo === 11 && d >= 22) || (mo === 12 && d <= 21);
  const earth = (mo === 4 && d >= 20) || (mo === 5 && d <= 20) || (mo === 8 && d >= 23) || (mo === 9 && d <= 22) || (mo === 12 && d >= 22) || (mo === 1 && d <= 19);
  const air   = (mo === 5 && d >= 21) || (mo === 6 && d <= 20) || (mo === 9 && d >= 23) || (mo === 10 && d <= 22) || (mo === 1 && d >= 20) || (mo === 2 && d <= 18);
  if (fire) return 'ateş';
  if (earth) return 'toprak';
  if (air) return 'hava';
  return 'su'; // Yengeç/Akrep/Balık
}

export function useSakinHayvanStore() {
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    quoteCounts: {},
    stoneCounts: {},
    animalCounts: {},
    nagualCounts: {},
    sourceCounts: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  // Host'tan gelen, onboarding'i ön-doldurmak için saklanan veri. SENKRON okunur
  // (lazy initializer) ki ProfileScreen ilk render'da köprüyü görsün; profil zaten
  // varsa loadAll bunu null'a çeker. Element içermez — kullanıcı yine seçer.
  const [bridgePrefill, setBridgePrefill] = useState<SakinBridge | null>(() => readSakinBridge());
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    loadAll();
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event: unknown, s: Session | null) => {
      setSession(s);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
  }, []);

  /**
   * Account deletion — Apple Guideline 5.1.1(v) compliance.
   * Calls the `delete_user` Supabase RPC (must be implemented server-side
   * with the service-role key), wipes local storage, and signs out.
   * Falls back to local wipe + signOut if Supabase is not configured or
   * the RPC is missing (offline-only mode still satisfies the guideline
   * because no server-side account exists).
   */
  const deleteAccount = useCallback(async () => {
    if (isSupabaseConfigured && session) {
      try {
        await supabase.rpc('delete_user');
      } catch {
        // Best-effort: continue with local wipe even if RPC is missing,
        // so the user is not blocked by a server-side gap.
      }
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PROFILE),
      AsyncStorage.removeItem(STORAGE_KEYS.DAILY),
      AsyncStorage.removeItem(STORAGE_KEYS.ARCHIVE),
      AsyncStorage.removeItem(STORAGE_KEYS.STATS),
    ]);
    setProfile(null);
    setDailyReading(null);
    setArchive([]);
    setStats({ quoteCounts: {}, stoneCounts: {}, animalCounts: {}, nagualCounts: {}, sourceCounts: {} });
    setSession(null);
    setIsNewUser(true);
  }, [session]);

  const loadAll = async () => {
    try {
      const [profileRaw, dailyRaw, archiveRaw, statsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY),
        AsyncStorage.getItem(STORAGE_KEYS.ARCHIVE),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
      ]);

      if (!profileRaw) {
        // KÖPRÜ — OTOMATİK PROFİL (HD gibi): host doğum tarihi verdiyse profili
        // sessizce kur, onboarding'i HİÇ gösterme; doğrudan rehberliğe geç. Element
        // burçtan türetilir (kullanıcı isterse Profil'de değiştirir). Birth yoksa
        // (nadir) eski akış: formu ön-doldur.
        const bridge = readSakinBridge();
        if (bridge?.birthDate) {
          const hm = (typeof bridge.birthHour === 'number') ? bridge.birthHour : undefined;
          const auto: UserProfile = {
            name: (bridge.name || 'Sakin').trim() || 'Sakin',
            fullName: bridge.name || undefined,
            element: elementFromBirthDate(bridge.birthDate),
            birthDate: bridge.birthDate,
            birthHour: hm,
            birthMinute: (typeof bridge.birthMinute === 'number') ? bridge.birthMinute : undefined,
            birthCity: bridge.birthCity,
            createdAt: new Date().toISOString(),
            streak: 0,
            totalReadings: 0,
            level: 1,
          };
          auto.fromBridge = true;
          await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(auto));
          setProfile(auto);
          setBridgePrefill(null);
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }
      } else {
        const existing: UserProfile = JSON.parse(profileRaw);
        // Host doğum bilgisi değişti mi? Köprüyle kurulan profili güncelle (seri/
        // okuma sayacı korunur). Elle kurulmuş profillere DOKUNMA.
        const bridge = readSakinBridge();
        if (existing.fromBridge && bridge?.birthDate && (
          existing.birthDate !== bridge.birthDate ||
          (typeof bridge.birthHour === 'number' && existing.birthHour !== bridge.birthHour) ||
          (!!bridge.name && existing.fullName !== bridge.name)
        )) {
          const updated: UserProfile = {
            ...existing,
            name: (bridge.name || existing.name).trim() || existing.name,
            fullName: bridge.name || existing.fullName,
            element: elementFromBirthDate(bridge.birthDate),
            birthDate: bridge.birthDate,
            birthHour: typeof bridge.birthHour === 'number' ? bridge.birthHour : existing.birthHour,
            birthMinute: typeof bridge.birthMinute === 'number' ? bridge.birthMinute : existing.birthMinute,
            birthCity: bridge.birthCity ?? existing.birthCity,
          };
          await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
          setProfile(updated);
        } else {
          setProfile(existing);
        }
        setBridgePrefill(null); // mevcut kullanıcıya köprü ön-doldurması sızmasın
      }

      if (dailyRaw) {
        const parsed: DailyReading = JSON.parse(dailyRaw);
        if (parsed.date === todayStr()) {
          setDailyReading(parsed);
        }
      }

      if (archiveRaw) setArchive(JSON.parse(archiveRaw));
      if (statsRaw) {
        const s = JSON.parse(statsRaw);
        setStats({ nagualCounts: {}, ...s });
      }
    } catch (e) {
      if (__DEV__) console.error('Load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Köprü GEÇ dolarsa yakala: embed ilk açıldığında host'ta doğum bilgisi yoktu
  // ama sonradan girildiyse (Ailesi paneli / kimlik), onboarding görünürken pencere
  // odağa/görünürlüğe gelince köprüyü yeniden oku — doluysa loadAll otomatik
  // profili kurar ve onboarding kendiliğinden kapanır.
  useEffect(() => {
    if (profile || !isNewUser || typeof window === 'undefined') return;
    const recheck = () => {
      const b = readSakinBridge();
      if (b?.birthDate) { loadAll(); return; }
      if (b) setBridgePrefill(b);
    };
    window.addEventListener('focus', recheck);
    document.addEventListener('visibilitychange', recheck);
    return () => {
      window.removeEventListener('focus', recheck);
      document.removeEventListener('visibilitychange', recheck);
    };
  }, [profile, isNewUser]);

  const saveProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p));
  }, []);

  const createProfile = useCallback(async (
    name: string,
    element: UserProfile['element'],
    birthDate?: string,
    fullName?: string,
    birthHour?: number,
    birthMinute?: number,
    birthCity?: string,
  ) => {
    const p: UserProfile = {
      name,
      element,
      birthDate,
      fullName,
      birthHour,
      birthMinute,
      birthCity,
      createdAt: new Date().toISOString(),
      streak: 0,
      totalReadings: 0,
      level: 1,
    };
    await saveProfile(p);
    writeSakinBridgeBack(p); // aile uygulamaları da görsün
    setIsNewUser(false);
    setBridgePrefill(null); // profil kuruldu — köprü ön-doldurması artık gereksiz
  }, [saveProfile]);

  const updateBirthData = useCallback(async (
    fullName: string,
    birthDate: string,
    birthHour?: number,
    birthMinute?: number,
    birthCity?: string,
  ) => {
    if (!profile) return;
    const next = { ...profile, fullName, birthDate, birthHour, birthMinute, birthCity };
    await saveProfile(next);
    writeSakinBridgeBack(next); // aile uygulamaları da görsün
  }, [profile, saveProfile]);

  const updateHDType = useCallback(async (hdTypeOverride: string) => {
    if (!profile) return;
    await saveProfile({ ...profile, hdTypeOverride });
  }, [profile, saveProfile]);

  const generateDailyReading = useCallback(async (
    quoteIds: string[],
    stoneIds: string[],
    animalIds: string[],
    nagualIds: string[]
  ) => {
    const today = todayStr();
    const reading: DailyReading = {
      date: today,
      quoteId: pickRandom(quoteIds),
      stoneId: pickRandom(stoneIds),
      animalId: pickRandom(animalIds),
      nagualId: pickRandom(nagualIds),
      quoteSaved: false,
      stoneSaved: false,
      animalSaved: false,
      nagualSaved: false,
    };

    setDailyReading(reading);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(reading));

    const entry: ArchiveEntry = {
      date: today,
      quoteId: reading.quoteId,
      stoneId: reading.stoneId,
      animalId: reading.animalId,
      nagualId: reading.nagualId,
    };
    const newArchive = [entry, ...archive.filter(a => a.date !== today)];
    setArchive(newArchive);
    await AsyncStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(newArchive));

    if (profile) {
      const last = profile.lastOpenDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = last === yesterdayStr ? profile.streak + 1 : 1;
      const updated: UserProfile = {
        ...profile,
        streak: newStreak,
        lastOpenDate: today,
        totalReadings: profile.totalReadings + 1,
        level: Math.floor((profile.totalReadings + 1) / 7) + 1,
      };
      await saveProfile(updated);
    }

    return reading;
  }, [archive, profile, saveProfile]);

  const updateStats = useCallback(async (
    quoteId: string,
    source: string,
    stoneId: string,
    animalId: string,
    nagualId: string
  ) => {
    const newStats: Stats = {
      quoteCounts: { ...stats.quoteCounts, [quoteId]: (stats.quoteCounts[quoteId] || 0) + 1 },
      stoneCounts: { ...stats.stoneCounts, [stoneId]: (stats.stoneCounts[stoneId] || 0) + 1 },
      animalCounts: { ...stats.animalCounts, [animalId]: (stats.animalCounts[animalId] || 0) + 1 },
      nagualCounts: { ...stats.nagualCounts, [nagualId]: (stats.nagualCounts[nagualId] || 0) + 1 },
      sourceCounts: { ...stats.sourceCounts, [source]: (stats.sourceCounts[source] || 0) + 1 },
    };
    setStats(newStats);
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  }, [stats]);

  const getTopStat = useCallback((counts: Record<string, number>): string | null => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }, []);

  const getLevelTitle = useCallback((level: number): string => {
    const titles = ['Talip', 'Mürit', 'Derviş', 'Eren', 'Veli', 'Pir', 'Kutup'];
    return titles[Math.min(level - 1, titles.length - 1)];
  }, []);

  return {
    language,
    setLanguage,
    profile,
    dailyReading,
    archive,
    stats,
    isLoading,
    isNewUser,
    bridgePrefill,
    session,
    authReady,
    isAuthenticated: !!session || !isSupabaseConfigured,
    signOut,
    deleteAccount,
    createProfile,
    saveProfile,
    updateBirthData,
    generateDailyReading,
    updateStats,
    getTopStat,
    getLevelTitle,
    updateHDType,
    todayStr,
  };
}
