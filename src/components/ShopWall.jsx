import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Reveal } from './anim';
import { cld } from '../cloudinary';

// Real photos from inside/outside the Chennai store. Cloudinary transforms
// keep the grid thumbnails light; the lightbox re-requests a larger size.

const PHOTOS = [
  { id: 'neydayneymar', caption: 'Neymar Wall', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697715/WhatsApp_Image_2026-07-10_at_1.57.14_PM_vtoiss.jpg', alt: 'Neymar poster wall inside Jersey Spot Chennai', tall: true },
  { id: 'ronaldocorner', caption: 'Ronaldo Corner', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697714/WhatsApp_Image_2026-07-10_at_1.57.12_PM-2_gon2cd.jpg', alt: 'Ronaldo posters on the shop wall' },
  { id: 'storesign', caption: 'Our Signage', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697714/WhatsApp_Image_2026-07-10_at_1.57.12_PM_c6geip.jpg', alt: 'Jersey Spot Chennai signage above the entrance', tall: true },
  { id: 'ronaldobig', caption: 'Tribute Print', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697714/WhatsApp_Image_2026-07-10_at_1.57.12_PM-3_czvjyt.jpg', alt: 'Ronaldo tribute poster in-store' },
  { id: 'manutdflag', caption: 'Red Devils', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697714/WhatsApp_Image_2026-07-10_at_1.57.09_PM_q7yslz.jpg', alt: 'Manchester United flag on display' },
  { id: 'storefront', caption: 'Manali, Chennai', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697714/WhatsApp_Image_2026-07-10_at_1.57.09_PM-2_z8yjiv.jpg', alt: 'Jersey Spot Chennai storefront in Manali', tall: true },
  { id: 'ronaldotapestry', caption: 'CR7 Art', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697714/WhatsApp_Image_2026-07-10_at_1.57.11_PM_x5gh8d.jpg', alt: 'Cristiano Ronaldo wall art' },
  { id: 'ronaldofanwall', caption: 'Fan Wall', url: 'https://res.cloudinary.com/hwm5h6fh/image/upload/v1783697713/WhatsApp_Image_2026-07-10_at_1.57.14_PM-2_fxtt60.jpg', alt: 'Our Ronaldo fan wall' },
];

const TILTS = [-4, 3, -2, 5, -3, 2, -5, 4];

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6" />
    </svg>
  );
}

export default function ShopWall() {
  const [openIdx, setOpenIdx] = useState(null);
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenIdx(null);
      if (e.key === 'ArrowRight') setOpenIdx((i) => (i + 1) % PHOTOS.length);
      if (e.key === 'ArrowLeft') setOpenIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIdx]);

  // Track which card is centered as the user swipes, so the dots + prev/next
  // buttons below the strip stay in sync with a manual finger-drag too.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const items = [...track.children];
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closest = 0, closestDist = Infinity;
        items.forEach((el, i) => {
          const dist = Math.abs((el.offsetLeft + el.offsetWidth / 2) - trackCenter);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        setActive(closest);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => { track.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = (i + PHOTOS.length) % PHOTOS.length;
    track.children[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <section className="section shopwall" id="shop-wall">
      <div className="container">
        <Reveal className="shopwall-head">
          <span className="eyebrow">Inside The Shop</span>
          <h2 className="section-title">Our wall says <span className="g">it all</span></h2>
          <p className="section-lead">
            Real photos from our Chennai store — the players we love, and the spot they hang out on our wall. Tap any photo for a closer look.
          </p>
        </Reveal>

        <div className="shopwall-grid" ref={trackRef}>
          {PHOTOS.map((p, i) => (
            <Reveal key={p.id} className={`shopwall-item${p.tall ? ' tall' : ''}`} delay={(i % 4) * 0.06}>
              <div className="shopwall-card" style={{ '--tilt': `${TILTS[i % TILTS.length]}deg` }}>
                <button
                  type="button"
                  className="shopwall-card-tap"
                  onClick={() => setOpenIdx(i)}
                  aria-label={`Open photo: ${p.alt}`}
                >
                  <img src={cld(p.url, 'f_auto,q_auto,w_700')} alt={p.alt} loading="lazy" />
                  <span className="shopwall-card-scrim" aria-hidden />
                  <span className="shopwall-card-caption">{p.caption}</span>
                </button>
                <button
                  type="button"
                  className="shopwall-card-expand"
                  onClick={() => setOpenIdx(i)}
                  aria-label={`Expand photo: ${p.alt}`}
                  tabIndex={-1}
                >
                  <ExpandIcon />
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="shopwall-controls">
          <button type="button" className="shopwall-arrow" onClick={() => goTo(active - 1)} aria-label="Previous photo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18 9 12l6-6" /></svg>
          </button>
          <div className="shopwall-dots">
            {PHOTOS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`shopwall-dot${i === active ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className="shopwall-arrow" onClick={() => goTo(active + 1)} aria-label="Next photo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openIdx !== null && (
          <motion.div
            className="shopwall-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpenIdx(null)}
          >
            <button type="button" className="shopwall-lightbox-close" onClick={() => setOpenIdx(null)} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <button
              type="button"
              className="shopwall-lightbox-nav prev"
              onClick={(e) => { e.stopPropagation(); setOpenIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length); }}
              aria-label="Previous photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18 9 12l6-6" /></svg>
            </button>
            <motion.img
              key={PHOTOS[openIdx].id}
              src={cld(PHOTOS[openIdx].url, 'f_auto,q_auto,w_1600')}
              alt={PHOTOS[openIdx].alt}
              className="shopwall-lightbox-img"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="shopwall-lightbox-nav next"
              onClick={(e) => { e.stopPropagation(); setOpenIdx((i) => (i + 1) % PHOTOS.length); }}
              aria-label="Next photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
