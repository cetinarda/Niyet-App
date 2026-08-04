// Host (sakin.life) Android donanım geri tuşu köprüsü.
//
// Host, embed'i kapatmadan ÖNCE iframe'e `{type:'sakin-back'}` yollar. Burada
// kayıtlı handler'lardan biri "bir adım geri gidebildim" derse host embed'i
// KAPATMAZ. Böylece kullanıcı detay kartındayken geri'ye basınca Keşfet'e
// fırlamak yerine bir önceki ekrana döner.
//
// `priority` iç içe geçme derinliğidir — en YÜKSEK olan önce denenir. React
// effect'leri çocuk→ebeveyn sırasıyla çalıştığı için kayıt sırasına güvenilemez,
// bu yüzden derinlik açıkça verilir.
export const BACK_PRIORITY = {
  hub: 1,     // sekme/alt menü seviyesi (Bul menüsüne dön)
  screen: 2,  // ekran içi mod (sonuç listesi → başlangıç)
  detail: 3,  // açık detay kartı
};

type BackHandler = () => boolean;
type Entry = { priority: number; handler: BackHandler };

const entries: Entry[] = [];

export function pushBackHandler(priority: number, handler: BackHandler): () => void {
  const entry: Entry = { priority, handler };
  entries.push(entry);
  return () => {
    const i = entries.indexOf(entry);
    if (i >= 0) entries.splice(i, 1);
  };
}

export function runBackHandlers(): boolean {
  const ordered = [...entries].sort((a, b) => b.priority - a.priority);
  for (const e of ordered) {
    try { if (e.handler()) return true; } catch (err) { /* yut, sıradakine geç */ }
  }
  return false;
}

// Embed kök bileşeninde bir kez çağrılır (idempotent).
export function installHostBackBridge(): void {
  if (typeof window === 'undefined') return;
  if ((window as any).__sakinBackBridge) return;
  (window as any).__sakinBackBridge = true;
  window.addEventListener('message', (e: MessageEvent) => {
    const d: any = e.data;
    if (!d || d.type !== 'sakin-back') return;
    const handled = runBackHandlers();
    try { window.parent.postMessage({ type: 'sakin-back-result', handled }, '*'); } catch (err) {}
  });
}
