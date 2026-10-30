/**
 * Pro: keeps learning progress in step across devices.
 * Progress stays in the browser as before; for Pro users a copy is also kept in Supabase
 * (one small JSON row per user), merged on sign-in and saved a few seconds after each change.
 */
import { getAuth, getSupabase, isPro, subscribeAuth } from './auth';
import { setState, state as progressState, subscribeProgress } from './progressStore';

const SAVE_DELAY_MS = 3000;

/** Combines two progress copies so nothing learned on either device is lost. */
export function mergeProgress(local, remote) {
  if (!remote) return local;
  const answers = { ...remote.answers };
  for (const [id, mine] of Object.entries(local.answers)) {
    const theirs = answers[id];
    if (!theirs || mine.attempts >= theirs.attempts) answers[id] = mine;
  }
  const later = (a, b) => ((a.lastDate || '') >= (b.lastDate || '') ? a : b);
  const streak = later(local.streak, remote.streak);
  const daily =
    local.daily.date === remote.daily.date
      ? Object.keys(local.daily.answers).length >= Object.keys(remote.daily.answers).length ? local.daily : remote.daily
      : (local.daily.date || '') > (remote.daily.date || '') ? local.daily : remote.daily;
  return {
    ...local,
    goal: local.goal || remote.goal,
    answers,
    streak: { ...streak, best: Math.max(local.streak.best, remote.streak.best) },
    daily,
    xp: Math.max(local.xp, remote.xp),
  };
}

let stopSaving = null;
let syncedUserId = null;

async function start(userId) {
  syncedUserId = userId;
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('progress').select('data').eq('user_id', userId).maybeSingle();
  if (error || syncedUserId !== userId) return;

  if (data?.data) setState((local) => mergeProgress(local, data.data));

  let timer = null;
  const save = async () => {
    const { runs, ...shared } = progressState; // the daily free-run count stays per device
    await supabase.from('progress').upsert({ user_id: userId, data: shared, updated_at: new Date().toISOString() });
  };
  save();
  const unsubscribe = subscribeProgress(() => {
    clearTimeout(timer);
    timer = setTimeout(save, SAVE_DELAY_MS);
  });
  stopSaving = () => {
    clearTimeout(timer);
    unsubscribe();
  };
}

function stop() {
  stopSaving?.();
  stopSaving = null;
  syncedUserId = null;
}

/** Called once at start-up: syncs while a Pro user is signed in. */
export function initCloudSync() {
  subscribeAuth(() => {
    const auth = getAuth();
    const shouldSync = auth.status === 'signed-in' && isPro(auth);
    if (shouldSync && syncedUserId !== auth.user.id) {
      stop();
      start(auth.user.id).catch(() => {});
    } else if (!shouldSync && syncedUserId) {
      stop();
    }
  });
}

export const isSyncing = () => syncedUserId !== null;
