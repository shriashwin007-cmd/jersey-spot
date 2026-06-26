import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import './App.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Stats from './components/Stats';
import Collections from './components/Collections';
import Slider3D from './components/Slider3D';
import JerseyGallery from './components/JerseyGallery';
import BallMorphSection from './components/BallMorphSection';
import ScrollReel3D from './components/ScrollReel3D';
import SportShowcase from './components/SportShowcase';
import JerseyCustomizer from './components/JerseyCustomizer';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CustomCursor from './components/CustomCursor';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showTop, setShowTop] = useState(false);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const addToCart = (item) => {
    setCartItems(prev => [...prev, { ...item, id: Date.now() + Math.random() }]);
    setCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <>
      <CustomCursor />

      <Navbar cartCount={cartItems.length} onCartClick={() => setCartOpen(true)} />

      <main id="main-content">
        <Hero />

        <Marquee />

        <div className="divider-glow" />

        <Stats />

        <div className="divider-glow" />

        {/* 3D CoverFlow featured slider */}
        <Slider3D onAddToCart={addToCart} />

        <div className="divider-glow" />

        {/* Real product photos from the Chennai store (Instagram) */}
        <JerseyGallery onAddToCart={addToCart} />

        <div className="divider-glow" />

        {/* GLSL ball morphing — football → basketball → cricket (scroll-driven) */}
        <BallMorphSection />

        <div className="divider-glow" />

        {/* Sport showcase with detailed SVG ball illustrations */}
        <SportShowcase />

        <div className="divider-glow" />

        {/* 3D horizontal scroll reel — all sport categories */}
        <ScrollReel3D />

        <div className="divider-glow" />

        <Collections onAddToCart={addToCart} />

        <div className="divider-glow" />

        <JerseyCustomizer onAddToCart={addToCart} />

        <div className="divider-glow" />

        <Features />

        <div className="divider-glow" />

        <Testimonials />

        <div className="divider-glow" />

        <Newsletter />
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
      />

      <AnimatePresence>
        {showTop && (
          <motion.button
            className="scroll-top"
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
