import { motion } from 'framer-motion';

const GALLERY = [
  { img: '/jerseys/jersey-1.jpg', name: 'England 2004 Away', team: 'England · Umbro', price: 1499, badge: 'Retro', accent: '#cc2200', ig: 'https://www.instagram.com/jersey.spot_chennai/p/DLzRJX5TxwK/' },
  { img: '/jerseys/jersey-2.jpg', name: 'Real Madrid Away Pink', team: 'Real Madrid · adidas', price: 1499, badge: 'Fan Favourite', accent: '#ff4d8d', ig: 'https://www.instagram.com/jersey.spot_chennai/p/DLzQeQqT2JR/' },
  { img: '/jerseys/jersey-3.jpg', name: 'Portugal Black & Gold', team: 'Portugal · Puma', price: 1599, badge: 'New Drop', accent: '#c8960a', ig: 'https://www.instagram.com/jersey.spot_chennai/p/DTm8hFfkpF3/' },
  { img: '/jerseys/jersey-4.jpg', name: 'Inter Miami Home', team: 'Inter Miami CF · adidas', price: 1699, badge: 'Messi', accent: '#ff5a8a', ig: 'https://www.instagram.com/jersey.spot_chennai/p/DTm8S4kkgL3/' },
  { img: '/jerseys/jersey-5.jpg', name: 'Argentina 3-Star', team: 'Argentina · adidas', price: 1499, badge: 'Champions', accent: '#4aa8e0', ig: 'https://www.instagram.com/jersey.spot_chennai/p/DTm8D79Erkm/' },
  { img: '/jerseys/jersey-6.jpg', name: 'Real Madrid Retro Blue', team: 'Real Madrid · adidas', price: 1499, badge: 'Classic', accent: '#1e6fd0', ig: 'https://www.instagram.com/jersey.spot_chennai/p/DTm7z8OkjDb/' },
];

export default function JerseyGallery({ onAddToCart }) {
  return (
    <section className="gallery-section" id="in-stock">
      <div className="container">
        <motion.div
          className="gallery-header"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-label">In Stock Now</div>
          <h2 className="section-title">
            Fresh From <span>The Shop</span>
          </h2>
          <p className="section-subtitle">
            Real jerseys, real stock — straight from our Chennai store.{' '}
            <a href="https://www.instagram.com/jersey.spot_chennai/" target="_blank" rel="noreferrer" className="gallery-ig-link">@jersey.spot_chennai</a>
          </p>
        </motion.div>

        <div className="gallery-grid">
          {GALLERY.map((j, i) => (
            <motion.article
              key={j.img}
              className="gallery-card"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
            >
              <div className="gallery-card-img">
                <div className="gallery-card-glow" style={{ background: `radial-gradient(ellipse at 50% 40%, ${j.accent}33 0%, transparent 70%)` }} />
                <img src={j.img} alt={j.name} loading="lazy" width="640" height="640" />
                <span className="gallery-card-badge" style={{ background: j.accent }}>{j.badge}</span>
                <a href={j.ig} target="_blank" rel="noreferrer" className="gallery-card-ig" aria-label="View on Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
              <div className="gallery-card-body">
                <div className="gallery-card-team">{j.team}</div>
                <h3 className="gallery-card-name">{j.name}</h3>
                <div className="gallery-card-footer">
                  <div className="gallery-card-price">₹{j.price.toLocaleString('en-IN')}</div>
                  <motion.button
                    className="gallery-card-btn"
                    style={{ background: j.accent }}
                    onClick={() => onAddToCart({ name: j.name, team: j.team, price: j.price, img: j.img, primary: j.accent, secondary: '#ffffff', number: '' })}
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.05 }}
                    aria-label={`Add ${j.name} to cart`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
