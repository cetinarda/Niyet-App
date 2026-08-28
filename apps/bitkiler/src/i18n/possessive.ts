// Turkce ILGI EKI (-in hali). Ad ile eki dogrudan birlestirmek yanlis sonuc
// veriyordu: "Koala" + "'in derin rehberligi" -> "Koala'in" (dogrusu "Koala'nin").
// Iki kural birden gerekiyor:
//   1) UNLU UYUMU  son unlu a/i -> in · e/i -> in · o/u -> un · o/u -> un
//   2) KAYNASTIRMA  ad UNLU ile bitiyorsa araya 'n' girer (Koala'nin, Ayi'nin)
// Ozel ad gibi kesme isaretiyle yazilir (Kurt'un, Kartal'in), veri adlari
// zaten tekil ozel ad olarak kullaniliyor.
export function trPossessive(name: string): string {
  const s = (name || '').trim();
  if (!s) return '';
  const lower = s.toLocaleLowerCase('tr');
  const vowels = 'aeıioöuü';
  let last = '';
  for (let i = lower.length - 1; i >= 0; i--) {
    if (vowels.includes(lower[i])) { last = lower[i]; break; }
  }
  const suffix =
    'aı'.includes(last) ? 'ın' :
    'ei'.includes(last) ? 'in' :
    'ou'.includes(last) ? 'un' :
    'öü'.includes(last) ? 'ün' :
    'in'; // unlu bulunamadi (kisaltma vb.): en notr ek
  const endsWithVowel = vowels.includes(lower[lower.length - 1]);
  return "'" + (endsWithVowel ? 'n' : '') + suffix;
}
