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

export const handler = async (event) => {
  const cors = getCorsHeaders(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  const ownerIPs = (process.env.OWNER_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
  const clientIP = event.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || event.headers["client-ip"]
    || event.headers["x-real-ip"]
    || "";

  return {
    statusCode: 200,
    headers: { ...cors, "Content-Type": "application/json" },
    body: JSON.stringify({ owner: ownerIPs.includes(clientIP) }),
  };
};
