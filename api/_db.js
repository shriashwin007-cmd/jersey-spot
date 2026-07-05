import { neon } from '@neondatabase/serverless';

// Vercel's Neon marketplace integration sets POSTGRES_URL (and friends)
// automatically once a database is connected via the Storage tab.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

export const sql = connectionString ? neon(connectionString) : null;

let schemaReady = null;

// Idempotent — safe to call on every cold start, no separate migration step.
export async function ensureSchema() {
  if (!sql) throw new Error('No database connected (POSTGRES_URL missing)');
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        tag TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'jersey',
        price INTEGER NOT NULL DEFAULT 0,
        image_url TEXT NOT NULL,
        cloudinary_public_id TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
  }
  await schemaReady;
}

export function checkAdminPassword(req) {
  const provided = req.headers['x-admin-password'];
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && provided === expected;
}

// price column is INTEGER (max ~2.1B); clamp to a sane rupee range so a
// stray extra digit can't crash the insert with a Postgres range error.
const MAX_PRICE = 999999;
export function sanitizePrice(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_PRICE);
}
