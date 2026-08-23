import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SHOP } from '../config';

function SizePicker({ sizes, selected, onSelect }) {
  return (
    <div className="pm-sizes">
      <span className="pm-sizes-label">Select size</span>
      <div className="pm-size-chips">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            className={`pm-size-chip${selected === s ? ' active' : ''}`}
            onClick={() => onSelect(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderForm({ product, sizes, selSize, onSelectSize, onBack, onSent }) {
  const [form, setForm] = useState({ name: '', phone: '', qty: '1', line: '', city: '', pincode: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const send = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.line || !form.city || !form.pincode) {
      setError('Please fill in name, phone and full address.');
      return;
    }
    if (sizes.length > 0 && !selSize) {
      setError('Please pick a size.');
      return;
    }
    setError('');
    const lines = [
      `Hi ${SHOP.name}! I'd like to buy this:`,
      '',
      `${product.name}${product.tag ? ` (${product.tag})` : ''}`,
      `Quantity: ${form.qty}`,
      selSize ? `Size: ${selSize}` : null,
      product.price ? `Price: ₹${product.price} each` : null,
      '',
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Address: ${form.line}, ${form.city} - ${form.pincode}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    onSent();
  };

  return (
    <form className="pm-order-form" onSubmit={send}>
      <button type="button" className="cart-back" onClick={onBack}>← Back</button>
      <h4 className="pm-order-title">Delivery details for {product.name}</h4>

      {sizes.length > 0 && (
        <div className="field">
          <SizePicker sizes={sizes} selected={selSize} onSelect={(s) => { onSelectSize(s); setError(''); }} />
        </div>
      )}

      <div className="field-row">
        <label className="field"><span>Your name</span><input value={form.name} onChange={set('name')} placeholder="e.g. Arjun" /></label>
        <label className="field field-qty"><span>Qty</span><input type="number" min="1" value={form.qty} onChange={set('qty')} /></label>
      </div>
      <label className="field"><span>Phone</span><input type="tel" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" /></label>
      <label className="field"><span>Address</span><input value={form.line} onChange={set('line')} placeholder="House no, street, area" /></label>
      <div className="field-row">
        <label className="field"><span>City</span><input value={form.city} onChange={set('city')} /></label>
        <label className="field field-qty"><span>Pincode</span><input value={form.pincode} onChange={set('pincode')} /></label>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <button type="submit" className="btn btn-whatsapp pm-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
        </svg>
        Send Order on WhatsApp
      </button>
    </form>
  );
}

// Amazon-style product detail modal with multi-image gallery.
// `product` shape: { img, images: [{url, label}...], name, tag, category, price, sizesEnabled, sizes, ... }
export default function ProductModal({ product, onClose, onAddToCart, onEnquire }) {
  const [added, setAdded] = useState(false);
  const [step, setStep] = useState('view');
  const [activeImg, setActiveImg] = useState(0);
  const [selSize, setSelSize] = useState('');
  const [sizeError, setSizeError] = useState(false);

  // Sizes only apply when the admin enabled them AND picked at least one.
  const sizes = product?.sizesEnabled && Array.isArray(product.sizes) ? product.sizes : [];

  const gallery = product
    ? [{ url: product.img, label: '' }, ...((product.images || []).map((im) => ({ url: im.url, label: im.label || '' })))]
    : [];

  useEffect(() => {
    setAdded(false);
    setStep('view');
    setActiveImg(0);
    setSelSize('');
    setSizeError(false);
    if (!product) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  // Returns true when a valid size is chosen (or none is needed).
  const requireSize = () => {
    if (sizes.length === 0 || selSize) { setSizeError(false); return true; }
    setSizeError(true);
    return false;
  };

  const navigateImg = useCallback((dir) => {
    if (gallery.length <= 1) return;
    setActiveImg((prev) => (prev + dir + gallery.length) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    if (!product || gallery.length <= 1) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') navigateImg(-1);
      if (e.key === 'ArrowRight') navigateImg(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, gallery.length, navigateImg]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="pm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            className="pm-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="pm-close" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>

            <div className="pm-media">
              {gallery.length > 1 && (
                <div className="pm-thumbs">
                  {gallery.map((im, i) => (
                    <button
                      key={i}
                      className={`pm-thumb${i === activeImg ? ' active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      type="button"
                    >
                      <img src={im.url} alt={im.label || `${product.name} view ${i + 1}`} />
                      {im.label && <span className="pm-thumb-label">{im.label}</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="pm-main-img-wrap">
                {gallery.length > 1 && (
                  <button type="button" className="pm-img-nav pm-img-prev" onClick={() => navigateImg(-1)} aria-label="Previous image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18 9 12l6-6" /></svg>
                  </button>
                )}
                <img
                  src={gallery[activeImg]?.url}
                  alt={product.name}
                  className="pm-main-img"
                />
                {gallery.length > 1 && (
                  <button type="button" className="pm-img-nav pm-img-next" onClick={() => navigateImg(1)} aria-label="Next image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                )}
                {product.tag && <span className="pm-tag">{product.tag}</span>}
                {gallery.length > 1 && (
                  <div className="pm-img-counter">{activeImg + 1} / {gallery.length}</div>
                )}
              </div>
            </div>

            <div className="pm-info">
              {step === 'order' && (
                <OrderForm
                  product={product}
                  sizes={sizes}
                  selSize={selSize}
                  onSelectSize={setSelSize}
                  onBack={() => setStep('view')}
                  onSent={() => setStep('sent')}
                />
              )}

              {step === 'sent' && (
                <div className="cart-success">
                  <div className="cart-success-icon">✓</div>
                  <h3>Order sent!</h3>
                  <p>Your order details went out on WhatsApp. We'll confirm availability and delivery there.</p>
                  <button type="button" className="btn btn-gold" onClick={onClose}>Continue Shopping</button>
                </div>
              )}

              {step === 'view' && (
                <>
                  <div className="pm-cat">{product.category}</div>
                  <h3 className="pm-name">{product.name}</h3>
                  {product.price ? (
                    <div className="pm-price">₹{product.price}</div>
                  ) : (
                    <div className="pm-price pm-price-ask">Price on request</div>
                  )}

                  {sizes.length > 0 && (
                    <>
                      <SizePicker sizes={sizes} selected={selSize} onSelect={(s) => { setSelSize(s); setSizeError(false); }} />
                      {sizeError && <div className="pm-size-error">Please pick a size first.</div>}
                    </>
                  )}

                  <p className="pm-desc">
                    Tell us the size, address and quantity and we'll confirm it right away on WhatsApp — no online payment needed.
                  </p>

                  <div className="pm-actions">
                    <button
                      type="button"
                      className="btn btn-gold pm-btn"
                      onClick={() => { if (requireSize()) setStep('order'); }}
                    >
                      Buy Now
                    </button>
                    {product.buyOnline && (
                      <button
                        type="button"
                        className={`btn btn-ghost pm-btn${added ? ' pm-added' : ''}`}
                        onClick={() => {
                          if (!requireSize()) return;
                          onAddToCart(product, selSize);
                          setAdded(true);
                        }}
                      >
                        {added ? '✓ Added to cart' : 'Add to Cart'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-whatsapp pm-btn"
                      onClick={() => { if (!requireSize()) return; onEnquire(product, selSize); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                      </svg>
                      Just Ask a Question
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
