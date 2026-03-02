import pg from 'pg';
import dotenv from 'dotenv';
import * as localDB from './db-local.js';

dotenv.config();

const { Pool } = pg;

let useLocalDB = false;
let pool = null;

// Try to connect to PostgreSQL, fall back to local JSON DB
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 3000,
  });

  // Test connection immediately
  pool.query('SELECT 1').then(() => {
    console.log('✅ PostgreSQL connected successfully');
  }).catch((err) => {
    console.warn('⚠️ PostgreSQL unavailable:', err.message);
    console.log('📁 Falling back to local JSON database (data/db.json)');
    useLocalDB = true;
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL idle client error:', err.message);
    useLocalDB = true;
  });
} catch (e) {
  console.warn('⚠️ PostgreSQL pool creation failed:', e.message);
  console.log('📁 Using local JSON database');
  useLocalDB = true;
}

export async function query(text, params) {
  if (useLocalDB) {
    return localDB.query(text, params);
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 60), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error, switching to local DB:', error.message);
    useLocalDB = true;
    return localDB.query(text, params);
  }
}

export async function getClient() {
  if (useLocalDB) {
    return { query: localDB.query, release: () => {} };
  }
  const client = await pool.connect();
  return client;
}

export async function closePool() {
  if (pool) await pool.end();
}

export default pool;
