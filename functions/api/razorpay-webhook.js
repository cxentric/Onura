// POST /api/razorpay-webhook → Razorpay's server-to-server notifications.
// Set this URL and RAZORPAY_WEBHOOK_SECRET in Razorpay → Settings → Webhooks, with the events:
// order.paid, subscription.activated, subscription.charged, subscription.pending,
// subscription.halted, subscription.cancelled, subscription.completed.
import {
  cycleEndWithGrace,
  grantPro,
  handle,
  hmacSha256Hex,
  json,
  orderDetails,
  safeEqual,
  saveSubscription,
  subscriptionDetails,
} from '../../lib/payments.js';

export const onRequestPost = handle(async ({ request, env }) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return json({ error: 'Webhook secret not configured.' }, 503);

  const raw = await request.text();
  const expected = await hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, raw);
  if (!safeEqual(expected, request.headers.get('X-Razorpay-Signature') || '')) {
    return json({ error: 'Invalid signature.' }, 400);
  }

  const { event, payload } = JSON.parse(raw);
  const payment = payload.payment?.entity;
  const subscription = payload.subscription?.entity;

  if (event === 'order.paid') {
    const order = payload.order.entity;
    const { userId, plan } = orderDetails(order);
    await grantPro(env, { userId, paymentId: payment.id, plan, amountPaise: payment.amount, orderId: order.id });
  } else if (event?.startsWith('subscription.') && subscription) {
    await saveSubscription(env, subscription);
    // Each successful Autopay debit extends Pro to the end of the cycle it paid for.
    if (event === 'subscription.charged' && payment) {
      const { userId, plan } = subscriptionDetails(subscription);
      await grantPro(env, {
        userId,
        paymentId: payment.id,
        plan,
        amountPaise: payment.amount,
        subscriptionId: subscription.id,
        until: cycleEndWithGrace(subscription),
      });
    }
  }

  // Always 200 for a valid signature, so Razorpay doesn't retry events we don't use.
  return json({ ok: true });
});
