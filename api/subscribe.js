/**
 * api/subscribe.js — Solar Flash Mailchimp Integration
 * Vercel Serverless Function
 *
 * Environment Variables needed in Vercel:
 *   MAILCHIMP_API_KEY  = your-api-key-here
 *   MAILCHIMP_LIST_ID  = your-audience-id-here
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  // Basic validation
  if (!email || !email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;

  if (!API_KEY || !LIST_ID) {
    console.error("Missing Mailchimp env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Extract datacenter from API key (e.g. us2 from key-us2)
  const DC = API_KEY.split("-").pop();
  const URL = `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

  try {
    const response = await fetch(URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Basic ${Buffer.from(`anystring:${API_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify({
        email_address: email.toLowerCase().trim(),
        status:        "subscribed",
        tags:          ["solar-flash-website"],
        merge_fields:  {
          SOURCE: "gosolarflash.com",
        },
      }),
    });

    const data = await response.json();

    // Already subscribed
    if (data.status === 400 && data.title === "Member Exists") {
      return res.status(200).json({
        success: true,
        message: "already_subscribed",
      });
    }

    // Success
    if (response.ok || data.status === "subscribed") {
      return res.status(200).json({
        success: true,
        message: "subscribed",
      });
    }

    // Other Mailchimp error
    console.error("Mailchimp error:", data);
    return res.status(400).json({
      error: data.detail || "Subscription failed",
    });

  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
