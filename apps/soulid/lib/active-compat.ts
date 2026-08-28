/**
 * Aktif uyum handoff, `lib/active-report.ts` ile aynı desen: iOS Capacitor'da
 * sayfa değişimi tam-sayfa reload yapabiliyor, zustand state uçuyor. Hangi
 * uyumu (çift) göstereceğimizi /pair/result'a taşımak için compat ID'sini
 * localStorage'a yazıyoruz (ID PII değil, deterministik çift kimliği).
 * /pair/result bunu okuyup `listCompat()`'tan ilgili kaydı (birthA/birthB)
 * bulur ve karneleri/sonuç ile anlatıyı YENİDEN hesaplar (astro hesaplama
 * deterministik ve anlık; yalnızca AI anlatı ağ isteği ister).
 */

const KEY = 'soulprofile.activeCompatId';

export function setActiveCompatId(id: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, id);
  } catch {
    /* private mode / quota */
  }
}

export function readActiveCompatId(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearActiveCompatId(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
