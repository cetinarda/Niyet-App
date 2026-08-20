// Lansman öncesi bayrakları — mağazalarda yayınlanana kadar geçerli.
//
//  - FREE_MODE: her şey ÜCRETSİZ. Premium gate'ler kapalı, satın alma denenmez,
//    upsell kartları gizli, deep-analysis açık. hasPremium() bu modda daima true.
//  - WEB_APP_OPEN: web'de tüm interaktif özellikler açık (AppOnlyGate bypass).
//
// İkisi de env ile sürülür ve VARSAYILAN AÇIK. Ücretli + yalnızca-uygulama
// moduna dönmek için deploy env'ine ekle:
//    NEXT_PUBLIC_FREE_MODE=0
//    NEXT_PUBLIC_WEB_APP_OPEN=0
// (NEXT_PUBLIC_ öneki build anında hem client hem server'a gömülür → deep-analysis
// route'u da aynı bayrağı okuyabilir.)

export const FREE_MODE = process.env.NEXT_PUBLIC_FREE_MODE !== '0';
export const WEB_APP_OPEN = process.env.NEXT_PUBLIC_WEB_APP_OPEN !== '0';

// premiumOpen: FREE_MODE'da herkes premium sayılır → yıldız konum/hareketi ve
// tüm görselleştirmeler açık, upsell kartı gizli. (hasPremium FREE_MODE'u içerir.)
export { hasPremium as premiumOpen } from './entitlements';
