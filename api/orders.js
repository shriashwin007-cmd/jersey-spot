import { sql, ensureSchema, checkAdminPassword } from './_db.js';

export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
    if (!checkAdminPassword(req)) return res.status(401).json({ error: 'Unauthorized' });
    await ensureSchema();

    const rows = await sql`
      SELECT id, status, customer_name, customer_phone, customer_email,
             address_line, city, state, pincode, items, subtotal, shipping_fee, total,
             razorpay_order_id, razorpay_payment_id, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return res.status(200).json({ orders: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
