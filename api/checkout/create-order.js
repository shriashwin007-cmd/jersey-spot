import { sql, ensureSchema, logActivity } from '../_db.js';
import { createRazorpayOrder } from '../_razorpay.js';

const SHIPPING_FEE = 79; // flat rate in rupees

export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
    await ensureSchema();

    const { items, customer, address } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }
    if (!address?.line || !address?.city || !address?.state || !address?.pincode) {
      return res.status(400).json({ error: 'Full shipping address is required' });
    }

    // Never trust client-sent prices — recompute from the DB, and only
    // allow items explicitly marked buy_online + currently in_stock.
    const ids = items.map((it) => Number(it.productId)).filter(Number.isFinite);
    if (!ids.length) return res.status(400).json({ error: 'Invalid cart items' });

    const products = await sql`
      SELECT id, name, price, image_url, in_stock, buy_online
      FROM products
      WHERE id = ANY(${ids})
    `;
    const byId = new Map(products.map((p) => [p.id, p]));

    const lineItems = [];
    let subtotal = 0;
    for (const it of items) {
      const p = byId.get(Number(it.productId));
      const qty = Math.max(1, Math.min(20, Math.trunc(Number(it.qty)) || 1));
      if (!p) return res.status(400).json({ error: `Product ${it.productId} no longer exists` });
      if (!p.in_stock || !p.buy_online) return res.status(400).json({ error: `${p.name} isn't available for online checkout right now` });
      subtotal += p.price * qty;
      lineItems.push({ productId: p.id, name: p.name, price: p.price, qty, imageUrl: p.image_url });
    }

    const total = subtotal + SHIPPING_FEE;
    const receipt = `order_${Date.now()}`;

    const rpOrder = await createRazorpayOrder({
      amountRupees: total,
      receipt,
      notes: { customer: customer.name, phone: customer.phone },
    });

    const [order] = await sql`
      INSERT INTO orders (
        status, customer_name, customer_phone, customer_email,
        address_line, city, state, pincode,
        items, subtotal, shipping_fee, total, razorpay_order_id
      ) VALUES (
        'pending', ${customer.name}, ${customer.phone}, ${customer.email || ''},
        ${address.line}, ${address.city}, ${address.state}, ${address.pincode},
        ${JSON.stringify(lineItems)}, ${subtotal}, ${SHIPPING_FEE}, ${total}, ${rpOrder.id}
      )
      RETURNING id
    `;

    await logActivity('order_created', `Order #${order.id} — ₹${total} (${lineItems.length} item${lineItems.length > 1 ? 's' : ''})`);

    return res.status(201).json({
      orderId: order.id,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount, // paise
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      subtotal,
      shippingFee: SHIPPING_FEE,
      total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
