/**
 * Learner progress actions and knowledge-base-aware values (readiness, daily challenge).
 * State lives in progressStore.js, in the browser.
 */
import { buildDailyChallenge, goalItems } from '../data/kb';
import { XP, dateKey, emptyState, setState, shiftDays, state as storeState } from './progressStore';

export { useProgress, activeStreak, dailyDone, dateKey, runsToday } from './progressStore';

// ---- Derived values ----

export const masteredIds = (s) =>
  new Set(Object.keys(s.answers).filter((id) => s.answers[id].correct));

export const mistakeIds = (s) =>
  Object.keys(s.answers).filter((id) => !s.answers[id].correct);

export function readiness(s) {
  const pool = goalItems(s.goal);
  if (!pool.length) return { percent: 0, mastered: 0, total: 0 };
  const mastered = pool.filter((item) => s.answers[item.id]?.correct).length;
  return { percent: Math.round((mastered / pool.length) * 100), mastered, total: pool.length };
}

// ---- Actions ----

export function setGoal(goal) {
  setState((s) => ({ ...s, goal, daily: s.daily.date === dateKey() && dailyStarted(s) ? s.daily : emptyState().daily }));
}

const dailyStarted = (s) => Object.keys(s.daily.answers).length > 0;

/** Make sure today's challenge exists; a new day (or a new goal before starting) gets fresh questions. */
export function ensureDailyChallenge() {
  const today = dateKey();
  if (storeState.daily.date === today && storeState.daily.ids.length) return;
  setState((s) => ({
    ...s,
    daily: {
      date: today,
      ids: buildDailyChallenge(today, s.goal, { mistakes: mistakeIds(s), mastered: masteredIds(s) }),
      answers: {},
    },
  }));
}

export function recordAnswer(id, correct) {
  setState((s) => {
    const prev = s.answers[id] || { attempts: 0, correctCount: 0 };
    return {
      ...s,
      xp: s.xp + (correct ? XP.correct : XP.attempt),
      answers: {
        ...s.answers,
        [id]: {
          correct,
          attempts: prev.attempts + 1,
          correctCount: prev.correctCount + (correct ? 1 : 0),
          last: dateKey(),
        },
      },
    };
  });
}

export function recordDailyAnswer(id, correct) {
  const today = dateKey();
  if (storeState.daily.date !== today || id in storeState.daily.answers) return;
  recordAnswer(id, correct);
  setState((s) => {
    const daily = { ...s.daily, answers: { ...s.daily.answers, [id]: correct } };
    const finished = daily.ids.every((qid) => qid in daily.answers);
    if (!finished || s.streak.lastDate === today) return { ...s, daily };

    const current = s.streak.lastDate === shiftDays(today, -1) ? s.streak.current + 1 : 1;
    return {
      ...s,
      daily,
      xp: s.xp + XP.dailyBonus,
      streak: { current, best: Math.max(current, s.streak.best), lastDate: today },
    };
  });
}

/** Counts a practice run (quiz or revision) towards today's free limit. */
export function countRun() {
  const today = dateKey();
  setState((s) => ({ ...s, runs: { date: today, count: (s.runs.date === today ? s.runs.count : 0) + 1 } }));
}

export function resetProgress() {
  setState(() => emptyState());
}
