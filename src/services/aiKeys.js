/**
 * The user's own AI connection for the AI Coach: their API key for Claude, ChatGPT or Gemini,
 * or an OpenRouter account. Kept only in this browser and sent only to that AI provider.
 * CXentric's servers never see it and pay nothing for the AI.
 */
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cxentric.ai.v1';
const VERIFIER_KEY = 'cxentric.openrouter.verifier';
const CALLBACK_FLAG = 'openrouter';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

let state = { connection: load(), connecting: false, error: null, pendingQuestion: null };
const listeners = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
};
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const useAiConnection = () => useSyncExternalStore(subscribe, () => state);

/** @param {{ provider: string, model: string, key: string }} connection */
export function saveConnection(connection) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
  } catch {
    // Storage blocked: the connection lasts for this visit only.
  }
  set({ connection, error: null });
}

export function forgetConnection() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing saved.
  }
  set({ connection: null });
}

/** Hands a question to the AI Coach tab (e.g. from a Learn answer); the tab asks it when it opens. */
export const askCoach = (question) => set({ pendingQuestion: question });
export const takePendingQuestion = () => {
  const question = state.pendingQuestion;
  if (question) set({ pendingQuestion: null });
  return question;
};

// ---- OpenRouter sign-in (OAuth with PKCE): the user approves CXentric and OpenRouter returns a key ----

const base64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function startOpenRouterConnect() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  const callback = `${window.location.origin}${window.location.pathname}?${CALLBACK_FLAG}=1`;
  window.location.assign(
    `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callback)}&code_challenge=${challenge}&code_challenge_method=S256`
  );
}

/** True when this page load is the return from OpenRouter (the assistant then opens on the AI Coach). */
export let returnedFromOpenRouter = false;

/**
 * Called once at start-up, before sign-in starts: OpenRouter's ?code= must not be mistaken for a
 * Supabase sign-in, so it is removed from the address bar straight away and swapped for a key here.
 */
export function handleOpenRouterReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get(CALLBACK_FLAG) !== '1') return;
  returnedFromOpenRouter = true;
  const code = params.get('code');
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  if (!code || !verifier) {
    set({ error: 'OpenRouter sign-in was cancelled.' });
    return;
  }

  set({ connecting: true, error: null });
  fetch('https://openrouter.ai/api/v1/auth/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: 'S256' }),
  })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
    .then(({ key }) => saveConnection({ provider: 'openrouter', model: 'openrouter/auto', key }))
    .catch(() => set({ error: 'Could not connect OpenRouter. Please try again.' }))
    .finally(() => set({ connecting: false }));
}
