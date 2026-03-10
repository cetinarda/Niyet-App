import Anthropic from "@anthropic-ai/sdk";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "API anahtarı yapılandırılmamış." }),
    };
  }

  let system, messages, model, max_tokens;
  try {
    ({ system, messages, model = "claude-opus-4-6", max_tokens = 1000 } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: "Geçersiz istek" };
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({ model, max_tokens, system, messages });
    const text = response.content.find((b) => b.type === "text")?.text || "";
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
