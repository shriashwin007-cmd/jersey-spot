import { motion, AnimatePresence } from 'framer-motion';
import JerseySVG from './JerseySVG';

export default function CartDrawer({ open, onClose, items, onRemove }) {
  const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const shipping = subtotal > 80 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            aria-label="Shopping cart"
            role="dialog"
            aria-modal="true"
          >
            <div className="cart-header">
              <h3>
                Your Cart
                {items.length > 0 && (
                  <span style={{ color: 'var(--primary-light)', marginLeft: 8, fontSize: 14 }}>
                    ({items.length})
                  </span>
                )}
              </h3>
              <button className="cart-close" onClick={onClose} aria-label="Close cart">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty" role="status">
                  <div className="icon" aria-hidden>🛒</div>
                  <div style={{ fontWeight: 600 }}>Your cart is empty</div>
                  <div style={{ fontSize: 13, textAlign: 'center' }}>Add some jerseys to get started!</div>
                  <a href="#collections" className="btn-primary" onClick={onClose} style={{ marginTop: 8 }}>
                    Browse Jerseys
                  </a>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="cart-item-img" aria-hidden>
                        <JerseySVG
                          primary={item.primary || '#15803D'}
                          secondary={item.secondary || '#22c55e'}
                          number={item.number || '10'}
                          size={56}
                        />
                      </div>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-details">
                          {item.team && `${item.team} • `}
                          {item.size && `Size ${item.size} • `}
                          Qty {item.qty || 1}
                        </div>
                        <div className="cart-item-footer">
                          <div className="cart-item-price">${item.price}</div>
                          <button
                            className="cart-item-remove"
                            onClick={() => onRemove(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-subtotal">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-subtotal">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free 🎉' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Add ${(80 - subtotal).toFixed(2)} more for free shipping
                  </div>
                )}
                <div className="cart-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button className="btn-primary w-full" style={{ justifyContent: 'center', borderRadius: 12 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Checkout Securely
                </button>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:12 }}>
                  {['💳 Visa', '💳 MC', '🍎 Pay', '🔒 SSL'].map(p => (
                    <span key={p} style={{ fontSize:11, color:'var(--text-subtle)' }}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
