import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import JerseySVG from './JerseySVG';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

function FloatingParticles() {
  const count = 28;
  return (
    <div className="hero-particles" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="hero-particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            opacity: 0.15 + Math.random() * 0.25,
            background: i % 3 === 0 ? 'var(--primary-light)' : i % 3 === 1 ? 'var(--accent-light)' : 'var(--sport-green-light)',
          }}
          animate={{
            y: [0, -(15 + Math.random() * 20), 0],
            x: [0, (Math.random() - 0.5) * 12, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function MagneticBtn({ href, className, children, ...rest }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const onMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.28);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.28);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x, y }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.96 }}
      {...rest}
    >
      {children}
    </motion.a>
  );
}

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 600], [0, -80]);
  const orbY2 = useTransform(scrollY, [0, 600], [0, 60]);
  const jerseyY = useTransform(scrollY, [0, 600], [0, -40]);
  const jerseyScale = useTransform(scrollY, [0, 400], [1, 0.92]);

  return (
    <section className="hero" id="home" ref={containerRef}>
      {/* Video background */}
      <div className="hero-video-wrap" aria-hidden>
        <video
          className="hero-video"
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-video-overlay" />
      </div>

      {/* Particle / orb layer */}
      <div className="hero-bg" aria-hidden>
        <motion.div className="hero-orb hero-orb-1" style={{ y: orbY1 }} />
        <motion.div className="hero-orb hero-orb-2" style={{ y: orbY2 }} />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-noise" />
        <div className="hero-grid-overlay" />
        <FloatingParticles />
      </div>

      <div className="container">
        <div className="hero-content">
          {/* Left text */}
          <div className="hero-text">
            <motion.div {...fadeUp(0.1)}>
              <div className="hero-eyebrow">
                <motion.span
                  className="dot"
                  aria-hidden
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Premium Jersey Shop — Chennai, Est. 2019
              </div>
            </motion.div>

            <motion.h1 className="hero-title" {...fadeUp(0.2)}>
              Wear Your<br />
              <span className="hl">
                Pride
                <motion.svg
                  className="hl-underline"
                  viewBox="0 0 200 12"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.path
                    d="M2 8 Q50 2 100 7 Q150 12 198 5"
                    stroke="url(#hlGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="hlGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#c8960a" />
                      <stop offset="50%" stopColor="#f5b800" />
                      <stop offset="100%" stopColor="#cc2200" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--accent-light)' }}>Play with Passion</em>
            </motion.h1>

            <motion.p className="hero-desc" {...fadeUp(0.3)}>
              Jersey Spot Chennai — premium custom jerseys crafted for champions. Football, cricket, basketball — design your perfect kit with our 3D customizer and world-class quality.
            </motion.p>

            <motion.div className="hero-actions" {...fadeUp(0.4)}>
              <MagneticBtn href="#collections" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.43H6"/>
                </svg>
                Shop Collections
              </MagneticBtn>
              <MagneticBtn href="#customizer" className="btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                Customize in 3D
              </MagneticBtn>
            </motion.div>

            <motion.div className="hero-social-proof" {...fadeUp(0.5)}>
              <div className="hero-avatars" aria-hidden>
                {['A', 'R', 'K', 'S', 'M'].map((l, i) => (
                  <motion.div
                    key={l}
                    className="hero-avatar"
                    style={{ background: ['#c8960a', '#cc2200', '#1a8c3a', '#c8960a', '#cc2200'][i] }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.07, type: 'spring', stiffness: 400 }}
                  >
                    {l}
                  </motion.div>
                ))}
              </div>
              <div className="hero-social-text">
                <strong>12,000+</strong> happy customers<br />
                <span style={{ color: '#f5b800' }}>★★★★★</span> <strong>4.9</strong> / 5 rating
              </div>
            </motion.div>
          </div>

          {/* Right visual */}
          <div className="hero-visual">
            <div className="hero-jersey-showcase">
              <motion.div className="hero-jersey-glow" aria-hidden
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="hero-jersey-ring" aria-hidden />
              <div className="hero-jersey-ring-2" aria-hidden />

              {[0, 72, 144, 216, 288].map((deg, i) => (
                <motion.div
                  key={deg}
                  className="hero-orbit-dot"
                  aria-hidden
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'linear' }}
                  style={{ '--deg': `${deg}deg` }}
                />
              ))}

              <motion.div
                className="floating-jersey"
                style={{ y: jerseyY, scale: jerseyScale }}
                initial={{ opacity: 0, scale: 0.75, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <JerseySVG
                  primary="#c8960a"
                  secondary="#f5b800"
                  number="10"
                  name="JERSEY SPOT"
                  size={310}
                  pattern="gradient"
                />
              </motion.div>

              <div className="hero-feature-pills" aria-hidden>
                {[
                  { icon: '⚽', text: '3D Customization' },
                  { icon: '🚀', text: 'Fast Delivery' },
                  { icon: '🏆', text: 'Pro Quality' },
                ].map((p, i) => (
                  <motion.div
                    key={p.text}
                    className="feature-pill"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.12, type: 'spring', stiffness: 280, damping: 20 }}
                    whileHover={{ x: 6, scale: 1.04 }}
                  >
                    <span className="pill-icon" aria-hidden>{p.icon}</span>
                    {p.text}
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="hero-price-tag"
                initial={{ opacity: 0, x: 30, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 22 }}
                whileHover={{ scale: 1.06 }}
                aria-label="Starting from ₹1,499"
              >
                <div className="label">Starting from</div>
                <div className="price" style={{ color: 'var(--primary-light)' }}>₹1,499</div>
                <div className="price-badge">Free shipping</div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="hero-scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        aria-hidden
      >
        <motion.div
          className="scroll-dot"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
