// Offline şehir sözlüğü (gazetteer) — ağ geocoding'i (Open-Meteo) BOŞ dönerse
// ya da başarısız olursa devreye giren yedek. App Store reviewer'ları çoğunlukla
// California'dan test eder ve review ağı bazen üçüncü-parti API'leri yavaşlatır/
// engeller; bu yüzden doğum yeri çözümü ASLA tek bir dış servise bağlı kalmamalı.
// (Guideline 2.1(a): "profil oluşturulamıyor" reddi buradan çıkıyordu.)
//
// Kapsam: dünya başkentleri + büyük şehirler, güçlü US (reviewer) + TR (birincil
// pazar) ağırlığı. Koordinatlar şehir merkezi; astroloji için şehir hassasiyeti
// yeterli. Timezone = IANA.

export type CityEntry = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  // Ek arama takma adları (İngilizce/yerel/ASCII yazımlar). Eşleşme
  // normalize edildiğinden çoğu durumda gereksiz; sadece belirgin farklar.
  aliases?: string[];
};

export const CITIES: CityEntry[] = [
  // --- Türkiye ---
  { name: 'İstanbul', country: 'Türkiye', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul', aliases: ['istanbul', 'constantinople'] },
  { name: 'Ankara', country: 'Türkiye', latitude: 39.9334, longitude: 32.8597, timezone: 'Europe/Istanbul' },
  { name: 'İzmir', country: 'Türkiye', latitude: 38.4237, longitude: 27.1428, timezone: 'Europe/Istanbul', aliases: ['izmir', 'smyrna'] },
  { name: 'Bursa', country: 'Türkiye', latitude: 40.1826, longitude: 29.0665, timezone: 'Europe/Istanbul' },
  { name: 'Antalya', country: 'Türkiye', latitude: 36.8969, longitude: 30.7133, timezone: 'Europe/Istanbul' },
  { name: 'Adana', country: 'Türkiye', latitude: 37.0000, longitude: 35.3213, timezone: 'Europe/Istanbul' },
  { name: 'Konya', country: 'Türkiye', latitude: 37.8746, longitude: 32.4932, timezone: 'Europe/Istanbul' },
  { name: 'Gaziantep', country: 'Türkiye', latitude: 37.0662, longitude: 37.3833, timezone: 'Europe/Istanbul' },
  { name: 'Kayseri', country: 'Türkiye', latitude: 38.7312, longitude: 35.4787, timezone: 'Europe/Istanbul' },
  { name: 'Mersin', country: 'Türkiye', latitude: 36.8121, longitude: 34.6415, timezone: 'Europe/Istanbul' },
  { name: 'Eskişehir', country: 'Türkiye', latitude: 39.7767, longitude: 30.5206, timezone: 'Europe/Istanbul', aliases: ['eskisehir'] },
  { name: 'Diyarbakır', country: 'Türkiye', latitude: 37.9144, longitude: 40.2306, timezone: 'Europe/Istanbul', aliases: ['diyarbakir'] },
  { name: 'Samsun', country: 'Türkiye', latitude: 41.2867, longitude: 36.3300, timezone: 'Europe/Istanbul' },
  { name: 'Denizli', country: 'Türkiye', latitude: 37.7765, longitude: 29.0864, timezone: 'Europe/Istanbul' },
  { name: 'Trabzon', country: 'Türkiye', latitude: 41.0015, longitude: 39.7178, timezone: 'Europe/Istanbul' },
  { name: 'Malatya', country: 'Türkiye', latitude: 38.3552, longitude: 38.3095, timezone: 'Europe/Istanbul' },
  { name: 'Erzurum', country: 'Türkiye', latitude: 39.9000, longitude: 41.2700, timezone: 'Europe/Istanbul' },
  { name: 'Van', country: 'Türkiye', latitude: 38.4891, longitude: 43.4089, timezone: 'Europe/Istanbul' },
  { name: 'Şanlıurfa', country: 'Türkiye', latitude: 37.1591, longitude: 38.7969, timezone: 'Europe/Istanbul', aliases: ['sanliurfa', 'urfa'] },
  { name: 'Kocaeli', country: 'Türkiye', latitude: 40.8533, longitude: 29.8815, timezone: 'Europe/Istanbul', aliases: ['izmit'] },
  { name: 'Muğla', country: 'Türkiye', latitude: 37.2153, longitude: 28.3636, timezone: 'Europe/Istanbul', aliases: ['mugla', 'bodrum'] },

  // --- USA (reviewer ağırlıklı) ---
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', aliases: ['nyc', 'new york city'] },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles', aliases: ['la'] },
  { name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { name: 'Houston', country: 'United States', latitude: 29.7604, longitude: -95.3698, timezone: 'America/Chicago' },
  { name: 'Phoenix', country: 'United States', latitude: 33.4484, longitude: -112.0740, timezone: 'America/Phoenix' },
  { name: 'Philadelphia', country: 'United States', latitude: 39.9526, longitude: -75.1652, timezone: 'America/New_York' },
  { name: 'San Antonio', country: 'United States', latitude: 29.4241, longitude: -98.4936, timezone: 'America/Chicago' },
  { name: 'San Diego', country: 'United States', latitude: 32.7157, longitude: -117.1611, timezone: 'America/Los_Angeles' },
  { name: 'Dallas', country: 'United States', latitude: 32.7767, longitude: -96.7970, timezone: 'America/Chicago' },
  { name: 'San Jose', country: 'United States', latitude: 37.3382, longitude: -121.8863, timezone: 'America/Los_Angeles' },
  { name: 'Austin', country: 'United States', latitude: 30.2672, longitude: -97.7431, timezone: 'America/Chicago' },
  { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles', aliases: ['sf'] },
  { name: 'Cupertino', country: 'United States', latitude: 37.3230, longitude: -122.0322, timezone: 'America/Los_Angeles' },
  { name: 'Seattle', country: 'United States', latitude: 47.6062, longitude: -122.3321, timezone: 'America/Los_Angeles' },
  { name: 'Denver', country: 'United States', latitude: 39.7392, longitude: -104.9903, timezone: 'America/Denver' },
  { name: 'Boston', country: 'United States', latitude: 42.3601, longitude: -71.0589, timezone: 'America/New_York' },
  { name: 'Washington', country: 'United States', latitude: 38.9072, longitude: -77.0369, timezone: 'America/New_York', aliases: ['washington dc', 'dc'] },
  { name: 'Miami', country: 'United States', latitude: 25.7617, longitude: -80.1918, timezone: 'America/New_York' },
  { name: 'Atlanta', country: 'United States', latitude: 33.7490, longitude: -84.3880, timezone: 'America/New_York' },
  { name: 'Las Vegas', country: 'United States', latitude: 36.1699, longitude: -115.1398, timezone: 'America/Los_Angeles' },
  { name: 'Portland', country: 'United States', latitude: 45.5152, longitude: -122.6784, timezone: 'America/Los_Angeles' },
  { name: 'Detroit', country: 'United States', latitude: 42.3314, longitude: -83.0458, timezone: 'America/Detroit' },
  { name: 'Minneapolis', country: 'United States', latitude: 44.9778, longitude: -93.2650, timezone: 'America/Chicago' },
  { name: 'Sacramento', country: 'United States', latitude: 38.5816, longitude: -121.4944, timezone: 'America/Los_Angeles' },
  { name: 'Honolulu', country: 'United States', latitude: 21.3069, longitude: -157.8583, timezone: 'Pacific/Honolulu' },

  // --- Canada ---
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Montreal', country: 'Canada', latitude: 45.5019, longitude: -73.5674, timezone: 'America/Toronto', aliases: ['montréal'] },
  { name: 'Vancouver', country: 'Canada', latitude: 49.2827, longitude: -123.1207, timezone: 'America/Vancouver' },
  { name: 'Calgary', country: 'Canada', latitude: 51.0447, longitude: -114.0719, timezone: 'America/Edmonton' },
  { name: 'Ottawa', country: 'Canada', latitude: 45.4215, longitude: -75.6972, timezone: 'America/Toronto' },

  // --- UK & Ireland ---
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Manchester', country: 'United Kingdom', latitude: 53.4808, longitude: -2.2426, timezone: 'Europe/London' },
  { name: 'Birmingham', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904, timezone: 'Europe/London' },
  { name: 'Edinburgh', country: 'United Kingdom', latitude: 55.9533, longitude: -3.1883, timezone: 'Europe/London' },
  { name: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603, timezone: 'Europe/Dublin' },

  // --- Europe ---
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Marseille', country: 'France', latitude: 43.2965, longitude: 5.3698, timezone: 'Europe/Paris' },
  { name: 'Lyon', country: 'France', latitude: 45.7640, longitude: 4.8357, timezone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Munich', country: 'Germany', latitude: 48.1351, longitude: 11.5820, timezone: 'Europe/Berlin', aliases: ['münchen', 'munchen'] },
  { name: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821, timezone: 'Europe/Berlin' },
  { name: 'Hamburg', country: 'Germany', latitude: 53.5511, longitude: 9.9937, timezone: 'Europe/Berlin' },
  { name: 'Cologne', country: 'Germany', latitude: 50.9375, longitude: 6.9603, timezone: 'Europe/Berlin', aliases: ['köln', 'koln'] },
  { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038, timezone: 'Europe/Madrid' },
  { name: 'Barcelona', country: 'Spain', latitude: 41.3874, longitude: 2.1686, timezone: 'Europe/Madrid' },
  { name: 'Valencia', country: 'Spain', latitude: 39.4699, longitude: -0.3763, timezone: 'Europe/Madrid' },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, timezone: 'Europe/Rome', aliases: ['roma'] },
  { name: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.1900, timezone: 'Europe/Rome', aliases: ['milano'] },
  { name: 'Naples', country: 'Italy', latitude: 40.8518, longitude: 14.2681, timezone: 'Europe/Rome', aliases: ['napoli'] },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam' },
  { name: 'Rotterdam', country: 'Netherlands', latitude: 51.9244, longitude: 4.4777, timezone: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517, timezone: 'Europe/Brussels', aliases: ['bruxelles'] },
  { name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738, timezone: 'Europe/Vienna', aliases: ['wien'] },
  { name: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417, timezone: 'Europe/Zurich', aliases: ['zürich'] },
  { name: 'Geneva', country: 'Switzerland', latitude: 46.2044, longitude: 6.1432, timezone: 'Europe/Zurich', aliases: ['genève', 'geneve'] },
  { name: 'Lisbon', country: 'Portugal', latitude: 38.7223, longitude: -9.1393, timezone: 'Europe/Lisbon', aliases: ['lisboa'] },
  { name: 'Porto', country: 'Portugal', latitude: 41.1579, longitude: -8.6291, timezone: 'Europe/Lisbon' },
  { name: 'Athens', country: 'Greece', latitude: 37.9838, longitude: 23.7275, timezone: 'Europe/Athens', aliases: ['athina'] },
  { name: 'Warsaw', country: 'Poland', latitude: 52.2297, longitude: 21.0122, timezone: 'Europe/Warsaw', aliases: ['warszawa'] },
  { name: 'Prague', country: 'Czechia', latitude: 50.0755, longitude: 14.4378, timezone: 'Europe/Prague', aliases: ['praha'] },
  { name: 'Budapest', country: 'Hungary', latitude: 47.4979, longitude: 19.0402, timezone: 'Europe/Budapest' },
  { name: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686, timezone: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522, timezone: 'Europe/Oslo' },
  { name: 'Copenhagen', country: 'Denmark', latitude: 55.6761, longitude: 12.5683, timezone: 'Europe/Copenhagen', aliases: ['københavn', 'kobenhavn'] },
  { name: 'Helsinki', country: 'Finland', latitude: 60.1699, longitude: 24.9384, timezone: 'Europe/Helsinki' },
  { name: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173, timezone: 'Europe/Moscow', aliases: ['moskva'] },
  { name: 'Saint Petersburg', country: 'Russia', latitude: 59.9311, longitude: 30.3609, timezone: 'Europe/Moscow', aliases: ['st petersburg'] },
  { name: 'Kyiv', country: 'Ukraine', latitude: 50.4501, longitude: 30.5234, timezone: 'Europe/Kyiv', aliases: ['kiev'] },
  { name: 'Bucharest', country: 'Romania', latitude: 44.4268, longitude: 26.1025, timezone: 'Europe/Bucharest', aliases: ['bucuresti'] },
  { name: 'Belgrade', country: 'Serbia', latitude: 44.7866, longitude: 20.4489, timezone: 'Europe/Belgrade', aliases: ['beograd'] },
  { name: 'Zagreb', country: 'Croatia', latitude: 45.8150, longitude: 15.9819, timezone: 'Europe/Zagreb' },
  { name: 'Sofia', country: 'Bulgaria', latitude: 42.6977, longitude: 23.3219, timezone: 'Europe/Sofia' },

  // --- Middle East ---
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.5310, timezone: 'Asia/Qatar' },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', latitude: 21.4858, longitude: 39.1925, timezone: 'Asia/Riyadh' },
  { name: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
  { name: 'Tehran', country: 'Iran', latitude: 35.6892, longitude: 51.3890, timezone: 'Asia/Tehran' },
  { name: 'Baghdad', country: 'Iraq', latitude: 33.3152, longitude: 44.3661, timezone: 'Asia/Baghdad' },
  { name: 'Beirut', country: 'Lebanon', latitude: 33.8938, longitude: 35.5018, timezone: 'Asia/Beirut' },
  { name: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284, timezone: 'Asia/Amman' },
  { name: 'Jerusalem', country: 'Israel', latitude: 31.7683, longitude: 35.2137, timezone: 'Asia/Jerusalem' },
  { name: 'Tel Aviv', country: 'Israel', latitude: 32.0853, longitude: 34.7818, timezone: 'Asia/Jerusalem' },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },

  // --- Asia ---
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Osaka', country: 'Japan', latitude: 34.6937, longitude: 135.5023, timezone: 'Asia/Tokyo' },
  { name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780, timezone: 'Asia/Seoul' },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai' },
  { name: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737, timezone: 'Asia/Shanghai' },
  { name: 'Hong Kong', country: 'Hong Kong', latitude: 22.3193, longitude: 114.1694, timezone: 'Asia/Hong_Kong' },
  { name: 'Taipei', country: 'Taiwan', latitude: 25.0330, longitude: 121.5654, timezone: 'Asia/Taipei' },
  { name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018, timezone: 'Asia/Bangkok' },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
  { name: 'Manila', country: 'Philippines', latitude: 14.5995, longitude: 120.9842, timezone: 'Asia/Manila' },
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata', aliases: ['delhi'] },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata', aliases: ['bombay'] },
  { name: 'Bangalore', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata', aliases: ['bengaluru'] },
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata', aliases: ['madras'] },
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata', aliases: ['calcutta'] },
  { name: 'Hyderabad', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479, timezone: 'Asia/Karachi' },
  { name: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
  { name: 'Colombo', country: 'Sri Lanka', latitude: 6.9271, longitude: 79.8612, timezone: 'Asia/Colombo' },
  { name: 'Kathmandu', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timezone: 'Asia/Kathmandu' },
  { name: 'Baku', country: 'Azerbaijan', latitude: 40.4093, longitude: 49.8671, timezone: 'Asia/Baku' },

  // --- Oceania ---
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne' },
  { name: 'Brisbane', country: 'Australia', latitude: -27.4698, longitude: 153.0251, timezone: 'Australia/Brisbane' },
  { name: 'Perth', country: 'Australia', latitude: -31.9505, longitude: 115.8605, timezone: 'Australia/Perth' },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633, timezone: 'Pacific/Auckland' },
  { name: 'Wellington', country: 'New Zealand', latitude: -41.2865, longitude: 174.7762, timezone: 'Pacific/Auckland' },

  // --- Latin America ---
  { name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332, timezone: 'America/Mexico_City', aliases: ['ciudad de mexico', 'cdmx'] },
  { name: 'Guadalajara', country: 'Mexico', latitude: 20.6597, longitude: -103.3496, timezone: 'America/Mexico_City' },
  { name: 'Monterrey', country: 'Mexico', latitude: 25.6866, longitude: -100.3161, timezone: 'America/Monterrey' },
  { name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo', aliases: ['sao paulo'] },
  { name: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9068, longitude: -43.1729, timezone: 'America/Sao_Paulo', aliases: ['rio'] },
  { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },
  { name: 'Lima', country: 'Peru', latitude: -12.0464, longitude: -77.0428, timezone: 'America/Lima' },
  { name: 'Bogotá', country: 'Colombia', latitude: 4.7110, longitude: -74.0721, timezone: 'America/Bogota', aliases: ['bogota'] },
  { name: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693, timezone: 'America/Santiago' },
  { name: 'Caracas', country: 'Venezuela', latitude: 10.4806, longitude: -66.9036, timezone: 'America/Caracas' },

  // --- Africa ---
  { name: 'Lagos', country: 'Nigeria', latitude: 6.5244, longitude: 3.3792, timezone: 'Africa/Lagos' },
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi' },
  { name: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473, timezone: 'Africa/Johannesburg' },
  { name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241, timezone: 'Africa/Johannesburg' },
  { name: 'Casablanca', country: 'Morocco', latitude: 33.5731, longitude: -7.5898, timezone: 'Africa/Casablanca' },
  { name: 'Accra', country: 'Ghana', latitude: 5.6037, longitude: -0.1870, timezone: 'Africa/Accra' },
  { name: 'Addis Ababa', country: 'Ethiopia', latitude: 9.0300, longitude: 38.7400, timezone: 'Africa/Addis_Ababa' },
  { name: 'Algiers', country: 'Algeria', latitude: 36.7538, longitude: 3.0588, timezone: 'Africa/Algiers' },
  { name: 'Tunis', country: 'Tunisia', latitude: 36.8065, longitude: 10.1815, timezone: 'Africa/Tunis' },
];

/** Türkçe/aksan duyarsız normalize — "İstanbul" == "istanbul" == "Istanbul". */
export function normalizePlace(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // birleşik aksan işaretlerini at
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ø/g, 'o')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Modül yüklenişinde bir kez normalize edip cache'le.
type IndexedCity = CityEntry & { _norm: string; _aliasNorms: string[] };
const INDEXED: IndexedCity[] = CITIES.map((c) => ({
  ...c,
  _norm: normalizePlace(c.name),
  _aliasNorms: (c.aliases ?? []).map(normalizePlace),
}));

/**
 * Offline gazetteer araması. Ağ geocoding'i boş/başarısız olduğunda kullanılır.
 * Öncelik: tam eşleşme > başlangıç eşleşmesi > içerir. En fazla `limit` sonuç.
 */
export function searchLocalCities(query: string, limit = 5): CityEntry[] {
  const q = normalizePlace(query);
  if (q.length < 2) return [];

  const scored: { c: IndexedCity; score: number }[] = [];
  for (const c of INDEXED) {
    const hay = [c._norm, ...c._aliasNorms];
    let best = -1;
    for (const h of hay) {
      if (h === q) best = Math.max(best, 3);
      else if (h.startsWith(q)) best = Math.max(best, 2);
      else if (h.includes(q)) best = Math.max(best, 1);
    }
    if (best > 0) scored.push({ c, score: best });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ c }) => ({
    name: c.name,
    country: c.country,
    latitude: c.latitude,
    longitude: c.longitude,
    timezone: c.timezone,
  }));
}
