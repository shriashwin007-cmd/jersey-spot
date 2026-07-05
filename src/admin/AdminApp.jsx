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
          </div>
          <div className="admin-row-meta">{p.category} · {p.tag || '—'} · ₹{p.price}</div>
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
            <button className="ghost" disabled={busy} onClick={() => setEditing(true)}>Edit</button>
            <button className="danger" disabled={busy} onClick={del}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ password, onLogout }) {
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
