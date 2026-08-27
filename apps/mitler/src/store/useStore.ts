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
  fromBridge?: boolean;  // Sakin host köprüsünden kuruldu → host doğum bilgisi değişince güncellenir
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
  VIEWED: '@mitler_viewed_today',
};

// GUN ANAHTARI YEREL SAATE GORE (host ile AYNI kural).
// KOK SEBEP (kullanici: "kecı cikti ama Bugun'e dondugumde gorunmuyor"):
// burasi toISOString() ile UTC tarihi yaziyordu, Sakin host'u ise
// sakinDayKey() ile YEREL tarihi okuyor. Turkiye UTC+3 oldugu icin gece
// 00:00-03:00 arasinda embed DUNUN tarihini yaziyor, host BUGUNU soruyor ->
// `d.date === dayKey` tutmuyor ve cekilmis kart "Bugun" ekraninda hic
// gorunmuyordu. Ayni tuzak host tarafinda daha once duzeltilmisti
// (bkz. kok CLAUDE.md), embed'lerde kalmis.
const todayStr = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

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
        // KÖPRÜ — OTOMATİK PROFİL (HD gibi): host doğum tarihi verdiyse profili
        // sessizce kur, onboarding'i HİÇ gösterme; doğrudan rehberliğe geç. Element
        // burçtan türetilir (kullanıcı isterse Profil'de değiştirir). Birth yoksa
        // (nadir) eski akış: formu ön-doldur (element adımı).
        const bridge = readSakinBridge();
        if (bridge?.birthDate) {
          const auto: UserProfile = {
            name: (bridge.name || 'Sakin').trim() || 'Sakin',
            fullName: bridge.name || undefined,
            element: elementFromBirthDate(bridge.birthDate),
            birthDate: bridge.birthDate,
            birthHour: (typeof bridge.birthHour === 'number') ? bridge.birthHour : undefined,
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

  // Keşfet'te bir kart (arketip/mit/imge/tarot/rune/iching detay) AÇILINCA okuma say
  // (kullanıcı isteği: "7 karta bakınca Yol Başlangıcı rozeti yansın"). AYNI KART GÜNDE
  // 1 KEZ sayılır. Farklı 7 kart açınca totalReadings 7'ye ulaşır ve rozet yanar.
  // AsyncStorage'dan okuyup yazar (paylaşılan store olmadığı için ekranlar ayrı kopya).
  const recordCardView = useCallback(async (cardId: string) => {
    if (!cardId) return;
    try {
      const today = todayStr();
      let seen: { day: string; ids: string[] } = { day: today, ids: [] };
      try {
        const vraw = await AsyncStorage.getItem(STORAGE_KEYS.VIEWED);
        const p = vraw ? JSON.parse(vraw) : null;
        if (p && p.day === today && Array.isArray(p.ids)) seen = p;
      } catch {}
      if (seen.ids.includes(cardId)) return;
      seen.ids.push(cardId);
      await AsyncStorage.setItem(STORAGE_KEYS.VIEWED, JSON.stringify(seen));
      const praw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!praw) return;
      const current: UserProfile = JSON.parse(praw);
      const total = (current.totalReadings || 0) + 1;
      await saveProfile({ ...current, totalReadings: total, level: Math.floor(total / 7) + 1 });
    } catch {}
  }, [saveProfile]);

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
    writeSakinBridgeBack(p); // aile uygulamaları da görsün
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
    // GUNDE TEK CEKILIS (kirmizi cizgi). Bugun icin bir okuma zaten
    // kaydedilmisse YENISI URETILMEZ, kayitli olan dondurulur. Boylece hangi
    // ekran/cagri gelirse gelsin gun icinde ayni kart gorunur (Sakin'in "Bugun"
    // ekrani ile uygulama icindeki kart artik cakismaz).
    // Depodaki kopya bos olabilir (soguk acilis), o yuzden ASIL kaynak
    // AsyncStorage'daki kayit.
    try {
      const existingRaw = await AsyncStorage.getItem(STORAGE_KEYS.DAILY);
      if (existingRaw) {
        const existing: DailyReading = JSON.parse(existingRaw);
        if (existing && existing.date === today) {
          setDailyReading(existing);
          return existing;
        }
      }
    } catch { /* bozuk kayit: yok say, asagida yenisi cekilir */ }
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
    recordCardView,
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
