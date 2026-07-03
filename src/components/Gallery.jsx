import { motion } from 'framer-motion';
import DomeSlider from './DomeSlider';
import { SHOP, waLink } from '../config';

const KITS = [
  { img: '/shop/shop-1.jpg', name: 'England Away', tag: 'Retro', msg: 'Hi! I want the England Away jersey.' },
  { img: '/shop/shop-2.jpg', name: 'Real Madrid Away', tag: 'Pink Edition', msg: 'Hi! I want the Real Madrid pink away jersey.' },
  { img: '/shop/shop-3.jpg', name: 'Portugal', tag: 'Black & Gold', msg: 'Hi! I want the Portugal black & gold jersey.' },
  { img: '/shop/shop-4.jpg', name: 'Inter Miami', tag: 'Home', msg: 'Hi! I want the Inter Miami home jersey.' },
  { img: '/shop/shop-5.jpg', name: 'Argentina', tag: '3-Star', msg: 'Hi! I want the Argentina 3-star jersey.' },
  { img: '/shop/shop-6.jpg', name: 'Real Madrid', tag: 'Retro Blue', msg: 'Hi! I want the Real Madrid retro blue jersey.' },
];

export default function Gallery() {
  return (
    <section className="section gallery" id="kits">
      <div className="container">
        <motion.div
          className="gallery-head"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">In Store Now</span>
          <h2 className="section-title">Latest <span className="g">kits</span> on the wall</h2>
          <p className="section-lead">
            Drag or tap through what's hanging in the shop right now. See more on{' '}
            <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="gallery-ig hoverable">{SHOP.instagramHandle}</a>
            {' '}— or message us for a kit you don't see here.
          </p>
        </motion.div>

        <DomeSlider
          items={KITS}
          onSelect={(item) => window.open(waLink(item.msg), '_blank', 'noopener')}
        />

        <motion.div
          className="gallery-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <a href={waLink('Hi Jersey Spot! Can you show me more kits you have in stock?')} target="_blank" rel="noreferrer" className="btn btn-whatsapp hoverable">
            See more on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
