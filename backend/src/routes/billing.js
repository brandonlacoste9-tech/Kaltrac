import express from 'express';
import Stripe from 'stripe';
import { authenticateRequest } from '../middleware.js';
import { getBillingStatus, upsertSubscription } from '../billing-store.js';

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SUCCESS_URL = process.env.STRIPE_SUCCESS_URL || `${FRONTEND_URL}/?stripe=success`;
const CANCEL_URL = process.env.STRIPE_CANCEL_URL || `${FRONTEND_URL}/?stripe=cancel`;

function getStripe() {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
}

router.get('/status', authenticateRequest, async (req, res, next) => {
  try {
    const status = await getBillingStatus(req.user.id);
    res.json(status);
  } catch (e) {
    next(e);
  }
});

const STRIPE_PAYMENT_LINK_URL = process.env.STRIPE_PAYMENT_LINK_URL;

router.post('/create-checkout-session', authenticateRequest, async (req, res, next) => {
  try {
    // If you use a Stripe Payment Link (e.g. from Dashboard), redirect there instead
    if (STRIPE_PAYMENT_LINK_URL) {
      return res.json({ url: STRIPE_PAYMENT_LINK_URL });
    }

    if (!STRIPE_PRICE_ID) return res.status(500).json({ error: 'STRIPE_PRICE_ID not set' });

    const stripe = getStripe();
    const billing = await getBillingStatus(req.user.id);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      customer: billing.stripeCustomerId || undefined,
      customer_email: billing.stripeCustomerId ? undefined : req.user.email,
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: String(req.user.id) },
      },
      metadata: { userId: String(req.user.id) },
    });

    res.json({ url: session.url });
  } catch (e) {
    next(e);
  }
});

router.post('/create-portal-session', authenticateRequest, async (req, res, next) => {
  try {
    const stripe = getStripe();
    const billing = await getBillingStatus(req.user.id);
    if (!billing.stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer on file' });

    const portal = await stripe.billingPortal.sessions.create({
      customer: billing.stripeCustomerId,
      return_url: FRONTEND_URL,
    });

    res.json({ url: portal.url });
  } catch (e) {
    next(e);
  }
});

export function stripeWebhookHandler(rawBody, signature) {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not set');
  }

  const stripe = getStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
}

export async function handleStripeEvent(event) {
  // We track subscription state only; payments are managed by Stripe.
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode !== 'subscription') return;
      const userId = session.metadata?.userId;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;
      if (!userId || !stripeSubscriptionId) return;

      await upsertSubscription({
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        status: 'active',
        currentPeriodEnd: null,
      });
      return;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      const stripeCustomerId = sub.customer;
      const stripeSubscriptionId = sub.id;
      if (!userId || !stripeSubscriptionId) return;

      await upsertSubscription({
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end || null,
      });
      return;
    }
    default:
      return;
  }
}

export default router;

