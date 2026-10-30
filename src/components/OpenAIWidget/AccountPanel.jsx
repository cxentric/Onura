import React, { useState } from 'react';
import Icon from '../AppIcon';
import { plansFrom, proFeatures } from '../../config/plans';
import { useSettings } from '../../services/appSettings';
import { isPro, signInWithEmail, signInWithGoogle, signOut, useAuth } from '../../services/auth';
import { cancelAutopay, upgrade } from '../../services/payments';
import { useKbStyles } from './kbUi';

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Autopay states in which Razorpay will keep debiting, so the user can cancel.
const AUTOPAY_ON = new Set(['authenticated', 'active', 'pending']);

const SignIn = ({ s }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className={`text-sm font-semibold ${s.text}`}>Sign in to go Pro</h3>
        <p className={`text-xs mt-1 ${s.muted}`}>Your streak and progress stay on this device either way. Signing in is needed only for Pro.</p>
      </div>
      <button
        onClick={() => run(signInWithGoogle)}
        disabled={busy}
        className={`w-full flex items-center justify-center space-x-2 py-2 rounded-md border text-xs font-medium disabled:opacity-60 ${
          s.dark ? 'border-gray-600 text-gray-100 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'
        }`}
      >
        <Icon name="LogIn" size={14} />
        <span>Continue with Google</span>
      </button>
      <div className={`flex items-center space-x-2 text-[10px] ${s.muted}`}>
        <span className={`flex-1 h-px ${s.dark ? 'bg-gray-600' : 'bg-gray-200'}`} />
        <span>or get a sign-in link by email</span>
        <span className={`flex-1 h-px ${s.dark ? 'bg-gray-600' : 'bg-gray-200'}`} />
      </div>
      {sent ? (
        <div className={`${s.card} p-3 flex items-start space-x-2`}>
          <Icon name="Mail" size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className={`text-xs ${s.text}`}>Check <strong>{email}</strong> for a sign-in link. You can close this tab; the link brings you back here.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await signInWithEmail(email.trim());
              setSent(true);
            });
          }}
          className="flex space-x-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className={s.select}
          />
          <button type="submit" disabled={busy} className="px-3 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-60">
            Send
          </button>
        </form>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

const Plans = ({ s }) => {
  const [recurring, setRecurring] = useState(true);
  const [plan, setPlan] = useState('yearly');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const pay = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { status } = await upgrade({ plan, recurring });
      if (status === 'paid') setMessage({ ok: true, text: 'Welcome to Pro! Everything is unlocked.' });
      if (status === 'pending') setMessage({ ok: true, text: 'Payment received. Pro unlocks as soon as your bank confirms it, usually within a minute.' });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const settings = useSettings();
  const plans = plansFrom(settings);
  const chosen = plans[plan];
  const toggleClass = (on) =>
    `flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
      on ? 'bg-primary text-white' : s.dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {proFeatures(settings).map((feature) => (
          <li key={feature} className={`flex items-start space-x-2 text-xs ${s.text}`}>
            <Icon name="Check" size={14} className="text-success flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className={`flex p-0.5 rounded-lg border ${s.dark ? 'border-gray-600' : 'border-gray-200'}`} role="group" aria-label="Payment type">
        <button onClick={() => setRecurring(true)} aria-pressed={recurring} className={toggleClass(recurring)}>UPI Autopay</button>
        <button onClick={() => setRecurring(false)} aria-pressed={!recurring} className={toggleClass(!recurring)}>One-time pass</button>
      </div>
      <p className={`text-[11px] ${s.muted}`}>
        {recurring
          ? 'Approve once with your UPI ID (or a card) and Pro renews automatically. Cancel any time here.'
          : 'Pay once by UPI, card or netbanking. No renewal, nothing to cancel.'}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {Object.values(plans).map((p) => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            aria-pressed={plan === p.id}
            className={`relative p-2.5 rounded-lg border-2 text-left transition-colors ${
              plan === p.id ? 'border-primary' : s.dark ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            {p.note && <span className="absolute -top-2 right-2 px-1.5 rounded-full bg-success text-white text-[9px] font-semibold">{p.note}</span>}
            <p className={`text-base font-bold ${s.text}`}>{p.price}</p>
            <p className={`text-[11px] ${s.muted}`}>{recurring ? (p.id === 'yearly' ? 'per year' : 'per month') : p.label}</p>
          </button>
        ))}
      </div>

      <button onClick={pay} disabled={busy} className="w-full py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60">
        {busy ? 'Opening payment…' : recurring ? `Set up Autopay · ${chosen.price}` : `Pay ${chosen.price}`}
      </button>
      {message && <p className={`text-xs ${message.ok ? 'text-success-600' : 'text-error'}`}>{message.text}</p>}
      <p className={`text-[10px] text-center ${s.muted}`}>Secure payments by Razorpay.</p>
    </div>
  );
};

const AccountPanel = () => {
  const s = useKbStyles();
  const auth = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  if (auth.status === 'disabled') {
    return (
      <div className="h-full overflow-y-auto p-3">
        <p className={`text-xs ${s.muted}`}>Accounts aren’t switched on yet, so every feature is free for now.</p>
      </div>
    );
  }
  if (auth.status === 'loading') {
    return <div className={`p-4 text-xs text-center ${s.muted}`}>Loading your account…</div>;
  }
  if (auth.status === 'signed-out') {
    return (
      <div className="h-full overflow-y-auto p-3">
        <SignIn s={s} />
      </div>
    );
  }

  const pro = isPro(auth);
  const sub = auth.subscription;
  const autopayOn = sub && AUTOPAY_ON.has(sub.status);

  const cancel = async () => {
    if (!window.confirm('Stop Autopay? You keep Pro until the end of the period you’ve paid for.')) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelAutopay(sub.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className={`${s.card} p-3 flex items-center space-x-3`}>
        <Icon name={pro ? 'Crown' : 'User'} size={22} className={pro ? 'text-amber-500' : s.muted} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs truncate ${s.muted}`}>{auth.user.email}</p>
          <p className={`text-sm font-semibold ${s.text}`}>
            {pro ? `Pro until ${formatDate(auth.proUntil)}` : 'Free plan'}
          </p>
          {autopayOn && (
            <p className={`text-[11px] ${s.muted}`}>
              Autopay on · renews {sub.plan === 'yearly' ? 'yearly' : 'monthly'}
              {sub.current_end ? ` · next on ${formatDate(sub.current_end)}` : ''}
            </p>
          )}
        </div>
      </div>

      {autopayOn && (
        <button
          onClick={cancel}
          disabled={cancelling}
          className={`w-full py-1.5 rounded-md border text-xs font-medium disabled:opacity-60 ${
            s.dark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {cancelling ? 'Stopping Autopay…' : 'Cancel Autopay'}
        </button>
      )}
      {error && <p className="text-xs text-error">{error}</p>}

      {!autopayOn && (
        <div>
          <h3 className={`text-sm font-semibold mb-2 ${s.text}`}>{pro ? 'Extend Pro' : 'Upgrade to Pro'}</h3>
          <Plans s={s} />
        </div>
      )}

      <button onClick={() => signOut()} className={`w-full flex items-center justify-center space-x-1 py-1.5 text-xs ${s.muted} hover:underline`}>
        <Icon name="LogOut" size={12} />
        <span>Sign out</span>
      </button>
    </div>
  );
};

export default AccountPanel;
