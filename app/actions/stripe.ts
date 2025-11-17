'use server'

import { stripe } from '@/lib/stripe'

const PRICE_ID = 'price_1S59GOL0tgTNaSwwEqyW1brC'

export async function startCheckoutSession(email: string, name: string) {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 7,
    },
    customer_email: email,
    metadata: {
      userName: name,
    },
  })

  return session.client_secret
}
