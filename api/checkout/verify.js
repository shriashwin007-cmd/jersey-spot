import { sql, ensureSchema, logActivity } from '../_db.js';
import { verifyRazorpaySignature } from '../_razorpay.js';

export default async function handler(req, res) {
  try {
    if (!sql) return res.status(503).json({ error: 'Database not connected yet' });
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
    await ensureSchema();

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const valid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!valid) {
      console.error('Razorpay signature mismatch for order', orderId);
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const [order] = await sql`
      UPDATE orders SET
        status = 'paid',
        razorpay_payment_id = ${razorpay_payment_id},
        razorpay_signature = ${razorpay_signature}
      WHERE id = ${orderId} AND razorpay_order_id = ${razorpay_order_id}
      RETURNING id, status, total, customer_name
    `;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await logActivity('order_paid', `Order #${order.id} paid — ₹${order.total} by ${order.customer_name}`);

    return res.status(200).json({ ok: true, order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
