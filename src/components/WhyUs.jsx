import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🧵', title: 'In-House Embroidery', desc: 'No outsourcing. Every stitch is done at our Chennai workshop for full quality control.' },
  { icon: '⚡', title: '48-Hour Turnaround', desc: 'Rush a single kit or a full team — most orders are ready in two days.' },
  { icon: '🏆', title: 'Club-Grade Quality', desc: 'Match-ready fabrics, true-to-club crests and finishes that survive real play.' },
  { icon: '💬', title: 'Order on WhatsApp', desc: 'Skip the queue. Share your design, sizes and numbers and we handle the rest.' },
  { icon: '👥', title: 'Team & Bulk Rates', desc: 'Special pricing for schools, clubs and corporate tournaments.' },
  { icon: '📍', title: 'Trusted in Chennai', desc: 'Thousands of players kitted since 2019 with a 4.9★ average rating.' },
];

export default function WhyUs() {
  return (
    <section className="section why" id="why">
      <div className="container">
        <motion.div
          className="why-head"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">Why Jersey Spot</span>
          <h2 className="section-title">Built for players who <span className="g">mean it</span></h2>
        </motion.div>

        <div className="why-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              className="why-card hoverable"
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
            >
              <div className="why-icon" aria-hidden>{f.icon}</div>
              <h3 className="why-title">{f.title}</h3>
              <p className="why-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
