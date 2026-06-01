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

// 7-lang sözlük: tr / en / de / es / pt / fr / ja
// Ton: Sakin'in sesi — düşük perdeden, sade, küçük harf tercihli.
function kpDescription(kp) {
  if (kp < 3)   return { tr:"sakin",            en:"calm",           de:"ruhig",            es:"calmo",            pt:"calmo",            fr:"calme",            ja:"穏やか",       level:"low" };
  if (kp < 5)   return { tr:"hafif aktif",      en:"unsettled",      de:"leicht unruhig",   es:"levemente activo", pt:"levemente ativo",  fr:"légèrement agité", ja:"少し活発",     level:"moderate" };
  if (kp === 5) return { tr:"küçük fırtına",    en:"minor storm",    de:"kleiner Sturm",    es:"tormenta menor",   pt:"tempestade leve",  fr:"orage mineur",     ja:"小さな嵐",     level:"G1" };
  if (kp === 6) return { tr:"orta fırtına",     en:"moderate storm", de:"mäßiger Sturm",    es:"tormenta moderada",pt:"tempestade moderada",fr:"orage modéré",   ja:"中程度の嵐",   level:"G2" };
  if (kp === 7) return { tr:"güçlü fırtına",    en:"strong storm",   de:"starker Sturm",    es:"tormenta fuerte",  pt:"tempestade forte", fr:"orage fort",       ja:"強い嵐",       level:"G3" };
  if (kp === 8) return { tr:"şiddetli fırtına", en:"severe storm",   de:"heftiger Sturm",   es:"tormenta severa",  pt:"tempestade severa",fr:"orage sévère",     ja:"激しい嵐",     level:"G4" };
  return        { tr:"aşırı fırtına",           en:"extreme storm",  de:"extremer Sturm",   es:"tormenta extrema", pt:"tempestade extrema",fr:"orage extrême",   ja:"極端な嵐",     level:"G5" };
}

function flareDescription(maxClass) {
  // M ve X sınıfları "önemli"; B/C sakin
  if (!maxClass) return { tr:"sakin", en:"quiet", de:"ruhig", es:"tranquilo", pt:"tranquilo", fr:"calme", ja:"静か" };
  const c = maxClass[0]?.toUpperCase();
  if (c === "X") return { tr:"büyük patlama",  en:"major flare",    de:"große Eruption",     es:"erupción mayor",    pt:"erupção maior",    fr:"éruption majeure",  ja:"大規模フレア" };
  if (c === "M") return { tr:"orta patlama",   en:"moderate flare", de:"mittlere Eruption",  es:"erupción moderada", pt:"erupção moderada", fr:"éruption modérée",  ja:"中規模フレア" };
  if (c === "C") return { tr:"küçük patlama",  en:"minor flare",    de:"kleine Eruption",    es:"erupción menor",    pt:"erupção menor",    fr:"éruption mineure",  ja:"小規模フレア" };
  return           { tr:"sakin",             en:"quiet",          de:"ruhig",              es:"tranquilo",         pt:"tranquilo",        fr:"calme",             ja:"静か" };
}

function windDescription(speed) {
  if (speed == null) return null;
  if (speed < 400) return { tr:"yavaş",          en:"slow",       de:"langsam",     es:"lento",          pt:"lento",          fr:"lent",         ja:"ゆるやか" };
  if (speed < 500) return { tr:"normal",         en:"normal",     de:"normal",      es:"normal",         pt:"normal",         fr:"normal",       ja:"通常" };
  if (speed < 600) return { tr:"hızlı",          en:"fast",       de:"schnell",     es:"rápido",         pt:"rápido",         fr:"rapide",       ja:"速い" };
  if (speed < 700) return { tr:"çok hızlı",      en:"very fast",  de:"sehr schnell",es:"muy rápido",     pt:"muito rápido",   fr:"très rapide",  ja:"とても速い" };
  return            { tr:"fırtına seviyesi",   en:"storm-level",de:"Sturmstärke", es:"nivel tormenta", pt:"nível tempestade",fr:"niveau orageux",ja:"嵐レベル" };
}

// fetch + timeout — Netlify function 10s sınırına takılmasın
async function fetchWithTimeout(url, ms = 4500) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return r;
  } finally {
    clearTimeout(timer);
  }
}

export const handler = async (event) => {
  const cors = getCorsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  // 4 endpoint paralel — biri çökerse diğerleri gelir
  const [kpResult, fcResult, flareResult, windResult] = await Promise.allSettled([
    fetchWithTimeout("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json").then(r => r.json()),
    fetchWithTimeout("https://services.swpc.noaa.gov/text/3-day-forecast.txt").then(r => r.text()),
    fetchWithTimeout("https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json").then(r => r.json()),
    fetchWithTimeout("https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json").then(r => r.json()),
  ]);

  try {
    // Past 7 days Kp index (3-hourly values) — bu ana veri, fail olursa 502
    if (kpResult.status !== "fulfilled") {
      throw new Error("Kp data unavailable: " + (kpResult.reason?.message || "unknown"));
    }
    const kpRaw = kpResult.value;
    const rows = kpRaw.slice(1);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const kpRecent = rows
      .filter(r => new Date(r[0]).getTime() >= sevenDaysAgo)
      .map(r => ({ time: r[0], kp: parseFloat(r[1]) }));

    // Daily max Kp (most relevant for energy interpretation)
    const dailyMax = {};
    for (const e of kpRecent) {
      const day = e.time.slice(0, 10);
      if (!dailyMax[day] || e.kp > dailyMax[day]) dailyMax[day] = e.kp;
    }
    const weeklyDays = Object.entries(dailyMax)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, kp]) => ({ day, kp, ...kpDescription(kp) }));

    const avgKp = kpRecent.length ? kpRecent.reduce((s, e) => s + e.kp, 0) / kpRecent.length : 0;
    const maxKp = kpRecent.length ? Math.max(...kpRecent.map(e => e.kp)) : 0;
    const currentKp = kpRecent.length ? kpRecent[kpRecent.length - 1].kp : 0;

    // 3-day forecast (opsiyonel)
    const forecastText = fcResult.status === "fulfilled" ? fcResult.value : "";
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

    // GÜNEŞ PATLAMALARI (son 24 saat) — opsiyonel
    let flares24h = { count: 0, max_class: null };
    if (flareResult.status === "fulfilled") {
      try {
        const fJson = flareResult.value;
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentFlares = (fJson || []).filter(f => f.max_time && new Date(f.max_time).getTime() >= dayAgo);
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
      } catch { /* sessiz geç */ }
    }

    // GÜNEŞ RÜZGARI (en güncel) — opsiyonel
    let solarWind = { speed: null, density: null };
    if (windResult.status === "fulfilled") {
      try {
        const wRows = windResult.value;
        const windRecent = wRows.slice(1).slice(-30);
        const valid = windRecent
          .map(r => ({ density: parseFloat(r[1]), speed: parseFloat(r[2]) }))
          .filter(r => isFinite(r.speed) && r.speed > 0);
        if (valid.length) {
          const last = valid[valid.length - 1];
          solarWind = { speed: Math.round(last.speed), density: Math.round(last.density * 10) / 10 };
        }
      } catch { /* sessiz geç */ }
    }

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
