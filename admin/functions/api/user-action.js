// POST /api/user-action { userId, action, reason, subscriptionId? }
// action: 'block' | 'unblock' | 'cancel_autopay'. For super admins and user admins.
import { audit, adminRoleOf, requireAdmin, setBlocked } from '../../../lib/admin.js';
import { HttpError, handle, json, razorpay, readBody, saveSubscription, subscriptionDetails } from '../../../lib/payments.js';

export const onRequestPost = handle(async ({ request, env }) => {
  const admin = await requireAdmin(request, env, ['super_admin', 'user_admin']);
  const { userId, action, reason, subscriptionId } = await readBody(request);
  if (!/^[0-9a-f-]{36}$/i.test(userId || '')) throw new HttpError(400, 'Unknown user.');
  if (!reason?.trim()) throw new HttpError(400, 'Please give a reason.');

  if (action === 'block' || action === 'unblock') {
    if (userId === admin.id) throw new HttpError(400, 'You can’t block yourself.');
    if ((await adminRoleOf(env, userId)) === 'super_admin') throw new HttpError(403, 'The super admin can’t be blocked.');
    await setBlocked(env, userId, action === 'block');
    await audit(env, { actorId: admin.id, action: `user.${action}`, target: userId, reason });
    return json({ ok: true });
  }

  if (action === 'cancel_autopay') {
    if (!/^sub_\w+$/.test(subscriptionId || '')) throw new HttpError(400, 'Unknown subscription.');
    const current = await razorpay(env, `/subscriptions/${subscriptionId}`);
    if (subscriptionDetails(current).userId !== userId) throw new HttpError(400, 'This subscription belongs to another user.');
    const cancelled = await razorpay(env, `/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancel_at_cycle_end: 0 }),
    });
    await saveSubscription(env, cancelled);
    await audit(env, {
      actorId: admin.id,
      action: 'user.cancel_autopay',
      target: userId,
      before: { subscription: subscriptionId, status: current.status },
      after: { status: cancelled.status },
      reason,
    });
    return json({ status: cancelled.status });
  }

  throw new HttpError(400, 'Unknown action.');
});
