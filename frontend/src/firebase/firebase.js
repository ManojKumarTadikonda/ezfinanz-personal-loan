import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    throw new Error(
      "This browser does not support notifications."
    );
  }

  const permission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(
      "Notification permission was not granted."
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  const token = await getToken(
    messaging,
    {
      vapidKey:
        import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration:
        registration
    }
  );

  if (!token) {
    throw new Error(
      "Unable to generate FCM token."
    );
  }

  return token;
}

export function listenForForegroundMessages(
  callback
) {
  return onMessage(
    messaging,
    callback
  );
}