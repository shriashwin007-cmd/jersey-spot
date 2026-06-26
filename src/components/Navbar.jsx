import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import logoImg from '../assets/logo.png';

function MagneticLink({ href, label, onClick }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * 0.25,
      y: (e.clientY - rect.top - rect.height / 2) * 0.25,
    });
  };
  const onMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="navbar-link"
    >
      {label}
      <span className="navbar-link-dot" aria-hidden />
    </motion.a>
  );
}

export default function Navbar({ cartCount, onCartClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 30));
    return unsub;
  }, [scrollY]);

  const navLinks = [
    { href: '#collections', label: 'Collections' },
    { href: '#customizer', label: 'Customize' },
    { href: '#features', label: 'Why Us' },
    { href: '#testimonials', label: 'Reviews' },
  ];

  return (
    <>
      <motion.nav
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="navbar-inner">
          <motion.a
            href="#"
            className="navbar-logo"
            aria-label="Jersey Spot home"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <img src={logoImg} alt="Jersey Spot Chennai" className="navbar-logo-img" />
          </motion.a>

          <ul className="navbar-nav">
            {navLinks.map(l => (
              <li key={l.href}>
                <MagneticLink href={l.href} label={l.label} />
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <motion.button
              className="cart-btn"
              onClick={onCartClick}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              aria-label={`Cart (${cartCount} items)`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    className="cart-count"
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    aria-live="polite"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.a
              href="#customizer"
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '13px' }}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
            >
              Design Yours
            </motion.a>

            <button
              className="navbar-menu-btn"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} transition={{ duration: 0.2 }} />
              <motion.span animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }} transition={{ duration: 0.2 }} />
              <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} transition={{ duration: 0.2 }} />
            </button>
          </div>
        </div>

        {/* Scroll progress */}
        <div className="progress-bar-track" aria-hidden>
          <motion.div className="progress-bar" style={{ width: progressWidth }} />
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -16, scaleY: 0.92 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -16, scaleY: 0.92 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top' }}
          >
            <ul>
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
                </motion.li>
              ))}
            </ul>
            <motion.a
              href="#customizer"
              className="btn-primary w-full"
              style={{ justifyContent: 'center' }}
              onClick={() => setMenuOpen(false)}
              whileTap={{ scale: 0.97 }}
            >
              Design Your Jersey
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
