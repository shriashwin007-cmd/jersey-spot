import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Mouse-reactive gold particle field for the hero backdrop. Pure Three.js
// (no @react-three/fiber overhead needed for something this small).
export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 26;

    const COUNT = 260;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const basePos = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 46;
      const y = (Math.random() - 0.5) * 26;
      const z = (Math.random() - 0.5) * 18;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePos[i * 3] = x;
      basePos[i * 3 + 1] = y;
      basePos[i * 3 + 2] = z;
      speeds[i] = 0.2 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // small soft circular sprite drawn on a canvas — avoids loading an external texture
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,220,120,1)');
    grad.addColorStop(0.4, 'rgba(232,185,35,0.7)');
    grad.addColorStop(1, 'rgba(232,185,35,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    const mat = new THREE.PointsMaterial({
      size: 0.42,
      map: sprite,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.85,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' });
    io.observe(canvas);

    const clock = new THREE.Clock();
    let raf;
    function animate() {
      raf = requestAnimationFrame(animate);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      const pos = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        const bx = basePos[i * 3], by = basePos[i * 3 + 1], bz = basePos[i * 3 + 2];
        pos[i * 3] = bx + Math.sin(t * speeds[i] + i) * 0.6;
        pos[i * 3 + 1] = by + Math.cos(t * speeds[i] * 0.8 + i) * 0.6;
      }
      geo.attributes.position.needsUpdate = true;

      targetRotY += (mouseX * 0.25 - targetRotY) * 0.03;
      targetRotX += (-mouseY * 0.15 - targetRotX) * 0.03;
      points.rotation.y = targetRotY;
      points.rotation.x = targetRotX;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('mousemove', onMouse);
      geo.dispose();
      mat.dispose();
      sprite.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden />;
}
