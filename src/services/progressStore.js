/**
 * Lightweight progress store (no knowledge-base import), so always-visible UI such as the
 * assistant bubble can show the streak without loading the question bank.
 * Progress lives in the browser; no server or account needed.
 */
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cxentric.progress.v1';
export const XP = { correct: 10, attempt: 2, dailyBonus: 20 };

export const emptyState = () => ({
  goal: null, // { industry, role }
  answers: {}, // itemId -> { correct (latest), attempts, correctCount, last }
  streak: { current: 0, best: 0, lastDate: null },
  daily: { date: null, ids: [], answers: {} }, // answers: itemId -> correct
  xp: 0,
  runs: { date: null, count: 0 }, // practice runs (quiz or revision) started today; Free has a daily limit
});

/** Local calendar date as YYYY-MM-DD (so the day rolls over at the user's midnight). */
export function dateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function shiftDays(key, days) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...emptyState(), ...saved } : emptyState();
  } catch {
    return emptyState();
  }
}

export let state = load();
const listeners = new Set();

export function setState(updater) {
  state = updater(state);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (e.g. private mode): progress lasts for this visit only.
  }
  listeners.forEach((listener) => listener());
}

// Keep several open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      state = load();
      listeners.forEach((listener) => listener());
    }
  });
}

export const subscribeProgress = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useProgress = () => useSyncExternalStore(subscribeProgress, () => state);

// ---- Derived values that don't need the knowledge base ----

/** Streak as it stands today: it survives until the end of the day after the last completed challenge. */
export function activeStreak(s, today = dateKey()) {
  const { current, lastDate } = s.streak;
  return lastDate === today || lastDate === shiftDays(today, -1) ? current : 0;
}

export const runsToday = (s, today = dateKey()) => (s.runs.date === today ? s.runs.count : 0);

export const dailyDone = (s, today = dateKey()) =>
  s.daily.date === today && s.daily.ids.length > 0 && s.daily.ids.every((id) => id in s.daily.answers);
