import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion';

function ReelDot({ item, i, total, scrollYProgress }) {
  const start = i / total;
  const end = (i + 1) / total;
  const scaleX = useTransform(scrollYProgress, [start, end], [1, 2.5]);
  const opacity = useTransform(scrollYProgress, [start - 0.1, start, end, end + 0.1], [0.3, 1, 1, 0.3]);
  return (
    <div className="scroll-reel-dot-wrap">
      <motion.div className="scroll-reel-dot" style={{ scaleX, opacity }} />
      <span>{item.sport}</span>
    </div>
  );
}
import JerseySVG from './JerseySVG';

const REEL_ITEMS = [
  { id: 1, sport: 'Football', label: 'FC Champions', primary: '#c8960a', secondary: '#f5b800', number: '10', pattern: 'gradient', badge: 'Most Popular', desc: 'Premium football jerseys for champions' },
  { id: 2, sport: 'Cricket', label: 'RCB Style', primary: '#8b0000', secondary: '#cc2200', number: '18', pattern: 'stripes', badge: 'Chennai Fav', desc: 'Official replica cricket jerseys' },
  { id: 3, sport: 'Basketball', label: 'Street Kings', primary: '#1a1a2e', secondary: '#e06010', number: '23', pattern: 'solid', badge: 'Street Style', desc: 'NBA inspired custom basketball vests' },
  { id: 4, sport: 'Hockey', label: 'Ice Wolves', primary: '#0a2463', secondary: '#1e90ff', number: '9', pattern: 'solid', badge: 'New Drop', desc: 'Pro hockey jerseys with full back print' },
  { id: 5, sport: 'Kabaddi', label: 'Tamil Titans', primary: '#1a8c3a', secondary: '#22c55e', number: '7', pattern: 'stripes', badge: 'Regional Pride', desc: 'Bold kabaddi kits for Tamil warriors' },
  { id: 6, sport: 'Volleyball', label: 'Beach Club', primary: '#cc5500', secondary: '#ffaa00', number: '6', pattern: 'gradient', badge: 'Summer Hit', desc: 'Lightweight beach & indoor volleyball' },
];

function ReelCard({ item, i, scrollYProgress }) {
  const start = i / REEL_ITEMS.length;
  const end = (i + 1) / REEL_ITEMS.length;

  const rotateY = useTransform(scrollYProgress, [start - 0.15, start, end, end + 0.15], [55, 0, 0, -55]);
  const scale = useTransform(scrollYProgress, [start - 0.1, start + 0.05, end - 0.05, end + 0.1], [0.75, 1, 1, 0.75]);
  const opacity = useTransform(scrollYProgress, [start - 0.12, start + 0.04, end - 0.04, end + 0.12], [0, 1, 1, 0]);

  const scaleS = useSpring(scale, { stiffness: 180, damping: 22 });
  const rotYS = useSpring(rotateY, { stiffness: 150, damping: 20 });

  // Transform STRING so framer never routes rotateY through Element.animate (Safari WAAPI crash)
  const transform = useMotionTemplate`perspective(1400px) rotateY(${rotYS}deg) scale(${scaleS})`;

  return (
    <div style={{ '--card-color': item.primary, width: '100vw', flexShrink: 0 }}>
    <motion.div
      className="reel-card"
      style={{ transform, opacity }}
    >
      <div className="reel-card-glow" />
      <div className="reel-card-sport-tag">{item.sport}</div>

      <div className="reel-card-visual">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        >
          <JerseySVG
            primary={item.primary}
            secondary={item.secondary}
            number={item.number}
            name={item.label}
            size={180}
            pattern={item.pattern}
          />
        </motion.div>
        <div className="reel-card-jersey-glow" style={{ background: `radial-gradient(ellipse, ${item.primary}44 0%, transparent 70%)` }} />
      </div>

      <div className="reel-card-body">
        <div className="reel-card-badge">{item.badge}</div>
        <h3 className="reel-card-name">{item.label}</h3>
        <p className="reel-card-desc">{item.desc}</p>
        <motion.a
          href="#collections"
          className="reel-card-cta"
          whileHover={{ scale: 1.04, x: 4 }}
          whileTap={{ scale: 0.97 }}
        >
          Shop {item.sport} →
        </motion.a>
      </div>

      {/* Number decoration */}
      <div className="reel-card-num-bg">{item.number}</div>
    </motion.div>
    </div>
  );
}

export default function ScrollReel3D() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Film strip track X — pure pixel values, no vw/% strings (WAAPI can't parse them)
  const trackX = useTransform(scrollYProgress, (v) => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return -(v * (REEL_ITEMS.length - 1) * w);
  });
  const trackXSpring = useSpring(trackX, { stiffness: 80, damping: 20 });

  // Film reel rotation counter
  const reelRotate = useTransform(scrollYProgress, [0, 1], [0, 720]);

  return (
    <div ref={sectionRef} className="scroll-reel-section" id="sports-categories">
      <div className="scroll-reel-sticky">

        {/* Header */}
        <div className="scroll-reel-header">
          <div className="section-label">All Sports</div>
          <h2 className="section-title">
            Browse by <span>Sport</span>
          </h2>
        </div>

        {/* Film reel decoration */}
        <motion.div className="reel-sprocket-left" style={{ rotate: reelRotate }} aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="reel-sprocket-tooth" style={{ transform: `rotate(${i * 45}deg) translateY(-28px)` }} />
          ))}
        </motion.div>
        <motion.div className="reel-sprocket-right" style={{ rotate: reelRotate }} aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="reel-sprocket-tooth" style={{ transform: `rotate(${i * 45}deg) translateY(-28px)` }} />
          ))}
        </motion.div>

        {/* Horizontal track */}
        <div className="scroll-reel-track-wrap" style={{ perspective: 1400 }}>
          <motion.div
            className="scroll-reel-track"
            style={{ x: trackXSpring }}
          >
            {REEL_ITEMS.map((item, i) => (
              <ReelCard
                key={item.id}
                item={item}
                i={i}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </motion.div>
        </div>

        {/* Progress dots */}
        <div className="scroll-reel-dots">
          {REEL_ITEMS.map((item, i) => (
            <ReelDot key={item.id} item={item} i={i} total={REEL_ITEMS.length} scrollYProgress={scrollYProgress} />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="scroll-reel-hint" aria-hidden>
          <motion.div
            animate={{ x: [0, 14, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="scroll-reel-hint-arrow"
          >→</motion.div>
          <span>Scroll to explore</span>
        </div>
      </div>
    </div>
  );
}
