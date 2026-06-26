import { useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame, useMotionValue } from 'framer-motion';
import { wrap } from '@motionone/utils';

const ITEMS = [
  { text: 'Premium Jerseys', icon: '⚡' },
  { text: 'Custom 3D Design', icon: '🎨' },
  { text: 'Pro Quality Fabric', icon: '🏆' },
  { text: 'Fast Delivery', icon: '🚀' },
  { text: 'Football', icon: '⚽' },
  { text: 'Basketball', icon: '🏀' },
  { text: 'Cricket', icon: '🏏' },
  { text: '12,000+ Teams Served', icon: '✅' },
  { text: 'Worldwide Shipping', icon: '🌍' },
  { text: 'Bulk Discounts', icon: '💎' },
];

function MarqueeTrack({ baseVelocity = -4, items, delay = 0 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);
  const hasStarted = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => { hasStarted.current = true; }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  useAnimationFrame((_, delta) => {
    if (!hasStarted.current) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="marquee-track-wrap">
      <motion.div className="marquee-track" style={{ x }}>
        {repeated.map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-icon" aria-hidden>{item.icon}</span>
            {item.text}
            <span className="marquee-sep" aria-hidden>·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="marquee-outer" aria-hidden>
      <div className="marquee-fade-left" />
      <div className="marquee-fade-right" />
      <MarqueeTrack baseVelocity={-3.5} items={ITEMS} delay={0} />
      <MarqueeTrack baseVelocity={3} items={[...ITEMS].reverse()} delay={200} />
    </div>
  );
}
