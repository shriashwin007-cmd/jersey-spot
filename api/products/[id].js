import { sql, ensureSchema, checkAdminPassword, sanitizePrice, logActivity } from '../_db.js';
import { destroyCloudinaryAsset } from '../_cloudinary.js';

export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    await ensureSchema();

    const id = Number(req.query.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    if (!checkAdminPassword(req)) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'PUT') {
      const { name, tag, category, club, price, sortOrder, inStock, buyOnline, imageUrl, cloudinaryPublicId, images } = req.body || {};
      const safePrice = price === undefined || price === null ? null : sanitizePrice(price);
      const safeInStock = inStock === undefined || inStock === null ? null : !!inStock;
      const safeBuyOnline = buyOnline === undefined || buyOnline === null ? null : !!buyOnline;
      const newImageUrl = imageUrl || null;
      const newPublicId = cloudinaryPublicId || null;

      let oldPublicId = null;
      let oldImages = null;
      if (newImageUrl || images !== undefined) {
        const [cur] = await sql`SELECT cloudinary_public_id, images FROM products WHERE id = ${id}`;
        oldPublicId = cur?.cloudinary_public_id || null;
        oldImages = cur?.images || [];
      }

      const imagesJson = images !== undefined ? JSON.stringify(images) : null;

      const [row] = await sql`
        UPDATE products SET
          name = COALESCE(${name}, name),
          tag = COALESCE(${tag}, tag),
          category = COALESCE(${category}, category),
          club = COALESCE(${club}, club),
          price = COALESCE(${safePrice}, price),
          sort_order = COALESCE(${sortOrder}, sort_order),
          in_stock = COALESCE(${safeInStock}, in_stock),
          buy_online = COALESCE(${safeBuyOnline}, buy_online),
          image_url = COALESCE(${newImageUrl}, image_url),
          cloudinary_public_id = COALESCE(${newPublicId}, cloudinary_public_id),
          images = COALESCE(${imagesJson}::jsonb, images)
        WHERE id = ${id}
        RETURNING id, name, tag, category, club, price, image_url, cloudinary_public_id, sort_order, in_stock, buy_online, enquiry_clicks, created_at, images
      `;
      if (!row) return res.status(404).json({ error: 'Not found' });
      if (safeInStock !== null) {
        await logActivity('stock_toggled', `"${row.name}" marked ${row.in_stock ? 'in stock' : 'sold out'}`);
      }
      if (newImageUrl && oldPublicId && oldPublicId !== row.cloudinary_public_id) {
        await destroyCloudinaryAsset(oldPublicId);
        await logActivity('logo_blurred', `Updated image for "${row.name}"`);
      }
      // Clean up removed images from Cloudinary when images array is replaced
      if (images !== undefined && oldImages.length > 0) {
        const newIds = new Set((images || []).map((img) => img.publicId));
        for (const oldImg of oldImages) {
          if (oldImg.publicId && !newIds.has(oldImg.publicId)) {
            await destroyCloudinaryAsset(oldImg.publicId);
          }
        }
      }
      return res.status(200).json({ product: row });
    }

    if (req.method === 'DELETE') {
      const [row] = await sql`DELETE FROM products WHERE id = ${id} RETURNING name, cloudinary_public_id, images`;
      if (!row) return res.status(404).json({ error: 'Not found' });
      await destroyCloudinaryAsset(row.cloudinary_public_id);
      // Also delete all additional images from Cloudinary
      if (row.images && row.images.length > 0) {
        for (const img of row.images) {
          if (img.publicId) {
            await destroyCloudinaryAsset(img.publicId);
          }
        }
      }
      await logActivity('product_deleted', `Deleted "${row.name}"`);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
