import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

// Testing vuanulvyqkfefmjcikfk.supabase.co directly
const URL = "postgresql://postgres:t6C8Z8pgSL6kXqEZ@vuanulvyqkfefmjcikfk.supabase.co:5432/postgres";

const pool = new Pool({
    connectionString: URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        console.log('Connecting to vuanulvyqkfefmjcikfk.supabase.co (5432)...');
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('✅ Connection successful:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
