import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// SVG sport ball illustrations with detailed shading
function FootballSVG({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fg-ball" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#b0b0b0" />
        </radialGradient>
        <radialGradient id="fg-patch" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>
        <radialGradient id="fg-highlight" cx="35%" cy="28%" r="35%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="fg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(245,184,0,0.0)" />
          <stop offset="70%" stopColor="rgba(245,184,0,0.08)" />
          <stop offset="100%" stopColor="rgba(245,184,0,0.25)" />
        </radialGradient>
        <clipPath id="fg-clip">
          <circle cx="100" cy="100" r="88" />
        </clipPath>
        <filter id="fg-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>
      {/* Shadow */}
      <ellipse cx="100" cy="185" rx="72" ry="12" fill="rgba(0,0,0,0.35)" />
      {/* Ball base */}
      <circle cx="100" cy="96" r="88" fill="url(#fg-ball)" filter="url(#fg-shadow)" />
      {/* Pentagon patches */}
      <g clipPath="url(#fg-clip)" fill="url(#fg-patch)">
        {/* Top center pentagon */}
        <polygon points="100,12 118,28 111,50 89,50 82,28" opacity="0.95"/>
        {/* Right-top */}
        <polygon points="155,38 168,60 158,80 137,76 128,55" opacity="0.9"/>
        {/* Right-bottom */}
        <polygon points="162,110 162,133 144,145 128,133 130,110" opacity="0.88"/>
        {/* Bottom-right */}
        <polygon points="130,160 118,178 96,178 84,162 92,145" opacity="0.85"/>
        {/* Bottom-left */}
        <polygon points="68,160 54,148 56,126 74,116 88,130" opacity="0.85"/>
        {/* Left-bottom */}
        <polygon points="38,110 42,87 60,78 73,92 68,116" opacity="0.88"/>
        {/* Left-top */}
        <polygon points="45,38 68,30 82,50 72,70 50,65" opacity="0.9"/>
      </g>
      {/* Highlight */}
      <circle cx="100" cy="96" r="88" fill="url(#fg-highlight)" />
      <circle cx="100" cy="96" r="88" fill="url(#fg-glow)" />
      {/* Gold rim glow */}
      <circle cx="100" cy="96" r="88" fill="none" stroke="rgba(245,184,0,0.3)" strokeWidth="2" />
    </svg>
  );
}

function BasketballSVG({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bb-ball" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f07028" />
          <stop offset="50%" stopColor="#e05518" />
          <stop offset="100%" stopColor="#8c2800" />
        </radialGradient>
        <radialGradient id="bb-highlight" cx="35%" cy="27%" r="32%">
          <stop offset="0%" stopColor="rgba(255,220,180,0.75)" />
          <stop offset="100%" stopColor="rgba(255,220,180,0)" />
        </radialGradient>
        <radialGradient id="bb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(204,34,0,0)" />
          <stop offset="100%" stopColor="rgba(204,34,0,0.3)" />
        </radialGradient>
        <clipPath id="bb-clip">
          <circle cx="100" cy="96" r="88" />
        </clipPath>
        <filter id="bb-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#5c1500" floodOpacity="0.6" />
        </filter>
      </defs>
      <ellipse cx="100" cy="185" rx="72" ry="12" fill="rgba(0,0,0,0.35)" />
      <circle cx="100" cy="96" r="88" fill="url(#bb-ball)" filter="url(#bb-shadow)" />
      {/* Seam lines */}
      <g clipPath="url(#bb-clip)" fill="none" stroke="#1a0800" strokeWidth="3.5" strokeLinecap="round">
        {/* Horizontal seam */}
        <line x1="12" y1="96" x2="188" y2="96" />
        {/* Vertical seam */}
        <line x1="100" y1="8" x2="100" y2="184" />
        {/* Left curve seam */}
        <path d="M 100 8 Q 55 50 55 96 Q 55 142 100 184" />
        {/* Right curve seam */}
        <path d="M 100 8 Q 145 50 145 96 Q 145 142 100 184" />
      </g>
      {/* Highlight */}
      <circle cx="100" cy="96" r="88" fill="url(#bb-highlight)" />
      <circle cx="100" cy="96" r="88" fill="url(#bb-glow)" />
      <circle cx="100" cy="96" r="88" fill="none" stroke="rgba(204,34,0,0.4)" strokeWidth="2" />
    </svg>
  );
}

function CricketBallSVG({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cb-ball" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c52020" />
          <stop offset="45%" stopColor="#9a0808" />
          <stop offset="100%" stopColor="#4a0000" />
        </radialGradient>
        <radialGradient id="cb-highlight" cx="34%" cy="26%" r="34%">
          <stop offset="0%" stopColor="rgba(255,180,180,0.65)" />
          <stop offset="100%" stopColor="rgba(255,180,180,0)" />
        </radialGradient>
        <radialGradient id="cb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="68%" stopColor="rgba(245,184,0,0)" />
          <stop offset="100%" stopColor="rgba(245,184,0,0.35)" />
        </radialGradient>
        <clipPath id="cb-clip">
          <circle cx="100" cy="96" r="88" />
        </clipPath>
        <filter id="cb-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#300000" floodOpacity="0.65" />
        </filter>
      </defs>
      <ellipse cx="100" cy="185" rx="72" ry="12" fill="rgba(0,0,0,0.35)" />
      <circle cx="100" cy="96" r="88" fill="url(#cb-ball)" filter="url(#cb-shadow)" />
      {/* Equator seam */}
      <g clipPath="url(#cb-clip)">
        {/* Raised seam ridge */}
        <path d="M 12 96 Q 56 80 100 96 Q 144 112 188 96" fill="none" stroke="#d4aa00" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
        <path d="M 12 96 Q 56 80 100 96 Q 144 112 188 96" fill="none" stroke="#f5d04a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Stitch dots on seam */}
        {Array.from({ length: 16 }).map((_, i) => {
          const t = i / 15;
          const x = 12 + t * 176;
          // approximate seam curve
          const midT = Math.abs(t - 0.5) * 2;
          const y = 96 + (t < 0.5 ? -16 : 16) * (1 - midT);
          return (
            <g key={i}>
              <line
                x1={x} y1={y - 5} x2={x} y2={y - 9}
                stroke="#f5d04a" strokeWidth="2" strokeLinecap="round"
              />
              <line
                x1={x} y1={y + 5} x2={x} y2={y + 9}
                stroke="#f5d04a" strokeWidth="2" strokeLinecap="round"
              />
            </g>
          );
        })}
        {/* Halves seam divider */}
        <line x1="100" y1="8" x2="100" y2="184" stroke="rgba(80,0,0,0.4)" strokeWidth="1" />
      </g>
      <circle cx="100" cy="96" r="88" fill="url(#cb-highlight)" />
      <circle cx="100" cy="96" r="88" fill="url(#cb-glow)" />
      <circle cx="100" cy="96" r="88" fill="none" stroke="rgba(245,184,0,0.45)" strokeWidth="2.5" />
    </svg>
  );
}

const SPORTS = [
  {
    id: 'football',
    name: 'Football',
    emoji: '⚽',
    tagline: 'The Beautiful Game',
    detail: 'From Chennai street leagues to national cups — we kit every level.',
    color: '#c8960a',
    Ball: FootballSVG,
  },
  {
    id: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    tagline: 'Street to Stadium',
    detail: 'NBA-inspired custom basketball vests, printed in 48 hours.',
    color: '#cc2200',
    Ball: BasketballSVG,
  },
  {
    id: 'cricket',
    name: 'Cricket',
    emoji: '🏏',
    tagline: "Chennai's Passion",
    detail: 'Official-grade cricket kits with team logos, numbers & names.',
    color: '#cc2200',
    Ball: CricketBallSVG,
  },
];

function SportCard({ sport, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.1'] });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const ySpring = useSpring(y, { stiffness: 120, damping: 18 });
  const scaleSpring = useSpring(scale, { stiffness: 120, damping: 18 });

  const { Ball } = sport;

  return (
    <motion.div
      ref={ref}
      className="sport-showcase-card"
      style={{ opacity, scale: scaleSpring }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20 }}
    >
      {/* Background glow */}
      <div className="sport-card-bg-glow" style={{ background: `radial-gradient(ellipse at 50% 30%, ${sport.color}22 0%, transparent 70%)` }} />

      {/* Ball visual */}
      <motion.div className="sport-card-ball-wrap" style={{ y: ySpring }}>
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4 + index * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Ball size={180} />
        </motion.div>
        {/* Reflection */}
        <div className="sport-card-ball-reflect" />
      </motion.div>

      {/* Content */}
      <div className="sport-card-content">
        <div className="sport-card-emoji">{sport.emoji}</div>
        <h3 className="sport-card-name">{sport.name}</h3>
        <p className="sport-card-tagline" style={{ color: sport.color }}>{sport.tagline}</p>
        <p className="sport-card-detail">{sport.detail}</p>
        <motion.a
          href="#collections"
          className="sport-card-btn"
          style={{ background: sport.color }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          Shop {sport.name} Jerseys
        </motion.a>
      </div>
    </motion.div>
  );
}

export default function SportShowcase() {
  return (
    <section className="sport-showcase-section" id="sport-showcase">
      <div className="container">
        <motion.div
          className="sport-showcase-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-label">Our Sports</div>
          <h2 className="section-title">
            Jersey Spot Covers <span>Every Sport</span>
          </h2>
          <p className="section-subtitle">
            Premium custom jerseys for every sport Chennai loves
          </p>
        </motion.div>

        <div className="sport-showcase-grid">
          {SPORTS.map((sport, i) => (
            <SportCard key={sport.id} sport={sport} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
