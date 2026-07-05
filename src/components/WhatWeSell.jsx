import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { waLink } from '../config';

/* ── gold line-art illustrations ── */
const Art = {
  jerseyEmb: (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M42 22 L30 30 L20 46 L30 56 L38 50 V96 H82 V50 L90 56 L100 46 L90 30 L78 22 Q60 34 42 22Z" />
      <path d="M48 24 Q60 33 72 24" />
      <circle cx="60" cy="60" r="9" strokeDasharray="3 3" />
      <path d="M54 74 h12 M52 82 h16" />
    </svg>
  ),
  jerseyPrint: (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M42 22 L30 30 L20 46 L30 56 L38 50 V96 H82 V50 L90 56 L100 46 L90 30 L78 22 Q60 34 42 22Z" />
      <path d="M48 24 Q60 33 72 24" />
      <text x="60" y="72" fontSize="30" fill="currentColor" stroke="none" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800">10</text>
    </svg>
  ),
  football: (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="60" cy="60" r="38" />
      <polygon points="60,44 71,52 67,65 53,65 49,52" fill="currentColor" stroke="none" />
      <path d="M60 22 V44 M98 60 L71 52 M83 92 L67 65 M37 92 L53 65 M22 60 L49 52" />
    </svg>
  ),
  boots: (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M26 44 Q30 40 40 42 L58 46 Q78 50 92 62 Q100 68 98 76 H30 Q24 76 24 68 Z" />
      <path d="M30 76 L28 84 H96 L98 76" />
      <path d="M34 84 v6 M46 86 v6 M58 86 v6 M70 86 v6 M82 86 v6" />
      <path d="M40 42 l4 10 M52 45 l3 9 M64 48 l3 9" />
    </svg>
  ),
};

// ids match the admin's category taxonomy (embroidered/printed/football/boots)
// so a live count + deep-link into the filtered Gallery can key off them directly.
const PRODUCTS = [
  {
    id: 'embroidered',
    art: Art.jerseyEmb,
    tag: 'Signature',
    title: 'Embroidered Jerseys',
    desc: 'Names, numbers and club crests stitched in-house for a premium, pro-club finish that lasts.',
    from: '₹1,499',
    msg: 'Hi Jersey Spot! I want to order an EMBROIDERED jersey.',
  },
  {
    id: 'printed',
    art: Art.jerseyPrint,
    tag: 'Everyday',
    title: 'Non-Embroidered Jerseys',
    desc: 'Crisp sublimation & heat-press printing. Lightweight, breathable and ready for match day.',
    from: '₹899',
    msg: 'Hi Jersey Spot! I want to order a PRINTED (non-embroidered) jersey.',
  },
  {
    id: 'football',
    art: Art.football,
    tag: 'Match Grade',
    title: 'Footballs',
    desc: 'Training to match-quality footballs for turf and ground — sizes 3, 4 and 5 in stock.',
    from: '₹499',
    msg: 'Hi Jersey Spot! I want to buy a FOOTBALL.',
  },
  {
    id: 'boots',
    art: Art.boots,
    tag: 'On Foot',
    title: 'Football Boots',
    desc: 'Studs and turf boots built for real play — grip, comfort and control for every surface.',
    from: '₹1,299',
    msg: 'Hi Jersey Spot! I want to buy football BOOTS.',
  },
];

const DEEP_LINK_EVENT = 'jersey:filter-category';

function TiltCard({ p, i, count, onViewStock }) {
  const ref = useRef(null);
  const [t, setT] = useState('');
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT(`perspective(800px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`);
  };
  const reset = () => setT('perspective(800px) rotateX(0deg) rotateY(0deg)');
  const hasStock = typeof count === 'number' && count > 0;

  return (
    <motion.article
      className="sell-card hoverable"
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={ref}
        className="sell-card-inner"
        style={{ transform: t }}
        onMouseMove={onMove}
        onMouseLeave={reset}
      >
        <div className="sell-card-glow" />
        <span className="sell-card-tag">{p.tag}</span>
        <div className="sell-card-art">{p.art}</div>
        <h3 className="sell-card-title">{p.title}</h3>
        <p className="sell-card-desc">{p.desc}</p>
        <div className="sell-card-foot">
          <div className="sell-card-price"><span>from</span> {p.from}</div>
          {hasStock ? (
            <button type="button" onClick={onViewStock} className="sell-card-btn hoverable" aria-label={`View ${p.title} in stock`}>
              {count} in stock
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          ) : (
            <a href={waLink(p.msg)} target="_blank" rel="noreferrer" className="sell-card-btn hoverable" aria-label={`Enquire about ${p.title}`}>
              Enquire
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function WhatWeSell() {
  const [counts, setCounts] = useState(null); // null = not loaded yet; {} once fetched

  useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.products) { setCounts({}); return; }
        const map = {};
        for (const p of data.products) {
          if (!p.in_stock) continue;
          map[p.category] = (map[p.category] || 0) + 1;
        }
        setCounts(map);
      })
      .catch(() => setCounts({}));
  }, []);

  const viewInStock = (category) => {
    // Gallery is already mounted (same-page scroll, not a navigation), so a
    // live event is what actually reaches it — sessionStorage would only be
    // read on Gallery's initial mount, which already happened by now.
    window.dispatchEvent(new CustomEvent(DEEP_LINK_EVENT, { detail: category }));
    document.getElementById('kits')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="section sell" id="shop">
      <div className="container">
        <motion.div
          className="sell-head"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">What We Sell</span>
          <h2 className="section-title">Everything to <span className="g">gear up</span></h2>
          <p className="section-lead">Jerseys, footballs and boots — for teams, clubs and every weekend baller in Chennai.</p>
        </motion.div>

        <div className="sell-grid">
          {PRODUCTS.map((p, i) => (
            <TiltCard key={p.id} p={p} i={i} count={counts?.[p.id]} onViewStock={() => viewInStock(p.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}
