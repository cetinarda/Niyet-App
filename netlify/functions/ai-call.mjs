export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "API anahtarı bulunamadı (GROQ_API_KEY)" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Geçersiz istek" };
  }

  const { system, messages, max_tokens = 1000 } = body;

  const groqMessages = [];
  if (system) groqMessages.push({ role: "system", content: system });
  for (const m of messages) groqMessages.push({ role: m.role, content: m.content });

  let res, data;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens,
        messages: groqMessages,
      }),
    });
    data = await res.json();
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Bağlantı hatası: " + e.message }),
    };
  }

  if (!res.ok || data.error) {
    const errMsg = data.error?.message || `HTTP ${res.status}`;
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: errMsg }),
    };
  }

  const text = data.choices?.[0]?.message?.content || "";
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  };
};
