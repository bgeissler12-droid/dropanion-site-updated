// api/firebase-admin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // turns "...\n..." from Vercel into real newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    // your RTDB URL
    databaseURL: "https://dropiq-ebay-software-default-rtdb.firebaseio.com",
  });
}

const db = admin.database();

module.exports = { db };
