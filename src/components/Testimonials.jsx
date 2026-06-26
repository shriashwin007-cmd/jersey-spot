import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useDragControls } from 'framer-motion';

const reviews = [
  { name: 'Marcus T.', role: 'Football Club Manager', rating: 5, text: 'Ordered 22 jerseys for our club and the quality was absolutely incredible. The 3D customizer made it so easy to get exactly the look we wanted. Will never order from anywhere else!', color: '#15803D', initials: 'MT' },
  { name: 'Sarah K.', role: 'Youth Coach, LA Knights', rating: 5, text: "The kids absolutely love their jerseys. The fabric is so comfortable and the custom printing didn't fade even after dozens of washes. Delivery was faster than expected too!", color: '#1E3A5F', initials: 'SK' },
  { name: 'James R.', role: 'Pro Athlete', rating: 5, text: 'As a professional, I need my kit to perform at the highest level. Jersey Spot delivered exactly that. Premium quality, perfect fit, and the customization options are unmatched.', color: '#7C3AED', initials: 'JR' },
  { name: 'Priya M.', role: 'Cricket Captain', rating: 5, text: 'Ordered full team kits with custom names and numbers. The process was seamless and the end result was stunning. Our team looks so professional now. Thank you Jersey Spot!', color: '#991B1B', initials: 'PM' },
  { name: 'Alex D.', role: 'Basketball Coach', rating: 5, text: "I've tried many jersey suppliers but none come close to the quality and customer service here. The 3D preview feature alone saves so much back and forth. Highly recommend!", color: '#0C4A6E', initials: 'AD' },
  { name: 'Nina L.', role: 'Sports Event Organizer', rating: 5, text: 'We used Jersey Spot for a tournament with 40+ teams. Their team handled everything perfectly — bulk pricing, fast turnaround, and every single jersey was perfect.', color: '#065F46', initials: 'NL' },
];

const CARD_W = 360;
const GAP = 24;

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const total = reviews.length;
  const dragControls = useDragControls();

  const goTo = useCallback((i) => {
    setActive(((i % total) + total) % total);
  }, [total]);

  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => goTo(active + 1), 4000);
    return () => clearInterval(id);
  }, [active, paused, goTo]);

  // Scroll track to active
  useEffect(() => {
    if (!trackRef.current) return;
    const offset = active * (CARD_W + GAP);
    trackRef.current.scrollTo({ left: offset, behavior: 'smooth' });
  }, [active]);

  return (
    <section
      className="section testimonials"
      id="testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container">
        <motion.div
          className="text-center"
          style={{ maxWidth: 560, margin: '0 auto 56px' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">
            Loved by <span>Champions</span><br />
            <em>Worldwide</em>
          </h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Don't just take our word for it — hear from the teams and athletes who wear Jersey Spot.
          </p>
        </motion.div>

        {/* Track */}
        <div className="testimonials-track-wrap">
          <div className="testimonials-track" ref={trackRef} role="list">
            {reviews.map((r, i) => {
              const dist = Math.abs(i - active);
              const isActive = i === active;
              return (
                <motion.div
                  key={r.name}
                  className={`testimonial-card${isActive ? ' testimonial-card-active' : ''}`}
                  role="listitem"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  animate={{
                    scale: isActive ? 1.03 : 1,
                    opacity: dist <= 1 ? 1 : 0.6,
                  }}
                  onClick={() => setActive(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="testimonial-stars" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <motion.span
                        key={j}
                        aria-hidden
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * j, type: 'spring', stiffness: 400 }}
                      >★</motion.span>
                    ))}
                  </div>
                  <p className="testimonial-text">"{r.text}"</p>
                  <div className="testimonial-author">
                    <div
                      className="testimonial-avatar"
                      style={{ background: r.color }}
                      aria-hidden
                    >
                      {r.initials}
                    </div>
                    <div>
                      <div className="testimonial-name">{r.name}</div>
                      <div className="testimonial-role">{r.role}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="testimonials-controls">
          <button
            className="testimonial-nav-btn"
            onClick={prev}
            aria-label="Previous review"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="testimonials-nav" role="tablist" aria-label="Testimonial navigation">
            {reviews.map((_, i) => (
              <motion.button
                key={i}
                className={`nav-dot${active === i ? ' active' : ''}`}
                onClick={() => setActive(i)}
                role="tab"
                aria-selected={active === i}
                aria-label={`Review ${i + 1}`}
                whileTap={{ scale: 0.85 }}
                animate={active === i ? { width: 28 } : { width: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            ))}
          </div>

          <button
            className="testimonial-nav-btn"
            onClick={next}
            aria-label="Next review"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* Autoplay progress bar */}
        {!paused && (
          <div className="testimonial-progress-wrap" aria-hidden>
            <motion.div
              key={active}
              className="testimonial-progress-bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
