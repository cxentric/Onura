// POST /api/verify-payment → called by the browser right after Razorpay Checkout succeeds,
// so Pro unlocks immediately. The webhook grants it too, in case the browser closes first.
import {
  HttpError,
  cycleEndWithGrace,
  grantPro,
  handle,
  hmacSha256Hex,
  json,
  orderDetails,
  razorpay,
  readBody,
  requireUser,
  safeEqual,
  saveSubscription,
  subscriptionDetails,
} from '../../lib/payments.js';

export const onRequestPost = handle(async ({ request, env }) => {
  const user = await requireUser(request, env);
  const body = await readBody(request);
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  if (!paymentId || !signature) throw new HttpError(400, 'Missing payment details.');

  // Razorpay signs order_id|payment_id for orders and payment_id|subscription_id for subscriptions.
  const signed = body.razorpay_subscription_id
    ? `${paymentId}|${body.razorpay_subscription_id}`
    : `${body.razorpay_order_id}|${paymentId}`;
  if (!safeEqual(await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, signed), signature)) {
    throw new HttpError(400, 'Payment signature did not match.');
  }

  const payment = await razorpay(env, `/payments/${paymentId}`);
  if (payment.status !== 'captured') return json({ pending: true });

  if (body.razorpay_subscription_id) {
    const subscription = await razorpay(env, `/subscriptions/${body.razorpay_subscription_id}`);
    const { userId, plan } = subscriptionDetails(subscription);
    if (userId !== user.id) throw new HttpError(403, 'This subscription belongs to another account.');
    await saveSubscription(env, subscription);
    const proUntil = await grantPro(env, {
      userId,
      paymentId,
      plan,
      amountPaise: payment.amount,
      subscriptionId: subscription.id,
      until: cycleEndWithGrace(subscription),
    });
    return json({ proUntil });
  }

  const order = await razorpay(env, `/orders/${body.razorpay_order_id}`);
  const { userId, plan } = orderDetails(order);
  if (userId !== user.id) throw new HttpError(403, 'This order belongs to another account.');
  const proUntil = await grantPro(env, { userId, paymentId, plan, amountPaise: payment.amount, orderId: order.id });
  return json({ proUntil });
});
