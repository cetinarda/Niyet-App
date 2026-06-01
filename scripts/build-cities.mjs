#!/usr/bin/env node
/**
 * build-cities.mjs — generates src/cities-data.json from the GeoNames
 *   "all cities with population ≥ 1000" dataset hosted by OpenDataSoft.
 *
 * Source dataset (CC BY 4.0, derived from GeoNames):
 *   https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000/
 *   Direct JSON export:
 *     https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/
 *       geonames-all-cities-with-a-population-1000/exports/json?lang=en
 *
 * When to regenerate: only when adding more countries or pulling fresh GeoNames data.
 *   Run:  node scripts/build-cities.mjs
 *
 * Filtering rules (kept intentionally simple):
 *   - Keep ALL Turkish (TR) cities → covers every ilçe (district).
 *   - Keep world cities with population ≥ 15 000 → ~33 k major cities.
 *   - Always-include capitals & alias targets (see CAPITALS_INCLUDE below).
 *
 * Why standard UTC offset (no DST):
 *   The astrology engine in src/App.jsx uses a single integer/float UTC offset
 *   (preciseAscendant). DST is intentionally NOT applied — that matches the
 *   prior hard-coded behaviour and avoids historical DST-edge ambiguity in
 *   birth-time lookups. We derive the *standard* (winter, non-DST) offset
 *   from each IANA timezone using the embedded TZ_OFFSET map below.
 *
 * Output: src/cities-data.json
 *   Shape: [ [name, lat, lon, tz, country, ascii?], ... ]
 *   - ascii is only included when it differs from name (saves bytes).
 *
 * License: city data © GeoNames (CC BY 4.0), OpenDataSoft mirror.
 *          Build script © Sakin app, same license as the rest of the repo.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "geonames-cities-1000.json");
const OUT_FILE = path.join(ROOT, "src", "cities-data.json");

const SOURCE_URL =
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/" +
  "geonames-all-cities-with-a-population-1000/exports/json?lang=en";

// IANA timezone → standard (non-DST, winter) UTC offset in hours.
// Generated once from Python's zoneinfo. See TZ_OFFSETS_NOTE below.
// We keep this map embedded so we don't depend on any tz library at build time.
const TZ_OFFSETS = {
  "Africa/Abidjan": 0, "Africa/Accra": 0, "Africa/Addis_Ababa": 3, "Africa/Algiers": 1,
  "Africa/Asmara": 3, "Africa/Bamako": 0, "Africa/Bangui": 1, "Africa/Banjul": 0,
  "Africa/Bissau": 0, "Africa/Blantyre": 2, "Africa/Brazzaville": 1, "Africa/Bujumbura": 2,
  "Africa/Cairo": 2, "Africa/Casablanca": 1, "Africa/Ceuta": 1, "Africa/Conakry": 0,
  "Africa/Dakar": 0, "Africa/Dar_es_Salaam": 3, "Africa/Djibouti": 3, "Africa/Douala": 1,
  "Africa/El_Aaiun": 1, "Africa/Freetown": 0, "Africa/Gaborone": 2, "Africa/Harare": 2,
  "Africa/Johannesburg": 2, "Africa/Juba": 2, "Africa/Kampala": 3, "Africa/Khartoum": 2,
  "Africa/Kigali": 2, "Africa/Kinshasa": 1, "Africa/Lagos": 1, "Africa/Libreville": 1,
  "Africa/Lome": 0, "Africa/Luanda": 1, "Africa/Lubumbashi": 2, "Africa/Lusaka": 2,
  "Africa/Malabo": 1, "Africa/Maputo": 2, "Africa/Maseru": 2, "Africa/Mbabane": 2,
  "Africa/Mogadishu": 3, "Africa/Monrovia": 0, "Africa/Nairobi": 3, "Africa/Ndjamena": 1,
  "Africa/Niamey": 1, "Africa/Nouakchott": 0, "Africa/Ouagadougou": 0, "Africa/Porto-Novo": 1,
  "Africa/Sao_Tome": 0, "Africa/Tripoli": 2, "Africa/Tunis": 1, "Africa/Windhoek": 2,
  "America/Adak": -10, "America/Anchorage": -9, "America/Anguilla": -4, "America/Antigua": -4,
  "America/Araguaina": -3, "America/Argentina/Buenos_Aires": -3, "America/Argentina/Catamarca": -3,
  "America/Argentina/Cordoba": -3, "America/Argentina/Jujuy": -3, "America/Argentina/La_Rioja": -3,
  "America/Argentina/Mendoza": -3, "America/Argentina/Rio_Gallegos": -3, "America/Argentina/Salta": -3,
  "America/Argentina/San_Juan": -3, "America/Argentina/San_Luis": -3, "America/Argentina/Tucuman": -3,
  "America/Argentina/Ushuaia": -3, "America/Aruba": -4, "America/Asuncion": -4, "America/Atikokan": -5,
  "America/Bahia": -3, "America/Bahia_Banderas": -6, "America/Barbados": -4, "America/Belem": -3,
  "America/Belize": -6, "America/Blanc-Sablon": -4, "America/Boa_Vista": -4, "America/Bogota": -5,
  "America/Boise": -7, "America/Cambridge_Bay": -7, "America/Campo_Grande": -4, "America/Cancun": -5,
  "America/Caracas": -4, "America/Cayenne": -3, "America/Cayman": -5, "America/Chicago": -6,
  "America/Chihuahua": -6, "America/Costa_Rica": -6, "America/Creston": -7, "America/Cuiaba": -4,
  "America/Curacao": -4, "America/Danmarkshavn": 0, "America/Dawson": -7, "America/Dawson_Creek": -7,
  "America/Denver": -7, "America/Detroit": -5, "America/Dominica": -4, "America/Edmonton": -7,
  "America/Eirunepe": -5, "America/El_Salvador": -6, "America/Fortaleza": -3, "America/Fort_Nelson": -7,
  "America/Glace_Bay": -4, "America/Godthab": -3, "America/Goose_Bay": -4, "America/Grand_Turk": -5,
  "America/Grenada": -4, "America/Guadeloupe": -4, "America/Guatemala": -6, "America/Guayaquil": -5,
  "America/Guyana": -4, "America/Halifax": -4, "America/Havana": -5, "America/Hermosillo": -7,
  "America/Indiana/Indianapolis": -5, "America/Indiana/Knox": -6, "America/Indiana/Marengo": -5,
  "America/Indiana/Petersburg": -5, "America/Indiana/Tell_City": -6, "America/Indiana/Vevay": -5,
  "America/Indiana/Vincennes": -5, "America/Indiana/Winamac": -5, "America/Inuvik": -7,
  "America/Iqaluit": -5, "America/Jamaica": -5, "America/Juneau": -9, "America/Kentucky/Louisville": -5,
  "America/Kentucky/Monticello": -5, "America/Kralendijk": -4, "America/La_Paz": -4, "America/Lima": -5,
  "America/Los_Angeles": -8, "America/Lower_Princes": -4, "America/Maceio": -3, "America/Managua": -6,
  "America/Manaus": -4, "America/Marigot": -4, "America/Martinique": -4, "America/Matamoros": -6,
  "America/Mazatlan": -7, "America/Menominee": -6, "America/Merida": -6, "America/Metlakatla": -9,
  "America/Mexico_City": -6, "America/Miquelon": -3, "America/Moncton": -4, "America/Monterrey": -6,
  "America/Montevideo": -3, "America/Montserrat": -4, "America/Nassau": -5, "America/New_York": -5,
  "America/Nipigon": -5, "America/Nome": -9, "America/Noronha": -2, "America/North_Dakota/Beulah": -6,
  "America/North_Dakota/Center": -6, "America/North_Dakota/New_Salem": -6, "America/Nuuk": -3,
  "America/Ojinaga": -6, "America/Panama": -5, "America/Pangnirtung": -5, "America/Paramaribo": -3,
  "America/Phoenix": -7, "America/Port-au-Prince": -5, "America/Port_of_Spain": -4,
  "America/Porto_Velho": -4, "America/Puerto_Rico": -4, "America/Punta_Arenas": -3,
  "America/Rainy_River": -6, "America/Rankin_Inlet": -6, "America/Recife": -3, "America/Regina": -6,
  "America/Resolute": -6, "America/Rio_Branco": -5, "America/Santarem": -3, "America/Santiago": -4,
  "America/Santo_Domingo": -4, "America/Sao_Paulo": -3, "America/Scoresbysund": -1, "America/Sitka": -9,
  "America/St_Barthelemy": -4, "America/St_Johns": -3.5, "America/St_Kitts": -4, "America/St_Lucia": -4,
  "America/St_Thomas": -4, "America/St_Vincent": -4, "America/Swift_Current": -6, "America/Tegucigalpa": -6,
  "America/Thule": -4, "America/Thunder_Bay": -5, "America/Tijuana": -8, "America/Toronto": -5,
  "America/Tortola": -4, "America/Vancouver": -8, "America/Whitehorse": -7, "America/Winnipeg": -6,
  "America/Yakutat": -9, "America/Yellowknife": -7,
  "Antarctica/Casey": 11, "Antarctica/Davis": 7, "Antarctica/DumontDUrville": 10, "Antarctica/Macquarie": 10,
  "Antarctica/Mawson": 5, "Antarctica/McMurdo": 12, "Antarctica/Palmer": -3, "Antarctica/Rothera": -3,
  "Antarctica/Syowa": 3, "Antarctica/Troll": 0, "Antarctica/Vostok": 6,
  "Arctic/Longyearbyen": 1,
  "Asia/Aden": 3, "Asia/Almaty": 5, "Asia/Amman": 2, "Asia/Anadyr": 12, "Asia/Aqtau": 5, "Asia/Aqtobe": 5,
  "Asia/Ashgabat": 5, "Asia/Atyrau": 5, "Asia/Baghdad": 3, "Asia/Bahrain": 3, "Asia/Baku": 4,
  "Asia/Bangkok": 7, "Asia/Barnaul": 7, "Asia/Beirut": 2, "Asia/Bishkek": 6, "Asia/Brunei": 8,
  "Asia/Chita": 9, "Asia/Choibalsan": 8, "Asia/Colombo": 5.5, "Asia/Damascus": 2, "Asia/Dhaka": 6,
  "Asia/Dili": 9, "Asia/Dubai": 4, "Asia/Dushanbe": 5, "Asia/Famagusta": 2, "Asia/Gaza": 2,
  "Asia/Hebron": 2, "Asia/Ho_Chi_Minh": 7, "Asia/Hong_Kong": 8, "Asia/Hovd": 7, "Asia/Irkutsk": 8,
  "Asia/Jakarta": 7, "Asia/Jayapura": 9, "Asia/Jerusalem": 2, "Asia/Kabul": 4.5, "Asia/Kamchatka": 12,
  "Asia/Karachi": 5, "Asia/Kathmandu": 5.75, "Asia/Khandyga": 9, "Asia/Kolkata": 5.5, "Asia/Krasnoyarsk": 7,
  "Asia/Kuala_Lumpur": 8, "Asia/Kuching": 8, "Asia/Kuwait": 3, "Asia/Macau": 8, "Asia/Magadan": 11,
  "Asia/Makassar": 8, "Asia/Manila": 8, "Asia/Muscat": 4, "Asia/Nicosia": 2, "Asia/Novokuznetsk": 7,
  "Asia/Novosibirsk": 7, "Asia/Omsk": 6, "Asia/Oral": 5, "Asia/Phnom_Penh": 7, "Asia/Pontianak": 7,
  "Asia/Pyongyang": 9, "Asia/Qatar": 3, "Asia/Qostanay": 5, "Asia/Qyzylorda": 5, "Asia/Riyadh": 3,
  "Asia/Sakhalin": 11, "Asia/Samarkand": 5, "Asia/Seoul": 9, "Asia/Shanghai": 8, "Asia/Singapore": 8,
  "Asia/Srednekolymsk": 11, "Asia/Taipei": 8, "Asia/Tashkent": 5, "Asia/Tbilisi": 4, "Asia/Tehran": 3.5,
  "Asia/Thimphu": 6, "Asia/Tokyo": 9, "Asia/Tomsk": 7, "Asia/Ulaanbaatar": 8, "Asia/Urumqi": 6,
  "Asia/Ust-Nera": 10, "Asia/Vientiane": 7, "Asia/Vladivostok": 10, "Asia/Yakutsk": 9, "Asia/Yangon": 6.5,
  "Asia/Yekaterinburg": 5, "Asia/Yerevan": 4,
  "Atlantic/Azores": -1, "Atlantic/Bermuda": -4, "Atlantic/Canary": 0, "Atlantic/Cape_Verde": -1,
  "Atlantic/Faroe": 0, "Atlantic/Madeira": 0, "Atlantic/Reykjavik": 0, "Atlantic/South_Georgia": -2,
  "Atlantic/St_Helena": 0, "Atlantic/Stanley": -3,
  "Australia/Adelaide": 9.5, "Australia/Brisbane": 10, "Australia/Broken_Hill": 9.5, "Australia/Currie": 10,
  "Australia/Darwin": 9.5, "Australia/Eucla": 8.75, "Australia/Hobart": 10, "Australia/Lindeman": 10,
  "Australia/Lord_Howe": 10.5, "Australia/Melbourne": 10, "Australia/Perth": 8, "Australia/Sydney": 10,
  "Europe/Amsterdam": 1, "Europe/Andorra": 1, "Europe/Astrakhan": 4, "Europe/Athens": 2, "Europe/Belgrade": 1,
  "Europe/Berlin": 1, "Europe/Bratislava": 1, "Europe/Brussels": 1, "Europe/Bucharest": 2,
  "Europe/Budapest": 1, "Europe/Busingen": 1, "Europe/Chisinau": 2, "Europe/Copenhagen": 1,
  "Europe/Dublin": 0, "Europe/Gibraltar": 1, "Europe/Guernsey": 0, "Europe/Helsinki": 2,
  "Europe/Isle_of_Man": 0, "Europe/Istanbul": 3, "Europe/Jersey": 0, "Europe/Kaliningrad": 2,
  "Europe/Kiev": 2, "Europe/Kirov": 3, "Europe/Kyiv": 2, "Europe/Lisbon": 0, "Europe/Ljubljana": 1,
  "Europe/London": 0, "Europe/Luxembourg": 1, "Europe/Madrid": 1, "Europe/Malta": 1,
  "Europe/Mariehamn": 2, "Europe/Minsk": 3, "Europe/Monaco": 1, "Europe/Moscow": 3,
  "Europe/Oslo": 1, "Europe/Paris": 1, "Europe/Podgorica": 1, "Europe/Prague": 1,
  "Europe/Riga": 2, "Europe/Rome": 1, "Europe/Samara": 4, "Europe/San_Marino": 1,
  "Europe/Sarajevo": 1, "Europe/Saratov": 4, "Europe/Simferopol": 3, "Europe/Skopje": 1,
  "Europe/Sofia": 2, "Europe/Stockholm": 1, "Europe/Tallinn": 2, "Europe/Tirane": 1,
  "Europe/Ulyanovsk": 4, "Europe/Uzhgorod": 2, "Europe/Vaduz": 1, "Europe/Vatican": 1,
  "Europe/Vienna": 1, "Europe/Vilnius": 2, "Europe/Volgograd": 3, "Europe/Warsaw": 1,
  "Europe/Zagreb": 1, "Europe/Zaporozhye": 2, "Europe/Zurich": 1,
  "Indian/Antananarivo": 3, "Indian/Chagos": 6, "Indian/Christmas": 7, "Indian/Cocos": 6.5,
  "Indian/Comoro": 3, "Indian/Kerguelen": 5, "Indian/Mahe": 4, "Indian/Maldives": 5,
  "Indian/Mauritius": 4, "Indian/Mayotte": 3, "Indian/Reunion": 4,
  "Pacific/Apia": 13, "Pacific/Auckland": 12, "Pacific/Bougainville": 11, "Pacific/Chatham": 12.75,
  "Pacific/Chuuk": 10, "Pacific/Easter": -6, "Pacific/Efate": 11, "Pacific/Enderbury": 13,
  "Pacific/Fakaofo": 13, "Pacific/Fiji": 12, "Pacific/Funafuti": 12, "Pacific/Galapagos": -6,
  "Pacific/Gambier": -9, "Pacific/Guadalcanal": 11, "Pacific/Guam": 10, "Pacific/Honolulu": -10,
  "Pacific/Kanton": 13, "Pacific/Kiritimati": 14, "Pacific/Kosrae": 11, "Pacific/Kwajalein": 12,
  "Pacific/Majuro": 12, "Pacific/Marquesas": -9.5, "Pacific/Midway": -11, "Pacific/Nauru": 12,
  "Pacific/Niue": -11, "Pacific/Norfolk": 11, "Pacific/Noumea": 11, "Pacific/Pago_Pago": -11,
  "Pacific/Palau": 9, "Pacific/Pitcairn": -8, "Pacific/Pohnpei": 11, "Pacific/Port_Moresby": 10,
  "Pacific/Rarotonga": -10, "Pacific/Saipan": 10, "Pacific/Tahiti": -10, "Pacific/Tarawa": 12,
  "Pacific/Tongatapu": 13, "Pacific/Wake": 12, "Pacific/Wallis": 12,
};

// Capitals & alias targets that should always be included even if pop < threshold.
// (Most are already > 100k, this is a safety net.)
const CAPITALS_INCLUDE = new Set([
  // For Sakin's Turkish UI we want these well-known European/world cities to never get filtered:
  "London","Paris","Berlin","Rome","Madrid","Amsterdam","Brussels","Vienna","Athens","Lisbon",
  "Stockholm","Helsinki","Oslo","Copenhagen","Dublin","Reykjavík","Warsaw","Prague","Budapest",
  "Moscow","Saint Petersburg","Kyiv","Minsk","Bucharest","Sofia","Belgrade","Zagreb","Sarajevo",
  "Tirana","Skopje","Ljubljana","Bratislava","Riga","Tallinn","Vilnius",
  "Istanbul","Ankara","Izmir","Adana","Antalya","Bursa","Gaziantep","Konya","Kayseri","Mersin",
  "Cairo","Baghdad","Damascus","Beirut","Jerusalem","Tel Aviv","Amman","Tehran","Doha",
  "Riyadh","Dubai","Abu Dhabi","Manama","Kuwait City","Sanaa","Muscat",
  "Tokyo","Osaka","Kyoto","Sapporo","Beijing","Shanghai","Hong Kong","Taipei","Seoul",
  "Bangkok","Singapore","Kuala Lumpur","Jakarta","Manila","Hanoi","Ho Chi Minh City",
  "New Delhi","Mumbai","Kolkata","Chennai","Bangalore","Karachi","Islamabad","Lahore","Dhaka",
  "New York","Los Angeles","Chicago","San Francisco","Boston","Washington","Miami","Houston",
  "Toronto","Vancouver","Montreal","Mexico City","Buenos Aires","Rio de Janeiro","São Paulo",
  "Sydney","Melbourne","Auckland","Wellington",
]);

// Turkish aliases — names that Turkish-speaking users type. Mapped to a target city in the DB.
// Lat/lng/tz is inherited from the target; we just add a synonym row.
// Format: alias → ascii target name to match against.
const TURKISH_ALIASES = [
  ["londra", "London", "GB"],
  ["paris", "Paris", "FR"],
  ["berlin", "Berlin", "DE"],
  ["münih", "Munich", "DE"],
  ["munih", "Munich", "DE"],
  ["köln", "Köln", "DE"],
  ["koln", "Köln", "DE"],
  ["frankfurt", "Frankfurt am Main", "DE"],
  ["hamburg", "Hamburg", "DE"],
  ["stuttgart", "Stuttgart", "DE"],
  ["viyana", "Vienna", "AT"],
  ["roma", "Rome", "IT"],
  ["milano", "Milan", "IT"],
  ["napoli", "Naples", "IT"],
  ["venedik", "Venice", "IT"],
  ["floransa", "Florence", "IT"],
  ["madrid", "Madrid", "ES"],
  ["barselona", "Barcelona", "ES"],
  ["lizbon", "Lisbon", "PT"],
  ["atina", "Athens", "GR"],
  ["selanik", "Thessaloniki", "GR"],
  ["amsterdam", "Amsterdam", "NL"],
  ["brüksel", "Brussels", "BE"],
  ["bruksel", "Brussels", "BE"],
  ["kopenhag", "Copenhagen", "DK"],
  ["stockholm", "Stockholm", "SE"],
  ["oslo", "Oslo", "NO"],
  ["helsinki", "Helsinki", "FI"],
  ["dublin", "Dublin", "IE"],
  ["varşova", "Warsaw", "PL"],
  ["varsova", "Warsaw", "PL"],
  ["prag", "Prague", "CZ"],
  ["budapeşte", "Budapest", "HU"],
  ["budapeste", "Budapest", "HU"],
  ["bükreş", "Bucharest", "RO"],
  ["bukres", "Bucharest", "RO"],
  ["sofya", "Sofia", "BG"],
  ["belgrad", "Belgrade", "RS"],
  ["saraybosna", "Sarajevo", "BA"],
  ["üsküp", "Skopje", "MK"],
  ["uskup", "Skopje", "MK"],
  ["tiran", "Tirana", "AL"],
  ["moskova", "Moscow", "RU"],
  ["petersburg", "Saint Petersburg", "RU"],
  ["sankt-peterburg", "Saint Petersburg", "RU"],
  ["kiev", "Kyiv", "UA"],
  ["minsk", "Minsk", "BY"],
  ["lyon", "Lyon", "FR"],
  ["marsilya", "Marseille", "FR"],
  ["nice", "Nice", "FR"],
  ["toulouse", "Toulouse", "FR"],
  ["bordeaux", "Bordeaux", "FR"],
  ["cenevre", "Geneva", "CH"],
  ["zürih", "Zürich", "CH"],
  ["zurih", "Zürich", "CH"],
  ["bern", "Bern", "CH"],
  ["lüksemburg", "Luxembourg", "LU"],
  ["luksemburg", "Luxembourg", "LU"],
  ["dubai", "Dubai", "AE"],
  ["abu dabi", "Abu Dhabi", "AE"],
  ["abudabi", "Abu Dhabi", "AE"],
  ["doha", "Doha", "QA"],
  ["riyad", "Riyadh", "SA"],
  ["mekke", "Makkah", "SA"],
  ["medine", "Medina", "SA"],
  ["cidde", "Jeddah", "SA"],
  ["şam", "Damascus", "SY"],
  ["sam", "Damascus", "SY"],
  ["halep", "Aleppo", "SY"],
  ["bağdat", "Baghdad", "IQ"],
  ["bagdat", "Baghdad", "IQ"],
  ["beyrut", "Beirut", "LB"],
  ["amman", "Amman", "JO"],
  ["kudüs", "Jerusalem", "IL"],
  ["kudus", "Jerusalem", "IL"],
  ["tel aviv", "Tel Aviv", "IL"],
  ["tahran", "Tehran", "IR"],
  ["isfahan", "Isfahan", "IR"],
  ["şiraz", "Shiraz", "IR"],
  ["siraz", "Shiraz", "IR"],
  ["meşhed", "Mashhad", "IR"],
  ["meshed", "Mashhad", "IR"],
  ["bakü", "Baku", "AZ"],
  ["baku", "Baku", "AZ"],
  ["gence", "Ganja", "AZ"],
  ["tiflis", "Tbilisi", "GE"],
  ["erivan", "Yerevan", "AM"],
  ["taşkent", "Tashkent", "UZ"],
  ["taskent", "Tashkent", "UZ"],
  ["semerkant", "Samarkand", "UZ"],
  ["buhara", "Bukhara", "UZ"],
  ["almatı", "Almaty", "KZ"],
  ["almati", "Almaty", "KZ"],
  ["astana", "Astana", "KZ"],
  ["nur-sultan", "Astana", "KZ"],
  ["bişkek", "Bishkek", "KG"],
  ["biskek", "Bishkek", "KG"],
  ["duşanbe", "Dushanbe", "TJ"],
  ["dusanbe", "Dushanbe", "TJ"],
  ["aşkabat", "Ashgabat", "TM"],
  ["askabat", "Ashgabat", "TM"],
  ["kabil", "Kabul", "AF"],
  ["islamabad", "Islamabad", "PK"],
  ["karaçi", "Karachi", "PK"],
  ["karaci", "Karachi", "PK"],
  ["yeni delhi", "New Delhi", "IN"],
  ["bombay", "Mumbai", "IN"],
  ["kalküta", "Kolkata", "IN"],
  ["kalkuta", "Kolkata", "IN"],
  ["madras", "Chennai", "IN"],
  ["pekin", "Beijing", "CN"],
  ["şanghay", "Shanghai", "CN"],
  ["sanghay", "Shanghai", "CN"],
  ["hong kong", "Hong Kong", "HK"],
  ["honkong", "Hong Kong", "HK"],
  ["tokyo", "Tokyo", "JP"],
  ["osaka", "Osaka", "JP"],
  ["kyoto", "Kyoto", "JP"],
  ["seul", "Seoul", "KR"],
  ["pyongyang", "Pyongyang", "KP"],
  ["bangkok", "Bangkok", "TH"],
  ["singapur", "Singapore", "SG"],
  ["kuala lumpur", "Kuala Lumpur", "MY"],
  ["jakarta", "Jakarta", "ID"],
  ["manila", "Manila", "PH"],
  ["hanoi", "Hanoi", "VN"],
  ["kahire", "Cairo", "EG"],
  ["iskenderiye", "Alexandria", "EG"],
  ["hartum", "Khartoum", "SD"],
  ["addis ababa", "Addis Ababa", "ET"],
  ["nairobi", "Nairobi", "KE"],
  ["lagos", "Lagos", "NG"],
  ["abuca", "Abuja", "NG"],
  ["abuja", "Abuja", "NG"],
  ["dakar", "Dakar", "SN"],
  ["kazablanka", "Casablanca", "MA"],
  ["rabat", "Rabat", "MA"],
  ["fes", "Fes", "MA"],
  ["marakeş", "Marrakesh", "MA"],
  ["marakes", "Marrakesh", "MA"],
  ["cezayir", "Algiers", "DZ"],
  ["tunus", "Tunis", "TN"],
  ["trablus", "Tripoli", "LY"],
  ["new york", "New York City", "US"],
  ["nev york", "New York City", "US"],
  ["los angeles", "Los Angeles", "US"],
  ["şikago", "Chicago", "US"],
  ["sikago", "Chicago", "US"],
  ["chicago", "Chicago", "US"],
  ["boston", "Boston", "US"],
  ["washington", "Washington", "US"],
  ["miami", "Miami", "US"],
  ["san francisco", "San Francisco", "US"],
  ["las vegas", "Las Vegas", "US"],
  ["seattle", "Seattle", "US"],
  ["atlanta", "Atlanta", "US"],
  ["dallas", "Dallas", "US"],
  ["houston", "Houston", "US"],
  ["philadelphia", "Philadelphia", "US"],
  ["toronto", "Toronto", "CA"],
  ["vancouver", "Vancouver", "CA"],
  ["montreal", "Montréal", "CA"],
  ["ottawa", "Ottawa", "CA"],
  ["mexico", "Mexico City", "MX"],
  ["meksiko", "Mexico City", "MX"],
  ["meksika", "Mexico City", "MX"],
  ["buenos aires", "Buenos Aires", "AR"],
  ["rio de janeiro", "Rio de Janeiro", "BR"],
  ["sao paulo", "São Paulo", "BR"],
  ["lima", "Lima", "PE"],
  ["santiago", "Santiago", "CL"],
  ["sidney", "Sydney", "AU"],
  ["sydney", "Sydney", "AU"],
  ["melbourne", "Melbourne", "AU"],
  ["lefkoşa", "Nicosia", "CY"],
  ["lefkosa", "Nicosia", "CY"],
  ["girne", "Kyrenia", "CY"],
  ["gazimağusa", "Famagusta", "CY"],
  ["gazimagusa", "Famagusta", "CY"],
];

// ---------- DOWNLOAD ----------

async function ensureSource() {
  try {
    const stat = await fs.stat(CACHE_FILE);
    if (stat.size > 50_000_000) {
      console.log(`[build-cities] using cached ${CACHE_FILE} (${(stat.size/1e6).toFixed(1)} MB)`);
      return;
    }
  } catch {/* not cached */}
  await fs.mkdir(CACHE_DIR, { recursive: true });
  console.log(`[build-cities] downloading ${SOURCE_URL} …`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(CACHE_FILE, buf);
  console.log(`[build-cities] saved ${CACHE_FILE} (${(buf.length/1e6).toFixed(1)} MB)`);
}

// ---------- BUILD ----------

function makeRow(c, tzOffsets) {
  const tzName = c.timezone || "";
  const tz = tzOffsets[tzName] ?? 0;
  const name = c.name || "";
  const ascii = (c.ascii_name || name);
  const lat = c.coordinates?.lat ?? null;
  const lon = c.coordinates?.lon ?? null;
  if (lat == null || lon == null) return null;
  const pop = Number(c.population) || 0;
  const row = [
    name,
    Math.round(lat * 10000) / 10000,
    Math.round(lon * 10000) / 10000,
    tz,
    c.country_code || "",
  ];
  if (ascii !== name) row.push(ascii);
  else row.push(""); // placeholder so pop is always at index 6
  row.push(pop); // transient: used for sort tiebreaker, stripped before write
  return row;
}

async function main() {
  await ensureSource();
  console.log("[build-cities] parsing …");
  const raw = await fs.readFile(CACHE_FILE, "utf-8");
  const data = JSON.parse(raw);
  console.log(`[build-cities] ${data.length} source cities`);

  const POP_THRESHOLD = 15000;
  const out = [];
  const seen = new Set();

  for (const c of data) {
    const cc = c.country_code;
    const pop = Number(c.population) || 0;
    // Keep all TR cities, and world cities ≥ 15 000, and capitals/alias targets.
    const isTR = cc === "TR";
    const isBigEnough = pop >= POP_THRESHOLD;
    const isCapital = CAPITALS_INCLUDE.has(c.name) || CAPITALS_INCLUDE.has(c.ascii_name);
    if (!isTR && !isBigEnough && !isCapital) continue;
    // De-dupe by geoname_id
    if (seen.has(c.geoname_id)) continue;
    seen.add(c.geoname_id);
    const row = makeRow(c, TZ_OFFSETS);
    if (row) out.push(row);
  }
  console.log(`[build-cities] kept ${out.length} cities after filter`);

  // Build a quick name → row index for alias attachment
  const byName = new Map();
  const byAscii = new Map();
  for (const r of out) {
    const [name, , , , cc, ascii] = r;
    const k = name.toLowerCase();
    if (!byName.has(k)) byName.set(k, r);
    if (ascii) {
      const ka = ascii.toLowerCase();
      if (!byAscii.has(ka)) byAscii.set(ka, r);
    }
  }
  function findRow(targetName, targetCC) {
    const k = targetName.toLowerCase();
    // Prefer country-code match
    let best = null;
    for (const r of out) {
      const [name, , , , cc, ascii] = r;
      const nameMatch = name.toLowerCase() === k || (ascii && ascii.toLowerCase() === k);
      if (!nameMatch) continue;
      if (cc === targetCC) return r;
      if (!best) best = r;
    }
    return best;
  }

  // Add Turkish aliases as standalone rows with alias name (so autocomplete finds them).
  let aliasAdded = 0, aliasMissed = 0;
  for (const [alias, target, cc] of TURKISH_ALIASES) {
    const r = findRow(target, cc);
    if (!r) { aliasMissed++; console.warn(`[build-cities] alias miss: ${alias} → ${target} (${cc})`); continue; }
    const [, lat, lon, tz, ccode, ascii] = r;
    // alias row keeps target's coords/tz; ascii preserves original name for clarity
    out.push([alias, lat, lon, tz, ccode, target]);
    aliasAdded++;
  }
  console.log(`[build-cities] aliases added: ${aliasAdded} (missed: ${aliasMissed})`);

  // Manual overrides — districts/cities that GeoNames misses or wrongly localizes.
  // Format matches makeRow output: [name, lat, lon, tz, cc, ascii, pop].
  const MANUAL_OVERRIDES = [
    ["Beşiktaş", 41.0429, 29.0094, 3, "TR", "Besiktas", 200000],
    ["Kadıköy", 40.9833, 29.0333, 3, "TR", "Kadikoy", 500000],
    // Big-name disambiguators: ensure famous city wins by virtue of giant pop
    ["Cairo", 30.0444, 31.2357, 2, "EG", "Cairo", 10000000],
    ["Athens", 37.9838, 23.7275, 2, "GR", "Athens", 3000000],
    ["Warsaw", 52.2297, 21.0122, 1, "PL", "Warsaw", 1800000],
    ["Damascus", 33.5138, 36.2765, 2, "SY", "Damascus", 2200000],
    ["Jerusalem", 31.7683, 35.2137, 2, "IL", "Jerusalem", 950000],
    ["Naples", 40.8518, 14.2681, 1, "IT", "Naples", 950000],
    ["Barcelona", 41.3851, 2.1734, 1, "ES", "Barcelona", 1600000],
    ["Perth", -31.9505, 115.8605, 8, "AU", "Perth", 2100000],
    ["Birmingham", 52.4862, -1.8904, 0, "GB", "Birmingham", 1100000],
    ["Riyadh", 24.7136, 46.6753, 3, "SA", "Riyadh", 7000000],
    ["Colombo", 6.9271, 79.8612, 5.5, "LK", "Colombo", 750000],
    ["Cologne", 50.9375, 6.9603, 1, "DE", "Cologne", 1100000], // English alias for Köln
  ];
  let overrideAdded = 0;
  for (const o of MANUAL_OVERRIDES) {
    // Inject at top with high pop — sort will keep them first
    out.push([...o]);
    overrideAdded++;
  }
  console.log(`[build-cities] manual overrides added: ${overrideAdded}`);

  // Sort: TR first, then others. Within group: name asc, then population DESC
  // (so same-named cities resolve to the most populous one in the byKey first-wins map).
  out.sort((a, b) => {
    const tA = a[4] === "TR" ? 0 : 1;
    const tB = b[4] === "TR" ? 0 : 1;
    if (tA !== tB) return tA - tB;
    const nameCmp = a[0].localeCompare(b[0]);
    if (nameCmp !== 0) return nameCmp;
    const popA = a[6] || 0;
    const popB = b[6] || 0;
    return popB - popA; // higher pop first → wins first-wins in cityDb.js
  });

  // Strip transient pop field (index 6) before writing.
  // Trim trailing empty ascii placeholder so unchanged rows stay compact.
  const finalRows = out.map(r => {
    const trimmed = r.slice(0, 6); // [name, lat, lon, tz, cc, ascii]
    if (trimmed[5] === "" || trimmed[5] === undefined) trimmed.pop();
    return trimmed;
  });

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  const text = JSON.stringify(finalRows);
  await fs.writeFile(OUT_FILE, text, "utf-8");
  console.log(`[build-cities] wrote ${OUT_FILE} (${(text.length/1024).toFixed(1)} kB raw, ${finalRows.length} rows)`);
}

main().catch(e => { console.error(e); process.exit(1); });
