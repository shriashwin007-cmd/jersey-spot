import { useCallback, useEffect, useRef, useState } from 'react';
import { useScroll } from 'framer-motion';

const FRAME_COUNT = 211;
const framePath = (n) => `/scrollvid/frame_${String(n).padStart(4, '0')}.jpg`;

// Classic scroll-scrubbed video: a tall wrapper creates scroll distance,
// a sticky canvas pins to fill the viewport, and the current scroll
// progress picks which pre-extracted frame to draw. All canvas drawing —
// no <video> element, no WAAPI, no autoplay policies to fight.
export default function ScrollVideo() {
  const wrapRef = useRef(null);
  const stickyRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const lastDrawnRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [loadedPct, setLoadedPct] = useState(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });

  const drawFrame = useCallback((idx) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[idx];
    const { w, h } = sizeRef.current;
    if (!canvas || !w || !h || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext('2d');
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    lastDrawnRef.current = idx;
  }, []);

  // Preload every frame; draw frame 0 the instant it's ready so the section
  // never shows blank, then keep filling in the rest in the background.
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    for (let n = 1; n <= FRAME_COUNT; n++) {
      const img = new Image();
      img.decoding = 'async';
      const idx = n - 1;
      img.onload = () => {
        if (cancelled) return;
        loaded += 1;
        if (idx === 0) { setReady(true); drawFrame(0); }
        if (loaded % 6 === 0 || loaded === FRAME_COUNT) setLoadedPct(Math.round((loaded / FRAME_COUNT) * 100));
      };
      img.src = framePath(n);
      framesRef.current[idx] = img;
    }
    return () => { cancelled = true; };
  }, [drawFrame]);

  // Size the canvas backing store to the sticky wrapper's real pixel size.
  useEffect(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;
    const ro = new ResizeObserver(([entry]) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(entry.contentRect.width * dpr);
      const h = Math.round(entry.contentRect.height * dpr);
      canvas.width = w;
      canvas.height = h;
      sizeRef.current = { w, h };
      drawFrame(lastDrawnRef.current);
    });
    ro.observe(sticky);
    return () => ro.disconnect();
  }, [drawFrame]);

  // Scroll position -> frame index. scrollYProgress is a MotionValue read via
  // .on('change', ...), the JS subscription path — never Element.animate().
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (p) => {
      const idx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(p * FRAME_COUNT)));
      drawFrame(idx);
    });
    return unsub;
  }, [scrollYProgress, drawFrame]);

  return (
    <section className="scrollvid-wrap" ref={wrapRef}>
      <div className="scrollvid-sticky" ref={stickyRef}>
        <canvas ref={canvasRef} className="scrollvid-canvas" aria-hidden />
        <div className="scrollvid-overlay" aria-hidden />

        {!ready && (
          <div className="scrollvid-loading" role="status" aria-live="polite">
            <div className="scrollvid-loading-track"><div className="scrollvid-loading-fill" style={{ width: `${loadedPct}%` }} /></div>
            <span>Loading {loadedPct}%</span>
          </div>
        )}

        <div className="container scrollvid-caption">
          <span className="eyebrow">Behind The Stitch</span>
          <h2 className="section-title">Every Kit, <span className="g">Crafted To Move</span></h2>
        </div>
      </div>
    </section>
  );
}
