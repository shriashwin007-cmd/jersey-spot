import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, animate } from 'framer-motion';

/* Word-by-word reveal. Pass children as a string. Preserves markup via `parts`
   if you need coloured spans — here we keep it simple and split on spaces. */
export function SplitText({ text, className, as = 'span', delay = 0, stagger = 0.05 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const words = text.split(' ');
  const Tag = motion[as] || motion.span;
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="split-word" aria-hidden>
          <motion.span
            className="split-word-inner"
            initial={{ y: '110%' }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

/* Count-up number. `value` numeric, `suffix`/`prefix` optional strings. */
export function Counter({ value, suffix = '', prefix = '', duration = 1.6, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState('0');
  const mv = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        setDisplay(Number.isInteger(value) ? Math.round(v).toLocaleString('en-IN') : v.toFixed(1));
      },
    });
    return controls.stop;
  }, [inView, value, duration, mv]);

  return <span ref={ref} className={className}>{prefix}{display}{suffix}</span>;
}

/* Magnetic element — pulls toward the cursor on hover. */
export function Magnetic({ children, className, strength = 0.35, as = 'a', ...rest }) {
  const ref = useRef(null);
  const x = useSpringMV();
  const y = useSpringMV();
  const Tag = motion[as] || motion.a;
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <Tag ref={ref} className={className} style={{ x, y }} onMouseMove={onMove} onMouseLeave={reset} {...rest}>
      {children}
    </Tag>
  );
}
function useSpringMV() {
  const mv = useMotionValue(0);
  return useSpring(mv, { stiffness: 300, damping: 20, mass: 0.5 });
}

/* Generic reveal wrapper */
export function Reveal({ children, className, y = 34, delay = 0, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
