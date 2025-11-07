// /pages/api/get-dashboard-data.js
// Revert to RTDB REST call using idToken + userId (POST)

export default async function handler(req, res) {
  // CORS for the extension
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const { idToken, userId } = req.body || {};
    if (!idToken || !userId) {
      return res.status(400).json({ error: "idToken_and_userId_required" });
    }

    // Put your RTDB base URL in an env var so we don’t hardcode it
    // Example: https://dropiq-ebay-software-default-rtdb.firebaseio.com
    const RTDB_BASE = process.env.FIREBASE_RTD_URL
      || "https://dropiq-ebay-software-default-rtdb.firebaseio.com";

    // IMPORTANT: RTDB REST requires the `.json` suffix
    const dbUrl = `${RTDB_BASE}/users/${encodeURIComponent(userId)}/listings.json?auth=${encodeURIComponent(idToken)}`;

    const dbRes = await fetch(dbUrl);
    const text = await dbRes.text(); // read raw first for better error surfacing

    // If Firebase returns an error, propagate the real status (don’t hide it in a 200)
    if (!dbRes.ok) {
      return res.status(dbRes.status).json({
        error: "firebase_request_failed",
        status: dbRes.status,
        url: dbUrl,
        detail: safeJson(text)
      });
    }

    // Parse JSON safely; RTDB returns null if path doesn’t exist
    const data = safeJson(text);

    return res.status(200).json({
      listings: data ?? {}
    });
  } catch (err) {
    console.error("get-dashboard-data error:", err);
    return res.status(500).json({ error: "server_error", detail: String(err) });
  }
}

// Helper: best-effort JSON parse
function safeJson(s) {
  try { return JSON.parse(s); } catch { return s; }
}
