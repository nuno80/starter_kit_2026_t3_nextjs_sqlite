"use client";

import { useCallback, useEffect, useState } from "react";

import { env } from "~/env";
import { api } from "~/trpc/react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushPermissionState = NotificationPermission | "unsupported";

/**
 * Client-side push notification lifecycle: permission request, subscribe/unsubscribe with the
 * browser's PushManager, and syncing the resulting subscription with our server (~/server/api/
 * routers/push.ts). Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY to be set (see docs/pwa/README.md).
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermissionState>(
    "unsupported",
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribeMutation = api.push.subscribe.useMutation();
  const unsubscribeMutation = api.push.unsubscribe.useMutation();

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  useEffect(() => {
    if (!supported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);

    void (async () => {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setSubscribed(!!existing);
    })();
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) {
      setError("Le notifiche push non sono supportate da questo browser.");
      return;
    }
    if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      setError(
        "VAPID non configurato lato server (NEXT_PUBLIC_VAPID_PUBLIC_KEY mancante).",
      );
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        setError("Permesso per le notifiche negato.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        ),
      });

      const json = pushSubscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
        throw new Error("Sottoscrizione push incompleta.");
      }

      await subscribeMutation.mutateAsync({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        userAgent: navigator.userAgent,
      });
      setSubscribed(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante l'iscrizione.",
      );
    } finally {
      setBusy(false);
    }
  }, [supported, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await unsubscribeMutation.mutateAsync({ endpoint: existing.endpoint });
        await existing.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Errore durante la disiscrizione.",
      );
    } finally {
      setBusy(false);
    }
  }, [unsubscribeMutation]);

  return { supported, permission, subscribed, busy, error, subscribe, unsubscribe };
}
