import { useEffect } from 'react';
import Lenis from 'lenis';
import { CartProvider } from './cart';

import CustomCursor from './components/CustomCursor';
import CartDrawer from './components/CartDrawer';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import ScrollVideo from './components/ScrollVideo';
import StatsBand from './components/StatsBand';
import BrandStory from './components/BrandStory';
import WhatWeSell from './components/WhatWeSell';
import Gallery from './components/Gallery';
import Embroidery from './components/Embroidery';
import HowItWorks from './components/HowItWorks';
import WhyUs from './components/WhyUs';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import WhatsAppFab from './components/WhatsAppFab';

export default function App() {
  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // let in-page anchor links use Lenis
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -80 }); }
      }
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <CartProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />

      <main id="main">
        <Hero />
        <Marquee />
        <ScrollVideo />
        <StatsBand />
        <BrandStory />
        <WhatWeSell />
        <Gallery />
        <Embroidery />
        <HowItWorks />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>

      <Footer />
      <WhatsAppFab />
      <CartDrawer />
    </CartProvider>
  );
}
