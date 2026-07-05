import { sql, ensureSchema, checkAdminPassword, sanitizePrice } from './_db.js';

export default async function handler(req, res) {
  try {
    if (!sql) {
      return res.status(503).json({ error: 'Database not connected yet' });
    }
    await ensureSchema();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, name, tag, category, price, image_url, cloudinary_public_id, sort_order, created_at
        FROM products
        ORDER BY sort_order ASC, created_at DESC
      `;
      return res.status(200).json({ products: rows });
    }

    if (req.method === 'POST') {
      if (!checkAdminPassword(req)) return res.status(401).json({ error: 'Unauthorized' });

      const { name, tag = '', category = 'jersey', price = 0, imageUrl, cloudinaryPublicId } = req.body || {};
      if (!name || !imageUrl || !cloudinaryPublicId) {
        return res.status(400).json({ error: 'name, imageUrl and cloudinaryPublicId are required' });
      }

      const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM products`;
      const [row] = await sql`
        INSERT INTO products (name, tag, category, price, image_url, cloudinary_public_id, sort_order)
        VALUES (${name}, ${tag}, ${category}, ${sanitizePrice(price)}, ${imageUrl}, ${cloudinaryPublicId}, ${max + 1})
        RETURNING id, name, tag, category, price, image_url, cloudinary_public_id, sort_order, created_at
      `;
      return res.status(201).json({ product: row });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
