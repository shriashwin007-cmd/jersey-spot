import { motion } from 'framer-motion';
import { SHOP } from '../config';

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export default function BrandStory() {
  return (
    <section className="section story" id="story">
      <div className="container story-grid">
        <motion.div className="story-copy" {...reveal}>
          <span className="eyebrow">Our Story</span>
          <h2 className="section-title">
            Chennai's home for <span className="g">the beautiful game</span>
          </h2>
          <p className="section-lead">
            {SHOP.name} started in {SHOP.est} with one belief — that every player, from gully
            grounds to floodlit turfs, deserves to look and feel like a pro. What began as a small
            counter in {SHOP.city} is now the city's go-to spot for premium jerseys, footballs and boots.
          </p>
          <p className="story-p">
            We stitch names, numbers and crests in-house, source match-grade footballs, and stock
            boots built for real play — not just the shelf. When you pull on a {SHOP.name} kit,
            you carry a little bit of Chennai's football heart with you.
          </p>

          <div className="story-quote">
            <span className="story-quote-mark">“</span>
            {SHOP.tagline}
            <span className="story-quote-by">— {SHOP.name} {SHOP.city}</span>
          </div>
        </motion.div>

        <motion.div
          className="story-panel"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="story-panel-glow" />
          <div className="story-panel-inner">
            {[
              { k: 'In-house', v: 'Embroidery & Printing' },
              { k: 'Every Sport', v: 'Football · Cricket · Basketball' },
              { k: 'Real Stock', v: 'Footballs · Boots · Kits' },
              { k: 'Fast', v: '48-hour Turnaround' },
            ].map((it, i) => (
              <motion.div
                className="story-tile"
                key={it.k}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
              >
                <div className="story-tile-k">{it.k}</div>
                <div className="story-tile-v">{it.v}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
