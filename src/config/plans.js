// Pro plans. Shared by the app (prices shown) and the Cloudflare functions (amounts charged),
// so they can never disagree. Amounts are in paise (₹1 = 100 paise).
export const PLANS = {
  monthly: { id: 'monthly', label: '1 month', price: '₹149', amountPaise: 14900, days: 30 },
  yearly: { id: 'yearly', label: '1 year', price: '₹999', amountPaise: 99900, days: 365, note: 'Save 44%' },
};

// Free users get this many practice runs (quiz or revision) per day. The daily challenge is always free.
export const FREE_RUNS_PER_DAY = 1;

// The AI Coach uses the learner's own AI key, so it costs us nothing to run; it is a Pro perk.
// Set to false to offer it to everyone.
export const AI_COACH_PRO_ONLY = true;

// What Pro adds, shown on the upgrade screen.
export const PRO_FEATURES = [
  'Unlimited quizzes and revision (Free: 1 a day)',
  'AI Coach with your own ChatGPT, Claude or Gemini',
  'Progress synced across your devices',
  'Shareable Readiness badge',
];
