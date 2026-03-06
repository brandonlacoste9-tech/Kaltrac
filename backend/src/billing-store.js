import { query } from './db.js';

function isActiveStatus(status) {
  return status === 'active' || status === 'trialing';
}

export async function getBillingStatus(userId) {
  const result = await query(
    `SELECT
       stripe_customer_id,
       stripe_subscription_id,
       status,
       current_period_end
     FROM subscriptions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  const row = result.rows?.[0];
  if (!row) return { isPremium: false };

  const currentPeriodEnd = row.current_period_end ? new Date(row.current_period_end) : null;
  const withinPeriod = !currentPeriodEnd || currentPeriodEnd.getTime() > Date.now();
  const isPremium = isActiveStatus(row.status) && withinPeriod;

  return {
    isPremium,
    status: row.status || null,
    currentPeriodEnd: row.current_period_end || null,
    stripeCustomerId: row.stripe_customer_id || null,
    stripeSubscriptionId: row.stripe_subscription_id || null,
  };
}

export async function upsertSubscription({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
  currentPeriodEnd,
}) {
  const result = await query(
    `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (stripe_subscription_id) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       status = EXCLUDED.status,
       current_period_end = EXCLUDED.current_period_end,
       updated_at = NOW()
     RETURNING *`,
    [
      userId,
      stripeCustomerId || null,
      stripeSubscriptionId,
      status || null,
      currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    ]
  );

  return result.rows?.[0];
}

