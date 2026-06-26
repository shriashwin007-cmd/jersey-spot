import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;
  uniform float u_morph;
  uniform float u_time;
  varying vec2 vUv;
  varying vec3 vNormal;

  #define PI 3.14159265358979

  vec3 footballColor(vec2 uv) {
    float scale = 4.0;
    vec2 p = fract(uv * vec2(scale * 2.2, scale)) - 0.5;
    float offset = step(1.0, mod(floor(uv.y * scale), 2.0)) * 0.5;
    p.x = fract(uv.x * scale * 2.2 + offset) - 0.5;
    float len = length(p);
    float patch = smoothstep(0.44, 0.47, len);
    float row = floor(uv.y * scale);
    float col = floor(uv.x * scale * 2.2 + offset);
    float isDark = mod(col + row * 1.7, 3.0);
    patch *= step(1.5, isDark);
    return mix(vec3(0.97), vec3(0.06), patch);
  }

  vec3 basketballColor(vec2 uv) {
    float u = uv.x, v = uv.y;
    float hSeam = smoothstep(0.022, 0.008, abs(v - 0.5));
    float c1 = 0.5 + 0.28 * sin(u * PI * 2.0 + PI * 0.5);
    float vSeam1 = smoothstep(0.022, 0.008, abs(v - c1));
    float vSeam2 = smoothstep(0.016, 0.004, min(abs(u - 0.25), abs(u - 0.75)));
    float seam = max(max(hSeam, vSeam1), vSeam2);
    return mix(vec3(0.88, 0.39, 0.06), vec3(0.07, 0.03, 0.0), seam);
  }

  vec3 cricketColor(vec2 uv) {
    float u = uv.x, v = uv.y;
    float sc = 0.5 + 0.13 * sin(u * PI * 4.0);
    float d = abs(v - sc);
    float sx = fract(u * 22.0);
    float stitchDot = step(0.25, sx) * step(sx, 0.75);
    float seam = smoothstep(0.028, 0.009, d);
    float stitch = smoothstep(0.020, 0.006, d) * stitchDot;
    vec3 ballC = mix(vec3(0.66, 0.04, 0.04), vec3(0.72, 0.05, 0.05), step(0.5, v));
    return mix(ballC, vec3(0.96, 0.88, 0.28), max(seam * 0.55, stitch));
  }

  void main() {
    float t = clamp(u_morph * 2.0, 0.0, 2.0);
    vec3 color;
    if (t < 1.0) {
      color = mix(footballColor(vUv), basketballColor(vUv), smoothstep(0.0, 1.0, t));
    } else {
      color = mix(basketballColor(vUv), cricketColor(vUv), smoothstep(0.0, 1.0, t - 1.0));
    }
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vec3(1.5, 2.0, 2.5));
    vec3 V = vec3(0.0, 0.0, 1.0);
    float diff = max(dot(N, L), 0.0);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 90.0) * 0.55;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.45;
    vec3 rimColor = mix(vec3(0.97, 0.72, 0.0), vec3(0.9, 0.2, 0.05), clamp(u_morph, 0.0, 1.0));
    gl_FragColor = vec4(color * (0.22 + diff * 0.78) + spec + rimColor * rim, 1.0);
  }
`;

const BG_FRAG = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_res;
  varying vec2 vUv;
  #define PI 3.14159265358979
  void coswarp(inout vec3 c, float s) {
    c.xyz += s * 0.1 * cos(3.0 * c.yzx + u_time * 0.22);
    c.xyz += s * 0.05 * cos(11.0 * c.yzx + u_time * 0.18);
  }
  void main() {
    vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / u_res.yy + 0.5;
    vec3 w = vec3(uv.x, uv.y, 1.0);
    coswarp(w, 2.5);
    vec2 warped = uv + w.rg * 0.4;
    float d = length(warped - 0.5);
    float t = sin(d * 8.0 - u_time * 0.6) * 0.5 + 0.5;
    float t2 = sin(d * 16.0 + u_time * 0.4) * 0.5 + 0.5;
    vec3 gold = vec3(0.97, 0.72, 0.0);
    vec3 red  = vec3(0.80, 0.13, 0.01);
    vec3 dark = vec3(0.02, 0.01, 0.0);
    vec3 color = mix(dark, mix(gold, red, sin(u_time * 0.15) * 0.5 + 0.5), pow(t * t2, 3.5) * 0.3);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const BALL_LABELS = [
  { sport: 'Football', icon: '⚽', color: '#e0e0e0', desc: 'The Beautiful Game' },
  { sport: 'Basketball', icon: '🏀', color: '#e06010', desc: 'Street to Stadium' },
  { sport: 'Cricket', icon: '🏏', color: '#cc2200', desc: "Chennai's Pride" },
];

function useBallScene(canvasRef, morphRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.5;

    const geo = new THREE.SphereGeometry(1.25, 128, 128);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        u_morph: { value: 0 },
        u_time: { value: 0 },
      },
    });
    const ball = new THREE.Mesh(geo, mat);
    scene.add(ball);

    const clock = new THREE.Clock();
    let raf;
    let currentMorph = 0;

    function resize() {
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function animate() {
      raf = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      // Smooth lerp to target morph
      currentMorph += (morphRef.current - currentMorph) * 0.055;
      mat.uniforms.u_morph.value = currentMorph;
      mat.uniforms.u_time.value = elapsed;
      ball.rotation.y = elapsed * 0.18;
      ball.rotation.x = Math.sin(elapsed * 0.08) * 0.12;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);
}

function useBgScene(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setClearColor(0x000000);
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geo = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2() },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position,1.0); }`,
      fragmentShader: BG_FRAG,
    });
    scene.add(new THREE.Mesh(geo, mat));
    const clock = new THREE.Clock();
    let raf;

    function resize() {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      renderer.setSize(W, H, false);
      uniforms.u_res.value.set(W, H);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    function animate() {
      raf = requestAnimationFrame(animate);
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    }
    animate();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); geo.dispose(); mat.dispose(); renderer.dispose(); };
  }, []);
}

export default function BallMorphSection() {
  const sectionRef = useRef(null);
  const ballCanvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const morphRef = useRef(0);
  const [labelIdx, setLabelIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      morphRef.current = v;
      const idx = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
      setLabelIdx(idx);
    });
    return unsub;
  }, [scrollYProgress]);

  const ballScale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.7, 1, 1, 0.7]);
  const ballY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  useBallScene(ballCanvasRef, morphRef);
  useBgScene(bgCanvasRef);

  return (
    <div ref={sectionRef} className="ball-morph-section" id="sports-balls">
      {/* Sticky viewport */}
      <div className="ball-morph-sticky">
        {/* Shader BG */}
        <canvas ref={bgCanvasRef} className="ball-morph-bg-canvas" />

        {/* Overlay gradient */}
        <div className="ball-morph-overlay" />

        {/* Header */}
        <div className="ball-morph-header">
          <div className="section-label">Sports World</div>
          <h2 className="section-title">
            One Sport, <span>Every Passion</span>
          </h2>
          <p className="ball-morph-subtitle">Scroll to transform the ball</p>
        </div>

        {/* Ball canvas */}
        <motion.div
          className="ball-morph-canvas-wrap"
          style={{ scale: ballScale, y: ballY }}
        >
          <canvas ref={ballCanvasRef} className="ball-morph-canvas" />
        </motion.div>

        {/* Sport label */}
        <div className="ball-morph-label-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={labelIdx}
              className="ball-morph-label"
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ball-morph-icon">{BALL_LABELS[labelIdx].icon}</span>
              <div>
                <div className="ball-morph-sport">{BALL_LABELS[labelIdx].sport}</div>
                <div className="ball-morph-desc">{BALL_LABELS[labelIdx].desc}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step dots */}
        <div className="ball-morph-steps">
          {BALL_LABELS.map((b, i) => (
            <div key={b.sport} className={`ball-morph-step${i === labelIdx ? ' active' : ''}`}>
              <span>{b.sport}</span>
            </div>
          ))}
        </div>

        {/* Scroll progress bar */}
        <div className="ball-morph-progress-track">
          <motion.div
            className="ball-morph-progress-fill"
            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
          />
        </div>
      </div>
    </div>
  );
}
