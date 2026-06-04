import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReadingType = 'archetype' | 'myth' | 'image';

export interface DailyReading {
  date: string;
  archetypeId: string;
  mythId: string;
  imageId: string;
  archetypeSaved: boolean;
  mythSaved: boolean;
  imageSaved: boolean;
}

export interface UserProfile {
  name: string;
  fullName?: string;
  birthDate?: string;
  birthHour?: number;
  birthMinute?: number;
  birthCity?: string;
  element?: 'ateş' | 'su' | 'toprak' | 'hava';
  createdAt: string;
  streak: number;
  lastOpenDate?: string;
  totalReadings: number;
  level: number;
}

export interface ArchiveEntry {
  date: string;
  archetypeId: string;
  mythId: string;
  imageId: string;
}

export interface Stats {
  archetypeCounts: Record<string, number>;
  mythCounts: Record<string, number>;
  imageCounts: Record<string, number>;
  traditionCounts: Record<string, number>;
}

const STORAGE_KEYS = {
  PROFILE: '@mitler_profile',
  DAILY: '@mitler_daily',
  ARCHIVE: '@mitler_archive',
  STATS: '@mitler_stats',
  DISCLAIMER: '@mitler_disclaimer_v1',
  LANG: '@mitler_lang',
};

const todayStr = () => new Date().toISOString().split('T')[0];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// SAKİN HOST KÖPRÜSÜ
// Sakin ana uygulaması embed'i bir iframe içinde aynı origin'de açar ve
// kullanıcının ad/doğum bilgisini localStorage'a yazar. Burada onu okuyup
// onboarding formunu ÖN-DOLDURMAK için kullanırız.
//
// KRİTİK: Bu app'in profili 'element' alanını kullanır — element kullanıcının
// kişilik testi/seçimiyle belirlenir (ateş/su/toprak/hava), doğum verisinden
// TÜRETİLEMEZ. Köprü asla element üretmez ve TEK BAŞINA profil oluşturmaz;
// sadece ad + doğum alanlarını forma akıtır. Element'siz profil mythos
// hesabını bozar (eski iz: HTML-bridge'in yazdığı element'siz profiller).
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

export function useMitlerStore() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    archetypeCounts: {},
    mythCounts: {},
    imageCounts: {},
    traditionCounts: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  // Sakin host'undan gelen, onboarding formuna pre-fill için saklanan veri.
  // Profil zaten varsa null. Element üretmez — sadece ad + doğum alanları.
  //
  // SENKRON OKUMA: localStorage (web) eşzamanlıdır. Köprüyü İLK render'da hazır
  // olması için lazy initializer ile senkron okuruz. Böylece ProfileScreen,
  // bridge varlığını AsyncStorage Promise'i çözülmeden önce — ilk render'da —
  // görür ve element adımına doğrudan başlar (ad/doğum ekranları hiç açılmaz).
  // Profil zaten varsa loadAll() bunu null'a çeker (aşağıda).
  const [bridgePrefill, setBridgePrefill] = useState<SakinBridge | null>(() => readSakinBridge());
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [profileRaw, dailyRaw, archiveRaw, statsRaw, disclaimerRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY),
        AsyncStorage.getItem(STORAGE_KEYS.ARCHIVE),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
        AsyncStorage.getItem(STORAGE_KEYS.DISCLAIMER),
      ]);

      if (disclaimerRaw === 'accepted') setDisclaimerAccepted(true);

      if (!profileRaw) {
        setIsNewUser(true);
        // Köprü zaten lazy-init ile senkron okundu (yukarı bak); profil yoksa
        // olduğu gibi bırakırız. NOT: Element içermez — kullanıcı yine seçer.
      } else {
        setProfile(JSON.parse(profileRaw));
        // Profil zaten var: senkron seed'lenmiş köprüyü geçersiz kıl, yoksa
        // mevcut kullanıcıya yanlışlıkla onboarding ön-doldurması sızar.
        setBridgePrefill(null);
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
        setStats({
          archetypeCounts: {},
          mythCounts: {},
          imageCounts: {},
          traditionCounts: {},
          ...s,
        });
      }
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(p));
  }, []);

  const createProfile = useCallback(async (
    name: string,
    element: UserProfile['element'],
    birthDate?: string,
    fullName?: string,
  ) => {
    const p: UserProfile = {
      name,
      element,
      birthDate,
      fullName,
      createdAt: new Date().toISOString(),
      streak: 0,
      totalReadings: 0,
      level: 1,
    };
    await saveProfile(p);
    setIsNewUser(false);
    setBridgePrefill(null); // profil kuruldu — köprü pre-fill'i artık gereksiz
  }, [saveProfile]);

  const updateBirthData = useCallback(async (
    fullName: string,
    birthDate: string,
    extras?: { birthHour?: number; birthMinute?: number; birthCity?: string },
  ) => {
    if (!profile) return;
    await saveProfile({
      ...profile,
      fullName,
      birthDate,
      birthHour: extras?.birthHour,
      birthMinute: extras?.birthMinute,
      birthCity: extras?.birthCity,
    });
  }, [profile, saveProfile]);

  const generateDailyReading = useCallback(async (
    archetypeIds: string[],
    mythIds: string[],
    imageIds: string[],
  ) => {
    const today = todayStr();
    const reading: DailyReading = {
      date: today,
      archetypeId: pickRandom(archetypeIds),
      mythId: pickRandom(mythIds),
      imageId: pickRandom(imageIds),
      archetypeSaved: false,
      mythSaved: false,
      imageSaved: false,
    };

    setDailyReading(reading);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(reading));

    const entry: ArchiveEntry = {
      date: today,
      archetypeId: reading.archetypeId,
      mythId: reading.mythId,
      imageId: reading.imageId,
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
    archetypeId: string,
    mythId: string,
    imageId: string,
    tradition: string,
  ) => {
    const newStats: Stats = {
      archetypeCounts: { ...stats.archetypeCounts, [archetypeId]: (stats.archetypeCounts[archetypeId] || 0) + 1 },
      mythCounts: { ...stats.mythCounts, [mythId]: (stats.mythCounts[mythId] || 0) + 1 },
      imageCounts: { ...stats.imageCounts, [imageId]: (stats.imageCounts[imageId] || 0) + 1 },
      traditionCounts: { ...stats.traditionCounts, [tradition]: (stats.traditionCounts[tradition] || 0) + 1 },
    };
    setStats(newStats);
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(newStats));
  }, [stats]);

  const getTopStat = useCallback((counts: Record<string, number>): string | null => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }, []);

  const acceptDisclaimer = useCallback(async () => {
    setDisclaimerAccepted(true);
    await AsyncStorage.setItem(STORAGE_KEYS.DISCLAIMER, 'accepted');
  }, []);

  const clearAllData = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROFILE,
      STORAGE_KEYS.DAILY,
      STORAGE_KEYS.ARCHIVE,
      STORAGE_KEYS.STATS,
    ]);
    setProfile(null);
    setDailyReading(null);
    setArchive([]);
    setStats({
      archetypeCounts: {},
      mythCounts: {},
      imageCounts: {},
      traditionCounts: {},
    });
    setIsNewUser(true);
    setBridgePrefill(null);
  }, []);

  // Returns the translation key for the level title; the consumer translates.
  const getLevelTitleKey = useCallback((level: number): string => {
    const idx = Math.min(Math.max(level, 1), 7);
    return `profile.level.${idx}`;
  }, []);
  // Backwards-compat shim — returns Turkish label by default.
  const getLevelTitle = useCallback((level: number): string => {
    const titles = ['Yolcu', 'Çırak', 'Arayıcı', 'Yorumcu', 'Mit Bilgesi', 'Arketip Ustası', 'Sembol Pîri'];
    return titles[Math.min(level - 1, titles.length - 1)];
  }, []);

  return {
    profile,
    dailyReading,
    archive,
    stats,
    isLoading,
    isNewUser,
    bridgePrefill,
    disclaimerAccepted,
    createProfile,
    saveProfile,
    updateBirthData,
    generateDailyReading,
    updateStats,
    getTopStat,
    getLevelTitle,
    getLevelTitleKey,
    todayStr,
    acceptDisclaimer,
    clearAllData,
  };
}
