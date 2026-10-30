// POST /api/checkout { plan } → a Razorpay order for a one-time Pro pass (UPI, cards, netbanking…).
import { handle, json, planFor, razorpay, readBody, requireUser } from '../../lib/payments.js';

export const onRequestPost = handle(async ({ request, env }) => {
  const user = await requireUser(request, env);
  const plan = planFor((await readBody(request)).plan);
  const order = await razorpay(env, '/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: plan.amountPaise,
      currency: 'INR',
      receipt: `pass_${Date.now()}`,
      notes: { user_id: user.id, plan: plan.id },
    }),
  });
  return json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.RAZORPAY_KEY_ID, email: user.email });
});
