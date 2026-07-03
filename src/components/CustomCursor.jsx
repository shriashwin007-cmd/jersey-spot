import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Minimal, premium cursor: a small dot that leads, and a soft ring that lags
// and blends with the page (mix-blend-mode: difference) so it stays visible
// on both light and dark content without any gimmicky labels.
export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 340, damping: 30, mass: 0.4 });
  const ry = useSpring(my, { stiffness: 340, damping: 30, mass: 0.4 });

  useEffect(() => {
    const move = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const over = (e) => {
      const t = e.target;
      setHover(!!(t.closest && t.closest('a, button, [role="button"], input, textarea, select, label, .hoverable')));
    };
    const leave = () => setVisible(false);
    const dn = () => setDown(true);
    const up = () => setDown(false);

    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over, { passive: true });
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mousedown', dn);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mousedown', dn);
      document.removeEventListener('mouseup', up);
    };
  }, [mx, my, visible]);

  return (
    <>
      <motion.div
        className="cur-ring"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%', opacity: visible ? 1 : 0 }}
        animate={{ scale: down ? 0.7 : hover ? 1.8 : 1 }}
        transition={{ scale: { type: 'spring', stiffness: 340, damping: 24 } }}
        aria-hidden
      />
      <motion.div
        className="cur-dot"
        style={{ x: mx, y: my, translateX: '-50%', translateY: '-50%', opacity: visible ? 1 : 0 }}
        animate={{ scale: down ? 0.5 : hover ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        aria-hidden
      />
    </>
  );
}
