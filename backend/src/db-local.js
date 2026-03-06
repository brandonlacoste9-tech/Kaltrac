import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial DB schema
const EMPTY_DB = {
  users: [],
  meals: [],
  workouts: [],
  water: [],
  settings: [],
  favorites: [],
  shopping_list: [],
  grocery_cache: [],
  subscriptions: [],
  ai_usage: [],
};

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading local DB, resetting:', e.message);
  }
  return { ...EMPTY_DB };
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Simulate PostgreSQL query() interface
export async function query(text, params = []) {
  const db = loadDB();
  const sql = text.trim().toUpperCase();

  // ======= AUTH: USERS =======
  if (sql.startsWith('INSERT INTO USERS')) {
    const [email, passwordHash, name] = params;
    // Check duplicate
    if (db.users.find(u => u.email === email)) {
      const err = new Error('Email already exists');
      err.code = '23505';
      throw err;
    }
    const user = { id: Date.now(), email, password_hash: passwordHash, name, created_at: new Date().toISOString() };
    db.users.push(user);
    saveDB(db);
    return { rows: [user], rowCount: 1 };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM USERS') && sql.includes('EMAIL')) {
    const email = params[0];
    const user = db.users.find(u => u.email === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM USERS') && sql.includes('ID')) {
    const id = params[0];
    const user = db.users.find(u => u.id === Number(id) || u.id === id);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // ======= BILLING: SUBSCRIPTIONS =======
  if (sql.startsWith('SELECT') && sql.includes('FROM SUBSCRIPTIONS')) {
    const userId = params[0];
    const rows = db.subscriptions
      .filter(s => s.user_id === userId || s.user_id === Number(userId) || s.user_id === String(userId))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return { rows: rows.slice(0, 1), rowCount: rows.length ? 1 : 0 };
  }

  if (sql.startsWith('INSERT INTO SUBSCRIPTIONS')) {
    const [userId, stripeCustomerId, stripeSubscriptionId, status, currentPeriodEnd] = params;
    const existingIdx = db.subscriptions.findIndex(s => s.stripe_subscription_id === stripeSubscriptionId);
    const now = new Date().toISOString();
    const row = {
      id: Date.now(),
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status,
      current_period_end: currentPeriodEnd,
      created_at: existingIdx >= 0 ? db.subscriptions[existingIdx].created_at : now,
      updated_at: now,
    };
    if (existingIdx >= 0) db.subscriptions[existingIdx] = { ...db.subscriptions[existingIdx], ...row };
    else db.subscriptions.push(row);
    saveDB(db);
    return { rows: [row], rowCount: 1 };
  }

  // ======= MEALS =======
  if (sql.startsWith('INSERT INTO MEALS')) {
    const meal = {
      id: Date.now(),
      user_id: params[0],
      name: params[1],
      calories: params[2],
      protein: params[3],
      carbs: params[4],
      fat: params[5],
      sugar: params[6] || 0,
      fiber: params[7] || 0,
      source: params[8] || 'manual',
      logged_at: new Date().toISOString()
    };
    db.meals.push(meal);
    saveDB(db);
    return { rows: [meal], rowCount: 1 };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM MEALS') && sql.includes('TODAY')) {
    const userId = params[0];
    const today = new Date().toISOString().split('T')[0];
    const meals = db.meals.filter(m => 
      (m.user_id === userId || m.user_id === Number(userId)) && 
      m.logged_at?.startsWith(today)
    );
    return { rows: meals, rowCount: meals.length };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM MEALS')) {
    const userId = params[0];
    const meals = db.meals.filter(m => m.user_id === userId || m.user_id === Number(userId));
    return { rows: meals, rowCount: meals.length };
  }

  if (sql.startsWith('DELETE') && sql.includes('MEALS')) {
    const id = params[0];
    db.meals = db.meals.filter(m => m.id !== Number(id) && m.id !== id);
    saveDB(db);
    return { rows: [], rowCount: 1 };
  }

  // ======= AI USAGE (FREE TIER LIMITS) =======
  if (sql.startsWith('SELECT') && sql.includes('FROM AI_USAGE')) {
    const userKey = params[0];
    const today = new Date().toISOString().split('T')[0];
    const row = db.ai_usage.find(r => r.user_key === userKey && r.usage_date === today);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }

  if (sql.startsWith('INSERT INTO AI_USAGE')) {
    const [userKey, usageDate, count] = params;
    const idx = db.ai_usage.findIndex(r => r.user_key === userKey && r.usage_date === usageDate);
    const now = new Date().toISOString();
    const row = {
      id: Date.now(),
      user_key: userKey,
      usage_date: usageDate,
      count,
      created_at: idx >= 0 ? db.ai_usage[idx].created_at : now,
      updated_at: now,
    };
    if (idx >= 0) db.ai_usage[idx] = { ...db.ai_usage[idx], ...row };
    else db.ai_usage.push(row);
    saveDB(db);
    return { rows: [row], rowCount: 1 };
  }

  // ======= WORKOUTS =======
  if (sql.startsWith('INSERT INTO WORKOUTS')) {
    const workout = {
      id: Date.now(),
      user_id: params[0],
      name: params[1],
      duration_min: params[2],
      calories_burned: params[3],
      intensity: params[4] || 'moderate',
      logged_at: new Date().toISOString()
    };
    db.workouts.push(workout);
    saveDB(db);
    return { rows: [workout], rowCount: 1 };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM WORKOUTS')) {
    const userId = params[0];
    const today = new Date().toISOString().split('T')[0];
    const workouts = db.workouts.filter(w => 
      (w.user_id === userId || w.user_id === Number(userId)) &&
      w.logged_at?.startsWith(today)
    );
    return { rows: workouts, rowCount: workouts.length };
  }

  if (sql.startsWith('DELETE') && sql.includes('WORKOUTS')) {
    const id = params[0];
    db.workouts = db.workouts.filter(w => w.id !== Number(id) && w.id !== id);
    saveDB(db);
    return { rows: [], rowCount: 1 };
  }

  // ======= WATER =======
  if (sql.includes('WATER') && (sql.startsWith('INSERT') || sql.startsWith('UPDATE'))) {
    const userId = params[0];
    const glasses = params[1];
    const today = new Date().toISOString().split('T')[0];
    const existing = db.water.findIndex(w => 
      (w.user_id === userId || w.user_id === Number(userId)) && w.date === today
    );
    if (existing >= 0) {
      db.water[existing].glasses_count = glasses;
    } else {
      db.water.push({ id: Date.now(), user_id: userId, glasses_count: glasses, date: today });
    }
    saveDB(db);
    return { rows: [{ glasses_count: glasses }], rowCount: 1 };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM WATER')) {
    const userId = params[0];
    const today = new Date().toISOString().split('T')[0];
    const entry = db.water.find(w => 
      (w.user_id === userId || w.user_id === Number(userId)) && w.date === today
    );
    return { rows: entry ? [entry] : [{ glasses_count: 0 }], rowCount: 1 };
  }

  // ======= SETTINGS =======
  if (sql.includes('SETTINGS') && (sql.startsWith('INSERT') || sql.startsWith('UPDATE') || sql.includes('UPSERT'))) {
    const userId = params[0];
    const settingsData = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
    const existing = db.settings.findIndex(s => s.user_id === userId || s.user_id === Number(userId));
    if (existing >= 0) {
      db.settings[existing] = { ...db.settings[existing], ...settingsData };
    } else {
      db.settings.push({ id: Date.now(), user_id: userId, ...settingsData });
    }
    saveDB(db);
    return { rows: [db.settings.find(s => s.user_id === userId || s.user_id === Number(userId))], rowCount: 1 };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM SETTINGS')) {
    const userId = params[0];
    const entry = db.settings.find(s => s.user_id === userId || s.user_id === Number(userId));
    return { rows: entry ? [entry] : [], rowCount: entry ? 1 : 0 };
  }

  // ======= FAVORITES =======
  if (sql.startsWith('INSERT') && sql.includes('FAVORITES')) {
    const fav = { id: Date.now(), user_id: params[0], name: params[1], calories: params[2], protein: params[3], carbs: params[4], fat: params[5] };
    db.favorites.push(fav);
    saveDB(db);
    return { rows: [fav], rowCount: 1 };
  }

  if (sql.startsWith('SELECT') && sql.includes('FROM FAVORITES')) {
    const userId = params[0];
    const favs = db.favorites.filter(f => f.user_id === userId || f.user_id === Number(userId));
    return { rows: favs, rowCount: favs.length };
  }

  if (sql.startsWith('DELETE') && sql.includes('FAVORITES')) {
    const id = params[0];
    db.favorites = db.favorites.filter(f => f.id !== Number(id) && f.id !== id);
    saveDB(db);
    return { rows: [], rowCount: 1 };
  }

  // ======= SHOPPING LIST =======
  if (sql.startsWith('INSERT') && sql.includes('SHOPPING')) {
    const item = { id: Date.now(), user_id: params[0], name: params[1], quantity: params[2] || 1, is_checked: false };
    db.shopping_list.push(item);
    saveDB(db);
    return { rows: [item], rowCount: 1 };
  }

  if (sql.startsWith('SELECT') && sql.includes('SHOPPING')) {
    const userId = params[0];
    const items = db.shopping_list.filter(i => i.user_id === userId || i.user_id === Number(userId));
    return { rows: items, rowCount: items.length };
  }

  if (sql.startsWith('UPDATE') && sql.includes('SHOPPING')) {
    const id = params[0];
    const item = db.shopping_list.find(i => i.id === Number(id) || i.id === id);
    if (item) {
      item.is_checked = params[1];
      saveDB(db);
    }
    return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
  }

  if (sql.startsWith('DELETE') && sql.includes('SHOPPING') && sql.includes('COMPLETED')) {
    const userId = params[0];
    db.shopping_list = db.shopping_list.filter(i => 
      !((i.user_id === userId || i.user_id === Number(userId)) && i.is_checked)
    );
    saveDB(db);
    return { rows: [], rowCount: 1 };
  }

  if (sql.startsWith('DELETE') && sql.includes('SHOPPING')) {
    const id = params[0];
    db.shopping_list = db.shopping_list.filter(i => i.id !== Number(id) && i.id !== id);
    saveDB(db);
    return { rows: [], rowCount: 1 };
  }

  // Default: return empty
  console.warn('Unmatched local DB query:', text);
  return { rows: [], rowCount: 0 };
}
