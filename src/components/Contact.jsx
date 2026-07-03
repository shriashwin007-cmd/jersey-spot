import { useState } from 'react';
import { motion } from 'framer-motion';
import { SHOP, waLink } from '../config';

export default function Contact() {
  const [form, setForm] = useState({ name: '', product: 'Embroidered Jersey', qty: '1', details: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const message =
    `Hi ${SHOP.name}! 👋%0A%0A` +
    `Name: ${form.name || '—'}%0A` +
    `Product: ${form.product}%0A` +
    `Quantity: ${form.qty}%0A` +
    `Details: ${form.details || '—'}`;

  const submit = (e) => {
    e.preventDefault();
    window.open(`https://wa.me/${SHOP.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <section className="section contact" id="contact">
      <div className="container contact-grid">
        {/* left: info */}
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">Order &amp; Visit</span>
          <h2 className="section-title">Let's build <span className="g">your kit</span></h2>
          <p className="section-lead">Send your order straight to our WhatsApp, or drop by the store in {SHOP.city}.</p>

          <ul className="contact-list">
            <li>
              <span className="contact-ic" aria-hidden>📍</span>
              <div><strong>Store</strong><a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="hoverable">{SHOP.address}</a></div>
            </li>
            <li>
              <span className="contact-ic" aria-hidden>🕒</span>
              <div><strong>Hours</strong>{SHOP.hours}</div>
            </li>
            <li>
              <span className="contact-ic" aria-hidden>📞</span>
              <div><strong>Call / WhatsApp</strong><a href={waLink()} target="_blank" rel="noreferrer" className="hoverable">{SHOP.phoneDisplay}</a></div>
            </li>
            <li>
              <span className="contact-ic" aria-hidden>📸</span>
              <div><strong>Instagram</strong><a href={SHOP.instagram} target="_blank" rel="noreferrer" className="hoverable">{SHOP.instagramHandle}</a></div>
            </li>
          </ul>
        </motion.div>

        {/* right: quick order form → WhatsApp */}
        <motion.form
          className="contact-form"
          onSubmit={submit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="contact-form-glow" />
          <h3 className="contact-form-title">Quick Order</h3>
          <p className="contact-form-sub">Fill this in — it opens WhatsApp with your order ready to send.</p>

          <label className="field">
            <span>Your name</span>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Arjun" className="hoverable" />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Product</span>
              <select value={form.product} onChange={set('product')} className="hoverable">
                <option>Embroidered Jersey</option>
                <option>Non-Embroidered Jersey</option>
                <option>Football</option>
                <option>Football Boots</option>
                <option>Team / Bulk Order</option>
              </select>
            </label>
            <label className="field field-qty">
              <span>Qty</span>
              <input type="number" min="1" value={form.qty} onChange={set('qty')} className="hoverable" />
            </label>
          </div>

          <label className="field">
            <span>Details <em>(sizes, numbers, design…)</em></span>
            <textarea rows="3" value={form.details} onChange={set('details')} placeholder="Size M, name RONALDO, number 7…" className="hoverable" />
          </label>

          <button type="submit" className="btn btn-whatsapp contact-submit hoverable">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
            Send Order on WhatsApp
          </button>
        </motion.form>
      </div>
    </section>
  );
}
