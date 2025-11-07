// FILE: /pages/api/get-dashboard-data.js
// (Next.js API route – Node runtime, NOT Edge)

import admin from "firebase-admin";

/**
 * One-time Admin SDK init using a service account.
 * Set these ENV VARS in your hosting platform:
 *  - FIREBASE_SERVICE_ACCOUNT: full JSON of your service account key (single line)
 *  - FIREBASE_DATABASE_URL:   https://<your-db>.firebaseio.com
 */
function initAdmin() {
  if (admin.apps.length) return;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
  }
  if (!process.env.FIREBASE_DATABASE_URL) {
    throw new Error("Missing FIREBASE_DATABASE_URL env var");
  }

  const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(svc),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export default async function handler(req, res) {
  // CORS for your Chrome extension
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    initAdmin();

    // Accept userId via query (?userId=...) for GET, or JSON body for POST
    const userId =
      req.method === "GET" ? req.query.userId : (req.body && req.body.userId);

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId_required" });
    }

    // Read from Realtime Database securely (no idToken needed)
    const ref = admin.database().ref(`/users/${userId}/listings`);
    const snap = await ref.once("value");
    const listings = snap.val() ?? {};

    return res.status(200).json({ listings });
  } catch (err) {
    console.error("get-dashboard-data error:", err);
    return res.status(500).json({
      error: "server_error",
      detail: (err && err.message) || String(err),
    });
  }
}

// Optional: disable Next.js body parsing for huge payloads (not needed here)
// export const config = { api: { bodyParser: true } };
