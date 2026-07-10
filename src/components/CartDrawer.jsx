import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../cart';
import { loadRazorpayScript } from '../razorpayLoader';

const SHIPPING_FEE = 79;

function QtyStepper({ qty, onChange }) {
  return (
    <div className="cart-qty">
      <button type="button" onClick={() => onChange(qty - 1)} aria-label="Decrease quantity">−</button>
      <span>{qty}</span>
      <button type="button" onClick={() => onChange(qty + 1)} aria-label="Increase quantity">+</button>
    </div>
  );
}

function CartStep({ items, updateQty, removeItem, subtotal, onCheckout }) {
  if (items.length === 0) {
    return <div className="cart-empty">Your cart is empty. Add a jersey to get started.</div>;
  }
  return (
    <>
      <div className="cart-items">
        {items.map((it) => (
          <div className="cart-item" key={it.productId}>
            <img src={it.imageUrl} alt={it.name} />
            <div className="cart-item-info">
              <div className="cart-item-name">{it.name}</div>
              <div className="cart-item-price">₹{it.price}</div>
            </div>
            <QtyStepper qty={it.qty} onChange={(q) => updateQty(it.productId, q)} />
            <button type="button" className="cart-item-remove" onClick={() => removeItem(it.productId)} aria-label={`Remove ${it.name}`}>✕</button>
          </div>
        ))}
      </div>
      <div className="cart-summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
      <button type="button" className="btn btn-gold cart-checkout-btn" onClick={onCheckout}>
        Checkout →
      </button>
    </>
  );
}

function AddressStep({ subtotal, onBack, onPaid }) {
  const { items, clear } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', email: '', line: '', city: '', state: '', pincode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const total = subtotal + SHIPPING_FEE;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.line || !form.city || !form.state || !form.pincode) {
      setError('Please fill in every field.');
      return;
    }
    setBusy(true);
    try {
      await loadRazorpayScript();

      const createRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: it.productId, qty: it.qty })),
          customer: { name: form.name, phone: form.phone, email: form.email },
          address: { line: form.line, city: form.city, state: form.state, pincode: form.pincode },
        }),
      });
      const order = await createRes.json();
      if (!createRes.ok) throw new Error(order.error || 'Could not start checkout');

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'Jersey Spot',
        description: `Order #${order.orderId}`,
        prefill: { name: form.name, contact: form.phone, email: form.email },
        theme: { color: '#e8302a' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verified = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verified.error || 'Payment verification failed');
            clear();
            onPaid(order.orderId);
          } catch (err) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      rzp.on('payment.failed', (resp) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="cart-address-form" onSubmit={pay}>
      <button type="button" className="cart-back" onClick={onBack}>← Back to cart</button>

      <label className="field"><span>Full name</span><input value={form.name} onChange={set('name')} /></label>
      <div className="field-row">
        <label className="field"><span>Phone</span><input type="tel" value={form.phone} onChange={set('phone')} /></label>
        <label className="field"><span>Email <em>(optional)</em></span><input type="email" value={form.email} onChange={set('email')} /></label>
      </div>
      <label className="field"><span>Address</span><input value={form.line} onChange={set('line')} placeholder="House no, street, area" /></label>
      <div className="field-row">
        <label className="field"><span>City</span><input value={form.city} onChange={set('city')} /></label>
        <label className="field"><span>State</span><input value={form.state} onChange={set('state')} /></label>
        <label className="field field-qty"><span>Pincode</span><input value={form.pincode} onChange={set('pincode')} /></label>
      </div>

      <div className="cart-summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
      <div className="cart-summary-row"><span>Shipping</span><span>₹{SHIPPING_FEE}</span></div>
      <div className="cart-summary-row cart-summary-total"><span>Total</span><span>₹{total}</span></div>

      {error && <div className="admin-error">{error}</div>}

      <button type="submit" className="btn btn-gold cart-checkout-btn" disabled={busy}>
        {busy ? 'Processing…' : `Pay ₹${total}`}
      </button>
    </form>
  );
}

function SuccessStep({ orderId, onClose }) {
  return (
    <div className="cart-success">
      <div className="cart-success-icon">✓</div>
      <h3>Order placed!</h3>
      <p>Order #{orderId} is confirmed. We'll reach out on your phone number to confirm delivery details.</p>
      <button type="button" className="btn btn-gold" onClick={onClose}>Continue Shopping</button>
    </div>
  );
}

export default function CartDrawer() {
  const { items, updateQty, removeItem, subtotal, open, setOpen } = useCart();
  const [step, setStep] = useState('cart'); // cart | address | success
  const [lastOrderId, setLastOrderId] = useState(null);

  const close = () => {
    setOpen(false);
    setTimeout(() => setStep('cart'), 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="cart-drawer-header">
              <h3>{step === 'address' ? 'Delivery Details' : step === 'success' ? 'Confirmed' : 'Your Cart'}</h3>
              <button type="button" className="cart-close" onClick={close} aria-label="Close cart">✕</button>
            </div>

            <div className="cart-drawer-body">
              {step === 'cart' && (
                <CartStep items={items} updateQty={updateQty} removeItem={removeItem} subtotal={subtotal} onCheckout={() => setStep('address')} />
              )}
              {step === 'address' && (
                <AddressStep subtotal={subtotal} onBack={() => setStep('cart')} onPaid={(id) => { setLastOrderId(id); setStep('success'); }} />
              )}
              {step === 'success' && <SuccessStep orderId={lastOrderId} onClose={close} />}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
