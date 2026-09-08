// GUNUN KARTINA DOGRUDAN ACILMA (Sakin host -> Mitler embed)
// ---------------------------------------------------------------------------
// Kullanici: "Bugun ekranindaki mitler karti (or. I Ching Zarafet)
// tiklaninca kart listesine degil, O KARTIN detay sayfasina gitsin."
// Host, karti acarken localStorage'a 'sakin_open_card' ipucunu yazar:
//   { kind:"myth", system:"iching", id:"ic_22", ts:<now>, date:"YYYY-MM-DD" }
// (host ile embed AYNI origin; localStorage paylasili, kopru/postMessage yok.)
// Mitler bunu iki yolla okur:
//   1) Ilk mount'ta getInitialIntent() (yalnizca TAZE ipucu, ~15 sn icinde
//      yazilmis; boylece gunler sonra sayfa yenilenince kullanici zorla
//      detaya atilmaz).
//   2) onIntent(): host ipucu her yazdiginda 'storage' olayi (embed ayri
//      browsing context oldugu icin cross-document tetiklenir) -> yeni ts ile
//      tekrar navigasyon (sticky iframe ayni gun ikinci acilista da calissin).
// 'system' mitler'in 'kind'iyle birebir ayni (archetype/myth/image/tarot/
// rune/iching), 'id' daily-index ile ayni kaynaktan (ic_01 == ic_01).

export interface OpenCardIntent {
  kind: string; // mitler MitlerEntry.kind ile ayni
  id: string;
  ts: number;
}

const KEY = 'sakin_open_card';
const FRESH_MS = 15000;

function parse(raw: string | null): (OpenCardIntent & { fresh: boolean }) | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    // Yalnizca mitler karti ipucu (kind:"myth") + system + id olani ele al.
    if (!o || o.kind !== 'myth' || !o.system || !o.id) return null;
    const ts = typeof o.ts === 'number' ? o.ts : 0;
    return { kind: String(o.system), id: String(o.id), ts, fresh: Date.now() - ts < FRESH_MS };
  } catch {
    return null;
  }
}

/** Ilk mount icin: yalnizca TAZE (yeni yazilmis) ipucu doner. */
export function getInitialIntent(): OpenCardIntent | null {
  if (typeof localStorage === 'undefined') return null;
  const p = parse(localStorage.getItem(KEY));
  return p && p.fresh ? { kind: p.kind, id: p.id, ts: p.ts } : null;
}

/**
 * Host ipucu her degistiginde (yeni tiklamada) callback. Ayni ts tekrar
 * uygulanmaz (dedupe). Doner: aboneligi iptal eden fonksiyon.
 */
export function onIntent(cb: (intent: OpenCardIntent) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let lastTs = -1;
  const initial = getInitialIntent();
  if (initial) lastTs = initial.ts;
  const handler = (e: StorageEvent) => {
    if (e.key && e.key !== KEY) return;
    const p = parse(localStorage.getItem(KEY));
    if (p && p.ts && p.ts !== lastTs) {
      lastTs = p.ts;
      cb({ kind: p.kind, id: p.id, ts: p.ts });
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
