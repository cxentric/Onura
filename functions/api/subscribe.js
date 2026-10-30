// POST /api/subscribe { plan } → a Razorpay subscription. Checkout then asks the user to approve
// a UPI Autopay mandate (or a card/eMandate), and Razorpay charges each month or year automatically.
import { handle, json, planFor, razorpay, razorpayPlanId, readBody, requireUser } from '../../lib/payments.js';

// Razorpay needs an end date for the mandate; this is about 10 years either way. Users can cancel any time.
const CYCLES = { monthly: 120, yearly: 10 };

export const onRequestPost = handle(async ({ request, env }) => {
  const user = await requireUser(request, env);
  const plan = planFor((await readBody(request)).plan);
  const subscription = await razorpay(env, '/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      plan_id: razorpayPlanId(env, plan),
      total_count: CYCLES[plan.id],
      customer_notify: 1,
      notes: { user_id: user.id, plan: plan.id },
    }),
  });
  return json({ subscriptionId: subscription.id, keyId: env.RAZORPAY_KEY_ID, email: user.email });
});
