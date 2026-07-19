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
    schemaReady = (async () => {
      await sql`
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
      // Idempotent migrations for installs created before these columns existed.
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT true`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS buy_online BOOLEAN NOT NULL DEFAULT false`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS enquiry_clicks INTEGER NOT NULL DEFAULT 0`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS club TEXT NOT NULL DEFAULT ''`;

      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          status TEXT NOT NULL DEFAULT 'pending',
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT NOT NULL DEFAULT '',
          address_line TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          pincode TEXT NOT NULL,
          items JSONB NOT NULL,
          subtotal INTEGER NOT NULL,
          shipping_fee INTEGER NOT NULL DEFAULT 0,
          total INTEGER NOT NULL,
          razorpay_order_id TEXT,
          razorpay_payment_id TEXT,
          razorpay_signature TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS activity_log (
          id SERIAL PRIMARY KEY,
          action TEXT NOT NULL,
          details TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  await schemaReady;
}

// Best-effort — a logging failure should never break the request it's logging.
export async function logActivity(action, details = '') {
  if (!sql) return;
  try {
    await sql`INSERT INTO activity_log (action, details) VALUES (${action}, ${details})`;
  } catch (err) {
    console.error('logActivity failed', err);
  }
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
