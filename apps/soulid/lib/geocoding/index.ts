// Open-Meteo geocoding — anahtarsız.
// https://open-meteo.com/en/docs/geocoding-api
//
// iOS Capacitor (capacitor://localhost origin) altında Open-Meteo CORS başlığı
// bu scheme'i kabul etmiyor → WKWebView preflight başarısız → fetch throw eder.
// Native'de @capacitor/core'un CapacitorHttp'sini kullanıyoruz: HTTP isteği
// WebView'ın DIŞINDA, native katmanda yapılır → CORS yok.
//
// ÖNEMLİ: @capacitor/core STATİK import edilir. Eski kod `new Function(...import)`
// ile dinamik import ediyordu; webpack bunu bundle'layamadığı için native'de
// `capacitor://localhost/@capacitor/core` → 404 → her zaman fail ediyordu.
// Statik import doğru bundle'lanır ve hem web hem native'de çalışır.

import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { searchLocalCities } from './cities';

export type GeocodeResult = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type RawHit = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

// Doğum yeri çözümü kritik yol üzerinde; tek bir dış servis takılırsa kullanıcı
// profil oluşturamaz (App Store 2.1(a) reddi). Ağ isteğine kısa timeout koy,
// başarısız/boş dönerse offline gazetteer'a düş.
const GEO_TIMEOUT_MS = 7_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('geocode timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

async function fetchJson(url: string): Promise<{ results?: RawHit[] } | null> {
  // Native: CapacitorHttp (CORS bypass)
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await withTimeout(
        CapacitorHttp.get({ url, headers: { Accept: 'application/json' } }),
        GEO_TIMEOUT_MS,
      );
      if (res.status >= 200 && res.status < 300) {
        const d = res.data;
        if (typeof d === 'string') {
          try {
            return JSON.parse(d);
          } catch {
            return null;
          }
        }
        return d as { results?: RawHit[] };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Web: normal fetch (Open-Meteo web origin'lerde CORS *'a izin verir)
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;
      return (await res.json()) as { results?: RawHit[] };
    } finally {
      clearTimeout(t);
    }
  } catch {
    return null;
  }
}

export async function geocodePlace(query: string, language: string = 'tr'): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=5&language=${encodeURIComponent(language)}&format=json`;

  const data = await fetchJson(url);
  const hits = (data?.results ?? []).map((r) => ({
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));

  // Ağ sonuç döndürdüyse onu kullan (daha kapsamlı). Boş/başarısızsa —
  // review ağında Open-Meteo yavaş/engelli olabilir — offline gazetteer'a düş
  // ki büyük şehirler her koşulda çözülsün ve profil oluşturulabilsin.
  if (hits.length > 0) return hits;
  return searchLocalCities(query);
}
