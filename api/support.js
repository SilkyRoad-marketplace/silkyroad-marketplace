export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, subject, message } = req.body || {};

    // Validate fields
    if (!email || !subject || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("❌ RESEND_API_KEY is missing in Vercel settings.");
      return res.status(500).json({ error: "Email service not configured" });
    }

    // Send email using Resend (sandbox / universal FROM address)
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Silky Road Support <onboarding@resend.dev>",  // Sandbox sender
        to: ["silkyroad.marketplace@gmail.com"],            // Your inbox
        reply_to: email,                                    // User email
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

    if (!send.ok) {
      const errorText = await send.text();
      console.error("❌ Resend API error:", errorText);
      return res.status(500).json({ error: "Failed to send message" });
    }

    // Success
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
