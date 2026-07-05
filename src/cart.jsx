import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'jersey_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) => (it.productId === product.id ? { ...it, qty: Math.min(20, it.qty + 1) } : it));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, imageUrl: product.img, qty: 1 }];
    });
    setOpen(true);
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((it) => it.productId !== productId)
        : prev.map((it) => (it.productId === productId ? { ...it, qty: Math.min(20, qty) } : it))
    );
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((it) => it.productId !== productId));
  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);

  const value = { items, addItem, updateQty, removeItem, clear, subtotal, count, open, setOpen };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
