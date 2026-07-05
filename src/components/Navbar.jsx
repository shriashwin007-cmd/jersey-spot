import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import { waLink } from '../config';
import { useCart } from '../cart';

const LINKS = [
  { href: '#story', label: 'Story' },
  { href: '#shop', label: 'What We Sell' },
  { href: '#embroidery', label: 'Embroidery' },
  { href: '#why', label: 'Why Us' },
  { href: '#contact', label: 'Visit' },
];

function MagLink({ href, label, onClick }) {
  const ref = useRef(null);
  const [p, setP] = useState({ x: 0, y: 0 });
  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      className="nav-link hoverable"
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        setP({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3 });
      }}
      onMouseLeave={() => setP({ x: 0, y: 0 })}
      animate={{ x: p.x, y: p.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
    >
      {label}
    </motion.a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`nav${scrolled ? ' scrolled' : ''}`}
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav-inner">
          <a href="#main" className="nav-logo hoverable" aria-label="Jersey Spot home">
            <img src={logo} alt="Jersey Spot Chennai" />
          </a>

          <nav className="nav-links">
            {LINKS.map((l) => <MagLink key={l.href} {...l} />)}
          </nav>

          <div className="nav-actions">
            <button className="nav-cart-btn hoverable" onClick={() => setCartOpen(true)} aria-label={`Cart (${count} items)`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.57L23 6H6" />
              </svg>
              {count > 0 && <span className="nav-cart-badge">{count}</span>}
            </button>
            <a href={waLink()} target="_blank" rel="noreferrer" className="btn btn-gold nav-cta hoverable">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              Order Now
            </a>
            <button
              className="nav-burger hoverable"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }} />
              <motion.span animate={{ opacity: open ? 0 : 1 }} />
              <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                className="hoverable"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {l.label}
              </motion.a>
            ))}
            <a href={waLink()} target="_blank" rel="noreferrer" className="btn btn-whatsapp hoverable" onClick={() => setOpen(false)}>
              Order on WhatsApp
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
