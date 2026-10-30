/**
 * App settings and question-bank edits, controlled from the admin console (admin.cxentric.in).
 *
 * Read with a plain request (no Supabase library) when the app starts, and cached in the browser
 * so the next visit starts with the latest values even before the request returns.
 * Without Supabase configured, the defaults below apply.
 */
import { useSyncExternalStore } from 'react';

export const DEFAULT_SETTINGS = {
  price_monthly_paise: 14900,
  price_yearly_paise: 99900,
  free_runs_per_day: 1,
  ai_coach_pro_only: true,
  feature_ai_coach: true,
  feature_hashtags: true,
  feature_share_badge: true,
  announcement_text: '',
  announcement_level: 'info',
  maintenance_mode: false,
  maintenance_message: 'CXentric is getting an upgrade. We’ll be back shortly.',
};

const SETTINGS_KEY = 'cxentric.settings.v1';
export const KB_OVERRIDES_KEY = 'cxentric.kbOverrides.v1';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function readCache(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: settings are fetched again next visit.
  }
}

let settings = { ...DEFAULT_SETTINGS, ...readCache(SETTINGS_KEY) };
const listeners = new Set();
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSettings = () => useSyncExternalStore(subscribe, () => settings);
export const getSettings = () => settings;

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

/** Called once at start-up. */
export function loadAppSettings() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  rest('app_settings?select=key,value&is_public=eq.true')
    .then((rows) => {
      const fresh = Object.fromEntries(rows.map((row) => [row.key, row.value]));
      writeCache(SETTINGS_KEY, fresh);
      settings = { ...DEFAULT_SETTINGS, ...fresh };
      listeners.forEach((listener) => listener());
    })
    .catch(() => {});

  // Question edits are applied when the question bank next loads (usually when the assistant opens).
  rest('kb_overrides?select=id,kind,data')
    .then((rows) => writeCache(KB_OVERRIDES_KEY, rows))
    .catch(() => {});
}

/** Question-bank edits saved by the last visit: [{ id, kind: 'edit' | 'hide' | 'add', data }]. */
export const cachedKbOverrides = () => readCache(KB_OVERRIDES_KEY) || [];
