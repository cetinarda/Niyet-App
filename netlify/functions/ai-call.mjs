const HEADERS = { "Content-Type": "application/json" };

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: "API anahtarı eksik." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: "Geçersiz istek" }) };
  }

  const { system, messages, model = "claude-opus-4-6", max_tokens = 1000 } = body;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        statusCode: res.status,
        headers: HEADERS,
        body: JSON.stringify({ error: data.error?.message || "API hatası" }),
      };
    }

    const text = data.content?.find((b) => b.type === "text")?.text || "";
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: HEADERS,
      body: JSON.stringify({ error: "AI servisiyle bağlantı kurulamadı. Lütfen tekrar deneyin." }),
    };
  }
};
