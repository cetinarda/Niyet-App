const ALLOWED_ORIGINS = ["https://sakin.life", "https://www.sakin.life"];

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
      interpretation: {
        current: kpDescription(currentKp),
        week_peak: kpDescription(maxKp),
        forecast_peak: forecastMaxKp !== null ? kpDescription(forecastMaxKp) : null,
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
