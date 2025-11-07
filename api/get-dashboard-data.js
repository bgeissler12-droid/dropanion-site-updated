// api/get-dashboard-data.js
const { db } = require("./firebase-admin");

module.exports = async (req, res) => {
  // let the extension hit this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ ok: false, message: "userId required" });
    }

    // 👇 this must match how your lister saved it
    const snap = await db.ref(`/users/${userId}/listings`).once("value");
    const listings = snap.val() || {};

    return res.status(200).json({ ok: true, listings });
  } catch (err) {
    console.error("get-dashboard-data error:", err);
    return res.status(500).json({ ok: false, message: "Failed to load listings" });
  }
};
