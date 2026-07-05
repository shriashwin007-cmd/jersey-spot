import { sql, ensureSchema } from './_db.js';

// Public, fire-and-forget — called right before a WhatsApp deep link opens.
// No admin auth: this is just a counter, not sensitive data.
export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
    await ensureSchema();

    const id = Number(req.body?.productId);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid productId' });

    await sql`UPDATE products SET enquiry_clicks = enquiry_clicks + 1 WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
