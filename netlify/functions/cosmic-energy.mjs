const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life", "capacitor://localhost", "ionic://localhost"];

function getCorsHeaders(event) {
  const origin = event.headers?.origin || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function kpDescription(kp) {
  if (kp < 3) return { tr: "sakin", en: "calm", level: "low" };
  if (kp < 5) return { tr: "hafif aktif", en: "unsettled", level: "moderate" };
  if (kp === 5) return { tr: "küçük fırtına", en: "minor storm", level: "G1" };
  if (kp === 6) return { tr: "orta fırtına", en: "moderate storm", level: "G2" };
  if (kp === 7) return { tr: "güçlü fırtına", en: "strong storm", level: "G3" };
  if (kp === 8) return { tr: "şiddetli fırtına", en: "severe storm", level: "G4" };
  return { tr: "aşırı fırtına", en: "extreme storm", level: "G5" };
}

function flareDescription(maxClass) {
  // M ve X sınıfları "önemli"; B/C sakin
  if (!maxClass) return { tr: "sakin", en: "quiet" };
  const c = maxClass[0]?.toUpperCase();
  if (c === "X") return { tr: "büyük patlama", en: "major flare" };
  if (c === "M") return { tr: "orta patlama", en: "moderate flare" };
  if (c === "C") return { tr: "küçük patlama", en: "minor flare" };
  return { tr: "sakin", en: "quiet" };
}

function windDescription(speed) {
  if (speed == null) return null;
  if (speed < 400) return { tr: "yavaş", en: "slow" };
  if (speed < 500) return { tr: "normal", en: "normal" };
  if (speed < 600) return { tr: "hızlı", en: "fast" };
  if (speed < 700) return { tr: "çok hızlı", en: "very fast" };
  return { tr: "fırtına seviyesi", en: "storm-level" };
}

export const handler = async (event) => {
  const cors = getCorsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  try {
    // Past 7 days Kp index (3-hourly values)
    const kpRes = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json");
    const kpRaw = await kpRes.json();
    // Format: [["time_tag", "Kp", "a_running", "station_count"], [...]]
    const header = kpRaw[0];
    const rows = kpRaw.slice(1);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = rows
      .filter(r => new Date(r[0]).getTime() >= sevenDaysAgo)
      .map(r => ({ time: r[0], kp: parseFloat(r[1]) }));

    // Daily max Kp (most relevant for energy interpretation)
    const dailyMax = {};
    for (const e of recent) {
      const day = e.time.slice(0, 10);
      if (!dailyMax[day] || e.kp > dailyMax[day]) dailyMax[day] = e.kp;
    }
    const weeklyDays = Object.entries(dailyMax)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, kp]) => ({ day, kp, ...kpDescription(kp) }));

    const avgKp = recent.length ? recent.reduce((s, e) => s + e.kp, 0) / recent.length : 0;
    const maxKp = recent.length ? Math.max(...recent.map(e => e.kp)) : 0;
    const currentKp = recent.length ? recent[recent.length - 1].kp : 0;

    // 3-day forecast (text format)
    let forecastText = "";
    try {
      const fcRes = await fetch("https://services.swpc.noaa.gov/text/3-day-forecast.txt");
      forecastText = await fcRes.text();
    } catch { /* optional */ }

    // Extract forecast Kp values from text (simple regex)
    const forecastKp = [];
    const fcMatch = forecastText.match(/NOAA Kp index breakdown[\s\S]{0,2000}/);
    if (fcMatch) {
      const lines = fcMatch[0].split("\n");
      for (const line of lines) {
        const m = line.match(/(\d{2}-\d{2}UT)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
        if (m) forecastKp.push({ slot: m[1], day1: parseFloat(m[2]), day2: parseFloat(m[3]), day3: parseFloat(m[4]) });
      }
    }
    const forecastMaxKp = forecastKp.length
      ? Math.max(...forecastKp.flatMap(f => [f.day1, f.day2, f.day3]))
      : null;

    // GÜNEŞ PATLAMALARI (son 24 saat) — NOAA GOES X-ray
    let flares24h = { count: 0, max_class: null };
    try {
      const fRes = await fetch("https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json");
      const fJson = await fRes.json();
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentFlares = (fJson || []).filter(f => f.max_time && new Date(f.max_time).getTime() >= dayAgo);
      // class rank: A < B < C < M < X
      const rank = { A: 1, B: 2, C: 3, M: 4, X: 5 };
      const ranked = recentFlares
        .map(f => ({ cls: f.max_class || f.begin_class, t: f.max_time }))
        .filter(f => f.cls);
      let top = null;
      for (const f of ranked) {
        const rk = rank[f.cls[0]?.toUpperCase()] || 0;
        if (!top || rk > (rank[top.cls[0]?.toUpperCase()] || 0)) top = f;
      }
      flares24h = { count: ranked.length, max_class: top?.cls || null, max_time: top?.t || null };
    } catch { /* optional */ }

    // GÜNEŞ RÜZGARI (en güncel) — NOAA DSCOVR plazma
    let solarWind = { speed: null, density: null };
    try {
      const wRes = await fetch("https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json");
      const wRows = await wRes.json();
      // [["time_tag","density","speed","temperature"], [...], ...]
      const recent = wRows.slice(1).slice(-30); // son ~30 ölçüm
      const valid = recent
        .map(r => ({ density: parseFloat(r[1]), speed: parseFloat(r[2]) }))
        .filter(r => isFinite(r.speed) && r.speed > 0);
      if (valid.length) {
        const last = valid[valid.length - 1];
        solarWind = { speed: Math.round(last.speed), density: Math.round(last.density * 10) / 10 };
      }
    } catch { /* optional */ }

    const summary = {
      generated_at: new Date().toISOString(),
      past_7_days: {
        avg_kp: Math.round(avgKp * 10) / 10,
        max_kp: maxKp,
        current_kp: currentKp,
        daily: weeklyDays,
      },
      next_3_days: {
        forecast_max_kp: forecastMaxKp,
        slots: forecastKp,
      },
      solar_flares_24h: flares24h,
      solar_wind: solarWind,
      interpretation: {
        current: kpDescription(currentKp),
        week_peak: kpDescription(maxKp),
        forecast_peak: forecastMaxKp !== null ? kpDescription(forecastMaxKp) : null,
        flares: flareDescription(flares24h.max_class),
        wind: windDescription(solarWind.speed),
      },
    };

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=900" },
      body: JSON.stringify(summary),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "NOAA verisine erişilemedi: " + e.message }),
    };
  }
};
