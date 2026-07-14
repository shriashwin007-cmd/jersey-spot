import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../categories';
import { waLink } from '../config';

/* ── line-art illustrations, one per category ── */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' };

const ART = {
  embroidered: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M42 22 L30 30 L20 46 L30 56 L38 50 V96 H82 V50 L90 56 L100 46 L90 30 L78 22 Q60 34 42 22Z" />
      <path d="M48 24 Q60 33 72 24" />
      <circle cx="60" cy="60" r="9" strokeDasharray="3 3" />
      <path d="M54 74 h12 M52 82 h16" />
    </svg>
  ),
  printed: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M42 22 L30 30 L20 46 L30 56 L38 50 V96 H82 V50 L90 56 L100 46 L90 30 L78 22 Q60 34 42 22Z" />
      <path d="M48 24 Q60 33 72 24" />
      <text x="60" y="76" fontSize="30" fill="currentColor" stroke="none" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800">10</text>
    </svg>
  ),
  set: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M38 14 L28 20 L20 32 L28 40 L34 35 V62 H74 V35 L80 40 L88 32 L80 20 L70 14 Q54 24 38 14Z" />
      <path d="M44 16 Q54 23 64 16" />
      <path d="M30 74 H90 L88 86 L85 106 H70 L66 90 H62 L58 106 H43 L32 86 Z" />
    </svg>
  ),
  football: (
    <svg viewBox="0 0 120 120" {...S}>
      <circle cx="60" cy="60" r="38" />
      <polygon points="60,44 71,52 67,65 53,65 49,52" fill="currentColor" stroke="none" />
      <path d="M60 22 V44 M98 60 L71 52 M83 92 L67 65 M37 92 L53 65 M22 60 L49 52" />
    </svg>
  ),
  boots: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M26 44 Q30 40 40 42 L58 46 Q78 50 92 62 Q100 68 98 76 H30 Q24 76 24 68 Z" />
      <path d="M30 76 L28 84 H96 L98 76" />
      <path d="M34 84 v6 M46 86 v6 M58 86 v6 M70 86 v6 M82 86 v6" />
      <path d="M40 42 l4 10 M52 45 l3 9 M64 48 l3 9" />
    </svg>
  ),
  socks: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M46 18 H76 V66 Q76 78 64 83 L42 92 Q30 97 26 86 Q23 76 34 72 L46 67 Z" />
      <path d="M46 32 H76" />
      <path d="M46 44 H76" strokeDasharray="3 4" />
    </svg>
  ),
  kitbags: (
    <svg viewBox="0 0 120 120" {...S}>
      <rect x="16" y="46" width="88" height="46" rx="14" />
      <path d="M42 46 V40 Q42 34 48 34 H72 Q78 34 78 40 V46" />
      <path d="M16 66 H104" />
      <path d="M46 26 Q60 18 74 26" />
    </svg>
  ),
  trackpants: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M34 20 H86 L84 36 L82 104 H66 L62 50 H58 L54 104 H38 L36 36 Z" />
      <path d="M34 32 H86" />
      <path d="M44 44 V96 M76 44 V96" strokeDasharray="3 4" />
    </svg>
  ),
  shorts: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M24 34 H96 L94 50 L90 96 H68 L64 58 H56 L52 96 H30 L26 50 Z" />
      <path d="M24 46 H96" />
      <path d="M60 58 V92" strokeDasharray="3 4" />
    </svg>
  ),
  polo: (
    <svg viewBox="0 0 120 120" {...S}>
      <path d="M42 22 L30 30 L20 46 L30 56 L38 50 V96 H82 V50 L90 56 L100 46 L90 30 L78 22 Q60 34 42 22Z" />
      <path d="M48 25 L60 42 L72 25" />
      <path d="M60 42 V62" />
      <circle cx="60" cy="48" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="60" cy="57" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const PRODUCTS = CATEGORIES.map((c) => ({
  id: c.value,
  art: ART[c.value],
  tag: c.tag,
  title: c.label,
  desc: c.desc,
  from: c.from,
  msg: `Hi Jersey Spot! I want to order — ${c.label}.`,
}));

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
      transition={{ duration: 0.55, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
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
          {p.from ? (
            <div className="sell-card-price"><span>from</span> ₹{p.from.toLocaleString('en-IN')}</div>
          ) : (
            <div className="sell-card-price sell-card-price-ask">Ask us</div>
          )}
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
          <p className="section-lead">Jerseys, footballs, boots and full team kit — for clubs, schools and every weekend baller in Chennai.</p>
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
