// /pages/api/get-dashboard-data.js

export const config = { runtime: "nodejs" }; // IMPORTANT: ensure Node runtime

import admin from "firebase-admin";

let adminInitialized = false;
function initAdminOrThrow() {
  if (adminInitialized) return;
  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const dbUrl = process.env.FIREBASE_DATABASE_URL;

  if (!saRaw) throw new Error("MISSING_ENV_FIREBASE_SERVICE_ACCOUNT");
  if (!dbUrl) throw new Error("MISSING_ENV_FIREBASE_DATABASE_URL");

  let sa;
  try {
    sa = JSON.parse(saRaw);
  } catch (e) {
    // Most common cause: malformed JSON in env var
    throw new Error("SERVICE_ACCOUNT_JSON_PARSE_FAILED");
  }

  admin.initializeApp({
    credential: admin.credential.cert(sa),
    databaseURL: dbUrl,
  });
  adminInitialized = true;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Accept userId from query (GET) or body (POST)
  const userId = req.method === "GET" ? req.query.userId : req.body?.userId;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId_required" });
  }

  try {
    initAdminOrThrow();

    const ref = admin.database().ref(`/users/${userId}/listings`);
    const snap = await ref.once("value");
    const listings = snap.val() ?? {};

    return res.status(200).json({ listings });
  } catch (err) {
    // Surface a clear error message while you debug
    const code = (err && err.message) || "unknown";
    console.error("get-dashboard-data failure:", code, err);
    return res.status(500).json({ error: "server_error", detail: code });
  }
}
