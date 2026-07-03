import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

// A single trailing dot that lags behind the previous point.
function Trail({ x, y, i }) {
  const tx = useSpring(x, { stiffness: 200 - i * 22, damping: 20, mass: 0.5 });
  const ty = useSpring(y, { stiffness: 200 - i * 22, damping: 20, mass: 0.5 });
  return (
    <motion.div
      className="cur-trail"
      style={{ x: tx, y: ty, translateX: '-50%', translateY: '-50%', opacity: 0.16 - i * 0.03, scale: 1 - i * 0.14 }}
      aria-hidden
    />
  );
}

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);
  const [mode, setMode] = useState('default'); // default | link | view | chat | design

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 260, damping: 24, mass: 0.5 });
  const ry = useSpring(my, { stiffness: 260, damping: 24, mass: 0.5 });

  useEffect(() => {
    const move = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!visible) setVisible(true);
    };
    const over = (e) => {
      const t = e.target;
      if (!t.closest) return setMode('default');
      const el = t.closest('[data-cursor], a, button, [role="button"], input, textarea, select, label, .hoverable');
      if (!el) return setMode('default');
      const explicit = el.getAttribute && el.getAttribute('data-cursor');
      if (explicit) return setMode(explicit);
      // infer from context
      if (el.closest('.gallery-card, .sell-card')) return setMode('view');
      if (/whatsapp|wa-fab|wa\.me/i.test(el.className + (el.href || ''))) return setMode('chat');
      setMode('link');
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

  const labelled = mode === 'view' || mode === 'chat' || mode === 'design';
  const label = mode === 'view' ? 'VIEW' : mode === 'chat' ? 'CHAT' : mode === 'design' ? 'DESIGN' : '';

  return (
    <>
      {/* trails */}
      {[0, 1, 2].map((i) => <Trail key={i} x={mx} y={my} i={i} />)}

      {/* ring / label capsule */}
      <motion.div
        className={`cur-ring cur-${mode}${down ? ' down' : ''}${labelled ? ' labelled' : ''}`}
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%', opacity: visible ? 1 : 0 }}
        aria-hidden
      >
        <AnimatePresence>
          {labelled && (
            <motion.span
              className="cur-label"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* precise dot */}
      <motion.div
        className="cur-dot"
        style={{ x: mx, y: my, translateX: '-50%', translateY: '-50%', opacity: visible && !labelled ? 1 : 0 }}
        animate={{ scale: down ? 0.6 : mode === 'link' ? 0.4 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        aria-hidden
      />
    </>
  );
}
