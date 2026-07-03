import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REVIEWS = [
  { name: 'Arjun R.', role: 'Sunday League Captain', text: 'Got 16 embroidered jerseys for our team in two days flat. The stitching quality is genuinely club-level. Whole squad was buzzing.', stars: 5 },
  { name: 'Karthik M.', role: 'College Football Team', text: 'Best jersey spot in Chennai, hands down. Custom names, numbers, crest — everything perfect. Will only order here from now.', stars: 5 },
  { name: 'Sanjay P.', role: 'Weekend Baller', text: 'Ordered boots and a football too. Legit stock, fair prices, and they actually reply fast on WhatsApp. Rare these days.', stars: 5 },
  { name: 'Deepak V.', role: 'Corporate Tournament', text: 'Did a bulk order of 40 kits for our office cup. Smooth from start to finish and the finish quality blew everyone away.', stars: 5 },
  { name: 'Rahul S.', role: 'Cricket Club', text: 'The embroidered crest looks exactly like the pro version. Feels premium, holds up wash after wash. Highly recommend.', stars: 5 },
];

function Stars({ n }) {
  return (
    <div className="tm-stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? 'on' : ''}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [i, setI] = useState(0);
  const total = REVIEWS.length;
  const go = useCallback((d) => setI((p) => (p + d + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [go]);

  const r = REVIEWS[i];

  return (
    <section className="section testimonials" id="reviews">
      <div className="container">
        <div className="tm-head">
          <span className="eyebrow">Player Reviews</span>
          <h2 className="section-title">Loved across <span className="g">Chennai</span></h2>
        </div>

        <div className="tm-stage">
          <button className="tm-arrow hoverable" onClick={() => go(-1)} aria-label="Previous review">‹</button>

          <div className="tm-card-wrap">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={i}
                className="tm-card"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="tm-quote" aria-hidden>“</div>
                <Stars n={r.stars} />
                <p className="tm-text">{r.text}</p>
                <footer className="tm-by">
                  <span className="tm-avatar" aria-hidden>{r.name.charAt(0)}</span>
                  <div>
                    <div className="tm-name">{r.name}</div>
                    <div className="tm-role">{r.role}</div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <button className="tm-arrow hoverable" onClick={() => go(1)} aria-label="Next review">›</button>
        </div>

        <div className="tm-dots">
          {REVIEWS.map((_, d) => (
            <button
              key={d}
              className={`tm-dot hoverable${d === i ? ' active' : ''}`}
              onClick={() => setI(d)}
              aria-label={`Go to review ${d + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
