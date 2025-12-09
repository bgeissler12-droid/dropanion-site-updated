module.exports = async function handler(req, res) {
  // Allow Chrome Extension fetch calls
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Call Firebase REST API to verify login
    const fbRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      return res
        .status(401)
        .json({ message: fbData.error?.message || "Invalid credentials" });
    }

    // Return token and user info
    return res.status(200).json({
      email: fbData.email,
      token: fbData.idToken,
      userId: fbData.localId,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}
