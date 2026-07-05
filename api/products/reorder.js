import { sql, ensureSchema, checkAdminPassword } from '../_db.js';

// Body: { order: [{ id, sortOrder }, ...] }
export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
    if (!checkAdminPassword(req)) return res.status(401).json({ error: 'Unauthorized' });
    await ensureSchema();

    const { order } = req.body || {};
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

    await Promise.all(
      order.map(({ id, sortOrder }) => sql`UPDATE products SET sort_order = ${sortOrder} WHERE id = ${id}`)
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
