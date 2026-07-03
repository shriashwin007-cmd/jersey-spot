import { motion } from 'framer-motion';
import { SplitText, Reveal } from './anim';
import { waLink } from '../config';

const STEPS = [
  { n: '01', icon: '💬', title: 'Message Us', desc: 'Ping us on WhatsApp with the kit, sport or team you have in mind — or a photo for reference.' },
  { n: '02', icon: '🎨', title: 'Personalise', desc: 'Pick embroidered or printed, choose sizes, add names, numbers and crests. We share a mockup.' },
  { n: '03', icon: '🧵', title: 'We Craft It', desc: 'Our Chennai workshop stitches and prints your order with match-grade materials — in 48 hours.' },
  { n: '04', icon: '⚽', title: 'Play With Pride', desc: 'Pick up in-store or get it delivered. Pull it on and own the pitch.' },
];

export default function HowItWorks() {
  return (
    <section className="section how" id="how-it-works">
      <div className="container">
        <div className="how-head">
          <span className="eyebrow">How It Works</span>
          <h2 className="section-title"><SplitText text="From idea to kickoff" /> <span className="g">in 4 steps</span></h2>
        </div>

        <div className="how-grid">
          {STEPS.map((s, i) => (
            <Reveal className="how-card hoverable" key={s.n} delay={i * 0.08}>
              <div className="how-line" aria-hidden />
              <div className="how-num">{s.n}</div>
              <div className="how-icon" aria-hidden>{s.icon}</div>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-desc">{s.desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="how-cta" delay={0.1}>
          <a href={waLink('Hi Jersey Spot! I want to start an order.')} target="_blank" rel="noreferrer" className="btn btn-gold hoverable">
            Start Your Order
          </a>
        </Reveal>
      </div>
    </section>
  );
}
