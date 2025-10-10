// Stripe Price IDs - Update these with your actual Stripe Price IDs from the dashboard
// Create products in Stripe dashboard first:
// 1. Product: "ResumeForge Pro" with 2 prices (monthly & yearly)
// 2. Product: "ResumeForge Premium" with 2 prices (monthly & yearly)

export const STRIPE_PRICE_IDS = {
  // TODO: Replace these with your actual Stripe Price IDs
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_placeholder',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly_placeholder',
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly_placeholder',
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly_placeholder',
} as const;

export type SubscriptionTier = keyof typeof STRIPE_PRICE_IDS;

export function getTierFromPriceId(priceId: string): 'pro' | 'premium' | null {
  if (priceId === STRIPE_PRICE_IDS.pro_monthly || priceId === STRIPE_PRICE_IDS.pro_yearly) {
    return 'pro';
  }
  if (priceId === STRIPE_PRICE_IDS.premium_monthly || priceId === STRIPE_PRICE_IDS.premium_yearly) {
    return 'premium';
  }
  return null;
}

export function getCreditsForTier(tier: 'free' | 'pro' | 'premium'): { resume: number; interview: number; linkedin: number } {
  switch (tier) {
    case 'free':
      return { resume: 5, interview: 2, linkedin: 1 };
    case 'pro':
      return { resume: -1, interview: -1, linkedin: 10 }; // -1 means unlimited
    case 'premium':
      return { resume: -1, interview: -1, linkedin: -1 }; // all unlimited
  }
}

export function getNextResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}
