// POST /api/cancel-subscription { subscriptionId } → stops future Autopay debits.
// Pro stays active until the end of the period already paid for.
import { HttpError, handle, json, razorpay, readBody, requireUser, saveSubscription, subscriptionDetails } from '../../lib/payments.js';

export const onRequestPost = handle(async ({ request, env }) => {
  const user = await requireUser(request, env);
  const { subscriptionId } = await readBody(request);
  if (!/^sub_\w+$/.test(subscriptionId || '')) throw new HttpError(400, 'Unknown subscription.');

  const current = await razorpay(env, `/subscriptions/${subscriptionId}`);
  if (subscriptionDetails(current).userId !== user.id) throw new HttpError(403, 'This subscription belongs to another account.');

  const cancelled = await razorpay(env, `/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancel_at_cycle_end: 0 }),
  });
  await saveSubscription(env, cancelled);
  return json({ status: cancelled.status });
});
