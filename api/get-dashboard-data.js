export default async function handler(req, res) {
  // allow the extension to call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { idToken, userId } = req.body || {};

    if (!idToken || !userId) {
      return res.status(400).json({ message: "idToken and userId required" });
    }

    // 👇 CHANGE THIS to your real Realtime Database URL if it's different
    const dbUrl =
      `https://dropiq-ebay-software-default-rtdb.firebaseio.com/users/${userId}/listings.json?auth=${idToken}`;

    const dbRes = await fetch(dbUrl);
    const data = await dbRes.json();

    // send whatever we got back
    return res.status(200).json({
      listings: data || {}
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
