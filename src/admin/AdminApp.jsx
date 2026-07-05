import { useCallback, useEffect, useRef, useState } from 'react';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './cloudinaryConfig';

const PASSWORD_KEY = 'jersey_admin_pw';

const CATEGORIES = [
  { value: 'embroidered', label: 'Embroidered Jersey' },
  { value: 'printed', label: 'Printed Jersey' },
  { value: 'football', label: 'Football' },
  { value: 'boots', label: 'Boots' },
];

async function api(path, { password, ...opts } = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(password ? { 'x-admin-password': password } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
  return data; // { secure_url, public_id, ... }
}

function LoginGate({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    try {
      const { ok } = await api('/api/admin-check', { method: 'POST', password });
      if (!ok) throw new Error('Wrong password');
      localStorage.setItem(PASSWORD_KEY, password);
      onLogin(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="admin-gate">
      <form className="admin-gate-card" onSubmit={submit}>
        <h1>Jersey Spot</h1>
        <p>Admin access</p>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="admin-error">{error}</div>}
        <button type="submit" disabled={checking || !password}>
          {checking ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}

// Batch upload — drag in several photos at once. Tag/category/price/in-stock
// are shared across the batch (they're normally the same for a fresh drop of
// kits), but each photo gets its own required name field since those differ.
function UploadForm({ password, onAdded }) {
  const [items, setItems] = useState([]);
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('embroidered');
  const [price, setPrice] = useState('');
  const [inStock, setInStock] = useState(true);
  const [buyOnline, setBuyOnline] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name.replace(/\.[^.]+$/, ''),
      })),
    ]);
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
  const renameItem = (id, name) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, name } : it)));

  const reset = () => {
    setItems([]); setTag(''); setPrice('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!items.length) { setError('Add at least one photo.'); return; }
    if (items.some((it) => !it.name.trim())) { setError('Every photo needs a name.'); return; }
    setError('');
    setUploading(true);
    try {
      for (const it of items) {
        const uploaded = await uploadToCloudinary(it.file);
        const { product } = await api('/api/products', {
          method: 'POST',
          password,
          body: JSON.stringify({
            name: it.name,
            tag,
            category,
            price: Number(price) || 0,
            inStock,
            buyOnline,
            imageUrl: uploaded.secure_url,
            cloudinaryPublicId: uploaded.public_id,
          }),
        });
        onAdded(product);
      }
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="admin-upload-card" onSubmit={submit}>
      <h2>Add jersey photos</h2>

      <div
        className={`admin-drop${dragOver ? ' over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        <div className="admin-drop-icon">📷</div>
        <div>Drag &amp; drop one or more photos, or click to browse</div>
      </div>

      {items.length > 0 && (
        <div className="admin-batch-list">
          {items.map((it) => (
            <div className="admin-batch-item" key={it.id}>
              <img src={it.preview} alt="" />
              <input value={it.name} onChange={(e) => renameItem(it.id, e.target.value)} placeholder="Name" />
              <button type="button" className="ghost" onClick={() => removeItem(it.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="admin-field-row">
        <label className="admin-field">
          <span>Tag <em>(applies to all above)</em></span>
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Retro" />
        </label>
      </div>
      <div className="admin-field-row">
        <label className="admin-field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label className="admin-field admin-field-price">
          <span>Price (₹)</span>
          <input type="number" min="0" max="999999" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1499" />
        </label>
      </div>
      <label className="admin-checkbox">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
        In stock
      </label>
      <label className="admin-checkbox">
        <input type="checkbox" checked={buyOnline} onChange={(e) => setBuyOnline(e.target.checked)} />
        Allow instant "Buy Now" checkout <em>(ready-to-ship items only — no custom name/number needed)</em>
      </label>

      {error && <div className="admin-error">{error}</div>}

      <button type="submit" disabled={uploading || !items.length}>
        {uploading
          ? `Uploading ${items.length} photo${items.length > 1 ? 's' : ''}…`
          : `Upload & Add${items.length ? ` (${items.length})` : ''}`}
      </button>
    </form>
  );
}

function ProductRow({ p, password, onDeleted, onUpdated, dragHandlers }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.name);
  const [tag, setTag] = useState(p.tag);
  const [category, setCategory] = useState(p.category);
  const [price, setPrice] = useState(p.price);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const { product } = await api(`/api/products/${p.id}`, {
        method: 'PUT', password,
        body: JSON.stringify({ name, tag, category, price: Number(price) || 0 }),
      });
      onUpdated(product);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleStock = async () => {
    setBusy(true);
    try {
      const { product } = await api(`/api/products/${p.id}`, {
        method: 'PUT', password,
        body: JSON.stringify({ inStock: !p.in_stock }),
      });
      onUpdated(product);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleBuyOnline = async () => {
    setBusy(true);
    try {
      const { product } = await api(`/api/products/${p.id}`, {
        method: 'PUT', password,
        body: JSON.stringify({ buyOnline: !p.buy_online }),
      });
      onUpdated(product);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm(`Delete "${p.name}"? This also removes it from Cloudinary.`)) return;
    setBusy(true);
    try {
      await api(`/api/products/${p.id}`, { method: 'DELETE', password });
      onDeleted(p.id);
    } catch (err) {
      alert(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={`admin-row${p.in_stock ? '' : ' sold-out'}`} draggable {...dragHandlers}>
      <span className="admin-row-handle" title="Drag to reorder">⠿</span>
      <img src={p.image_url} alt={p.name} className="admin-row-thumb" />
      {editing ? (
        <div className="admin-row-edit">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input type="number" min="0" max="999999" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
        </div>
      ) : (
        <div className="admin-row-info">
          <div className="admin-row-name">
            {p.name}
            {!p.in_stock && <span className="admin-badge-soldout">Sold Out</span>}
            {p.buy_online && <span className="admin-badge-buyonline">Buy Online</span>}
          </div>
          <div className="admin-row-meta">{p.category} · {p.tag || '—'} · ₹{p.price}{p.enquiry_clicks > 0 ? ` · ${p.enquiry_clicks} enquiries` : ''}</div>
        </div>
      )}
      <div className="admin-row-actions">
        {editing ? (
          <>
            <button disabled={busy} onClick={save}>Save</button>
            <button disabled={busy} className="ghost" onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="ghost" disabled={busy} onClick={toggleStock}>
              {p.in_stock ? 'Mark Sold Out' : 'Mark In Stock'}
            </button>
            <button className="ghost" disabled={busy} onClick={toggleBuyOnline}>
              {p.buy_online ? 'Disable Buy Online' : 'Enable Buy Online'}
            </button>
            <button className="ghost" disabled={busy} onClick={() => setEditing(true)}>Edit</button>
            <button className="danger" disabled={busy} onClick={del}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'failed'];

function OrdersTab({ password }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { orders } = await api('/api/orders', { password });
      setOrders(orders);
    } catch (err) {
      setError(err.message);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      const { order } = await api(`/api/orders/${id}`, { method: 'PUT', password, body: JSON.stringify({ status }) });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: order.status } : o)));
    } catch (err) {
      alert(err.message);
    }
  };

  if (error) return <div className="admin-error">{error}</div>;
  if (!orders) return <div className="admin-empty">Loading…</div>;
  if (orders.length === 0) return <div className="admin-empty">No orders yet — they'll show up here once someone checks out online.</div>;

  return (
    <div className="admin-orders-list">
      {orders.map((o) => (
        <div className="admin-order-card" key={o.id}>
          <div className="admin-order-top">
            <div>
              <div className="admin-order-id">Order #{o.id}</div>
              <div className="admin-order-date">{new Date(o.created_at).toLocaleString('en-IN')}</div>
            </div>
            <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className={`admin-order-status status-${o.status}`}>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="admin-order-customer">
            <strong>{o.customer_name}</strong> · {o.customer_phone}{o.customer_email ? ` · ${o.customer_email}` : ''}
            <div className="admin-order-address">{o.address_line}, {o.city}, {o.state} {o.pincode}</div>
          </div>

          <div className="admin-order-items">
            {o.items.map((it, i) => (
              <div key={i} className="admin-order-item">
                <img src={it.imageUrl} alt="" />
                <span>{it.name} × {it.qty}</span>
                <span>₹{it.price * it.qty}</span>
              </div>
            ))}
          </div>

          <div className="admin-order-totals">
            <span>Subtotal ₹{o.subtotal}</span>
            <span>Shipping ₹{o.shipping_fee}</span>
            <strong>Total ₹{o.total}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  );
}

function AnalyticsTab({ password }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/dashboard', { password }).then(setData).catch((err) => setError(err.message));
  }, [password]);

  if (error) return <div className="admin-error">{error}</div>;
  if (!data) return <div className="admin-empty">Loading…</div>;

  return (
    <div className="admin-analytics">
      <div className="admin-stats-row">
        <StatCard label="Today's Revenue" value={`₹${data.revenue.today.toLocaleString('en-IN')}`} />
        <StatCard label="This Month" value={`₹${data.revenue.thisMonth.toLocaleString('en-IN')}`} />
        <StatCard label="All Time" value={`₹${data.revenue.allTime.toLocaleString('en-IN')}`} />
      </div>

      <div className="admin-stats-row">
        <StatCard label="Total Products" value={data.catalog.total} />
        <StatCard label="In Stock" value={data.catalog.inStock} />
        <StatCard label="Sold Out" value={data.catalog.soldOut} />
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-list-card">
          <h2>Top Selling Products</h2>
          {data.topProducts.length === 0 ? (
            <div className="admin-empty">No paid orders yet.</div>
          ) : (
            <div className="admin-mini-table">
              {data.topProducts.map((p, i) => (
                <div className="admin-mini-row" key={i}>
                  <span>{p.name}</span>
                  <span>{p.qty} sold</span>
                  <span>₹{Number(p.revenue).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-list-card">
          <h2>Top Categories</h2>
          {data.topCategories.length === 0 ? (
            <div className="admin-empty">No paid orders yet.</div>
          ) : (
            <div className="admin-mini-table">
              {data.topCategories.map((c, i) => (
                <div className="admin-mini-row" key={i}>
                  <span style={{ textTransform: 'capitalize' }}>{c.category}</span>
                  <span>{c.qty} sold</span>
                  <span>₹{Number(c.revenue).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-list-card">
          <h2>Catalog Health</h2>
          <div className="admin-mini-table">
            {CATEGORIES.map((c) => {
              const row = data.catalog.byCategory.find((r) => r.category === c.value);
              return (
                <div className="admin-mini-row" key={c.value}>
                  <span>{c.label}</span>
                  <span>{row ? `${row.in_stock}/${row.total} in stock` : 'None yet'}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-list-card">
          <h2>Most Enquired</h2>
          {data.topEnquired.length === 0 ? (
            <div className="admin-empty">No WhatsApp clicks tracked yet.</div>
          ) : (
            <div className="admin-mini-table">
              {data.topEnquired.map((p) => (
                <div className="admin-mini-row" key={p.id}>
                  <span>{p.name}</span>
                  <span>{p.enquiry_clicks} clicks</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-list-card admin-activity-card">
          <h2>Recent Activity</h2>
          {data.recentActivity.length === 0 ? (
            <div className="admin-empty">Nothing logged yet.</div>
          ) : (
            <div className="admin-activity-list">
              {data.recentActivity.map((a) => (
                <div className="admin-activity-row" key={a.id}>
                  <span className="admin-activity-dot" />
                  <div>
                    <div>{a.details}</div>
                    <div className="admin-activity-time">{new Date(a.created_at).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ password, onLogout }) {
  const [tab, setTab] = useState('catalog');
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const dragIndex = useRef(null);

  const load = useCallback(async () => {
    try {
      const { products } = await api('/api/products');
      setProducts(products);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onAdded = (p) => setProducts((prev) => [...(prev || []), p]);
  const onDeleted = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));
  const onUpdated = (p) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  const persistOrder = async (list) => {
    try {
      await api('/api/products/reorder', {
        method: 'POST', password,
        body: JSON.stringify({ order: list.map((p, i) => ({ id: p.id, sortOrder: i })) }),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const dragHandlersFor = (i) => ({
    onDragStart: () => { dragIndex.current = i; },
    onDragOver: (e) => e.preventDefault(),
    onDrop: () => {
      const from = dragIndex.current;
      if (from === null || from === i) return;
      setProducts((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(i, 0, moved);
        persistOrder(next);
        return next;
      });
      dragIndex.current = null;
    },
  });

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Jersey Spot — Admin</h1>
        <button className="ghost" onClick={onLogout}>Log out</button>
      </header>

      <div className="admin-tabs" role="tablist">
        {[
          { id: 'catalog', label: 'Catalog' },
          { id: 'orders', label: 'Orders' },
          { id: 'analytics', label: 'Analytics' },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <div className="admin-grid">
          <UploadForm password={password} onAdded={onAdded} />

          <div className="admin-list-card">
            <h2>Catalog {products ? `(${products.length})` : ''}</h2>
            {error && <div className="admin-error">{error}</div>}
            {!products ? (
              <div className="admin-empty">Loading…</div>
            ) : products.length === 0 ? (
              <div className="admin-empty">No products yet — add your first photo.</div>
            ) : (
              <div className="admin-list">
                {products.map((p, i) => (
                  <ProductRow
                    key={p.id}
                    p={p}
                    password={password}
                    onDeleted={onDeleted}
                    onUpdated={onUpdated}
                    dragHandlers={dragHandlersFor(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'orders' && <OrdersTab password={password} />}
      {tab === 'analytics' && <AnalyticsTab password={password} />}
    </div>
  );
}

export default function AdminApp() {
  const [password, setPassword] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(PASSWORD_KEY);
    if (!saved) { setChecked(true); return; }
    api('/api/admin-check', { method: 'POST', password: saved })
      .then(({ ok }) => setPassword(ok ? saved : null))
      .catch(() => setPassword(null))
      .finally(() => setChecked(true));
  }, []);

  const logout = () => {
    localStorage.removeItem(PASSWORD_KEY);
    setPassword(null);
  };

  if (!checked) return null;
  if (!password) return <LoginGate onLogin={setPassword} />;
  return <Dashboard password={password} onLogout={logout} />;
}
