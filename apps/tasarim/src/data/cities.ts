export interface City {
  name: string;          // "İstanbul, Türkiye"
  lat: number;           // ondalık derece
  lng: number;
  tz: number;            // standart UTC offset (saat) — DST haricinde
  country: string;
  dst?: 'eu' | 'us' | 'tr' | 'none';   // DST kuralı
}

// Kurallar:
// - AB: Mart son Pazar 01:00 UTC – Ekim son Pazar 01:00 UTC (+1)
// - ABD: Mart 2. Pazar – Kasım 1. Pazar yerel 02:00 (+1)
// - Türkiye: 1985-2016 arası AB kuralları (+1), 2017+ kalıcı +1 (UTC+3 sabit).
//   Bu yüzden Türk şehirleri tz:2 + dst:'tr' olarak tanımlandı.

export const CITIES: City[] = [
  // Türkiye
  { name: 'İstanbul, Türkiye', lat: 41.0082, lng: 28.9784, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Ankara, Türkiye', lat: 39.9334, lng: 32.8597, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'İzmir, Türkiye', lat: 38.4192, lng: 27.1287, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Bursa, Türkiye', lat: 40.1828, lng: 29.0665, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Antalya, Türkiye', lat: 36.8969, lng: 30.7133, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Adana, Türkiye', lat: 37.0000, lng: 35.3213, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Konya, Türkiye', lat: 37.8746, lng: 32.4932, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Gaziantep, Türkiye', lat: 37.0662, lng: 37.3833, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Kayseri, Türkiye', lat: 38.7312, lng: 35.4787, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Eskişehir, Türkiye', lat: 39.7767, lng: 30.5206, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Trabzon, Türkiye', lat: 41.0015, lng: 39.7178, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Diyarbakır, Türkiye', lat: 37.9144, lng: 40.2306, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Samsun, Türkiye', lat: 41.2867, lng: 36.3300, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Erzurum, Türkiye', lat: 39.9000, lng: 41.2700, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Mersin, Türkiye', lat: 36.8121, lng: 34.6415, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Sakarya, Türkiye', lat: 40.7569, lng: 30.3781, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Denizli, Türkiye', lat: 37.7765, lng: 29.0864, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Muğla, Türkiye', lat: 37.2154, lng: 28.3636, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Bodrum, Türkiye', lat: 37.0344, lng: 27.4305, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Çanakkale, Türkiye', lat: 40.1553, lng: 26.4142, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Edirne, Türkiye', lat: 41.6764, lng: 26.5557, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Van, Türkiye', lat: 38.4942, lng: 43.3833, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Mardin, Türkiye', lat: 37.3212, lng: 40.7245, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Şanlıurfa, Türkiye', lat: 37.1591, lng: 38.7969, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Kocaeli, Türkiye', lat: 40.8533, lng: 29.8815, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Tekirdağ, Türkiye', lat: 40.9833, lng: 27.5167, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Balıkesir, Türkiye', lat: 39.6484, lng: 27.8826, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Manisa, Türkiye', lat: 38.6191, lng: 27.4289, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Aydın, Türkiye', lat: 37.8444, lng: 27.8458, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Hatay, Türkiye', lat: 36.4018, lng: 36.3498, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Malatya, Türkiye', lat: 38.3552, lng: 38.3095, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Sivas, Türkiye', lat: 39.7477, lng: 37.0179, tz: 2, country: 'TR', dst: 'tr' },

  // Avrupa
  { name: 'Londra, Birleşik Krallık', lat: 51.5074, lng: -0.1278, tz: 0, country: 'GB', dst: 'eu' },
  { name: 'Paris, Fransa', lat: 48.8566, lng: 2.3522, tz: 1, country: 'FR', dst: 'eu' },
  { name: 'Berlin, Almanya', lat: 52.5200, lng: 13.4050, tz: 1, country: 'DE', dst: 'eu' },
  { name: 'Münih, Almanya', lat: 48.1351, lng: 11.5820, tz: 1, country: 'DE', dst: 'eu' },
  { name: 'Frankfurt, Almanya', lat: 50.1109, lng: 8.6821, tz: 1, country: 'DE', dst: 'eu' },
  { name: 'Köln, Almanya', lat: 50.9375, lng: 6.9603, tz: 1, country: 'DE', dst: 'eu' },
  { name: 'Hamburg, Almanya', lat: 53.5511, lng: 9.9937, tz: 1, country: 'DE', dst: 'eu' },
  { name: 'Amsterdam, Hollanda', lat: 52.3676, lng: 4.9041, tz: 1, country: 'NL', dst: 'eu' },
  { name: 'Brüksel, Belçika', lat: 50.8503, lng: 4.3517, tz: 1, country: 'BE', dst: 'eu' },
  { name: 'Viyana, Avusturya', lat: 48.2082, lng: 16.3738, tz: 1, country: 'AT', dst: 'eu' },
  { name: 'Roma, İtalya', lat: 41.9028, lng: 12.4964, tz: 1, country: 'IT', dst: 'eu' },
  { name: 'Milano, İtalya', lat: 45.4642, lng: 9.1900, tz: 1, country: 'IT', dst: 'eu' },
  { name: 'Madrid, İspanya', lat: 40.4168, lng: -3.7038, tz: 1, country: 'ES', dst: 'eu' },
  { name: 'Barselona, İspanya', lat: 41.3851, lng: 2.1734, tz: 1, country: 'ES', dst: 'eu' },
  { name: 'Lizbon, Portekiz', lat: 38.7223, lng: -9.1393, tz: 0, country: 'PT', dst: 'eu' },
  { name: 'Dublin, İrlanda', lat: 53.3498, lng: -6.2603, tz: 0, country: 'IE', dst: 'eu' },
  { name: 'Stockholm, İsveç', lat: 59.3293, lng: 18.0686, tz: 1, country: 'SE', dst: 'eu' },
  { name: 'Oslo, Norveç', lat: 59.9139, lng: 10.7522, tz: 1, country: 'NO', dst: 'eu' },
  { name: 'Kopenhag, Danimarka', lat: 55.6761, lng: 12.5683, tz: 1, country: 'DK', dst: 'eu' },
  { name: 'Helsinki, Finlandiya', lat: 60.1699, lng: 24.9384, tz: 2, country: 'FI', dst: 'eu' },
  { name: 'Atina, Yunanistan', lat: 37.9838, lng: 23.7275, tz: 2, country: 'GR', dst: 'eu' },
  { name: 'Sofya, Bulgaristan', lat: 42.6977, lng: 23.3219, tz: 2, country: 'BG', dst: 'eu' },
  { name: 'Bükreş, Romanya', lat: 44.4268, lng: 26.1025, tz: 2, country: 'RO', dst: 'eu' },
  { name: 'Budapeşte, Macaristan', lat: 47.4979, lng: 19.0402, tz: 1, country: 'HU', dst: 'eu' },
  { name: 'Prag, Çekya', lat: 50.0755, lng: 14.4378, tz: 1, country: 'CZ', dst: 'eu' },
  { name: 'Varşova, Polonya', lat: 52.2297, lng: 21.0122, tz: 1, country: 'PL', dst: 'eu' },
  { name: 'Zürih, İsviçre', lat: 47.3769, lng: 8.5417, tz: 1, country: 'CH', dst: 'eu' },
  { name: 'Cenevre, İsviçre', lat: 46.2044, lng: 6.1432, tz: 1, country: 'CH', dst: 'eu' },

  // Amerika
  { name: 'New York, ABD', lat: 40.7128, lng: -74.0060, tz: -5, country: 'US', dst: 'us' },
  { name: 'Los Angeles, ABD', lat: 34.0522, lng: -118.2437, tz: -8, country: 'US', dst: 'us' },
  { name: 'Chicago, ABD', lat: 41.8781, lng: -87.6298, tz: -6, country: 'US', dst: 'us' },
  { name: 'Houston, ABD', lat: 29.7604, lng: -95.3698, tz: -6, country: 'US', dst: 'us' },
  { name: 'Miami, ABD', lat: 25.7617, lng: -80.1918, tz: -5, country: 'US', dst: 'us' },
  { name: 'San Francisco, ABD', lat: 37.7749, lng: -122.4194, tz: -8, country: 'US', dst: 'us' },
  { name: 'Boston, ABD', lat: 42.3601, lng: -71.0589, tz: -5, country: 'US', dst: 'us' },
  { name: 'Seattle, ABD', lat: 47.6062, lng: -122.3321, tz: -8, country: 'US', dst: 'us' },
  { name: 'Toronto, Kanada', lat: 43.6532, lng: -79.3832, tz: -5, country: 'CA', dst: 'us' },
  { name: 'Vancouver, Kanada', lat: 49.2827, lng: -123.1207, tz: -8, country: 'CA', dst: 'us' },
  { name: 'Montreal, Kanada', lat: 45.5017, lng: -73.5673, tz: -5, country: 'CA', dst: 'us' },
  { name: 'Mexico City, Meksika', lat: 19.4326, lng: -99.1332, tz: -6, country: 'MX', dst: 'none' },
  { name: 'São Paulo, Brezilya', lat: -23.5505, lng: -46.6333, tz: -3, country: 'BR', dst: 'none' },
  { name: 'Rio de Janeiro, Brezilya', lat: -22.9068, lng: -43.1729, tz: -3, country: 'BR', dst: 'none' },
  { name: 'Buenos Aires, Arjantin', lat: -34.6037, lng: -58.3816, tz: -3, country: 'AR', dst: 'none' },
  { name: 'Santiago, Şili', lat: -33.4489, lng: -70.6693, tz: -4, country: 'CL', dst: 'none' },
  { name: 'Lima, Peru', lat: -12.0464, lng: -77.0428, tz: -5, country: 'PE', dst: 'none' },
  { name: 'Bogotá, Kolombiya', lat: 4.7110, lng: -74.0721, tz: -5, country: 'CO', dst: 'none' },

  // Asya
  { name: 'Tokyo, Japonya', lat: 35.6762, lng: 139.6503, tz: 9, country: 'JP', dst: 'none' },
  { name: 'Osaka, Japonya', lat: 34.6937, lng: 135.5023, tz: 9, country: 'JP', dst: 'none' },
  { name: 'Pekin, Çin', lat: 39.9042, lng: 116.4074, tz: 8, country: 'CN', dst: 'none' },
  { name: 'Şanghay, Çin', lat: 31.2304, lng: 121.4737, tz: 8, country: 'CN', dst: 'none' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, tz: 8, country: 'HK', dst: 'none' },
  { name: 'Seul, Güney Kore', lat: 37.5665, lng: 126.9780, tz: 9, country: 'KR', dst: 'none' },
  { name: 'Singapur', lat: 1.3521, lng: 103.8198, tz: 8, country: 'SG', dst: 'none' },
  { name: 'Bangkok, Tayland', lat: 13.7563, lng: 100.5018, tz: 7, country: 'TH', dst: 'none' },
  { name: 'Yeni Delhi, Hindistan', lat: 28.6139, lng: 77.2090, tz: 5.5, country: 'IN', dst: 'none' },
  { name: 'Bombay, Hindistan', lat: 19.0760, lng: 72.8777, tz: 5.5, country: 'IN', dst: 'none' },
  { name: 'Bali (Denpasar), Endonezya', lat: -8.6705, lng: 115.2126, tz: 8, country: 'ID', dst: 'none' },
  { name: 'Jakarta, Endonezya', lat: -6.2088, lng: 106.8456, tz: 7, country: 'ID', dst: 'none' },
  { name: 'Manila, Filipinler', lat: 14.5995, lng: 120.9842, tz: 8, country: 'PH', dst: 'none' },
  { name: 'Hanoi, Vietnam', lat: 21.0285, lng: 105.8542, tz: 7, country: 'VN', dst: 'none' },
  { name: 'Tahran, İran', lat: 35.6892, lng: 51.3890, tz: 3.5, country: 'IR', dst: 'none' },

  // Orta Doğu
  { name: 'Dubai, BAE', lat: 25.2048, lng: 55.2708, tz: 4, country: 'AE', dst: 'none' },
  { name: 'Abu Dabi, BAE', lat: 24.4539, lng: 54.3773, tz: 4, country: 'AE', dst: 'none' },
  { name: 'Doha, Katar', lat: 25.2854, lng: 51.5310, tz: 3, country: 'QA', dst: 'none' },
  { name: 'Riyad, Suudi Arabistan', lat: 24.7136, lng: 46.6753, tz: 3, country: 'SA', dst: 'none' },
  { name: 'Tel Aviv, İsrail', lat: 32.0853, lng: 34.7818, tz: 2, country: 'IL', dst: 'eu' },
  { name: 'Kudüs, İsrail', lat: 31.7683, lng: 35.2137, tz: 2, country: 'IL', dst: 'eu' },
  { name: 'Beyrut, Lübnan', lat: 33.8938, lng: 35.5018, tz: 2, country: 'LB', dst: 'eu' },
  { name: 'Amman, Ürdün', lat: 31.9454, lng: 35.9284, tz: 3, country: 'JO', dst: 'none' },
  { name: 'Bağdat, Irak', lat: 33.3152, lng: 44.3661, tz: 3, country: 'IQ', dst: 'none' },
  { name: 'Bakü, Azerbaycan', lat: 40.4093, lng: 49.8671, tz: 4, country: 'AZ', dst: 'none' },
  { name: 'Tiflis, Gürcistan', lat: 41.7151, lng: 44.8271, tz: 4, country: 'GE', dst: 'none' },

  // Afrika
  { name: 'Kahire, Mısır', lat: 30.0444, lng: 31.2357, tz: 2, country: 'EG', dst: 'eu' },
  { name: 'Lagos, Nijerya', lat: 6.5244, lng: 3.3792, tz: 1, country: 'NG', dst: 'none' },
  { name: 'Cape Town, G. Afrika', lat: -33.9249, lng: 18.4241, tz: 2, country: 'ZA', dst: 'none' },
  { name: 'Johannesburg, G. Afrika', lat: -26.2041, lng: 28.0473, tz: 2, country: 'ZA', dst: 'none' },
  { name: 'Marakeş, Fas', lat: 31.6295, lng: -7.9811, tz: 1, country: 'MA', dst: 'none' },

  // Okyanusya
  { name: 'Sidney, Avustralya', lat: -33.8688, lng: 151.2093, tz: 10, country: 'AU', dst: 'none' },
  { name: 'Melbourne, Avustralya', lat: -37.8136, lng: 144.9631, tz: 10, country: 'AU', dst: 'none' },
  { name: 'Auckland, Yeni Zelanda', lat: -36.8485, lng: 174.7633, tz: 12, country: 'NZ', dst: 'none' },

  // Rusya / BDT
  { name: 'Moskova, Rusya', lat: 55.7558, lng: 37.6173, tz: 3, country: 'RU', dst: 'none' },
  { name: 'St. Petersburg, Rusya', lat: 59.9311, lng: 30.3609, tz: 3, country: 'RU', dst: 'none' },
  { name: 'Kiev, Ukrayna', lat: 50.4501, lng: 30.5234, tz: 2, country: 'UA', dst: 'eu' },
  { name: 'Lefkoşa, KKTC', lat: 35.1856, lng: 33.3823, tz: 2, country: 'TR', dst: 'tr' },
  { name: 'Diğer / Bilinmiyor', lat: 41.0082, lng: 28.9784, tz: 3, country: 'XX', dst: 'none' },
];

export function searchCities(query: string, limit = 8): City[] {
  const q = query.trim().toLocaleLowerCase('tr');
  if (!q) return [];
  return CITIES.filter(c => c.name.toLocaleLowerCase('tr').includes(q)).slice(0, limit);
}

// AB DST: Mart son Pazar 01:00 UTC – Ekim son Pazar 01:00 UTC
function lastSundayOfMonth(year: number, month: number): Date {
  const d = new Date(Date.UTC(year, month + 1, 0)); // ayın son günü
  const dow = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - dow);
  return d;
}
// ABD DST: Mart 2. Pazar 02:00 yerel – Kasım 1. Pazar 02:00 yerel
function nthSundayOfMonth(year: number, month: number, n: number): Date {
  const d = new Date(Date.UTC(year, month, 1));
  const dow = d.getUTCDay();
  const offset = (7 - dow) % 7;
  d.setUTCDate(1 + offset + (n - 1) * 7);
  return d;
}

// utcDate: doğum anının UTC tarihi
export function dstOffsetHours(city: City, utcDate: Date): number {
  if (city.dst === 'none' || !city.dst) return 0;
  const y = utcDate.getUTCFullYear();
  if (city.dst === 'eu') {
    const start = lastSundayOfMonth(y, 2);  // Mart
    start.setUTCHours(1);
    const end = lastSundayOfMonth(y, 9);    // Ekim
    end.setUTCHours(1);
    return utcDate >= start && utcDate < end ? 1 : 0;
  }
  if (city.dst === 'us') {
    const start = nthSundayOfMonth(y, 2, 2);  // Mart 2. Pazar
    start.setUTCHours(2 - city.tz);
    const end = nthSundayOfMonth(y, 10, 1);   // Kasım 1. Pazar
    end.setUTCHours(2 - city.tz);
    return utcDate >= start && utcDate < end ? 1 : 0;
  }
  if (city.dst === 'tr') {
    // Türkiye: 2017'den itibaren kalıcı +1 (UTC+3 sabit). 1985-2016 AB kuralları.
    if (y >= 2017) return 1;
    if (y < 1985) return 0;
    const start = lastSundayOfMonth(y, 2);
    start.setUTCHours(1);
    const end = lastSundayOfMonth(y, 9);
    end.setUTCHours(1);
    return utcDate >= start && utcDate < end ? 1 : 0;
  }
  return 0;
}
