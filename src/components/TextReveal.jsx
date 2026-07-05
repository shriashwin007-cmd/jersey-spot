import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Word-by-word scroll reveal: a faint "ghost" copy of the line sits behind a
// solid copy whose opacity is driven per-word by scroll progress through this
// section — only `opacity` is animated (never transform keys), so it's safe
// under Safari's WAAPI same as the rest of the site's motion code.
function RevealWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="text-reveal-word">
      <span className="text-reveal-word-bg" aria-hidden="true">{children}</span>
      <motion.span style={{ opacity }} className="text-reveal-word-fg">{children}</motion.span>
    </span>
  );
}

export default function TextReveal({ text, className = '' }) {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const words = text.split(' ');

  return (
    <div ref={targetRef} className={`text-reveal${className ? ` ${className}` : ''}`}>
      <div className="text-reveal-sticky">
        <p className="text-reveal-p">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <RevealWord key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </RevealWord>
            );
          })}
        </p>
      </div>
    </div>
  );
}
