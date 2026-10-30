/**
 * Upgrading to Pro with Razorpay Checkout, loaded only when someone taps Upgrade.
 * - Autopay: a subscription; the user approves a UPI Autopay mandate once (or a card) and is charged each cycle.
 * - One-time pass: a single payment for 30 or 365 days.
 * The secret keys live in the Cloudflare functions under /functions/api.
 */
import { accessToken, getAuth, refreshPlan } from './auth';

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise = null;

function loadCheckout() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load the payment page. Check your connection and try again.'));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await accessToken()}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Payments are unavailable right now. Please try again later.');
  return data;
}

/**
 * Opens Razorpay Checkout. Resolves with { status: 'paid' | 'pending' | 'dismissed' }.
 * @param {{ plan: 'monthly' | 'yearly', recurring: boolean }} options
 */
export async function upgrade({ plan, recurring }) {
  const [Razorpay, created] = await Promise.all([
    loadCheckout(),
    api(recurring ? '/api/subscribe' : '/api/checkout', { plan }),
  ]);

  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: created.keyId,
      name: 'CXentric',
      description: recurring ? `CXentric Pro, renews ${plan === 'yearly' ? 'yearly' : 'monthly'}` : 'CXentric Pro pass',
      image: `${window.location.origin}/assets/images/logo.webp`,
      ...(recurring ? { subscription_id: created.subscriptionId } : { order_id: created.orderId, amount: created.amount, currency: created.currency }),
      // Open on UPI: for Autopay this is where the user enters their UPI ID and approves the mandate.
      prefill: { email: created.email || getAuth().user?.email, method: 'upi' },
      theme: { color: '#2563EB' },
      modal: { ondismiss: () => resolve({ status: 'dismissed' }) },
      handler: async (response) => {
        try {
          const result = await api('/api/verify-payment', response);
          await refreshPlan();
          resolve({ status: result.pending ? 'pending' : 'paid' });
        } catch (err) {
          reject(err);
        }
      },
    });
    // A failed attempt stays inside Checkout, which shows the reason and lets the user retry.
    checkout.open();
  });
}

/** Stops future Autopay debits. Pro continues until the end of the period already paid for. */
export async function cancelAutopay(subscriptionId) {
  await api('/api/cancel-subscription', { subscriptionId });
  await refreshPlan();
}
