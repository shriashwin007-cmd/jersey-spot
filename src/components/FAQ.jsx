import { Reveal } from './anim';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';

const QA = [
  { q: 'What\'s the difference between embroidered and printed jerseys?', a: 'Embroidered kits have crests stitched with thread for a raised, premium, pro-club feel that never cracks or fades. Printed kits use sublimation/heat-press for a smooth, lightweight finish at a lower price — great for bulk team orders.' },
  { q: 'How long does an order take?', a: 'Most orders — single kits or full teams — are ready within 48 hours. Large bulk or fully custom designs may take a little longer; we\'ll always confirm the timeline on WhatsApp before we start.' },
  { q: 'Do you take team & bulk orders?', a: 'Absolutely. Schools, clubs and corporate tournaments get special per-piece pricing. Send us your squad list with sizes, names and numbers and we\'ll handle the rest.' },
  { q: 'Can I order a jersey I don\'t see on the site?', a: 'Yes! The site shows just a sample of what\'s in store. Message us on WhatsApp with any club, country or design and we\'ll source or make it for you.' },
  { q: 'Do you sell footballs and boots too?', a: 'We do — training to match-grade footballs (sizes 3, 4, 5) and studs/turf boots built for real play. Ask us for current stock and prices.' },
  { q: 'How do I pay and receive my order?', a: 'Confirm everything over WhatsApp, pay via UPI/cash, then pick up in-store in Chennai or have it delivered. Simple.' },
];

export default function FAQ() {
  return (
    <section className="section faq" id="faq">
      <div className="container faq-grid">
        <div className="faq-head">
          <span className="eyebrow">Good to Know</span>
          <h2 className="section-title">Frequently <span className="g">asked</span></h2>
          <p className="section-lead">Still unsure about something? Just message us — we reply fast.</p>
        </div>
        <Accordion type="single" collapsible defaultValue="0" className="faq-list">
          {QA.map((item, i) => (
            <Reveal key={i} className="faq-item" delay={i * 0.05}>
              <AccordionItem value={String(i)} className="border-none">
                <AccordionTrigger className="faq-q hoverable">
                  <span>{item.q}</span>
                  <span className="faq-plus" aria-hidden>+</span>
                </AccordionTrigger>
                <AccordionContent className="faq-a">{item.a}</AccordionContent>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
