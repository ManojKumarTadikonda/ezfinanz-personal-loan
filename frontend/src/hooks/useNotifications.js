import { useEffect, useState } from "react";

import {
  requestNotificationPermission,
  listenForForegroundMessages
} from "../firebase/firebase";

import api from "../lib/api";

export function useNotifications(
  enabled = false
) {
  const [permission, setPermission] =
    useState(
      typeof Notification !== "undefined"
        ? Notification.permission
        : "default"
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function enableNotifications() {
    try {
      setLoading(true);
      setError("");

      const token =
        await requestNotificationPermission();

      await api.post(
        "/notifications/token",
        {
          token
        }
      );

      setPermission("granted");

      return token;
    } catch (error) {
      console.error(
        "Notification setup error:",
        error
      );

      setError(
        error?.message ||
          "Unable to enable notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!enabled) return;

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      enableNotifications();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe =
      listenForForegroundMessages(
        (payload) => {
          console.log(
            "Foreground notification:",
            payload
          );

          const title =
            payload.notification?.title ||
            "EZFINANZ";

          const body =
            payload.notification?.body ||
            "You have a new notification.";

          if (
            Notification.permission ===
            "granted"
          ) {
            new Notification(title, {
              body
            });
          }
        }
      );

    return () => unsubscribe();
  }, [enabled]);

  return {
    permission,
    loading,
    error,
    enableNotifications
  };
}