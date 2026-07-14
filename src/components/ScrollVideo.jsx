import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { useIsCompact } from '../hooks';

// Frames were extracted from the source clip with ffmpeg at 30fps
// (`fps=30,scale=960:-1`) and uploaded to Cloudinary under a predictable
// public_id — jersey-catalog/scrollvid/frame_0001..0151 — so the delivery
// URL can be built directly instead of shipping a 151-entry lookup table.
const FRAME_COUNT = 151;
const BASE = 'https://res.cloudinary.com/hwm5h6fh/image/upload';
const frameUrl = (i, width) => `${BASE}/f_auto,q_auto,w_${width}/jersey-catalog/scrollvid/frame_${String(i).padStart(4, '0')}.jpg`;

export default function ScrollVideo() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const images = useRef(new Array(FRAME_COUNT + 1).fill(null));
  const currentFrame = useRef(1);
  const [ready, setReady] = useState(0); // frames loaded so far, drives the progress hint
  const compact = useIsCompact();
  const width = compact ? 640 : 1080;

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

  const draw = useCallback((idx) => {
    const canvas = canvasRef.current;
    const img = images.current[idx];
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }, []);

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
        if (idx === currentFrame.current) draw(idx);
        loadNext();
      };
      img.onerror = loadNext;
      img.src = frameUrl(idx, width);
    };
    for (let c = 0; c < 6; c++) loadNext();

    return () => { cancelled = true; };
  }, [width, draw]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const target = Math.min(FRAME_COUNT, Math.max(1, Math.round(p * (FRAME_COUNT - 1)) + 1));
    currentFrame.current = target;
    let idx = target;
    while (idx > 1 && !images.current[idx]) idx--; // hold last-known-good frame while scrubbing ahead of preload
    if (images.current[idx]) draw(idx);
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
        <canvas ref={canvasRef} className="scrollvid-canvas" />
        <div className="scrollvid-vignette" />
        {pct < 100 && (
          <div className="scrollvid-loadbar"><span style={{ width: `${pct}%` }} /></div>
        )}
      </div>
    </section>
  );
}
