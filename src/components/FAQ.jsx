import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from './anim';

const QA = [
  { q: 'What\'s the difference between embroidered and printed jerseys?', a: 'Embroidered kits have names, numbers and crests stitched with thread for a raised, premium, pro-club feel that never cracks or fades. Printed kits use sublimation/heat-press for a smooth, lightweight finish at a lower price — great for bulk team orders.' },
  { q: 'How long does an order take?', a: 'Most orders — single kits or full teams — are ready within 48 hours. Large bulk or fully custom designs may take a little longer; we\'ll always confirm the timeline on WhatsApp before we start.' },
  { q: 'Do you take team & bulk orders?', a: 'Absolutely. Schools, clubs and corporate tournaments get special per-piece pricing. Send us your squad list with sizes, names and numbers and we\'ll handle the rest.' },
  { q: 'Can I order a jersey I don\'t see on the site?', a: 'Yes! The site shows just a sample of what\'s in store. Message us on WhatsApp with any club, country or design and we\'ll source or make it for you.' },
  { q: 'Do you sell footballs and boots too?', a: 'We do — training to match-grade footballs (sizes 3, 4, 5) and studs/turf boots built for real play. Ask us for current stock and prices.' },
  { q: 'How do I pay and receive my order?', a: 'Confirm everything over WhatsApp, pay via UPI/cash, then pick up in-store in Chennai or have it delivered. Simple.' },
];

function Item({ item, open, onToggle, i }) {
  return (
    <Reveal className="faq-item" delay={i * 0.05}>
      <button className={`faq-q hoverable${open ? ' open' : ''}`} onClick={onToggle} aria-expanded={open}>
        <span>{item.q}</span>
        <motion.span className="faq-plus" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }} aria-hidden>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-a-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="faq-a">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq" id="faq">
      <div className="container faq-grid">
        <div className="faq-head">
          <span className="eyebrow">Good to Know</span>
          <h2 className="section-title">Frequently <span className="g">asked</span></h2>
          <p className="section-lead">Still unsure about something? Just message us — we reply fast.</p>
        </div>
        <div className="faq-list">
          {QA.map((item, i) => (
            <Item key={i} item={item} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
