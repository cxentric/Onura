// Shared helpers for the Cloudflare Pages Functions in /functions/api.
// Secrets come from Cloudflare environment variables and never reach the browser.
import { PLANS } from '../src/config/plans.js';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Wraps a handler: checks configuration and turns thrown errors into JSON responses. */
export const handle = (fn) => async (context) => {
  const missing = REQUIRED_ENV.filter((key) => !context.env[key]);
  if (missing.length) return json({ error: 'Payments are not configured yet.' }, 503);
  try {
    return await fn(context);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error(err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
};

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Invalid request body.');
  }
}

// Supabase accepts the legacy service_role JWT or the newer sb_secret_ key; only a JWT goes in Authorization.
const serviceHeaders = (env) => {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  return key.startsWith('eyJ') ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
};

/** The signed-in Supabase user behind the request's bearer token. */
export async function requireUser(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Please sign in first.');
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new HttpError(401, 'Your session has expired. Please sign in again.');
  const user = await res.json();
  return { id: user.id, email: user.email };
}

/** Calls the Razorpay REST API with the key id and secret. */
export async function razorpay(env, path, init = {}) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Razorpay', path, res.status, body?.error?.description);
    throw new HttpError(502, body?.error?.description || 'The payment provider returned an error.');
  }
  return body;
}

export async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison of two hex strings. */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const planFor = (id) => {
  const plan = PLANS[id];
  if (!plan) throw new HttpError(400, 'Unknown plan.');
  return plan;
};

/** Razorpay plan ids for UPI Autopay subscriptions, created once in the Razorpay dashboard. */
export function razorpayPlanId(env, plan) {
  const id = plan.id === 'yearly' ? env.RAZORPAY_PLAN_YEARLY : env.RAZORPAY_PLAN_MONTHLY;
  if (!id) throw new HttpError(503, 'Autopay is not configured yet. Please choose a one-time pass.');
  return id;
}

/** Checks a one-time order was created by us for this plan, and returns { userId, plan }. */
export function orderDetails(order) {
  const plan = planFor(order?.notes?.plan);
  if (order.amount !== plan.amountPaise || order.currency !== 'INR' || !order.notes.user_id) {
    throw new HttpError(400, 'This order does not match a CXentric plan.');
  }
  return { userId: order.notes.user_id, plan };
}

/** Same for a subscription: the user and plan come from the notes we set when creating it. */
export function subscriptionDetails(subscription) {
  const plan = planFor(subscription?.notes?.plan);
  if (!subscription.notes.user_id) throw new HttpError(400, 'This subscription is not linked to a user.');
  return { userId: subscription.notes.user_id, plan };
}

async function supabaseRest(env, path, init) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: { ...serviceHeaders(env), 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) {
    console.error('Supabase', path, res.status, await res.text());
    throw new HttpError(500, 'Could not update your plan. Please contact support.');
  }
  const text = await res.text(); // empty for writes sent with return=minimal
  return text ? JSON.parse(text) : null;
}

/**
 * Records a captured payment and extends Pro. Safe to call more than once for the same payment
 * (the browser and the webhook both report it). For Autopay, `until` is the end of the paid cycle.
 */
export function grantPro(env, { userId, paymentId, plan, amountPaise, orderId = null, subscriptionId = null, until = null }) {
  return supabaseRest(env, '/rpc/grant_pro', {
    method: 'POST',
    body: JSON.stringify({
      p_user_id: userId,
      p_payment_id: paymentId,
      p_plan: plan.id,
      p_amount_paise: amountPaise,
      p_order_id: orderId,
      p_subscription_id: subscriptionId,
      p_until: until,
    }),
  });
}

/** Saves the latest state of an Autopay subscription so the app can show it and offer cancelling. */
export function saveSubscription(env, subscription) {
  const { userId, plan } = subscriptionDetails(subscription);
  return supabaseRest(env, '/subscriptions?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      id: subscription.id,
      user_id: userId,
      plan: plan.id,
      status: subscription.status,
      current_end: unixToIso(subscription.current_end),
      updated_at: new Date().toISOString(),
    }),
  });
}

export const unixToIso = (seconds) => (seconds ? new Date(seconds * 1000).toISOString() : null);

// A day of grace after each cycle, so a slightly late Autopay debit doesn't drop the user to Free.
export const cycleEndWithGrace = (subscription) =>
  subscription.current_end ? unixToIso(subscription.current_end + 24 * 60 * 60) : null;
