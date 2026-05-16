export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { message, category, lang, timestamp } = JSON.parse(event.body);

    if (!message || !message.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: "empty" }) };
    }

    const to = process.env.FEEDBACK_EMAIL || "destek@sakin.life";
    const RESEND_KEY = process.env.RESEND_API_KEY;

    const feedbackText = `
Yeni Geri Bildirim / New Feedback
─────────────────────────────────
Kategori: ${category || "-"}
Dil: ${lang || "-"}
Tarih: ${timestamp || new Date().toISOString()}
─────────────────────────────────
${message.trim()}
─────────────────────────────────`.trim();

    if (RESEND_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Sakin Feedback <feedback@sakin.life>",
          to,
          subject: `[Sakin Feedback] ${category || "Genel"}`,
          text: feedbackText,
        }),
      });
    }

    const LOG_URL = process.env.FEEDBACK_WEBHOOK_URL;
    if (LOG_URL) {
      await fetch(LOG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), category, lang, timestamp }),
      }).catch(() => {});
    }

    console.log("FEEDBACK:", feedbackText);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (e) {
    console.error("Feedback error:", e);
    return { statusCode: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ error: "server_error" }) };
  }
};
