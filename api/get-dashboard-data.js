// api/get-dashboard-data.js

module.exports = async (req, res) => {
  // allow extension
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 👇 NO Firebase here yet
  return res.status(200).json({
    ok: true,
    listings: {
      example1: {
        title: "Test item",
        amazonLink: "https://amazon.com/test"
      }
    }
  });
};
