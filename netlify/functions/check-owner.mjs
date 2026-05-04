export const handler = async (event) => {
  const ownerIPs = (process.env.OWNER_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
  const clientIP = event.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || event.headers["client-ip"]
    || event.headers["x-real-ip"]
    || "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner: ownerIPs.includes(clientIP) }),
  };
};
