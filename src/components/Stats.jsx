import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

function CountUp({ to, suffix = '', prefix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    let startTs = null;
    const animate = (ts) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, to, duration]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 12000, suffix: '+', label: 'Happy Customers', icon: '😊', color: '#22c55e' },
  { value: 500, suffix: '+', label: 'Jersey Designs', icon: '🎨', color: '#60a5fa' },
  { value: 150, suffix: '+', label: 'Sports Clubs', icon: '🏆', color: '#f59e0b' },
  { value: 99, suffix: '%', label: 'Satisfaction Rate', icon: '⭐', color: '#ec4899' },
];

export default function Stats() {
  return (
    <section className="stats section-sm">
      <div className="container">
        <motion.div
          className="stats-inner"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {stats.map((s, i) => (
            <motion.div
              className="stat-item"
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              style={{}}
            >
              <div className="stat-icon" aria-hidden>{s.icon}</div>
              <div className="stat-value">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-bar" aria-hidden>
                <motion.div
                  className="stat-bar-fill"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: s.color }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
