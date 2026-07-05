import { sql, ensureSchema, checkAdminPassword, logActivity } from '../_db.js';

const VALID_STATUSES = ['pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled'];

export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    if (req.method !== 'PUT') { res.setHeader('Allow', 'PUT'); return res.status(405).json({ error: 'Method not allowed' }); }
    if (!checkAdminPassword(req)) return res.status(401).json({ error: 'Unauthorized' });
    await ensureSchema();

    const id = Number(req.query.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const { status } = req.body || {};
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const [order] = await sql`
      UPDATE orders SET status = ${status} WHERE id = ${id}
      RETURNING id, status, customer_name, total
    `;
    if (!order) return res.status(404).json({ error: 'Not found' });

    await logActivity('order_status_changed', `Order #${order.id} (${order.customer_name}) → ${status}`);

    return res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
