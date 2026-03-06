import { query } from './db.js';

export async function incrementDailyAiUsage(userKey) {
  const usageDate = new Date().toISOString().split('T')[0];

  // Read current count
  const current = await query(
    'SELECT count FROM ai_usage WHERE user_key = $1 AND usage_date = $2',
    [userKey, usageDate]
  );

  const existingCount = current.rows?.[0]?.count ? Number(current.rows[0].count) : 0;
  const nextCount = existingCount + 1;

  // Write back (portable between Postgres + local JSON fallback)
  await query(
    `INSERT INTO ai_usage (user_key, usage_date, count)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_key, usage_date) DO UPDATE SET
       count = EXCLUDED.count,
       updated_at = NOW()
     RETURNING count`,
    [userKey, usageDate, nextCount]
  );

  return { usageDate, count: nextCount };
}

