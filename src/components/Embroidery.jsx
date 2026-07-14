import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CompareSlider from './CompareSlider';
import { cld } from '../cloudinary';
import { waLink } from '../config';

const EMBROIDERED_PHOTO = 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1784019861/embroy_version_xicda2.png';
const PRINTED_PHOTO = 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1784019861/sublimation_version_ohd5iq.png';

const MODES = {
  embroidered: {
    label: 'Embroidered',
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
    points: [
      'Full-colour sublimation & heat-press printing',
      'Feather-light with a smooth flat finish',
      'Any design, gradient or photo — no limits',
      'Best value for big team & bulk orders',
    ],
    msg: 'Hi Jersey Spot! Tell me more about PRINTED jerseys.',
  },
};

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
            before={<img src={cld(EMBROIDERED_PHOTO, 'f_auto,q_auto,w_920')} alt="Embroidered finish" />}
            after={<img src={cld(PRINTED_PHOTO, 'f_auto,q_auto,w_920')} alt="Sublimation printed finish" />}
            leftLabel="Embroidered"
            rightLabel="Printed"
          />
          <div className="emb-preview-hint">← Drag to compare →</div>
        </motion.div>
      </div>
    </section>
  );
}
