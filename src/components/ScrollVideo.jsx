import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useIsCompact } from '../hooks';

// Frames were extracted from the source clip with ffmpeg at 30fps
// (`fps=30,scale=960:-1`) and uploaded to Cloudinary under a predictable
// public_id — jersey-catalog/scrollvid/frame_0001..0151 — so the delivery
// URL can be built directly instead of shipping a 151-entry lookup table.
const FRAME_COUNT = 151;
const BASE = 'https://res.cloudinary.com/hwm5h6fh/image/upload';
const frameUrl = (i, width) => `${BASE}/f_auto,q_auto,w_${width}/jersey-catalog/scrollvid/frame_${String(i).padStart(4, '0')}.jpg`;

const LINES = [
  { big: 'EPIC', small: 'FOOTBALL', range: [0, 0.06, 0.24, 0.31] },
  { big: 'EVERY SPRINT.', small: 'EVERY GOAL.', range: [0.35, 0.41, 0.59, 0.66] },
  { big: 'WEAR YOUR', small: 'PRIDE.', range: [0.7, 0.76, 0.94, 1] },
];

// One phrase, flipped into view in 3D (rotateX + depth) and flipped back out
// as the scroll passes its window — a slide-deck that lives entirely on the
// scrollbar instead of a timer.
function TextSlide({ scrollYProgress, range, big, small }) {
  const [s0, s1, e1, e0] = range;
  const rotateX = useTransform(scrollYProgress, [s0, s1, e1, e0], [78, 0, 0, -78]);
  const opacity = useTransform(scrollYProgress, [s0, s1, e1, e0], [0, 1, 1, 0]);
  const z = useTransform(scrollYProgress, [s0, s1, e1, e0], [-260, 0, 0, -260]);
  const y = useTransform(scrollYProgress, [s0, s1, e1, e0], [70, 0, 0, -70]);
  return (
    <motion.div className="scrollvid-line" style={{ rotateX, opacity, z, y }}>
      <span className="scrollvid-line-big">{big}</span>
      <span className="scrollvid-line-small">{small}</span>
    </motion.div>
  );
}

export default function ScrollVideo() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const images = useRef(new Array(FRAME_COUNT + 2).fill(null));
  const currentFrame = useRef(1);
  const [ready, setReady] = useState(0); // frames loaded so far, drives the progress hint
  const compact = useIsCompact();
  const width = compact ? 640 : 1080;

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);

  // On a tall phone viewport, a true "cover" fit against a wide landscape
  // frame crops down to almost one face — fine on desktop's wide canvas, but
  // on mobile we fit to width instead so the whole composition stays in
  // frame, letterboxed top/bottom into the section's black background.
  const drawCover = useCallback((ctx, img, w, h, alpha, fitWidth) => {
    const scale = fitWidth ? w / img.width : Math.max(w / img.width, h / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  }, []);

  // Draws a fractional frame position by crossfading the two nearest loaded
  // frames — with only 151 stills spread across a much longer scroll now,
  // a hard frame-snap would look stepped, so this dissolves between them for
  // a genuinely smooth scrub instead of a slideshow.
  const draw = useCallback((floatIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const clamped = Math.min(FRAME_COUNT, Math.max(1, floatIdx));
    let lo = Math.floor(clamped);
    const frac = clamped - lo;
    let hi = Math.min(FRAME_COUNT, lo + 1);
    while (lo > 1 && !images.current[lo]) lo--; // hold last-known-good while preload catches up
    if (!images.current[hi]) hi = lo;

    const loImg = images.current[lo];
    if (!loImg) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawCover(ctx, loImg, w, h, 1, compact);
    const hiImg = images.current[hi];
    if (hiImg && hi !== lo && frac > 0.01) drawCover(ctx, hiImg, w, h, frac, compact);
  }, [drawCover, compact]);

  // Preload the sequence with 6 loaders running at once, each chaining to the
  // next frame as it finishes — fast enough to get moving immediately without
  // firing 151 requests in one burst.
  useEffect(() => {
    let cancelled = false;
    let nextToQueue = 1;
    let loadedCount = 0;

    const loadNext = () => {
      if (cancelled || nextToQueue > FRAME_COUNT) return;
      const idx = nextToQueue++;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        images.current[idx] = img;
        loadedCount++;
        setReady(loadedCount);
        if (Math.abs(idx - currentFrame.current) < 1.5) draw(currentFrame.current);
        loadNext();
      };
      img.onerror = loadNext;
      img.src = frameUrl(idx, width);
    };
    for (let c = 0; c < 6; c++) loadNext();

    return () => { cancelled = true; };
  }, [width, draw]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const floatIdx = 1 + p * (FRAME_COUNT - 1);
    currentFrame.current = floatIdx;
    draw(floatIdx);
  });

  useEffect(() => {
    const onResize = () => draw(currentFrame.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  const pct = Math.round((ready / FRAME_COUNT) * 100);

  return (
    <section className="scrollvid-wrap" ref={wrapRef} aria-hidden>
      <div className="scrollvid-sticky">
        <motion.canvas ref={canvasRef} className="scrollvid-canvas" style={{ scale: canvasScale }} />
        <div className="scrollvid-vignette" />

        <div className="scrollvid-textstage">
          {LINES.map((l) => (
            <TextSlide key={l.big} scrollYProgress={scrollYProgress} range={l.range} big={l.big} small={l.small} />
          ))}
        </div>

        {pct < 100 && (
          <div className="scrollvid-loadbar"><span style={{ width: `${pct}%` }} /></div>
        )}
      </div>
    </section>
  );
}
