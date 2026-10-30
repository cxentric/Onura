import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import Input from './ui/Input';
import { accountsEnabled, signInWithEmail, signInWithGoogle, useAuth } from '../services/auth';

// Open from anywhere: openSignIn('Sign in to like posts.').
let prompt = null; // null when closed, otherwise { reason }
const listeners = new Set();
const setPrompt = (next) => {
  prompt = next;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const openSignIn = (reason = null) => accountsEnabled && setPrompt({ reason });
export const closeSignIn = () => setPrompt(null);

// Visitors see the pop-up once per browser session, a few seconds after arriving.
const AUTO_OPEN_KEY = 'cxentric.signInPrompted';
const AUTO_OPEN_DELAY_MS = 6000;

function shouldAutoOpen() {
  try {
    if (sessionStorage.getItem(AUTO_OPEN_KEY)) return false;
    sessionStorage.setItem(AUTO_OPEN_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

const SignInModal = () => {
  const current = useSyncExternalStore(subscribe, () => prompt);
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (auth.status !== 'signed-out') return undefined;
    const timer = setTimeout(() => {
      if (!prompt && document.visibilityState === 'visible' && shouldAutoOpen()) openSignIn();
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [auth.status]);

  // A sign-in link that failed: reopen the pop-up and say why.
  useEffect(() => {
    if (auth.linkError) openSignIn(auth.linkError);
  }, [auth.linkError]);

  // Close once signed in, and on Escape.
  useEffect(() => {
    if (auth.status === 'signed-in' && prompt) closeSignIn();
  }, [auth.status]);
  useEffect(() => {
    if (!current) return undefined;
    setSent(false);
    setError(null);
    dialogRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeSignIn();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [current]);

  if (!current || !accountsEnabled) return null;

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && closeSignIn()}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-title"
        className="relative w-full max-w-sm bg-surface rounded-xl shadow-xl p-6 space-y-4 outline-none"
      >
        <button onClick={closeSignIn} aria-label="Close" className="absolute top-3 right-3 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-secondary-50">
          <Icon name="X" size={18} />
        </button>
        <div className="flex items-center space-x-3">
          <img src="/assets/images/logo.webp" alt="" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 id="sign-in-title" className="text-lg font-heading font-semibold text-text-primary">Join CXentric</h2>
            <p className="text-sm text-text-muted">{current.reason || 'Sign in to post, connect and see your network.'}</p>
          </div>
        </div>

        <Button variant="outline" fullWidth disabled={busy} onClick={() => run(signInWithGoogle)} iconName="LogIn" iconPosition="left">
          Continue with Google
        </Button>

        <div className="flex items-center space-x-2 text-xs text-text-muted">
          <span className="flex-1 h-px bg-border" />
          <span>or get a sign-in link by email</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        {sent ? (
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-primary-50">
            <Icon name="Mail" size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-primary">
              Check <strong>{email}</strong> for a sign-in link. It brings you back here.
            </p>
          </div>
        ) : (
          <form
            className="flex space-x-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await signInWithEmail(email.trim());
                setSent(true);
              });
            }}
          >
            <Input type="email" required placeholder="you@example.com" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" disabled={busy}>Send</Button>
          </form>
        )}

        {error && <p className="text-sm text-error">{error}</p>}
        <p className="text-xs text-text-muted">New here? Signing in creates your free account.</p>
      </div>
    </div>
  );
};

export default SignInModal;
