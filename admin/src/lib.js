import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(URL && KEY);

export const supabase = configured
  ? createClient(URL, KEY, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, storageKey: 'cxentric-admin-auth' } })
  : null;

/** Calls a database function; every admin function checks the caller's role itself. */
export async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

/** Calls the admin site's own server functions (actions that need secret keys). */
export async function serverAction(path, body) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` },
    body: JSON.stringify(body),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result.error || 'The action failed. Please try again.');
  return result;
}

export const ROLE_LABELS = {
  super_admin: 'Super admin',
  app_admin: 'App admin',
  user_admin: 'User admin',
  member: 'Member (read-only)',
};

export const ROLE_HELP = {
  super_admin: 'Everything, including the team and billing settings. Only one person.',
  app_admin: 'App settings, feature switches, announcements and the question bank.',
  user_admin: 'Users and subscriptions: give or end Pro, cancel Autopay, block accounts.',
  member: 'Read-only. Sees dashboards and lists with emails partly hidden.',
};

// Mirrors the checks in the database, so buttons only show for people who can use them.
const CAN = {
  manageUsers: ['super_admin', 'user_admin'],
  editSettings: ['super_admin', 'app_admin'],
  editBilling: ['super_admin'],
  editQuestions: ['super_admin', 'app_admin'],
  manageTeam: ['super_admin'],
  viewAudit: ['super_admin', 'app_admin', 'user_admin'],
};
export const can = (role, permission) => CAN[permission].includes(role);

export const rupees = (paise) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const date = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const dateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
