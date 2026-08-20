/**
 * Aktif karne handoff — iOS Capacitor'da sayfa değişiminde
 * window.location.assign() tam-sayfa reload yapıyor; zustand state uçuyor.
 * Hangi karneyi göstereceğimizi sayfalar arası taşımak için karne ID'sini
 * localStorage'a yazıyoruz (ID PII değil — UUID), /report onu okuyup
 * şifreli karne listesinden ilgili karneyi buluyor.
 */

const KEY = 'soulprofile.activeReportId';

export function setActiveReportId(id: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, id);
  } catch {
    /* private mode / quota */
  }
}

export function readActiveReportId(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearActiveReportId(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
