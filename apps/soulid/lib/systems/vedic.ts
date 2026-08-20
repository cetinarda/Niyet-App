// Vedik Astroloji: Lahiri ayanamsa ile sidereal Ay nakshatrası

const NAKSHATRAS = [
  { tr: 'Ashwini', deity: 'Ashwin Kumaras', symbol: 'At başı', power: 'Hızlı şifa, yeni başlangıç', range: 'Koç 0°-13°20\'' },
  { tr: 'Bharani', deity: 'Yama', symbol: 'Yoni', power: 'Dönüşüm, doğum-ölüm eşiği', range: 'Koç 13°20\'-26°40\'' },
  { tr: 'Krittika', deity: 'Agni', symbol: 'Bıçak/Alev', power: 'Saflaştıran ateş, kesin görüş', range: 'Koç 26°40\'-Boğa 10°' },
  { tr: 'Rohini', deity: 'Brahma', symbol: 'Araba', power: 'Çekim gücü, bolluk, sanat', range: 'Boğa 10°-23°20\'' },
  { tr: 'Mrigashira', deity: 'Soma', symbol: 'Geyik başı', power: 'Arayış, merak, gezginlik', range: 'Boğa 23°20\'-İkizler 6°40\'' },
  { tr: 'Ardra', deity: 'Rudra', symbol: 'Gözyaşı', power: 'Fırtına sonrası tazelenme, dönüşüm', range: 'İkizler 6°40\'-20°' },
  { tr: 'Punarvasu', deity: 'Aditi', symbol: 'Sadak', power: 'Geri dönüş, yeniden ışıma', range: 'İkizler 20°-Yengeç 3°20\'' },
  { tr: 'Pushya', deity: 'Brihaspati', symbol: 'İnek memesi', power: 'Besleyen koruyucu, ruhsal süt', range: 'Yengeç 3°20\'-16°40\'' },
  { tr: 'Ashlesha', deity: 'Naga', symbol: 'Sarılan yılan', power: 'Mistik bilgi, hipnoz, derinlik', range: 'Yengeç 16°40\'-30°' },
  { tr: 'Magha', deity: 'Pitris', symbol: 'Taht', power: 'Atalar gücü, kraliyet hattı', range: 'Aslan 0°-13°20\'' },
  { tr: 'Purva Phalguni', deity: 'Bhaga', symbol: 'Yatak ön ayakları', power: 'Zevk, yaratıcılık, romantizm', range: 'Aslan 13°20\'-26°40\'' },
  { tr: 'Uttara Phalguni', deity: 'Aryaman', symbol: 'Yatak arka ayakları', power: 'Bağ kurma, evlilik, sözleşme', range: 'Aslan 26°40\'-Başak 10°' },
  { tr: 'Hasta', deity: 'Savitr', symbol: 'El', power: 'Beceri, manifestasyon, zanaat', range: 'Başak 10°-23°20\'' },
  { tr: 'Chitra', deity: 'Tvashtri', symbol: 'Parlayan mücevher', power: 'Estetik, sihir, illüzyon', range: 'Başak 23°20\'-Terazi 6°40\'' },
  { tr: 'Swati', deity: 'Vayu', symbol: 'Rüzgârda sallanan filiz', power: 'Bağımsızlık, esneklik', range: 'Terazi 6°40\'-20°' },
  { tr: 'Vishakha', deity: 'Indragni', symbol: 'Zafer kemeri', power: 'Çift hedefli odak, yükselen başarı', range: 'Terazi 20°-Akrep 3°20\'' },
  { tr: 'Anuradha', deity: 'Mitra', symbol: 'Lotus', power: 'Dostluk, sadakat, derin bağ', range: 'Akrep 3°20\'-16°40\'' },
  { tr: 'Jyeshtha', deity: 'Indra', symbol: 'Küpe', power: 'En yaşlı bilge, sorumluluk', range: 'Akrep 16°40\'-30°' },
  { tr: 'Mula', deity: 'Nirriti', symbol: 'Kök demet', power: 'Kökleri sökme, hakikat arayışı', range: 'Yay 0°-13°20\'' },
  { tr: 'Purva Ashadha', deity: 'Apas', symbol: 'Yelpaze', power: 'Yenilmez ruh, içsel ateş', range: 'Yay 13°20\'-26°40\'' },
  { tr: 'Uttara Ashadha', deity: 'Vishvedevas', symbol: 'Fil dişi', power: 'Evrensel ilkeler, son zafer', range: 'Yay 26°40\'-Oğlak 10°' },
  { tr: 'Shravana', deity: 'Vishnu', symbol: 'Kulak', power: 'Dinleme bilgeliği, kutsal sözler', range: 'Oğlak 10°-23°20\'' },
  { tr: 'Dhanishta', deity: 'Vasus', symbol: 'Davul', power: 'Ritim, bolluk, müzik', range: 'Oğlak 23°20\'-Kova 6°40\'' },
  { tr: 'Shatabhisha', deity: 'Varuna', symbol: '100 şifacı', power: 'Gizem, şifa sırları, kozmik su', range: 'Kova 6°40\'-20°' },
  { tr: 'Purva Bhadrapada', deity: 'Aja Ekapada', symbol: 'Kılıç', power: 'Yakıcı vizyon, ruhsal ateş', range: 'Kova 20°-Balık 3°20\'' },
  { tr: 'Uttara Bhadrapada', deity: 'Ahir Budhnya', symbol: 'Yılanın derin koltuğu', power: 'Derin dinginlik, ezoterik bilgi', range: 'Balık 3°20\'-16°40\'' },
  { tr: 'Revati', deity: 'Pushan', symbol: 'Balık', power: 'Yumuşak veda, koruyucu öncü', range: 'Balık 16°40\'-30°' },
];

// Lahiri ayanamsa: J2000'de ~23.85°, yılda ~50.29" artar
function lahiriAyanamsa(date: Date): number {
  const julianYears = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000);
  return 23.85 + (julianYears * 50.29) / 3600;
}

export type VedicResult = {
  ayanamsa: number;
  moonSiderealLongitude: number;
  nakshatra: {
    index: number;
    name: string;
    deity: string;
    symbol: string;
    power: string;
    range: string;
  };
  pada: number;
};

export function calculateVedic(moonTropicalLongitude: number, birthISO: string): VedicResult {
  const date = new Date(birthISO);
  const ayan = lahiriAyanamsa(date);
  let sidereal = moonTropicalLongitude - ayan;
  if (sidereal < 0) sidereal += 360;
  const nakshatraSize = 360 / 27;
  const nakIdx = Math.floor(sidereal / nakshatraSize);
  const within = sidereal - nakIdx * nakshatraSize;
  const padaSize = nakshatraSize / 4;
  const pada = Math.floor(within / padaSize) + 1;
  const nak = NAKSHATRAS[nakIdx]!;
  return {
    ayanamsa: ayan,
    moonSiderealLongitude: sidereal,
    nakshatra: { index: nakIdx, name: nak.tr, deity: nak.deity, symbol: nak.symbol, power: nak.power, range: nak.range },
    pada,
  };
}
