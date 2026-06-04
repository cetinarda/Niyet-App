import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { City, CITIES, searchCities } from '../data/cities';
import { computeChart, HumanDesignChart } from '../utils/humanDesign';

export interface SavedProfile {
  id: string;
  name: string;
  birthDate: string;     // YYYY-MM-DD
  birthTime: string;     // HH:MM (24h)
  city: City;
  createdAt: string;
  photoUri?: string;     // lokal asset URI (lokal stilize foto)
}

export interface UserStats {
  openedAt: string;
  totalOpens: number;
  streak: number;
  lastOpenDate?: string;
  level: number;
}

const STORAGE_KEYS = {
  PROFILES: '@tasarim_profiles',
  ACTIVE: '@tasarim_active',
  STATS: '@tasarim_stats',
  ONBOARDED: '@tasarim_onboarded',
};

const todayStr = () => new Date().toISOString().split('T')[0];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// SAKİN HOST KÖPRÜSÜ
// Sakin ana uygulaması (host) bu embed'i bir iframe içinde açtığında, kullanıcının
// Sakin'de zaten girdiği isim + doğum bilgisini embed'in localStorage'ına yazar
// (aynı origin). Burada o veriyi okuyup profili otomatik kurarız; böylece kullanıcı
// aynı bilgileri TEKRAR girmez ve hukuki onboarding atlanır.
//
// Human Design haritası için ÜÇ alan da gerekir: doğum tarihi + saat + şehir.
// Host hepsini sağlarsa kullanıcı doğrudan haritasına düşer. Eksik alan varsa
// fabrikasyon yapmayız: elimizdeki kadarını profil formuna ÖN-DOLDURUR, kullanıcı
// yalnızca eksik alanı tamamlar (tam onboarding'e geri dönmeyiz).

export interface SakinBridge {
  name?: string;
  birthDate?: string;   // YYYY-MM-DD
  birthTime?: string;   // HH:MM
  city: City | null;    // host şehir string'inden çözüldü (yoksa null)
  complete: boolean;    // üçü de var ve şehir çözüldü → harita hesaplanabilir
}

// Host'un verdiği şehir string'ini ("İstanbul" / "İstanbul, Türkiye") City'ye çevir.
function resolveCity(raw?: string): City | null {
  if (!raw) return null;
  const want = raw.trim().toLocaleLowerCase('tr');
  if (!want) return null;
  // 1) tam ad eşleşmesi ("İstanbul, Türkiye")
  let hit = CITIES.find(c => c.name.toLocaleLowerCase('tr') === want);
  if (hit) return hit;
  // 2) virgülden önceki şehir adı eşleşmesi ("İstanbul")
  const wantCity = want.split(',')[0].trim();
  hit = CITIES.find(c => c.name.toLocaleLowerCase('tr').split(',')[0].trim() === wantCity);
  if (hit) return hit;
  // 3) son çare: arama (içerir) — ilk sonuç
  const found = searchCities(wantCity, 1);
  return found.length ? found[0] : null;
}

function readSakinBridge(): SakinBridge | null {
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
    const cityRaw = get('sakin_birth_city', 'birth_city', 'birthCity');
    // Host hiçbir şey yazmadıysa köprü yok — normal akışa düş
    if (!name && !birthDate && !birthTime && !cityRaw) return null;
    // ŞEHİR KOORDİNATI — BİRİNCİL: host (Sakin) şehri kendi 36k DB'sinde çözüp
    // lat/lon/tz'yi yazar. Bu, embed'in 118-şehir listesinden DAHA KAPSAMLI ve
    // Sakin'in YÜKSELEN BURÇ hesabıyla AYNI DB → tutarlı sonuç. Host koordinatı
    // varsa onu kullan (gerçek yer, varsayılan/tahmin değil). Yoksa (host'suz/eski
    // profil) embed'in kendi 118-listesi FALLBACK.
    let city: City | null = null;
    const lat = parseFloat(get('sakin_birth_lat'));
    const lon = parseFloat(get('sakin_birth_lon'));
    const tz  = parseFloat(get('sakin_birth_tz'));
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      city = {
        name: cityRaw || 'Doğum yeri',
        lat, lng: lon,
        tz: Number.isFinite(tz) ? tz : 0,
        country: '', dst: 'none',
      };
    }
    if (!city) city = resolveCity(cityRaw);
    return {
      name: name || undefined,
      birthDate: birthDate || undefined,
      birthTime: birthTime || undefined,
      city,
      complete: !!(birthDate && birthTime && city),
    };
  } catch {
    return null;
  }
}

interface StoreValue {
  profiles: SavedProfile[];
  activeProfile: SavedProfile | null;
  stats: UserStats;
  chart: HumanDesignChart | null;
  isLoading: boolean;
  isOnboarded: boolean;
  // Host köprüsünden gelen, harita için eksik kalan ön-doldurma verisi.
  // null ise köprü yok ya da profil zaten kuruldu. ProfileScreen formunu
  // bununla ön-doldurur, böylece kullanıcı yalnızca eksik alanı tamamlar.
  bridgePrefill: SakinBridge | null;
  // Açılışta hangi sekmeye düşülecek. Köprü eksik veri verdiyse 'profile'
  // (ön-doldurulmuş form), aksi halde 'home'.
  initialTab: 'home' | 'profile';
  addProfile: (
    name: string, birthDate: string, birthTime: string, city: City, makeActive?: boolean,
  ) => Promise<SavedProfile>;
  selectProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  updateProfilePhoto: (id: string, photoUri: string | null) => Promise<void>;
  setOnboarded: () => Promise<void>;
  getLevelTitle: (level: number) => string;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    openedAt: new Date().toISOString(),
    totalOpens: 0,
    streak: 0,
    level: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [chart, setChart] = useState<HumanDesignChart | null>(null);
  const [bridgePrefill, setBridgePrefill] = useState<SakinBridge | null>(null);
  const [initialTab, setInitialTab] = useState<'home' | 'profile'>('home');

  useEffect(() => {
    (async () => {
      try {
        const [pRaw, aRaw, sRaw, oRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROFILES),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE),
          AsyncStorage.getItem(STORAGE_KEYS.STATS),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        ]);
        const list: SavedProfile[] = pRaw ? JSON.parse(pRaw) : [];
        let onboarded = oRaw === '1';
        let activeIdToSet: string | null = aRaw;
        let chartComputed = false;

        // ── SAKİN HOST KÖPRÜSÜ ────────────────────────────────────────────────
        // Henüz hiç profil yokken host verisini dene. Tam veri varsa profili kur
        // ve onboarding'i atla; eksikse formu ön-doldurmak için sakla + hukuki
        // onboarding'i yine atla (host kullanıcısı zaten Sakin'de kabul etti).
        if (list.length === 0) {
          const bridge = readSakinBridge();
          if (bridge) {
            if (bridge.complete) {
              const bridged: SavedProfile = {
                id: makeId(),
                name: bridge.name || 'Sakin',
                birthDate: bridge.birthDate!,
                birthTime: bridge.birthTime!,
                city: bridge.city!,
                createdAt: new Date().toISOString(),
              };
              list.push(bridged);
              await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(list));
              await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE, bridged.id);
              activeIdToSet = bridged.id;
              try {
                setChart(computeChart(bridged.birthDate, bridged.birthTime, bridged.city));
                chartComputed = true;
              } catch (e) { console.error('bridge chart calc:', e); }
              onboarded = true;
              await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, '1');
            } else {
              // Eksik veri: formu ön-doldur, hukuki onboarding'i atla ve doğrudan
              // Profil sekmesine düş — kullanıcı yalnızca eksik alanı tamamlar.
              setBridgePrefill(bridge);
              setInitialTab('profile');
              onboarded = true;
              await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, '1');
            }
          }
        }
        // ──────────────────────────────────────────────────────────────────────

        setProfiles(list);
        setActiveId(activeIdToSet);
        if (sRaw) setStats(JSON.parse(sRaw));
        setIsOnboarded(onboarded);

        // Köprü zaten chart'ı hesapladıysa tekrar etme; aksi halde aktif profili çiz.
        if (activeIdToSet && !chartComputed) {
          const found = list.find(p => p.id === activeIdToSet);
          if (found) {
            try {
              setChart(computeChart(found.birthDate, found.birthTime, found.city));
            } catch (e) { console.error('chart calc:', e); }
          }
        }

        // bump open
        const today = todayStr();
        const cur = sRaw ? (JSON.parse(sRaw) as UserStats) : {
          openedAt: new Date().toISOString(), totalOpens: 0, streak: 0, level: 1,
        };
        if (cur.lastOpenDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = yesterday.toISOString().split('T')[0];
          cur.streak = cur.lastOpenDate === yStr ? cur.streak + 1 : 1;
          cur.lastOpenDate = today;
          cur.totalOpens += 1;
          cur.level = Math.floor(cur.totalOpens / 7) + 1;
          setStats({ ...cur });
          await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(cur));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setOnboarded = useCallback(async () => {
    setIsOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, '1');
  }, []);

  const addProfile = useCallback(async (
    name: string,
    birthDate: string,
    birthTime: string,
    city: City,
    makeActive = true,
  ): Promise<SavedProfile> => {
    const profile: SavedProfile = {
      id: makeId(), name, birthDate, birthTime, city,
      createdAt: new Date().toISOString(),
    };
    setProfiles(prev => {
      const next = [profile, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(next));
      return next;
    });
    if (makeActive) {
      setActiveId(profile.id);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE, profile.id);
      try {
        setChart(computeChart(birthDate, birthTime, city));
      } catch (e) { console.error('chart calc:', e); }
    }
    setIsOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, '1');
    setBridgePrefill(null); // profil kuruldu — köprü ön-doldurması artık gereksiz
    return profile;
  }, []);

  const selectProfile = useCallback(async (pid: string) => {
    const found = profiles.find(p => p.id === pid);
    if (!found) return;
    setActiveId(pid);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE, pid);
    try {
      setChart(computeChart(found.birthDate, found.birthTime, found.city));
    } catch (e) { console.error('chart calc:', e); }
  }, [profiles]);

  const updateProfilePhoto = useCallback(async (pid: string, photoUri: string | null) => {
    setProfiles(prev => {
      const next = prev.map(p =>
        p.id === pid
          ? { ...p, photoUri: photoUri ?? undefined }
          : p
      );
      AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProfile = useCallback(async (pid: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== pid);
      AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(next));
      return next;
    });
    if (activeId === pid) {
      setActiveId(null);
      setChart(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE);
    }
  }, [activeId]);

  const activeProfile: SavedProfile | null =
    profiles.find(p => p.id === activeId) || null;

  const getLevelTitle = useCallback((level: number) => {
    const t = ['Acemi', 'Gözlemci', 'Tanık', 'Çırak', 'Usta', 'Bilge', 'Pir'];
    return t[Math.min(level - 1, t.length - 1)];
  }, []);

  const value: StoreValue = {
    profiles, activeProfile, stats, chart, isLoading, isOnboarded, bridgePrefill, initialTab,
    addProfile, selectProfile, deleteProfile, updateProfilePhoto,
    setOnboarded, getLevelTitle,
  };

  return React.createElement(StoreCtx.Provider, { value }, children);
}

export function useTasarimStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) {
    throw new Error('useTasarimStore must be used within <StoreProvider>');
  }
  return ctx;
}
