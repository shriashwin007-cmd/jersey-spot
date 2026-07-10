import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Magnetic } from './anim';
import ParticleField from './ParticleField';
import { useIsCompact } from '../hooks';
import { cld } from '../cloudinary';
import { waLink, SHOP } from '../config';

const STATS = [
  { n: '6+', l: 'Years in Chennai' },
  { n: '12K+', l: 'Happy Players' },
  { n: '4.9★', l: 'Customer Rating' },
];

export default function Hero() {
  const ref = useRef(null);
  const compact = useIsCompact();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yUp = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 34 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay: d, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section className="hero" id="home" ref={ref}>
      {/* backdrop */}
      <div className="hero-bg" aria-hidden>
        {/* Real store photo, mobile only (CSS-hidden on desktop, which keeps
            its particle field instead) — a bold photo backdrop reads much
            better on a phone than empty space above the fold. */}
        <div className="hero-photo" style={{ backgroundImage: `url(${cld('https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697714/WhatsApp_Image_2026-07-10_at_1.57.12_PM_c6geip.jpg', 'f_auto,q_auto,w_900')})` }} />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-grid" />
        {/* Mouse-reactive WebGL particles — meaningless on touch (no cursor)
            and a real battery/GPU cost, so skip mounting it on mobile. */}
        {!compact && <ParticleField />}
      </div>

      <motion.div className="container hero-inner" style={{ y: yUp, opacity: fade }}>
        <div className="hero-copy">
          <motion.div {...fadeUp(0.05)}>
            <span className="eyebrow">Premium Sports Store · {SHOP.city} · Est. {SHOP.est}</span>
          </motion.div>

          <motion.h1 className="hero-title" {...fadeUp(0.15)}>
            Wear Your <span className="hero-gold">Pride</span>,<br />
            Play With <span className="hero-italic">Passion</span>
          </motion.h1>

          <motion.p className="hero-sub" {...fadeUp(0.28)}>
            {SHOP.name} {SHOP.city} — your home for <strong>custom &amp; embroidered jerseys</strong>,
            match footballs and pro boots. Kitting up champions across every sport since {SHOP.est}.
          </motion.p>

          <motion.div className="hero-cta" {...fadeUp(0.4)}>
            <Magnetic href={waLink()} target="_blank" rel="noreferrer" className="btn btn-gold hoverable">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              Order on WhatsApp
            </Magnetic>
            <Magnetic href="#shop" className="btn btn-ghost hoverable">
              Explore the Shop
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Magnetic>
          </motion.div>

          <motion.div className="hero-stats" {...fadeUp(0.52)}>
            {STATS.map((s) => (
              <div className="hero-stat" key={s.l}>
                <div className="hero-stat-n">{s.n}</div>
                <div className="hero-stat-l">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* interactive visual */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <motion.div
            className="hero-ball"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="220" height="220" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="hb" cx="38%" cy="32%" r="70%">
                  <stop offset="0%" stopColor="#2a2a2e" />
                  <stop offset="100%" stopColor="#050505" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="47" fill="url(#hb)" stroke="#e8302a" strokeWidth="1.4" />
              <polygon points="50,20 61,28 57,41 43,41 39,28" fill="#e8302a" />
              <polygon points="76,44 80,57 70,65 61,56 66,44" fill="#1a1a1d" stroke="#e8302a" strokeWidth="0.8"/>
              <polygon points="59,74 47,79 37,71 42,59 55,61" fill="#1a1a1d" stroke="#e8302a" strokeWidth="0.8"/>
              <polygon points="24,44 33,44 38,56 29,65 19,57" fill="#1a1a1d" stroke="#e8302a" strokeWidth="0.8"/>
            </svg>
          </motion.div>
          {['⚽', '👕', '🥅', '👟'].map((e, i) => (
            <motion.div
              key={e}
              className="hero-orbit"
              animate={{ rotate: [i * 90, i * 90 + 360] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
              <span className="hero-orbit-icon">{e}</span>
            </motion.div>
          ))}
          <div className="hero-badge hero-badge-tl">Embroidered ✦</div>
          <div className="hero-badge hero-badge-br">48h Delivery</div>
        </motion.div>
      </motion.div>

      <motion.div className="hero-scroll" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
        <span>Scroll</span>
        <motion.div className="hero-scroll-line" animate={{ scaleY: [0.2, 1, 0.2] }} transition={{ duration: 1.8, repeat: Infinity }} />
      </motion.div>
    </section>
  );
}
