import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const benefits = ['10% off first order', 'Early collection drops', 'Exclusive member perks'];

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="section newsletter" ref={ref}>
      <div className="container">
        <div className="newsletter-inner">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="section-label">Newsletter</div>
            <h2 className="section-title">
              Get Early Access &<br />
              <em>Exclusive Deals</em>
            </h2>
            <p className="section-desc">
              Join 8,000+ sports enthusiasts. Be the first to know about new collections, limited drops, and member-only discounts.
            </p>
            <div className="newsletter-benefits">
              {benefits.map((b, i) => (
                <motion.div
                  key={b}
                  className="newsletter-benefit"
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  <span className="check" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {b}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="newsletter-success"
                  role="status"
                  aria-live="polite"
                >
                  <motion.div
                    className="newsletter-success-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
                    aria-hidden
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </motion.div>
                  <div className="newsletter-success-title">You're in the squad!</div>
                  <div className="newsletter-success-desc">
                    Welcome to the Jersey Spot family. Check your inbox for your 10% discount code.
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  noValidate
                  className="newsletter-form-wrap"
                >
                  <div className={`newsletter-form${focused ? ' focused' : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="newsletter-form-icon" aria-hidden>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email"
                      className="newsletter-input"
                      placeholder="Your email address"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      aria-label="Email address"
                      aria-describedby={error ? 'newsletter-error' : undefined}
                      aria-invalid={!!error}
                    />
                    <motion.button
                      type="submit"
                      className="btn-primary newsletter-submit"
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      Subscribe
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        id="newsletter-error"
                        role="alert"
                        className="newsletter-error"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="newsletter-fine">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    No spam, ever. Unsubscribe at any time.
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
