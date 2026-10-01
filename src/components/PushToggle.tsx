'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

type State = 'unsupported' | 'unavailable' | 'off' | 'on' | 'denied';

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushToggle() {
  const [state, setState] = useState<State>('off');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setState('unsupported');
      return;
    }
    const cfg = await fetch('/api/push/subscribe').then((r) => r.json()).catch(() => null);
    if (!cfg?.enabled) {
      setState('unavailable');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setState(sub && Notification.permission === 'granted' ? 'on' : 'off');
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enable = async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return setState(perm === 'denied' ? 'denied' : 'off');
      const cfg = await fetch('/api/push/subscribe').then((r) => r.json());
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
        }));
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      setState(res.ok ? 'on' : 'off');
    } catch (err) {
      console.warn('Enable push failed:', err);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('off');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'unsupported' || state === 'unavailable') return null;

  if (state === 'denied') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-white/80">
        <BellOff size={14} /> Notifications blocked in browser settings
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={state === 'on' ? disable : enable}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 transition disabled:opacity-60"
    >
      {state === 'on' ? <BellOff size={14} /> : <Bell size={14} />}
      {state === 'on' ? 'Turn off notifications' : 'Turn on notifications'}
    </button>
  );
}
