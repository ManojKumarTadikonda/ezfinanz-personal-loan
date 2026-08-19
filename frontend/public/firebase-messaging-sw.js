/* eslint-disable no-undef */

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBLUzTbDvBaKuhEfWM-Ba2obn8aZoSORFg",
  authDomain: "ezfinanz-personal-loan.firebaseapp.com",
  projectId: "ezfinanz-personal-loan",
  storageBucket: "ezfinanz-personal-loan.firebasestorage.app",
  messagingSenderId: "820417230216",
  appId: "1:820417230216:web:c3df9d4c45ae228bfa763d",
  measurementId: "G-029D0ELQ0K"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const title =
    payload.notification?.title ||
    "EZFINANZ";

  const body =
    payload.notification?.body ||
    "You have a new notification.";

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    data: {
      url:
        payload.data?.applicationId
          ? `/admin/applications/${payload.data.applicationId}`
          : "/admin"
    }
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification?.data?.url ||
    "/admin";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

      return undefined;
    })
  );
});