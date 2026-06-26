import { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionTemplate } from 'framer-motion';
import JerseySVG from './JerseySVG';

const SPRING = { stiffness: 260, damping: 28, mass: 0.9 };

function SliderCard({ item, style, centeredOffset, active, i, setActive, onAddToCart }) {
  // Spring-driven motion values — applied via a transform STRING so framer
  // never routes them through Element.animate() (Safari WAAPI crashes on rotateY).
  const x = useSpring(style.x, SPRING);
  const scale = useSpring(style.scale, SPRING);
  const rotateY = useSpring(style.rotateY, SPRING);
  const opacity = useSpring(style.opacity, SPRING);

  useEffect(() => {
    x.set(style.x);
    scale.set(style.scale);
    rotateY.set(style.rotateY);
    opacity.set(style.opacity);
  }, [style.x, style.scale, style.rotateY, style.opacity, x, scale, rotateY, opacity]);

  const transform = useMotionTemplate`translate(-50%, -50%) translateX(${x}px) scale(${scale}) perspective(1200px) rotateY(${rotateY}deg)`;

  return (
    <motion.div
      className={`slider3d-card${centeredOffset === 0 ? ' active' : ''}`}
      style={{
        zIndex: style.zIndex,
        pointerEvents: centeredOffset === 0 ? 'auto' : 'none',
        top: '50%',
        left: '50%',
        transform,
        opacity,
      }}
      onClick={() => centeredOffset !== 0 && setActive(i)}
    >
      <div className="slider3d-img">
        <div className="slider3d-img-glow" />
        <motion.div
          whileHover={centeredOffset === 0 ? { scale: 1.06, rotate: 2 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <JerseySVG
            primary={item.primary}
            secondary={item.secondary}
            number={item.number}
            name={item.team}
            size={160}
            pattern={item.pattern}
          />
        </motion.div>
      </div>
      <div className="slider3d-body">
        <div className="slider3d-name">{item.name}</div>
        <div className="slider3d-team">{item.team}</div>
        <div className="slider3d-footer">
          <div className="slider3d-price">${item.price}</div>
          {item.badge && <span className="slider3d-badge">{item.badge}</span>}
        </div>
        {centeredOffset === 0 && (
          <motion.button
            className="btn-primary"
            style={{ width: '100%', marginTop: 14, justifyContent: 'center', fontSize: 13, padding: '10px 16px' }}
            onClick={() => onAddToCart({ name: item.name, team: item.team, price: item.price, primary: item.primary, secondary: item.secondary, number: item.number })}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add to Cart
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

const featured = [
  { id:1, name:'Elite Pro', team:'FC Champions', price:89, primary:'#c8960a', secondary:'#f5b800', number:'10', badge:'Best Seller', pattern:'gradient' },
  { id:2, name:'Inferno', team:'Fire United', price:85, primary:'#991B1B', secondary:'#FCA5A5', number:'9', badge:'Hot', pattern:'solid' },
  { id:3, name:'Royal Guard', team:'Kings XI', price:92, primary:'#1D4ED8', secondary:'#BFDBFE', number:'11', badge:'Premium', pattern:'solid' },
  { id:4, name:'Shadow Ops', team:'Dark Side', price:88, primary:'#111827', secondary:'#22C55E', number:'23', badge:'Limited', pattern:'stripes' },
  { id:5, name:'Rose Gold', team:'Elite XI', price:99, primary:'#831843', secondary:'#FBCFE8', number:'6', badge:'Luxury', pattern:'solid' },
  { id:6, name:'Thunder Strike', team:'Thunder FC', price:79, primary:'#1E3A5F', secondary:'#F59E0B', number:'7', badge:'New', pattern:'stripes' },
  { id:7, name:'Green Machine', team:'Eco FC', price:74, primary:'#065F46', secondary:'#6EE7B7', number:'5', badge:'Eco', pattern:'solid' },
];

function getCardStyle(offset) {
  const abs = Math.abs(offset);
  if (abs > 2) return null;

  const zTable   = [0,   0,   1,   0,   0];
  const xTable   = [-560, -260, 0,  260, 560];
  const scTable  = [0.62, 0.78, 1, 0.78, 0.62];
  const ryTable  = [-58,  -38, 0,  38,  58];
  const opTable  = [0.35, 0.6, 1,  0.6, 0.35];
  const ziTable  = [1,    2,   5,   2,    1];
  const idx = offset + 2;

  return {
    x: xTable[idx],
    scale: scTable[idx],
    rotateY: ryTable[idx],
    opacity: opTable[idx],
    zIndex: ziTable[idx],
    z: zTable[idx] * -180,
  };
}

export default function Slider3D({ onAddToCart }) {
  const [active, setActive] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const total = featured.length;

  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);
  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(next, 3500);
    return () => clearInterval(t);
  }, [next]);

  const handleDragEnd = (e, info) => {
    const dx = info.offset.x;
    if (dx < -60) next();
    else if (dx > 60) prev();
  };

  return (
    <div className="section slider3d-section" id="featured">
      <div className="container">
        <div className="slider3d-header">
          <div className="section-label">Featured</div>
          <h2 className="section-title">
            Trending <span>Jerseys</span>
          </h2>
        </div>

        <motion.div
          className="slider3d-wrap"
          style={{ perspective: 1200 }}
          onDragStart={(e, i) => setDragStart(i.point.x)}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
        >
          <div className="slider3d-track">
            {featured.map((item, i) => {
              const offset = ((i - active + total) % total + total) % total;
              const centeredOffset = offset > total / 2 ? offset - total : offset;
              const style = getCardStyle(centeredOffset);
              if (!style) return null;

              return (
                <SliderCard
                  key={item.id}
                  item={item}
                  style={style}
                  centeredOffset={centeredOffset}
                  active={active}
                  i={i}
                  setActive={setActive}
                  onAddToCart={onAddToCart}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Controls */}
        <div className="slider3d-controls">
          <motion.button className="slider3d-btn" onClick={prev} aria-label="Previous" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </motion.button>

          <div className="slider3d-dots" aria-label="Slider navigation">
            {featured.map((_, i) => (
              <motion.button
                key={i}
                className={`slider3d-dot${i === active ? ' active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                animate={{ width: i === active ? 20 : 6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              />
            ))}
          </div>

          <motion.button className="slider3d-btn" onClick={next} aria-label="Next" whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
