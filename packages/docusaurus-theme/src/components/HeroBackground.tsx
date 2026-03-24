import React, {useEffect, useRef} from 'react';

const PKT_GLOW = 'rgba(34,197,94,';
const PKT_CORE = '#86efac';

function project(position: any, camera: any, W: number, H: number) {
  const v = position.clone();
  v.project(camera);
  return {x: (v.x + 1) / 2 * W, y: (-v.y + 1) / 2 * H};
}

function inBounds(p: {x:number;y:number}, W: number, H: number) {
  return p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H;
}

type PacketState = {
  fromIdx: number; toIdx: number; speed: number; t: number;
  phase: 'travel' | 'pulse' | 'wait';
  pulse: number; waitUntil: number;
};

export default function HeroBackground(): React.ReactElement {
  const vantaRef  = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectRef = useRef<any>(null);
  const pausedRef = useRef(false);
  const mouseRef  = useRef({x: -1, y: -1, active: false});
  const revealRef = useRef({x: -1, y: -1}); // smoothed reveal position

  useEffect(() => {
    if (typeof window === 'undefined' || !vantaRef.current) return;
    let cancelled = false;
    let rafId: number;

    // Global mousemove so events fire regardless of what element is on top
    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = {
        x, y,
        active: x >= 0 && x <= rect.width && y >= 0 && y <= rect.height,
      };
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (effectRef.current?.renderer) {
        effectRef.current.renderer.setAnimationLoop(
          document.hidden ? null : () => effectRef.current?.onUpdate?.()
        );
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current = !entry.isIntersecting;
        if (effectRef.current?.renderer) {
          effectRef.current.renderer.setAnimationLoop(
            entry.isIntersecting ? () => effectRef.current?.onUpdate?.() : null
          );
        }
      },
      {threshold: 0}
    );
    if (vantaRef.current) observer.observe(vantaRef.current);

    Promise.all([
      import('three'),
      import('vanta/dist/vanta.net.min'),
    ]).then(([THREE, vantaMod]) => {
      if (cancelled || !vantaRef.current) return;
      if (effectRef.current) { effectRef.current.destroy(); effectRef.current = null; }
      const VANTA = (vantaMod as any).default ?? vantaMod;
      effectRef.current = VANTA({
        el:              vantaRef.current,
        THREE,
        mouseControls:   false,
        touchControls:   false,
        gyroControls:    false,
        color:           0x22d3ee,
        backgroundColor: 0x020617,
        points:          7,
        maxDistance:     26,
        spacing:         22,
        showDots:        true,
        speed:           0.8,
      });

      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas || !effectRef.current?.points?.length) return;

        const vPoints: any[] = effectRef.current.points;
        const cam = effectRef.current.camera;
        const W = canvas.clientWidth;
        const H = canvas.clientHeight;

        // Only use edges well inside maxDistance so they stay connected as nodes drift
        const SAFE_DIST = 18;

        // Pick a single fresh valid edge: both endpoints on-screen, firmly connected
        const pickEdge = (): {a: number; b: number} | null => {
          const cW2 = canvas.clientWidth;
          const cH2 = canvas.clientHeight;
          const candidates: {a:number; b:number; len:number}[] = [];
          for (let i = 0; i < vPoints.length; i++) {
            for (let j = i + 1; j < vPoints.length; j++) {
              const dx = vPoints[i].position.x - vPoints[j].position.x;
              const dy = vPoints[i].position.y - vPoints[j].position.y;
              const dz = vPoints[i].position.z - vPoints[j].position.z;
              if (Math.sqrt(dx*dx + dy*dy + dz*dz) > SAFE_DIST) continue;
              const pa = project(vPoints[i].position, cam, cW2, cH2);
              const pb = project(vPoints[j].position, cam, cW2, cH2);
              if (!inBounds(pa, W, H) || !inBounds(pb, W, H)) continue;
              const len = Math.sqrt((pa.x-pb.x)**2 + (pa.y-pb.y)**2);
              if (len > 20) candidates.push({a: i, b: j, len}); // skip tiny hops
            }
          }
          if (!candidates.length) return null;
          candidates.sort((x, y) => y.len - x.len);
          // Pick randomly from top half so we get variety
          const pool = candidates.slice(0, Math.max(1, Math.floor(candidates.length * 0.5)));
          return pool[Math.floor(Math.random() * pool.length)];
        };

        const speeds  = [0.22, 0.20, 0.25, 0.23, 0.21, 0.24, 0.19];
        const startTs = [0.30, 0.70, 0.10, 0.55, 0.45, 0.80, 0.20];
        const initialEdges = Array.from({length: 7}, () => pickEdge());
        const routes = initialEdges
          .map((e, i) => e ? {fromIdx: e.a, toIdx: e.b, speed: speeds[i], startT: startTs[i]} : null)
          .filter(Boolean) as {fromIdx:number; toIdx:number; speed:number; startT:number}[];

        const packets: PacketState[] = routes.map(r => ({
          fromIdx: r.fromIdx, toIdx: r.toIdx, speed: r.speed,
          t: r.startT, phase: 'travel', pulse: 0, waitUntil: 0,
        }));

        let last = performance.now();

        const tick = (now: number) => {
          rafId = requestAnimationFrame(tick);
          if (pausedRef.current) return;

          const dt  = Math.min((now - last) / 1000, 0.05);
          last = now;

          const dpr = window.devicePixelRatio || 1;
          const cW  = canvas.clientWidth;
          const cH  = canvas.clientHeight;
          if (canvas.width !== cW * dpr || canvas.height !== cH * dpr) {
            canvas.width  = cW * dpr;
            canvas.height = cH * dpr;
          }

          const ctx = canvas.getContext('2d')!;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, cW, cH);

          // ── Flashlight reveal ────────────────────────────────────────────
          // Dark overlay — always present
          ctx.fillStyle = 'rgba(2,6,23,0.85)';
          ctx.fillRect(0, 0, cW, cH);

          // Only cut the hole when the mouse is inside the hero
          if (mouseRef.current.active) {
            if (revealRef.current.x < 0) {
              revealRef.current.x = mouseRef.current.x;
              revealRef.current.y = mouseRef.current.y;
            }
            revealRef.current.x += (mouseRef.current.x - revealRef.current.x) * 0.1;
            revealRef.current.y += (mouseRef.current.y - revealRef.current.y) * 0.1;

            ctx.globalCompositeOperation = 'destination-out';
            const hole = ctx.createRadialGradient(
              revealRef.current.x, revealRef.current.y, 0,
              revealRef.current.x, revealRef.current.y, 180
            );
            hole.addColorStop(0,   'rgba(0,0,0,1)');
            hole.addColorStop(0.6, 'rgba(0,0,0,0.85)');
            hole.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = hole;
            ctx.fillRect(0, 0, cW, cH);
            ctx.globalCompositeOperation = 'source-over';
          }

          // ── Packets drawn after overlay so destination-out doesn't erase them ──
          // Reveal factor dims orbs outside the flashlight to match the mesh behavior.
          const revealActive = mouseRef.current.active && revealRef.current.x >= 0;
          const HOLE_R = 180;
          const revealFactor = (px: number, py: number): number => {
            if (!revealActive) return 0.28;
            const d = Math.sqrt((px - revealRef.current.x) ** 2 + (py - revealRef.current.y) ** 2);
            if (d < HOLE_R * 0.6) return 1;
            if (d > HOLE_R) return 0.28;
            const t = (d - HOLE_R * 0.6) / (HOLE_R * 0.4);
            return 1 - t * 0.72;
          };

          for (const p of packets) {
            const A = project(vPoints[p.fromIdx].position, cam, cW, cH);
            const B = project(vPoints[p.toIdx].position,   cam, cW, cH);

            if (p.phase === 'travel') {
              p.t += p.speed * dt;
              if (p.t >= 1) { p.t = 1; p.phase = 'pulse'; p.pulse = 0; }
              const x = A.x + (B.x - A.x) * p.t;
              const y = A.y + (B.y - A.y) * p.t;
              const rf = revealFactor(x, y);
              const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
              g.addColorStop(0, PKT_GLOW + (0.85 * rf).toFixed(2) + ')');
              g.addColorStop(1, PKT_GLOW + '0)');
              ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI*2);
              ctx.fillStyle = g; ctx.fill();
              ctx.globalAlpha = rf;
              ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2);
              ctx.fillStyle = PKT_CORE; ctx.fill();
              ctx.globalAlpha = 1;
            }

            if (p.phase === 'pulse') {
              p.pulse += dt * 22;
              const alpha = Math.max(0, 1 - p.pulse / 18);
              const rf = revealFactor(B.x, B.y);
              ctx.beginPath(); ctx.arc(B.x, B.y, p.pulse, 0, Math.PI*2);
              ctx.strokeStyle = `rgba(34,197,94,${(alpha * rf).toFixed(2)})`;
              ctx.lineWidth = 1.5; ctx.stroke();
              if (p.pulse >= 18) {
                p.phase = 'wait';
                p.waitUntil = now + 700 + Math.random() * 600;
                p.t = 0;
              }
            }

            if (p.phase === 'wait' && now >= p.waitUntil) {
              const next = pickEdge();
              if (next) { p.fromIdx = next.a; p.toIdx = next.b; }
              p.phase = 'travel'; p.t = 0;
            }
          }

        };

        rafId = requestAnimationFrame(tick);
      }));
    });

    return () => {
      cancelled = true;
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (effectRef.current) { effectRef.current.destroy(); effectRef.current = null; }
    };
  }, []);

  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 0}}>
      <div ref={vantaRef} style={{position: 'absolute', inset: 0}} />
      <canvas
        ref={canvasRef}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}}
        aria-hidden="true"
      />
    </div>
  );
}
