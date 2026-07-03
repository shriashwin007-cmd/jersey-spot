import { motion } from 'framer-motion';
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
            A peek at what's hanging in the shop right now. See more on{' '}
            <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="gallery-ig hoverable">{SHOP.instagramHandle}</a>
            {' '}— or message us for a kit you don't see here.
          </p>
        </motion.div>

        <div className="gallery-grid">
          {KITS.map((k, i) => (
            <motion.a
              key={k.img}
              href={waLink(k.msg)}
              target="_blank"
              rel="noreferrer"
              className="gallery-card hoverable"
              initial={{ opacity: 0, y: 42, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              aria-label={`Enquire about ${k.name}`}
            >
              <div className="gallery-img">
                <img src={k.img} alt={`${k.name} jersey`} loading="lazy" width="640" height="640" />
                <div className="gallery-shine" />
                <span className="gallery-tag">{k.tag}</span>
              </div>
              <div className="gallery-meta">
                <span className="gallery-name">{k.name}</span>
                <span className="gallery-enquire">
                  Enquire
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </div>
            </motion.a>
          ))}
        </div>

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
