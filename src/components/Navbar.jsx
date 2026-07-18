import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { waLink } from '../config';
import { useCart } from '../cart';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';

const LINKS = [
  { href: '#kits', label: 'Catalogue' },
  { href: '#story', label: 'Story' },
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
            <Button asChild variant="gold" className="nav-cta hoverable">
              <a href="#kits">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.57L23 6H6" />
                </svg>
                Shop Catalogue
              </a>
            </Button>
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="top"
          showCloseButton={false}
          style={{ top: 'var(--nav-h)' }}
          className="nav-mobile z-[899] inset-x-0 bottom-0 h-auto rounded-none border-t border-border bg-black/98 backdrop-blur-2xl gap-1.5 overflow-y-auto shadow-none"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
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
          <Button asChild variant="whatsapp" className="hoverable" onClick={() => setOpen(false)}>
            <a href={waLink()} target="_blank" rel="noreferrer">Order on WhatsApp</a>
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
