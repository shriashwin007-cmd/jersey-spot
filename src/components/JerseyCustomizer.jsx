import { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import JerseySVG from './JerseySVG';

const COLOR_PRESETS = [
  { name: 'Forest Green', primary: '#15803D', secondary: '#bbf7d0' },
  { name: 'Navy Gold',    primary: '#1E3A5F', secondary: '#F59E0B' },
  { name: 'Crimson',      primary: '#991B1B', secondary: '#FCA5A5' },
  { name: 'Ocean Blue',   primary: '#0C4A6E', secondary: '#7DD3FC' },
  { name: 'Royal Purple', primary: '#5B21B6', secondary: '#C4B5FD' },
  { name: 'Inferno',      primary: '#7C2D12', secondary: '#FDBA74' },
  { name: 'Midnight',     primary: '#111827', secondary: '#22C55E' },
  { name: 'Rose Gold',    primary: '#831843', secondary: '#FBCFE8' },
];

const PATTERNS = ['solid', 'stripes', 'gradient'];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const UNAVAIL = ['XS'];

// ── 3D Jersey geometry built from scratch ──────────────────────────────────
function buildJerseyShape() {
  const s = new THREE.Shape();
  s.moveTo(-1.4, -3.0);
  s.lineTo(-1.4, 0.4);
  s.lineTo(-2.6, 0.9);
  s.bezierCurveTo(-3.2, 1.1, -3.5, 0.6, -3.6, 0.0);
  s.lineTo(-2.9, -0.4);
  s.lineTo(-2.2, 0.0);
  s.lineTo(-1.6, 0.2);
  s.lineTo(-1.0, 0.7);
  s.lineTo(-0.4, 1.6);
  s.bezierCurveTo(-0.2, 2.0, 0.2, 2.0, 0.4, 1.6);
  s.lineTo(1.0, 0.7);
  s.lineTo(1.6, 0.2);
  s.lineTo(2.2, 0.0);
  s.lineTo(2.9, -0.4);
  s.lineTo(3.6, 0.0);
  s.bezierCurveTo(3.5, 0.6, 3.2, 1.1, 2.6, 0.9);
  s.lineTo(1.4, 0.4);
  s.lineTo(1.4, -3.0);
  s.closePath();
  return s;
}

function buildCollarHole() {
  const hole = new THREE.Path();
  hole.moveTo(-0.35, 1.4);
  hole.bezierCurveTo(-0.35, 1.7, 0, 1.95, 0, 1.95);
  hole.bezierCurveTo(0, 1.95, 0.35, 1.7, 0.35, 1.4);
  hole.bezierCurveTo(0.2, 1.2, 0, 1.1, -0.2, 1.2);
  hole.closePath();
  return hole;
}

// Canvas texture for the jersey front face
function makeJerseyTexture(primary, secondary, playerNumber, playerName, pattern) {
  const W = 512, H = 768;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Base fill
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, W, H);

  // Pattern overlay
  if (pattern === 'stripes') {
    ctx.fillStyle = secondary + '33';
    for (let x = 0; x < W; x += 48) {
      ctx.fillRect(x, 0, 24, H);
    }
  } else if (pattern === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, secondary + '25');
    g.addColorStop(0.5, 'transparent');
    g.addColorStop(1, secondary + '25');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Fabric sheen
  const sheen = ctx.createLinearGradient(0, 0, W, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.35, 'rgba(255,255,255,0.07)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Collar accent
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.ellipse(W / 2, 90, 120, 60, 0, 0, Math.PI);
  ctx.fill();

  // Side stripes
  ctx.fillStyle = secondary + '22';
  ctx.fillRect(0, 0, 80, H);
  ctx.fillRect(W - 80, 0, 80, H);

  // Number
  ctx.fillStyle = secondary;
  ctx.font = `bold 260px "Arial Black", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 12;
  ctx.fillText(String(playerNumber).substring(0, 2), W / 2, H * 0.52);
  ctx.shadowBlur = 0;

  // Name
  ctx.fillStyle = secondary;
  ctx.font = `bold 54px Arial, sans-serif`;
  ctx.letterSpacing = '8px';
  ctx.fillText(playerName.toUpperCase().substring(0, 12), W / 2, H * 0.74);

  return new THREE.CanvasTexture(canvas);
}

// ── The 3D mesh ─────────────────────────────────────────────────────────────
function Jersey3D({ primary, secondary, playerNumber, playerName, pattern }) {
  const ref = useRef();

  const shape = useMemo(() => {
    const s = buildJerseyShape();
    s.holes.push(buildCollarHole());
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 4,
    steps: 2,
  }), []);

  const texture = useMemo(
    () => makeJerseyTexture(primary, secondary, playerNumber, playerName, pattern),
    [primary, secondary, playerNumber, playerName, pattern],
  );

  // back texture (plain)
  const backTexture = useMemo(() => {
    const W = 512, H = 768;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, W, H);
    if (pattern === 'stripes') {
      ctx.fillStyle = secondary + '33';
      for (let x = 0; x < W; x += 48) ctx.fillRect(x, 0, 24, H);
    }
    const sheen = ctx.createLinearGradient(0, 0, W, 0);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.4, 'rgba(255,255,255,0.06)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, W, H);
    return new THREE.CanvasTexture(canvas);
  }, [primary, secondary, pattern]);

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    roughness: 0.85,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.6,
    map: texture,
    envMapIntensity: 0.6,
  }), [texture]);

  const backMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    roughness: 0.85,
    metalness: 0.0,
    map: backTexture,
    envMapIntensity: 0.6,
  }), [backTexture]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
      <group ref={ref} position={[0, 0.2, 0]}>
        {/* Front face */}
        <mesh castShadow receiveShadow material={mat}>
          <extrudeGeometry args={[shape, extrudeSettings]} />
        </mesh>
        {/* Back face override */}
        <mesh position={[0, 0, -0.01]} material={backMat}>
          <extrudeGeometry args={[shape, { ...extrudeSettings, depth: 0.01 }]} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ primary, secondary, playerNumber, playerName, pattern }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-4, 4, 2]} intensity={0.5} />
      <pointLight position={[0, -4, 3]} intensity={0.6} color={primary} />
      <pointLight position={[3, 3, -2]} intensity={0.3} color={secondary} />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Jersey3D
          primary={primary}
          secondary={secondary}
          playerNumber={playerNumber}
          playerName={playerName}
          pattern={pattern}
        />
        <ContactShadows
          position={[0, -3.6, 0]}
          opacity={0.35}
          scale={10}
          blur={2.5}
          far={4}
        />
      </Suspense>
    </>
  );
}

// ── Customizer UI ────────────────────────────────────────────────────────────
export default function JerseyCustomizer({ onAddToCart }) {
  const [preset, setPreset] = useState(0);
  const [primary, setPrimary] = useState(COLOR_PRESETS[0].primary);
  const [secondary, setSecondary] = useState(COLOR_PRESETS[0].secondary);
  const [playerNumber, setPlayerNumber] = useState('10');
  const [playerName, setPlayerName] = useState('YOUR NAME');
  const [pattern, setPattern] = useState('solid');
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);

  const basePrice = 89;
  const total = basePrice * qty;

  const applyPreset = (i) => {
    setPreset(i);
    setPrimary(COLOR_PRESETS[i].primary);
    setSecondary(COLOR_PRESETS[i].secondary);
  };

  const handleAddToCart = () => {
    onAddToCart({
      name: `Custom Jersey #${playerNumber}`,
      team: playerName,
      price: total,
      primary,
      secondary,
      number: playerNumber,
      size,
      qty,
    });
  };

  return (
    <section className="section customizer" id="customizer">
      <div className="container">
        <motion.div
          className="text-center"
          style={{ maxWidth: 600, margin: '0 auto 56px' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-label">3D Customizer</div>
          <h2 className="section-title">
            Design Your <span>Dream</span><br />
            <em>Jersey</em> in 3D
          </h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Drag to rotate, pick colors, type your name and number. What you see is exactly what you get.
          </p>
        </motion.div>

        <div className="customizer-inner">
          {/* ── Left Panel: Design Controls ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="customizer-panel">
              <div className="customizer-panel-title">Team Color Presets</div>
              <div className="color-presets">
                {COLOR_PRESETS.map((c, i) => (
                  <button
                    key={c.name}
                    className={`color-preset${preset === i ? ' active' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${c.primary} 50%, ${c.secondary} 50%)` }}
                    onClick={() => applyPreset(i)}
                    title={c.name}
                    aria-label={`${c.name} color preset${preset === i ? ' (selected)' : ''}`}
                    aria-pressed={preset === i}
                  />
                ))}
              </div>

              <div className="customizer-panel-title">Custom Colors</div>
              <div className="color-picker-row">
                <div className="color-picker-group">
                  <label htmlFor="primary-color">Primary</label>
                  <input
                    id="primary-color"
                    type="color"
                    value={primary}
                    onChange={e => { setPrimary(e.target.value); setPreset(-1); }}
                  />
                </div>
                <div className="color-picker-group">
                  <label htmlFor="secondary-color">Secondary</label>
                  <input
                    id="secondary-color"
                    type="color"
                    value={secondary}
                    onChange={e => { setSecondary(e.target.value); setPreset(-1); }}
                  />
                </div>
              </div>

              <div className="customizer-panel-title">Pattern</div>
              <div className="pattern-grid">
                {PATTERNS.map(p => (
                  <button
                    key={p}
                    className={`pattern-btn${pattern === p ? ' active' : ''}`}
                    onClick={() => setPattern(p)}
                    aria-pressed={pattern === p}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              <div className="customizer-panel-title">Personalization</div>
              <div className="customizer-field">
                <label htmlFor="player-number">Squad Number</label>
                <input
                  id="player-number"
                  type="text"
                  value={playerNumber}
                  onChange={e => setPlayerNumber(e.target.value.replace(/\D/g, '').substring(0, 2))}
                  placeholder="10"
                  maxLength={2}
                  inputMode="numeric"
                />
              </div>
              <div className="customizer-field">
                <label htmlFor="player-name">Player / Team Name</label>
                <input
                  id="player-name"
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value.substring(0, 14))}
                  placeholder="YOUR NAME"
                  maxLength={14}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Center: 3D Canvas ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="canvas-wrapper">
              <Canvas
                camera={{ position: [0, 0, 9], fov: 42 }}
                shadows
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
              >
                <Scene
                  primary={primary}
                  secondary={secondary}
                  playerNumber={playerNumber}
                  playerName={playerName}
                  pattern={pattern}
                />
                <OrbitControls
                  enablePan={false}
                  enableZoom={false}
                  maxPolarAngle={Math.PI * 0.75}
                  minPolarAngle={Math.PI * 0.25}
                  rotateSpeed={0.7}
                  autoRotate={false}
                />
              </Canvas>
              <div className="canvas-hint" aria-hidden>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline',verticalAlign:'middle',marginRight:4 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                Drag to rotate · Colors update live
              </div>
            </div>
          </motion.div>

          {/* ── Right Panel: Size & Cart ── */}
          <motion.div
            className="customizer-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="customizer-panel">
              <div className="customizer-panel-title">Select Size</div>
              <div className="size-grid">
                {SIZES.map(s => (
                  <button
                    key={s}
                    className={`size-btn${size === s ? ' active' : ''}${UNAVAIL.includes(s) ? ' disabled' : ''}`}
                    onClick={() => !UNAVAIL.includes(s) && setSize(s)}
                    disabled={UNAVAIL.includes(s)}
                    aria-pressed={size === s}
                    aria-disabled={UNAVAIL.includes(s)}
                  >
                    {s}
                    {UNAVAIL.includes(s) && <div style={{ fontSize: 9, color: 'var(--text-subtle)' }}>Out</div>}
                  </button>
                ))}
              </div>

              <div className="customizer-panel-title">Quantity</div>
              <div className="qty-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >−</button>
                <span className="qty-value" aria-live="polite" aria-label={`Quantity: ${qty}`}>{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.min(50, q + 1))}
                  aria-label="Increase quantity"
                >+</button>
              </div>
            </div>

            <div className="customizer-panel">
              <div className="customizer-panel-title">Order Summary</div>

              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-muted)', marginBottom:6 }}>
                <span>Base price</span>
                <span>${basePrice}</span>
              </div>
              {qty > 1 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-muted)', marginBottom:6 }}>
                  <span>Quantity ×{qty}</span>
                  <span>${total}</span>
                </div>
              )}
              {qty >= 10 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--primary-light)', marginBottom:6 }}>
                  <span>Bulk discount (10%)</span>
                  <span>−${(total * 0.1).toFixed(0)}</span>
                </div>
              )}
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:12, marginTop:6 }}>
                <div className="customizer-price">
                  <div className="price">
                    ${qty >= 10 ? (total * 0.9).toFixed(2) : total.toFixed(2)}
                  </div>
                  <div className="sub">{qty > 1 ? `(${qty} jerseys)` : 'per jersey'}</div>
                </div>
              </div>

              <motion.button
                className="btn-primary w-full"
                style={{ justifyContent:'center', borderRadius:12, marginBottom:10 }}
                onClick={handleAddToCart}
                whileTap={{ scale: 0.97 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-8.43H6"/>
                </svg>
                Add to Cart
              </motion.button>

              <button className="btn-ghost w-full" style={{ justifyContent:'center', borderRadius:12 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                Save Design
              </button>
            </div>

            {/* Preview card */}
            <div className="customizer-panel" style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ flexShrink:0 }}>
                <JerseySVG
                  primary={primary}
                  secondary={secondary}
                  number={playerNumber || '10'}
                  name={playerName}
                  size={80}
                  pattern={pattern}
                />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>
                  #{playerNumber} {playerName}
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5 }}>
                  Size {size} · {pattern}<br />
                  {COLOR_PRESETS[preset]?.name || 'Custom colors'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
