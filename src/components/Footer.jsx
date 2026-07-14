import logo from '../assets/logo.png';
import { CATEGORIES } from '../categories';
import { SHOP, waLink } from '../config';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={logo} alt="Jersey Spot Chennai" className="footer-logo" />
          <p>{SHOP.tagline}</p>
          <p className="footer-est">Premium sports store · {SHOP.city} · Est. {SHOP.est}</p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <a href="#story" className="hoverable">Our Story</a>
          <a href="#shop" className="hoverable">What We Sell</a>
          <a href="#embroidery" className="hoverable">Embroidery</a>
          <a href="#why" className="hoverable">Why Us</a>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          {CATEGORIES.map((c) => (
            <a
              key={c.value}
              href={waLink(`Hi Jersey Spot! I want to order — ${c.label}.`)}
              target="_blank"
              rel="noreferrer"
              className="hoverable"
            >
              {c.label}
            </a>
          ))}
        </div>

        <div className="footer-col">
          <h4>Reach Us</h4>
          <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="hoverable">{SHOP.address}</a>
          <a href={waLink()} target="_blank" rel="noreferrer" className="hoverable">{SHOP.phoneDisplay}</a>
          <a href={SHOP.instagram} target="_blank" rel="noreferrer" className="hoverable">{SHOP.instagramHandle}</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {year} {SHOP.name} {SHOP.city}. All rights reserved.</span>
        <span className="footer-made">Made with <span className="footer-heart">♦</span> in Chennai</span>
      </div>
    </footer>
  );
}
