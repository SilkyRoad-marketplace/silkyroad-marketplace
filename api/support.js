export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { email, subject, message } = req.body || {};
    if (!email || !subject || !message) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set");
      res.status(500).json({ error: "Email service not configured" });
      return;
    }
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Silky Road Support <silkyroad.marketplace@gmail.com>",
        to: ["silkyroad.marketplace@gmail.com"],
        reply_to: email,
        subject: `Support: ${subject}`,
        html: `<p>From: ${email}</p><p>${message.replace(/\n/g, "<br>")}</p>`
      })
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error("Resend error:", text);
      res.status(500).json({ error: "Failed to send email" });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
