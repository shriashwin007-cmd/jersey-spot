import { useCallback, useEffect, useState } from 'react';
import { motion, useSpring, useMotionTemplate, useMotionValue } from 'framer-motion';

// 3D "dome" coverflow: cards arranged along a shallow arc, spring-driven.
// Transform is composed into a single string via useMotionTemplate — never
// routed through Element.animate() (Safari WAAPI rejects independent
// transform keys like rotateY when framer accelerates them individually).
const SPRING = { stiffness: 240, damping: 26, mass: 0.8 };

function styleFor(offset) {
  const abs = Math.abs(offset);
  if (abs > 2) return null;
  const table = {
    x: [-460, -230, 0, 230, 460],
    y: [26, 8, -14, 8, 26],       // dome curvature — outer cards sit lower
    scale: [0.72, 0.86, 1, 0.86, 0.72],
    rotateY: [34, 18, 0, -18, -34],
    opacity: [0, 0.75, 1, 0.75, 0],
    z: [-260, -90, 0, -90, -260],
  };
  const idx = offset + 2;
  return {
    x: table.x[idx], y: table.y[idx], scale: table.scale[idx],
    rotateY: table.rotateY[idx], opacity: table.opacity[idx], z: table.z[idx],
  };
}

function DomeCard({ item, offset, onClick }) {
  const style = styleFor(offset);
  const x = useSpring(useMotionValue(style?.x ?? 0), SPRING);
  const y = useSpring(useMotionValue(style?.y ?? 0), SPRING);
  const scale = useSpring(useMotionValue(style?.scale ?? 0.7), SPRING);
  const rotateY = useSpring(useMotionValue(style?.rotateY ?? 0), SPRING);
  const opacity = useSpring(useMotionValue(style?.opacity ?? 0), SPRING);

  useEffect(() => {
    if (!style) return;
    x.set(style.x); y.set(style.y); scale.set(style.scale);
    rotateY.set(style.rotateY); opacity.set(style.opacity);
  }, [style?.x, style?.y, style?.scale, style?.rotateY, style?.opacity]); // eslint-disable-line react-hooks/exhaustive-deps

  const transform = useMotionTemplate`translate(-50%, -50%) translate(${x}px, ${y}px) perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`;

  const isCenter = offset === 0;
  return (
    <motion.button
      type="button"
      className={`dome-card hoverable${isCenter ? ' active' : ''}`}
      style={{ transform, opacity, zIndex: 10 - Math.abs(offset), pointerEvents: isCenter ? 'auto' : 'auto' }}
      onClick={onClick}
      aria-label={item.name}
    >
      <img src={item.img} alt={item.name} loading="lazy" width="320" height="320" />
      <span className="dome-card-tag">{item.tag}</span>
      {isCenter && <span className="dome-card-name">{item.name}</span>}
    </motion.button>
  );
}

export default function DomeSlider({ items, onSelect }) {
  const [active, setActive] = useState(0);
  const total = items.length;
  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);

  useEffect(() => {
    const t = setInterval(next, 3800);
    return () => clearInterval(t);
  }, [next]);

  const onDragEnd = (_, info) => {
    if (info.offset.x < -50) next();
    else if (info.offset.x > 50) prev();
  };

  return (
    <div className="dome-wrap">
      <motion.div className="dome-stage" style={{ perspective: 1200 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} onDragEnd={onDragEnd}>
        {items.map((item, i) => {
          const raw = ((i - active + total) % total + total) % total;
          const offset = raw > total / 2 ? raw - total : raw;
          if (Math.abs(offset) > 2) return null;
          return (
            <DomeCard
              key={item.img}
              item={item}
              offset={offset}
              onClick={() => (offset === 0 ? onSelect && onSelect(item) : setActive(i))}
            />
          );
        })}
      </motion.div>

      <div className="dome-controls">
        <button className="dome-btn hoverable" onClick={prev} aria-label="Previous">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18 9 12l6-6" /></svg>
        </button>
        <div className="dome-dots">
          {items.map((_, i) => (
            <button key={i} className={`dome-dot hoverable${i === active ? ' active' : ''}`} onClick={() => setActive(i)} aria-label={`Go to ${i + 1}`} />
          ))}
        </div>
        <button className="dome-btn hoverable" onClick={next} aria-label="Next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}
