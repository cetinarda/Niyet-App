// SAYI AİLELERİ: TEK KAYNAK
// ---------------------------------------------------------------------------
// Numerolojideki yaygın uyum üçlüleri: 1-5-7 (zihin, arayış) · 2-4-8 (yapı) ·
// 3-6-9 (yaratım). Usta sayılar köküne iner (11→2, 22→4, 33→6).
//
// ⚠️ NEDEN AYRI DOSYA (kullanıcı bildirdi: "ruh profilimde 5-7, galaktik
// kimlikte Kurucular 1-4-7"): bu tablo iki yerde AYRI AYRI tanımlıydı ve
// çelişiyordu. Karnedeki "Sayı Ailen" (compatibility/outlook.ts) 1-5-7 /
// 2-4-8 / 3-6-9 kullanıyordu; Sakin'e giden özet (sakin-summary.ts) sonradan
// mod-3 düzlemlerini (1-4-7 / 2-5-8 / 3-6-9) uydurmuştu. Yaşam yolu 1 olan
// kişi bir ekranda "5 · 7", diğerinde "1 · 4 · 7" görüyordu. Artık ikisi de
// BURADAN okuyor. Sakin host'u (src/App.jsx NUMBER_FAMILY_TXT) AYNI üçlüleri
// 7 dilde taşır; burayı değiştirirsen orayı da değiştir.

export const LP_TRIADS: number[][] = [
  [1, 5, 7],
  [2, 4, 8],
  [3, 6, 9],
];

const NAMES: Record<string, { tr: string; en: string }> = {
  '1,5,7': { tr: 'Arayanlar', en: 'Seekers' },
  '2,4,8': { tr: 'Kurucular', en: 'Builders' },
  '3,6,9': { tr: 'Işıklar', en: 'Lights' },
};

export function lifePathRoot(lp: number): number {
  return lp === 11 ? 2 : lp === 22 ? 4 : lp === 33 ? 6 : lp;
}

/** Yaşam yolunun ailesi: kök sayı, üçlü, adı ("Arayanlar") ve etiketi ("Arayanlar (1 · 5 · 7)"). */
export function numberFamily(lp: number): {
  root: number;
  members: number[];
  name: { tr: string; en: string };
  label: { tr: string; en: string };
} {
  const root = lifePathRoot(lp);
  const members = LP_TRIADS.find((t) => t.includes(root)) ?? [root];
  const name = NAMES[members.join(',')] ?? { tr: '', en: '' };
  const nums = members.join(' · ');
  return {
    root,
    members,
    name,
    label: { tr: name.tr ? `${name.tr} (${nums})` : nums, en: name.en ? `${name.en} (${nums})` : nums },
  };
}
