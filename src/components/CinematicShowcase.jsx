import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { waLink } from '../config';

// Slow Ken Burns zoom/pan + cross-fade across real shop photos — reads like
// a cinematic video background, but it's pure CSS animation (no WAAPI risk,
// no AI generation needed).
const SLIDES = [
  { img: '/shop/shop-1.jpg', name: 'England Away', tag: 'Retro Icon', msg: 'Hi! I want the England Away jersey.' },
  { img: '/shop/shop-2.jpg', name: 'Real Madrid Away', tag: 'Pink Edition', msg: 'Hi! I want the Real Madrid pink away jersey.' },
  { img: '/shop/shop-3.jpg', name: 'Portugal', tag: 'Black & Gold', msg: 'Hi! I want the Portugal black & gold jersey.' },
  { img: '/shop/shop-4.jpg', name: 'Inter Miami', tag: 'Home Kit', msg: 'Hi! I want the Inter Miami home jersey.' },
  { img: '/shop/shop-5.jpg', name: 'Argentina', tag: '3-Star Pride', msg: 'Hi! I want the Argentina 3-star jersey.' },
  { img: '/shop/shop-6.jpg', name: 'Real Madrid', tag: 'Retro Blue', msg: 'Hi! I want the Real Madrid retro blue jersey.' },
];
const SLIDE_MS = 5200;

export default function CinematicShowcase() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '0px' });
    if (sectionRef.current) io.observe(sectionRef.current);

    const t = setInterval(() => {
      if (!visible || document.hidden) return;
      setActive((a) => (a + 1) % SLIDES.length);
    }, SLIDE_MS);

    return () => { clearInterval(t); io.disconnect(); };
  }, []);

  const current = SLIDES[active];

  return (
    <section className="cine-section" ref={sectionRef} aria-label="Featured kits showcase">
      {SLIDES.map((s, i) => (
        <div key={s.img} className={`cine-slide${i === active ? ' active' : ''}`}>
          {/* remount the img on becoming active so the CSS keyframe restarts from scale(1) */}
          {i === active && <img src={s.img} alt={`${s.name} — ${s.tag}`} className="cine-kenburns" />}
          {i !== active && <img src={s.img} alt="" aria-hidden />}
        </div>
      ))}

      <div className="cine-overlay" aria-hidden />

      <div className="container cine-content">
        <span className="eyebrow">Now Showing</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="cine-name">{current.name}</h2>
            <span className="cine-tag">{current.tag}</span>
          </motion.div>
        </AnimatePresence>

        <div className="cine-row">
          <a href={waLink(current.msg)} target="_blank" rel="noreferrer" className="btn btn-gold hoverable">
            Shop This Kit →
          </a>
          <div className="cine-dots">
            {SLIDES.map((s, i) => (
              <button
                key={s.img}
                className={`cine-dot hoverable${i === active ? ' active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Show ${s.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
