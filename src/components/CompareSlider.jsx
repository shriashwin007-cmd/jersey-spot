import { useCallback, useRef, useState } from 'react';

// Generic drag-to-compare: `before` renders full-width underneath, `after`
// renders on top and gets clipped at `pos`%. Plain pointer events + React
// state — no Framer drag/WAAPI involved, so it's rock solid cross-browser.
export default function CompareSlider({ before, after, leftLabel, rightLabel, className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const r = ref.current.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(98, Math.max(2, pct)));
  }, []);

  const onDown = (e) => {
    dragging.current = true;
    setFromClientX(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setFromClientX(clientX);
  };
  const onUp = () => {
    dragging.current = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(2, p - 4));
    if (e.key === 'ArrowRight') setPos((p) => Math.min(98, p + 4));
  };

  return (
    <div
      ref={ref}
      className={`compare-slider ${className}`}
      onPointerDown={onDown}
      onTouchStart={onDown}
    >
      <div className="compare-layer compare-before">{before}</div>
      <div className="compare-layer compare-after" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {after}
      </div>

      {leftLabel && <span className="compare-badge compare-badge-l" style={{ opacity: pos > 14 ? 1 : 0 }}>{leftLabel}</span>}
      {rightLabel && <span className="compare-badge compare-badge-r" style={{ opacity: pos < 86 ? 1 : 0 }}>{rightLabel}</span>}

      <div
        className="compare-handle"
        style={{ left: `${pos}%` }}
        role="slider"
        tabIndex={0}
        aria-label="Drag to compare"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        onKeyDown={onKeyDown}
      >
        <span className="compare-handle-grip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 5 3 12l5 7M16 5l5 7-5 7" /></svg>
        </span>
      </div>
    </div>
  );
}
