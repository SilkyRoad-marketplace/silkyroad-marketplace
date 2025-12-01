module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse JSON body manually (required for Vercel + static sites)
  let rawBody = "";
  await new Promise(resolve => {
    req.on("data", chunk => rawBody += chunk);
    req.on("end", resolve);
  });

  let body = {};
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { email, subject, message } = body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY missing");
    return res.status(500).json({ error: "Email service not configured" });
  }

  // Send email through Resend
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Silky Road Support <onboarding@resend.dev>",
      to: ["silkyroad.marketplace@gmail.com"],
      reply_to: email,
      subject: `Support Request: ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `
    })
  });

  if (!response.ok) {
    console.error("❌ Resend error:", await response.text());
    return res.status(500).json({ error: "Failed to send message" });
  }

  return res.status(200).json({ success: true });
};
