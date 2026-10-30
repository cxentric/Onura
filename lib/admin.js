// Helpers for the admin console's server functions (admin/functions). Every action checks the
// caller's admin role on the server and is written to the audit log.
import { HttpError, requireUser, serviceHeaders, supabaseRest } from './payments.js';

export const ROLES = {
  super_admin: 'Super admin',
  app_admin: 'App admin',
  user_admin: 'User admin',
  member: 'Member (read-only)',
};

/** The signed-in admin, if their role is one of `roles`. */
export async function requireAdmin(request, env, roles) {
  const user = await requireUser(request, env);
  const rows = await supabaseRest(env, `/admins?select=role&user_id=eq.${user.id}`, { method: 'GET' });
  const role = rows?.[0]?.role;
  if (!roles.includes(role)) throw new HttpError(403, 'You don’t have permission to do this.');
  return { ...user, role };
}

export const adminRoleOf = async (env, userId) =>
  (await supabaseRest(env, `/admins?select=role&user_id=eq.${encodeURIComponent(userId)}`, { method: 'GET' }))?.[0]?.role || null;

export const audit = (env, { actorId, action, target, before = null, after = null, reason = null }) =>
  supabaseRest(env, '/rpc/write_audit', {
    method: 'POST',
    body: JSON.stringify({ p_actor: actorId, p_action: action, p_target: target, p_before: before, p_after: after, p_reason: reason }),
  });

/** Blocks or unblocks sign-in with Supabase Auth. A blocked user's current session ends within the hour. */
export async function setBlocked(env, userId, blocked) {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { ...serviceHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ban_duration: blocked ? '876000h' : 'none' }),
  });
  if (!res.ok) {
    console.error('Supabase ban', res.status, await res.text());
    throw new HttpError(502, 'Could not update the account. Please try again.');
  }
}
