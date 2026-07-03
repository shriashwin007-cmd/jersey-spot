import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 200, damping: 22, mass: 0.6 });
  const ry = useSpring(my, { stiffness: 200, damping: 22, mass: 0.6 });

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
      {/* trailing gold ring */}
      <motion.div
        className={`cur-ring${hover ? ' hover' : ''}${down ? ' down' : ''}`}
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%', opacity: visible ? 1 : 0 }}
        aria-hidden
      />
      {/* precise dot */}
      <motion.div
        className="cur-dot"
        style={{ x: mx, y: my, translateX: '-50%', translateY: '-50%', opacity: visible ? 1 : 0 }}
        animate={{ scale: down ? 0.6 : hover ? 0.4 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        aria-hidden
      />
    </>
  );
}
