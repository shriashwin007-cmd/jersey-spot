import { createHmac } from 'node:crypto';

// Plain fetch against Razorpay's REST API — no SDK dependency needed for
// just "create an order" + "verify a signature", same approach as Cloudinary.
export async function createRazorpayOrder({ amountRupees, receipt, notes }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay is not configured yet');

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amountRupees * 100), // paise
      currency: 'INR',
      receipt,
      notes,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.description || 'Razorpay order creation failed');
  return data; // { id, amount, currency, ... }
}

// Razorpay's documented signature check: HMAC-SHA256("order_id|payment_id", key_secret)
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  return expected === signature;
}
