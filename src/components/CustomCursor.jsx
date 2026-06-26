import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const TRAIL_COUNT = 6;

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Ring springs behind with lag
  const springCfg = { stiffness: 120, damping: 16, mass: 0.8 };
  const ringX = useSpring(mouseX, springCfg);
  const ringY = useSpring(mouseY, springCfg);


  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    const checkHover = (e) => {
      const el = e.target;
      const isInteractive = el.closest('a, button, [role="button"], input, select, textarea, label, .slider3d-card');
      setHovering(!!isInteractive);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousemove', checkHover, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousemove', checkHover);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <>
      {/* Outer magnetic ring */}
      <motion.div
        className={`cursor-ring${hovering ? ' hovering' : ''}${clicking ? ' clicking' : ''}`}
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.2 } }}
        aria-hidden
      />

      {/* Trail dots */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          className="cursor-trail"
          style={{
            x: ringX,
            y: ringY,
            translateX: '-50%',
            translateY: '-50%',
            opacity: visible ? (0.18 - i * 0.025) : 0,
            scale: 1 - i * 0.12,
            filter: `blur(${i * 0.5}px)`,
            transitionDelay: `${i * 0.018}s`,
          }}
          aria-hidden
        />
      ))}

      {/* Football dot cursor */}
      <motion.div
        className="cursor-dot"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: visible ? 1 : 0,
          scale: clicking ? 0.7 : hovering ? 0.6 : 1,
        }}
        transition={{ scale: { type: 'spring', stiffness: 400, damping: 20 }, opacity: { duration: 0.15 } }}
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="white" stroke="#222" strokeWidth="4"/>
          {/* Pentagon patches */}
          <polygon points="50,6 62,18 57,33 43,33 38,18" fill="#111"/>
          <polygon points="87,34 94,49 85,62 71,57 70,40" fill="#111"/>
          <polygon points="78,78 63,82 52,71 60,57 75,57" fill="#111"/>
          <polygon points="22,78 25,63 40,57 48,71 37,82" fill="#111"/>
          <polygon points="13,34 30,40 29,57 15,62 6,49" fill="#111"/>
        </svg>
      </motion.div>
    </>
  );
}
