import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
    title: '3D Live Customization',
    desc: 'Design your jersey in real-time with our interactive 3D configurator. Choose colors, patterns, numbers and names — see it all before you order.',
    size: 'large',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
    title: 'Express Delivery',
    desc: 'Need it fast? Our priority production line gets your custom jersey to your door in as little as 3 business days, worldwide.',
    size: 'normal',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',
    title: 'Pro-Grade Fabric',
    desc: 'Same moisture-wicking, breathable performance fabrics trusted by professional sports organizations globally.',
    size: 'normal',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    color: '#f472b6', bg: 'rgba(244,114,182,0.1)',
    title: 'Unlimited Personalization',
    desc: 'Add squad names, numbers, logos and sponsor patches. Our design team brings your vision to life at no extra charge.',
    size: 'normal',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',
    title: 'Secure Payments',
    desc: 'Shop with confidence. All transactions are encrypted. We accept all major cards, Apple Pay, Google Pay and more.',
    size: 'normal',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
      </svg>
    ),
    color: '#34d399', bg: 'rgba(52,211,153,0.1)',
    title: '30-Day Returns',
    desc: 'Not happy? No problem. Hassle-free returns and exchanges within 30 days of delivery, no questions asked.',
    size: 'normal',
  },
];

function FeatureCard({ f, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div style={{ '--feat-color': f.color, '--feat-bg': f.bg }}>
    <motion.div
      ref={ref}
      className={`feature-card${f.size === 'large' ? ' feature-card-large' : ''}`}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
    >
      <div className="feature-card-glow" aria-hidden />
      <div className="feature-icon" style={{ background: f.bg }} aria-hidden>
        <span className="feature-icon-inner" style={{ color: f.color }}>{f.icon}</span>
      </div>
      <h3 className="feature-title">{f.title}</h3>
      <p className="feature-desc">{f.desc}</p>
      {f.size === 'large' && (
        <div className="feature-large-badge" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Most popular feature
        </div>
      )}
    </motion.div>
    </div>
  );
}

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <motion.div
          className="text-center"
          style={{ maxWidth: 600, margin: '0 auto 64px' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Why Jersey Spot</div>
          <h2 className="section-title">
            Everything You Need<br />
            for <em>Championship</em> Kits
          </h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            From design to delivery, we make creating premium custom jerseys effortless.
          </p>
        </motion.div>

        <div className="features-bento">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
