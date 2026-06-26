import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import JerseySVG from './JerseySVG';

const products = [
  { id:1, name:'Elite Pro', team:'FC Champions', price:89, original:110, primary:'#15803D', secondary:'#bbf7d0', number:'10', cat:'football', badge:'Best Seller', pattern:'solid' },
  { id:2, name:'Thunder Strike', team:'Thunder FC', price:79, original:99, primary:'#1E3A5F', secondary:'#F59E0B', number:'7', cat:'football', badge:'New', pattern:'stripes' },
  { id:3, name:'Inferno', team:'Fire United', price:85, original:105, primary:'#991B1B', secondary:'#FCA5A5', number:'9', cat:'football', badge:'Hot', pattern:'solid' },
  { id:4, name:'Ice Cold', team:'Arctic FC', price:75, original:95, primary:'#0C4A6E', secondary:'#7DD3FC', number:'1', cat:'football', badge:null, pattern:'gradient' },
  { id:5, name:'Royal Guard', team:'Kings XI', price:92, original:115, primary:'#1D4ED8', secondary:'#BFDBFE', number:'11', cat:'basketball', badge:'Premium', pattern:'solid' },
  { id:6, name:'Shadow Ops', team:'Dark Side', price:88, original:109, primary:'#111827', secondary:'#22C55E', number:'23', cat:'basketball', badge:'Limited', pattern:'stripes' },
  { id:7, name:'Violet Viper', team:'Purple Reign', price:82, original:102, primary:'#6D28D9', secondary:'#DDD6FE', number:'3', cat:'basketball', badge:null, pattern:'solid' },
  { id:8, name:'Citrus Burst', team:'Sunny FC', price:76, original:96, primary:'#92400E', secondary:'#FDE68A', number:'8', cat:'cricket', badge:'New', pattern:'gradient' },
  { id:9, name:'Rose Gold', team:'Elite XI', price:99, original:129, primary:'#831843', secondary:'#FBCFE8', number:'6', cat:'cricket', badge:'Luxury', pattern:'solid' },
  { id:10, name:'Midnight Run', team:'Night Hawks', price:80, original:100, primary:'#1F2937', secondary:'#60A5FA', number:'4', cat:'football', badge:null, pattern:'stripes' },
  { id:11, name:'Green Machine', team:'Eco FC', price:74, original:92, primary:'#065F46', secondary:'#6EE7B7', number:'5', cat:'football', badge:'Eco', pattern:'solid' },
  { id:12, name:'Scarlet Storm', team:'Red Army', price:87, original:108, primary:'#7F1D1D', secondary:'#FCA5A5', number:'12', cat:'cricket', badge:null, pattern:'gradient' },
];

const categories = ['all', 'football', 'basketball', 'cricket'];

function TiltCard({ children, style }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 300, damping: 25 });

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export default function Collections({ onAddToCart }) {
  const [filter, setFilter] = useState('all');
  const [wishlist, setWishlist] = useState(new Set());
  const [added, setAdded] = useState(null);

  const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter);

  const toggleWish = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = (p) => {
    onAddToCart({ name: p.name, team: p.team, price: p.price, primary: p.primary, secondary: p.secondary, number: p.number });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <section className="section" id="collections">
      <div className="container">
        <div className="collections-header">
          <div>
            <div className="section-label">Collections</div>
            <h2 className="section-title">
              Find Your <span>Perfect</span><br />
              <em>Jersey</em>
            </h2>
          </div>
          <div className="filter-tabs" role="tablist" aria-label="Filter jerseys by sport">
            {categories.map(c => (
              <motion.button
                key={c}
                className={`filter-tab${filter === c ? ' active' : ''}`}
                onClick={() => setFilter(c)}
                role="tab"
                aria-selected={filter === c}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div className="products-grid" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.article
                key={p.id}
                className="product-card"
                layout
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.84, y: -10 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                data-jersey-glow={p.primary}
              >
                <TiltCard>
                  <div className="product-card-img">
                    <div className="product-img-glow" aria-hidden />
                    <motion.button
                      className={`product-wishlist${wishlist.has(p.id) ? ' active' : ''}`}
                      onClick={() => toggleWish(p.id)}
                      aria-label={wishlist.has(p.id) ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlist.has(p.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                    </motion.button>
                    {p.badge && (
                      <motion.span
                        className="badge badge-green"
                        style={{ position:'absolute', top:12, left:12, zIndex:2 }}
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: i * 0.04 + 0.15 }}
                      >
                        {p.badge}
                      </motion.span>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: 2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    >
                      <JerseySVG primary={p.primary} secondary={p.secondary} number={p.number} name={p.team} size={160} pattern={p.pattern} />
                    </motion.div>
                  </div>

                  <div className="product-card-body">
                    <div className="product-name">{p.name}</div>
                    <div className="product-team">{p.team}</div>
                    <div className="product-colors" aria-label="Available colors">
                      {[p.primary, p.secondary, '#374151'].map((c, ci) => (
                        <motion.div
                          key={ci}
                          className="color-dot"
                          style={{ background: c }}
                          title={c}
                          role="img"
                          aria-label={`Color option ${ci + 1}`}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                        />
                      ))}
                    </div>
                    <div className="product-footer">
                      <div className="product-price">
                        ${p.price}
                        <span className="original">${p.original}</span>
                        <span className="discount-pct">{Math.round((1 - p.price / p.original) * 100)}% off</span>
                      </div>
                      <motion.button
                        className={`product-add-btn${added === p.id ? ' added' : ''}`}
                        onClick={() => handleAdd(p)}
                        whileTap={{ scale: 0.84 }}
                        whileHover={{ scale: 1.12 }}
                        aria-label={`Add ${p.name} to cart`}
                      >
                        <AnimatePresence mode="wait">
                          {added === p.id ? (
                            <motion.svg
                              key="check"
                              width="16" height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <polyline points="20 6 9 17 4 12"/>
                            </motion.svg>
                          ) : (
                            <motion.svg
                              key="plus"
                              width="16" height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>
                </TiltCard>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="text-center"
          style={{ marginTop: 48 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.a
            href="#"
            className="btn-ghost"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            View All Jerseys
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
