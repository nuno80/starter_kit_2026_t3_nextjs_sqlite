"use client";

import { useState } from "react";

import { usePushNotifications } from "~/lib/use-push-notifications";
import { api } from "~/trpc/react";

export function NotificationSettings() {
  const {
    supported,
    permission,
    subscribed,
    busy,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const [testResult, setTestResult] = useState<string | null>(null);

  const sendTest = api.push.sendTestNotification.useMutation({
    onSuccess: (res) =>
      setTestResult(`Inviata a ${res.sent} dispositivo/i.`),
    onError: (err) => setTestResult(err.message),
  });

  if (!supported) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-line bg-plaster-deep p-6 text-sm text-ink-soft">
        Questo browser non supporta le notifiche push.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-plaster-deep p-6 shadow-sm">
      <h3 className="font-serif text-xl font-bold text-ink">
        Notifiche push
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Stato permesso browser:{" "}
        <span className="font-semibold text-ink">{permission}</span>
      </p>

      {error && (
        <div className="mt-3 rounded-xl border border-red-300 bg-red-100 p-3 text-xs text-red-800">
          {error}
        </div>
      )}

      {subscribed ? (
        <button
          type="button"
          onClick={() => void unsubscribe()}
          disabled={busy}
          className="mt-4 w-full rounded-xl border border-ink px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-plaster disabled:pointer-events-none disabled:opacity-50"
        >
          {busy ? "Attendere..." : "Disabilita notifiche"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void subscribe()}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-plaster transition hover:bg-terracotta-d disabled:pointer-events-none disabled:opacity-50"
        >
          {busy ? "Attendere..." : "Abilita notifiche"}
        </button>
      )}

      {subscribed && (
        <>
          <button
            type="button"
            onClick={() => {
              setTestResult(null);
              sendTest.mutate();
            }}
            disabled={sendTest.isPending}
            className="mt-3 w-full rounded-xl border border-line px-5 py-3 text-sm font-medium text-ink transition hover:bg-plaster disabled:pointer-events-none disabled:opacity-50"
          >
            {sendTest.isPending ? "Invio..." : "Invia notifica di prova"}
          </button>
          {testResult && (
            <p className="mt-2 text-xs text-ink-soft">{testResult}</p>
          )}
        </>
      )}
    </div>
  );
}
