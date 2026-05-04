export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }

  const { license_key } = body;
  if (!license_key || typeof license_key !== "string" || license_key.length > 100) {
    return { statusCode: 400, body: JSON.stringify({ valid: false, error: "Invalid key" }) };
  }

  try {
    const res = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_key }),
    });
    const data = await res.json();

    if (data.valid) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valid: true, name: data.meta?.customer_name || "" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valid: false, error: data.error || "Invalid license" }),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valid: false, error: "Connection error" }),
    };
  }
};
