import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DomeSlider from './DomeSlider';
import { useCart } from '../cart';
import { SHOP, waLink } from '../config';

// Static fallback — shown until the admin catalog has real entries, or if
// the database isn't connected yet. The live site never breaks either way.
const FALLBACK_KITS = [
  { img: '/shop/shop-1.jpg', name: 'England Away', tag: 'Retro', category: 'embroidered', msg: 'Hi! I want the England Away jersey.' },
  { img: '/shop/shop-2.jpg', name: 'Real Madrid Away', tag: 'Pink Edition', category: 'embroidered', msg: 'Hi! I want the Real Madrid pink away jersey.' },
  { img: '/shop/shop-3.jpg', name: 'Portugal', tag: 'Black & Gold', category: 'embroidered', msg: 'Hi! I want the Portugal black & gold jersey.' },
  { img: '/shop/shop-4.jpg', name: 'Inter Miami', tag: 'Home', category: 'printed', msg: 'Hi! I want the Inter Miami home jersey.' },
  { img: '/shop/shop-5.jpg', name: 'Argentina', tag: '3-Star', category: 'printed', msg: 'Hi! I want the Argentina 3-star jersey.' },
  { img: '/shop/shop-6.jpg', name: 'Real Madrid', tag: 'Retro Blue', category: 'embroidered', msg: 'Hi! I want the Real Madrid retro blue jersey.' },
];

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'embroidered', label: 'Embroidered' },
  { value: 'printed', label: 'Printed' },
  { value: 'football', label: 'Football' },
  { value: 'boots', label: 'Boots' },
];

const DEEP_LINK_EVENT = 'jersey:filter-category';

export default function Gallery() {
  const [kits, setKits] = useState(FALLBACK_KITS);
  const [filter, setFilter] = useState('all');
  const { addItem } = useCart();

  useEffect(() => {
    // Gallery mounts once on initial page load — a plain "read sessionStorage
    // on mount" check would never fire for a click that happens later on the
    // same page. Listen for the live event WhatWeSell dispatches instead.
    const onDeepLink = (e) => setFilter(e.detail);
    window.addEventListener(DEEP_LINK_EVENT, onDeepLink);
    return () => window.removeEventListener(DEEP_LINK_EVENT, onDeepLink);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.products?.length) return;
        setKits(
          data.products
            .filter((p) => p.in_stock)
            .map((p) => ({
              id: p.id,
              img: p.image_url,
              name: p.name,
              tag: p.tag,
              category: p.category,
              price: p.price,
              buyOnline: p.buy_online,
              msg: `Hi! I want the ${p.name}${p.tag ? ` (${p.tag})` : ''} jersey.`,
            }))
        );
      })
      .catch(() => {}); // keep the static fallback on any error
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? kits : kits.filter((k) => k.category === filter)),
    [kits, filter]
  );

  return (
    <section className="section gallery" id="kits">
      <div className="container">
        <motion.div
          className="gallery-head"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">In Store Now</span>
          <h2 className="section-title">Latest <span className="g">kits</span> on the wall</h2>
          <p className="section-lead">
            Drag or tap through what's hanging in the shop right now. See more on{' '}
            <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="gallery-ig hoverable">{SHOP.instagramHandle}</a>
            {' '}— or message us for a kit you don't see here.
          </p>
        </motion.div>

        <div className="gallery-filters" role="tablist" aria-label="Filter by category">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              className={`gallery-filter-btn hoverable${filter === f.value ? ' active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="gallery-empty">Nothing in this category yet — message us, we've probably still got it.</div>
        ) : (
          <DomeSlider
            key={filter}
            items={filtered}
            onSelect={(item) => {
              if (item.id) {
                fetch('/api/track-enquiry', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: item.id }),
                }).catch(() => {});
              }
              window.open(waLink(item.msg), '_blank', 'noopener');
            }}
            onAddToCart={(item) => addItem({ id: item.id, name: item.name, price: item.price, img: item.img })}
          />
        )}

        <motion.div
          className="gallery-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <a href={waLink('Hi Jersey Spot! Can you show me more kits you have in stock?')} target="_blank" rel="noreferrer" className="btn btn-whatsapp hoverable">
            See more on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
