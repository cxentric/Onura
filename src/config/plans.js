// Pro plans. Prices are app settings, changed by the super admin in the admin console;
// the amounts here are only the defaults. Amounts are in paise (₹1 = 100 paise).
// Shared by the app (prices shown) and the Cloudflare functions (amounts charged).
export const PLANS = {
  monthly: { id: 'monthly', label: '1 month', days: 30, amountPaise: 14900 },
  yearly: { id: 'yearly', label: '1 year', days: 365, amountPaise: 99900 },
};

export const formatRupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/** The plans with prices from settings ({ price_monthly_paise, price_yearly_paise }). */
export function plansFrom(settings = {}) {
  const monthly = Number(settings.price_monthly_paise) || PLANS.monthly.amountPaise;
  const yearly = Number(settings.price_yearly_paise) || PLANS.yearly.amountPaise;
  const saving = Math.round((1 - yearly / (monthly * 12)) * 100);
  return {
    monthly: { ...PLANS.monthly, amountPaise: monthly, price: formatRupees(monthly) },
    yearly: { ...PLANS.yearly, amountPaise: yearly, price: formatRupees(yearly), note: saving > 0 ? `Save ${saving}%` : null },
  };
}

/** What Pro adds, shown on the upgrade screen. */
export function proFeatures(settings) {
  const runs = Number(settings.free_runs_per_day);
  return [
    `Unlimited quizzes and revision (Free: ${runs} a day)`,
    settings.feature_ai_coach && settings.ai_coach_pro_only && 'AI Coach with your own ChatGPT, Claude or Gemini',
    settings.feature_ai_coach && settings.openrouter_pro_only && 'AI Coach with OpenRouter: every AI model, one sign-in',
    'Progress synced across your devices',
    settings.feature_share_badge && 'Shareable Readiness badge',
  ].filter(Boolean);
}
