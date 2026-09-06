import { NextRequest, NextResponse } from "next/server";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// In-memory store for MVP — replace with database in production
const subscriptions: PushSubscriptionData[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PushSubscriptionData;
    if (!body.endpoint || !body.keys) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    // Avoid duplicates
    const exists = subscriptions.some((s) => s.endpoint === body.endpoint);
    if (!exists) {
      subscriptions.push(body);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ count: subscriptions.length });
}

/** Helper to send a push notification to all subscribers (for server-side use) */
export async function sendPushToAll(
  payload: { title: string; body?: string; url?: string },
  vapidPrivateKey: string,
  vapidPublicKey: string,
) {
  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:support@ishaconnect.app", vapidPublicKey, vapidPrivateKey);

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
        JSON.stringify(payload),
      ),
    ),
  );

  // Remove stale subscriptions
  for (let i = subscriptions.length - 1; i >= 0; i--) {
    const result = results[i];
    if (result.status === "rejected" && isExpiredError(result.reason)) {
      subscriptions.splice(i, 1);
    }
  }
}

function isExpiredError(err: unknown): boolean {
  if (err && typeof err === "object" && "statusCode" in err) {
    return (err as { statusCode: number }).statusCode === 410;
  }
  return false;
}
