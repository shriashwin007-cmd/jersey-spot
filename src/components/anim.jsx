import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, useScroll, useTransform, animate } from 'framer-motion';
import { useIsCompact } from '../hooks';

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

/* Continuous scroll-linked photo entrance: slides in from the left or right
   while rising up from below, then fades back out as it exits the top of
   the viewport — tracks scroll position the whole time it's on screen
   (not a one-shot "once" trigger like Reveal). Only ever animates x, y and
   opacity as independent motion values bound via `style` — never mixed
   with rotate — so it stays off the WAAPI-accelerated multi-transform path
   this codebase avoids (any CSS tilt on the child is a separate element's
   own `transform`, composed by plain CSS, not Framer). Works identically
   on mobile/tablet/desktop since it's driven by page scroll position, not
   viewport width. */
export function ScrollPhoto({ children, className, direction = 'left', style }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Deliberately BIG travel so the motion is unmistakable: each card flies in
  // from far off to the side + up from well below, sits centred while it's in
  // view, then flies back out the opposite way and fades — a full pass, not a
  // tiny nudge. A spring gives it weight instead of rigidly tracking scroll.
  const fromX = direction === 'left' ? -260 : 260;
  const xRaw = useTransform(scrollYProgress, [0, 0.42, 0.62, 1], [fromX, 0, 0, -fromX * 0.55]);
  const yRaw = useTransform(scrollYProgress, [0, 0.42, 0.62, 1], [160, 0, 0, -110]);
  const scaleRaw = useTransform(scrollYProgress, [0, 0.42, 0.62, 1], [0.7, 1, 1, 0.86]);
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.8, 1], [0, 1, 1, 0]);
  const spring = { stiffness: 140, damping: 28, mass: 0.5 };
  const x = useSpring(xRaw, spring);
  const y = useSpring(yRaw, spring);
  const scale = useSpring(scaleRaw, spring);
  return (
    <motion.div ref={ref} className={className} style={{ x, y, scale, opacity, ...style }}>
      {children}
    </motion.div>
  );
}

/* Scroll parallax: shifts a layer vertically as the page scrolls past it,
   so it drifts at a different speed than the content around it (depth).
   `mobile` / `desktop` are the total vertical travel in px across the
   element's full pass through the viewport — tuned separately because the
   same px travel reads much stronger on a short phone viewport than a tall
   desktop one, and heavy parallax on mobile is disorienting. A spring
   smooths the raw scroll value so it feels weighty, not twitchy. Only ever
   drives `y` via `style` (never combined with rotate) — safe under Safari
   WAAPI, same rule as the rest of this file. Respects reduced-motion. */
export function Parallax({ children, className, mobile = 24, desktop = 80, style }) {
  const ref = useRef(null);
  const compact = useIsCompact();
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const travel = reduce ? 0 : (compact ? mobile : desktop);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rawY = useTransform(scrollYProgress, [0, 1], [travel, -travel]);
  const y = useSpring(rawY, { stiffness: 120, damping: 30, mass: 0.6 });
  return (
    <motion.div ref={ref} className={className} style={{ y, ...style }}>
      {children}
    </motion.div>
  );
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
