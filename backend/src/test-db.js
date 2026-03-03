import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// Use the DATABASE_URL from the .env file
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env file. Please ensure it is set correctly.');
  process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
});

async function test() {
    try {
        const url = new URL(databaseUrl);
        console.log(`Connecting to ${url.hostname}:${url.port}...`);
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('✅ Connection successful:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await pool.end();
    }
}

test();
