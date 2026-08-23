import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DomeSlider from './DomeSlider';
import ProductModal from './ProductModal';
import { useCart } from '../cart';
import { CATEGORIES } from '../categories';
import { CLUBS } from '../clubs';
import { cld } from '../cloudinary';
import { SHOP, waLink } from '../config';

// Static fallback — shown until the admin catalog has real entries, or if
// the database isn't connected yet. The live site never breaks either way.
const FALLBACK_KITS = [
  { img: '/shop/shop-1.jpg', images: [], name: 'England Away', tag: 'Retro', category: 'embroidered', msg: 'Hi! I want the England Away jersey.' },
  { img: '/shop/shop-2.jpg', images: [], name: 'Real Madrid Away', tag: 'Pink Edition', category: 'embroidered', msg: 'Hi! I want the Real Madrid pink away jersey.' },
  { img: '/shop/shop-3.jpg', images: [], name: 'Portugal', tag: 'Black & Gold', category: 'embroidered', msg: 'Hi! I want the Portugal black & gold jersey.' },
  { img: '/shop/shop-4.jpg', images: [], name: 'Inter Miami', tag: 'Home', category: 'printed', msg: 'Hi! I want the Inter Miami home jersey.' },
  { img: '/shop/shop-5.jpg', images: [], name: 'Argentina', tag: '3-Star', category: 'printed', msg: 'Hi! I want the Argentina 3-star jersey.' },
  { img: '/shop/shop-6.jpg', images: [], name: 'Real Madrid', tag: 'Retro Blue', category: 'embroidered', msg: 'Hi! I want the Real Madrid retro blue jersey.' },
];

// Jersey types get their own dedicated catalogs; everything else stays behind
// the filter tabs below.
const SUB_CATEGORY = 'printed';      // "Sublimation Jersey"
const EMB_CATEGORY = 'embroidered';  // "Embroidery Jersey"
const GEAR_FILTERS = [
  { value: 'all', label: 'All' },
  ...CATEGORIES.filter((c) => c.value !== SUB_CATEGORY && c.value !== EMB_CATEGORY),
];

// One auto-categorized catalog block: whatever the admin uploads with this
// jersey type lands here — no manual assignment needed anywhere.
function CatalogSection({ id, eyebrow, title, lead, emptyText, items, clubFilter, onSelect, onAddToCart }) {
  return (
    <div className="catalog-section" id={id}>
      <motion.div
        className="gallery-head"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
        <p className="section-lead">{lead}</p>
      </motion.div>

      {items.length === 0 ? (
        <div className="gallery-empty">
          {clubFilter ? `No ${clubFilter} kits here right now.` : emptyText}
        </div>
      ) : (
        <DomeSlider
          key={`sub-${clubFilter || 'all'}`}
          items={items}
          onSelect={onSelect}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}

export default function Gallery() {
  const [kits, setKits] = useState(FALLBACK_KITS);
  const [gearFilter, setGearFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState(null);
  const [preview, setPreview] = useState(null);
  const { addItem } = useCart();

  const enquire = (item, size = '') => {
    if (item.id) {
      fetch('/api/track-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.id }),
      }).catch(() => {});
    }
    const text = size && item.sizesEnabled ? `${item.msg} My size: ${size}.` : item.msg;
    window.open(waLink(text), '_blank', 'noopener');
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.products?.length) return;
        setKits(
          data.products
            .filter((p) => p.in_stock)
            .map((p) => ({
              id: p.id,
              img: p.image_url,
              images: p.images || [],
              name: p.name,
              tag: p.tag,
              category: p.category,
              club: p.club,
              price: p.price,
              buyOnline: p.buy_online,
              sizesEnabled: !!p.sizes_enabled && Array.isArray(p.sizes) && p.sizes.length > 0,
              sizes: p.sizes || [],
              msg: `Hi! I want the ${p.name}${p.tag ? ` (${p.tag})` : ''} jersey.`,
            }))
        );
      })
      .catch(() => {}); // keep the static fallback on any error
    return () => { cancelled = true; };
  }, []);

  const clubMatched = useMemo(
    () => kits.filter((k) => !clubFilter || k.club === clubFilter),
    [kits, clubFilter]
  );

  const addToCartOrOpen = (item) => {
    // Size-enabled products must go through the modal so the
    // customer picks a size first.
    if (item.sizesEnabled) { setPreview(item); return; }
    addItem({ id: item.id, name: item.name, price: item.price, img: item.img });
  };

  const subItems = useMemo(() => clubMatched.filter((k) => k.category === SUB_CATEGORY), [clubMatched]);
  const embItems = useMemo(() => clubMatched.filter((k) => k.category === EMB_CATEGORY), [clubMatched]);
  const gearItems = useMemo(
    () => clubMatched.filter(
      (k) => k.category !== SUB_CATEGORY && k.category !== EMB_CATEGORY &&
        (gearFilter === 'all' || k.category === gearFilter)
    ),
    [clubMatched, gearFilter]
  );

  return (
    <>
      <section className="section club-showcase" id="clubs">
        <div className="club-showcase-glow" aria-hidden />
        <div className="container">
          <motion.div
            className="club-showcase-head"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">Pick Your Side</span>
            <h2 className="section-title">Shop by <span className="g">club</span></h2>
            <p className="section-lead">Tap a crest to jump straight to that club's kits.</p>
          </motion.div>

          <div className="club-showcase-grid" role="tablist" aria-label="Filter by club">
            {CLUBS.map((c, i) => {
              const active = clubFilter === c.name;
              return (
                <motion.button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  className={`club-card hoverable${active ? ' active' : ''}`}
                  onClick={() => {
                    setClubFilter((cur) => (cur === c.name ? null : c.name));
                    document.getElementById('kits')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  initial={{ opacity: 0, y: 24, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: (i % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <img src={cld(c.url, 'f_auto,q_auto,w_260')} alt="" loading="lazy" />
                  <span className="club-card-name">{c.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section gallery" id="kits">
      <div className="container">
        <motion.div
          className="gallery-head"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">In Store Now</span>
          <h2 className="section-title">Two ways to get <span className="g">kitted</span></h2>
          <p className="section-lead">
            Every kit lands in its catalog automatically by jersey type. See more on{' '}
            <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="gallery-ig hoverable">{SHOP.instagramHandle}</a>
            {' '}— or message us for a kit you don't see here.
          </p>
        </motion.div>

        <AnimatePresence>
          {clubFilter && (
            <motion.div
              className="gallery-active-club"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              Showing <strong>{clubFilter}</strong>
              <button type="button" className="hoverable" onClick={() => setClubFilter(null)}>Clear ✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <CatalogSection
          id="catalog-sublimation"
          eyebrow="Sublimation Jersey Catalog"
          title={<>Sublimation <span className="g">jerseys</span></>}
          lead="Crisp sublimation & heat-press printing — lightweight, breathable and ready for match day."
          emptyText="No sublimation jerseys yet — message us, we've probably still got one."
          items={subItems}
          clubFilter={clubFilter}
          onSelect={(item) => setPreview(item)}
          onAddToCart={addToCartOrOpen}
        />

        <CatalogSection
          id="catalog-embroidery"
          eyebrow="Embroidery Jersey Catalog"
          title={<>Embroidery <span className="g">jerseys</span></>}
          lead="Names, numbers and crests stitched in-house for a premium, pro-club finish."
          emptyText="No embroidery jerseys yet — message us, we've probably still got one."
          items={embItems}
          clubFilter={clubFilter}
          onSelect={(item) => setPreview(item)}
          onAddToCart={addToCartOrOpen}
        />

        <div className="catalog-section" id="catalog-gear">
          <motion.div
            className="gallery-head"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">Complete The Kit</span>
            <h2 className="section-title">Everything <span className="g">else</span> on the wall</h2>
            <p className="section-lead">Sets, boots, balls and all the extras to round out your kit.</p>
          </motion.div>

          {GEAR_FILTERS.length > 2 && (
            <div className="gallery-filters" role="tablist" aria-label="Filter gear by category">
              {GEAR_FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={gearFilter === f.value}
                  className={`gallery-filter-btn hoverable${gearFilter === f.value ? ' active' : ''}`}
                  onClick={() => setGearFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {gearItems.length === 0 ? (
            <div className="gallery-empty">
              {clubFilter ? `No ${clubFilter} gear here right now.` : 'Nothing in this category yet — message us, we\'ve probably still got it.'}
            </div>
          ) : (
            <DomeSlider
              key={`gear-${clubFilter || 'all'}-${gearFilter}`}
              items={gearItems}
              onSelect={(item) => setPreview(item)}
              onAddToCart={addToCartOrOpen}
            />
          )}
        </div>

        <motion.div
          className="gallery-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <a href={waLink('Hi Jersey Spot! Can you show me more kits you have in stock?')} target="_blank" rel="noreferrer" className="btn btn-whatsapp hoverable">
            See more on WhatsApp
          </a>
        </motion.div>
      </div>

      <ProductModal
        product={preview}
        onClose={() => setPreview(null)}
        onAddToCart={(item, size) => addItem({ id: item.id, name: item.name, price: item.price, img: item.img }, size)}
        onEnquire={(item) => enquire(item)}
      />
      </section>
    </>
  );
}
