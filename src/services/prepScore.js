/**
 * Prep Score: display layer only. It describes how much of the goal's question set the learner has
 * answered correctly, as a level. It is never a prediction of interview results.
 * The stored data and readiness() in progress.js stay as they are, so saved and synced progress loads unchanged.
 */
export const POOL_SIZE = 65;

export const LEVELS = [
  { min: 0, key: 'starting', label: 'Getting started' },
  { min: 25, key: 'building', label: 'Building' },
  { min: 50, key: 'foundation', label: 'Strong foundation' },
  { min: 75, key: 'practice', label: 'Ready for mock interviews' },
  { min: 100, key: 'complete', label: 'Prep track complete' },
];

export const levelAtLeast = (score, key) => score.pct >= LEVELS.find((l) => l.key === key).min;

export const SCOPE_NOTE = 'Covers role and company knowledge. Doesn’t cover communication, your CV or live interview skills.';

/** @param {number} correct goal questions answered correctly @param {number} total questions in the goal pool */
export function prepScore(correct, total = POOL_SIZE) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const level = [...LEVELS].reverse().find((l) => pct >= l.min);
  const next = LEVELS.find((l) => l.min > pct) || null;
  const toNext = next ? Math.ceil((next.min * total) / 100) - correct : 0;
  return { pct, correct, total, level, next, toNext };
}
