import webpush from 'web-push';
import User from '@/models/User';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

let configured: boolean | null = null;

function configure(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    configured = false;
    return false;
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@ruksati.com',
    pub,
    priv
  );
  configured = true;
  return true;
}

/**
 * Send a Web Push notification to every device a user has subscribed.
 * Never throws. Expired subscriptions (404/410) are removed automatically.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!configure()) return;

  const user = await User.findById(userId)
    .select('+pushSubscriptions')
    .lean<{ pushSubscriptions?: { endpoint: string; keys: { p256dh: string; auth: string } }[] }>();
  const subs = user?.pushSubscriptions ?? [];
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);
  const expired: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, body, { TTL: 60 * 60 * 24 });
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expired.push(sub.endpoint);
        else console.error('[push] send failed:', status ?? err);
      }
    })
  );

  if (expired.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $pull: { pushSubscriptions: { endpoint: { $in: expired } } } }
    );
  }
}
