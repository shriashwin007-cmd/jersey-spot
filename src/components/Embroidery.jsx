import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CompareSlider from './CompareSlider';
import { waLink } from '../config';

const MODES = {
  embroidered: {
    label: 'Embroidered',
    price: 'from ₹1,499',
    points: [
      'Names, numbers & crests stitched thread-by-thread',
      'Raised, textured, premium pro-club feel',
      'Won\'t crack, peel or fade over seasons',
      'Perfect for gifts, captains & club sets',
    ],
    msg: 'Hi Jersey Spot! Tell me more about EMBROIDERED jerseys.',
  },
  printed: {
    label: 'Printed',
    price: 'from ₹899',
    points: [
      'Full-colour sublimation & heat-press printing',
      'Feather-light with a smooth flat finish',
      'Any design, gradient or photo — no limits',
      'Best value for big team & bulk orders',
    ],
    msg: 'Hi Jersey Spot! Tell me more about PRINTED jerseys.',
  },
};

function JerseyBase({ children }) {
  return (
    <svg viewBox="0 0 200 220" width="100%" height="100%">
      <defs>
        <linearGradient id="embFab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1d" />
          <stop offset="100%" stopColor="#0a0a0b" />
        </linearGradient>
      </defs>
      <path d="M70 26 L48 38 L26 70 L46 88 L60 76 V196 H140 V76 L154 88 L174 70 L152 38 L130 26 Q100 46 70 26Z" fill="url(#embFab)" stroke="#e8302a" strokeWidth="2" />
      <path d="M80 30 Q100 44 120 30" fill="none" stroke="#e8302a" strokeWidth="2" />
      {children}
    </svg>
  );
}

function EmbroideredJersey() {
  return (
    <JerseyBase>
      <circle cx="100" cy="103" r="40" fill="none" stroke="#e8302a" strokeWidth="1.4" strokeDasharray="4 5" opacity="0.55" />
      <text x="100" y="120" fontSize="52" fontWeight="800" fontFamily="Inter, sans-serif" fill="#e8302a" stroke="#a4161a" strokeWidth="1.2" textAnchor="middle">10</text>
      <text x="100" y="164" fontSize="16" fontWeight="700" letterSpacing="3" fontFamily="Inter, sans-serif" fill="#e8302a" textAnchor="middle">CHENNAI</text>
    </JerseyBase>
  );
}
function PrintedJersey() {
  return (
    <JerseyBase>
      <text x="100" y="120" fontSize="52" fontWeight="800" fontFamily="Inter, sans-serif" fill="#dfe3ea" textAnchor="middle">10</text>
      <text x="100" y="164" fontSize="16" fontWeight="700" letterSpacing="3" fontFamily="Inter, sans-serif" fill="#dfe3ea" textAnchor="middle">CHENNAI</text>
    </JerseyBase>
  );
}

export default function Embroidery() {
  const [mode, setMode] = useState('embroidered');
  const m = MODES[mode];

  return (
    <section className="section emb" id="embroidery">
      <div className="emb-bg" aria-hidden><div className="emb-bg-glow" /></div>
      <div className="container emb-grid">
        <motion.div
          className="emb-copy"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">The Craft</span>
          <h2 className="section-title">Two finishes,<br /><span className="g">one obsession</span></h2>
          <p className="section-lead">Drag the slider on the right to compare — or pick a finish below for the full details.</p>

          <div className="emb-toggle" role="tablist" aria-label="Jersey finish">
            {Object.keys(MODES).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={mode === k}
                className={`emb-toggle-btn hoverable${mode === k ? ' active' : ''}`}
                onClick={() => setMode(k)}
              >
                {MODES[k].label}
                {mode === k && <motion.span className="emb-toggle-pill" layoutId="embPill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.ul
              key={mode}
              className="emb-points"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {m.points.map((pt) => (
                <li key={pt}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                  {pt}
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>

          <div className="emb-cta">
            <div className="emb-price">{m.price}</div>
            <a href={waLink(m.msg)} target="_blank" rel="noreferrer" className="btn btn-gold hoverable">Order {m.label} →</a>
          </div>
        </motion.div>

        {/* drag-to-compare jersey preview */}
        <motion.div
          className="emb-preview"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="emb-preview-ring" />
          <CompareSlider
            className="emb-compare hoverable"
            before={<EmbroideredJersey />}
            after={<PrintedJersey />}
            leftLabel="Embroidered"
            rightLabel="Printed"
          />
          <div className="emb-preview-hint">← Drag to compare →</div>
        </motion.div>
      </div>
    </section>
  );
}
