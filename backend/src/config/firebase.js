const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const fs = require("fs");

const serviceAccountPath = path.join(
  __dirname,
  "../../firebase-service-account.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    "firebase-service-account.json not found in backend root"
  );
}

const serviceAccount = require(serviceAccountPath);

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount)
      });

const messaging = getMessaging(firebaseApp);

module.exports = {
  firebaseApp,
  messaging
};