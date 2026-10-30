/**
 * Sign-in (Supabase: Google or an emailed link) and the user's plan.
 *
 * Supabase is loaded only when needed: when someone signs in, returns from a sign-in link,
 * or already has a saved session. Visitors who never sign in don't download it.
 * Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, accounts are switched off and every feature is free.
 */
import { useSyncExternalStore } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const accountsEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let state = {
  status: accountsEnabled ? 'loading' : 'disabled', // disabled | loading | signed-out | signed-in
  user: null,
  proUntil: null,
  subscription: null, // latest Autopay subscription, if any
  role: null, // admin role (super_admin, app_admin, user_admin, member) or null for members
  linkError: null, // why a sign-in link didn't sign the user in, shown in the sign-in pop-up
};
const listeners = new Set();
const setAuth = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};
export const subscribeAuth = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useAuth = () => useSyncExternalStore(subscribeAuth, () => state);
export const getAuth = () => state;

/** Pro is unlocked when accounts are switched off, or the plan runs past now. */
export const isPro = (s = state) => s.status === 'disabled' || (s.proUntil ? new Date(s.proUntil) > new Date() : false);

let clientPromise = null;
export function getSupabase() {
  if (!accountsEnabled) return Promise.reject(new Error('Accounts are not enabled.'));
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true },
    });
    client.auth.onAuthStateChange((_event, session) => {
      // Supabase asks callbacks not to await its own calls here, so load the plan afterwards.
      setTimeout(() => applySession(session), 0);
    });
    return client;
  });
  return clientPromise;
}

async function applySession(session) {
  if (!session) {
    setAuth({ status: 'signed-out', user: null, proUntil: null, subscription: null, role: null });
    return;
  }
  setAuth({ status: 'signed-in', user: { id: session.user.id, email: session.user.email } });
  await refreshPlan();
}

/** Reloads the plan expiry, the latest Autopay subscription (readable by their owner only) and any admin role. */
export async function refreshPlan() {
  const supabase = await getSupabase();
  const userId = state.user?.id;
  if (!userId) return;
  const [profile, subs, role] = await Promise.all([
    supabase.from('profiles').select('pro_until').eq('id', userId).maybeSingle(),
    supabase.from('subscriptions').select('id, plan, status, current_end').order('created_at', { ascending: false }).limit(1),
    supabase.rpc('admin_role'),
  ]);
  setAuth({ proUntil: profile.data?.pro_until ?? null, subscription: subs.data?.[0] ?? null, role: role.data ?? null });
}

const hasSavedSession = () => {
  try {
    return Object.keys(localStorage).some((key) => key.startsWith('sb-') && key.endsWith('-auth-token'));
  } catch {
    return false;
  }
};
const isAuthRedirect = () => /[?&]code=|access_token=|error_description=/.test(window.location.search + window.location.hash);

// The links only work in the browser that asked for them (PKCE), which is the usual reason they fail.
const LINK_FAILED = 'That sign-in link didn’t work. Open it in the same browser where you asked for it, or send a new one.';

function linkErrorFromUrl() {
  const params = new URLSearchParams(`${window.location.search.slice(1)}&${window.location.hash.slice(1)}`);
  return params.get('error_description');
}

/** Called once at start-up. */
export function initAuth() {
  if (!accountsEnabled) return;
  const fromLink = isAuthRedirect();
  const urlError = fromLink ? linkErrorFromUrl() : null;
  if (hasSavedSession() || fromLink) {
    getSupabase()
      .then((supabase) => supabase.auth.getSession())
      .then(({ data }) => {
        if (fromLink && !data.session) setAuth({ linkError: urlError || LINK_FAILED });
        return applySession(data.session);
      })
      .catch(() => setAuth({ status: 'signed-out', linkError: fromLink ? urlError || LINK_FAILED : null }));
  } else {
    setAuth({ status: 'signed-out' });
  }
}

// Come back to the same page after signing in, without any leftover sign-in parameters.
const returnUrl = () => `${window.location.origin}${window.location.pathname}`;

export async function signInWithGoogle() {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: returnUrl() } });
  if (error) throw error;
}

export async function signInWithEmail(email) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: returnUrl() } });
  if (error) throw error;
}

export async function signOut() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
}

/** The current access token, for calling our own /api functions. */
export async function accessToken() {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Please sign in first.');
  return data.session.access_token;
}
