import { useEffect } from 'react';
import Lenis from 'lenis';
import { CartProvider } from './cart';

import CartDrawer from './components/CartDrawer';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import ScrollVideo from './components/ScrollVideo';
import StatsBand from './components/StatsBand';
import BrandStory from './components/BrandStory';
import TextReveal from './components/TextReveal';
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
      <ScrollProgress />
      <Navbar />

      <main id="main">
        <Hero />
        <Marquee />
        <ScrollVideo />
        <StatsBand />
        <BrandStory />
        <TextReveal text="Every jersey we sell in Chennai is checked by hand before it ever reaches you." />
        <WhatWeSell />
        <Gallery />
        <Embroidery />
        <TextReveal text="Names stitched. Numbers set. Crests true to the club. Nothing leaves our workshop until it's right." />
        <HowItWorks />
        <WhyUs />
        <TextReveal text="Thousands of players kitted since 2019 — and we're just getting started." />
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
