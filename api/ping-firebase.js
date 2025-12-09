// api/ping-firebase.js
const { db } = require("../lib/firebase-admin");

module.exports = async (req, res) => {
  try {
    // just read a tiny known path
    const snap = await db.ref("/__ping").once("value");
    res.status(200).json({ ok: true, value: snap.val() ?? null });
  } catch (err) {
    console.error("ping error:", err);
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
};
