import React, {useEffect, useMemo, useRef} from 'react';

// ── Canvas & palette ────────────────────────────────────────────────────────
const W      = 1400;
const H      = 800;
const BG     = '#020617';
const CYAN   = '#22d3ee';
const INDIGO = '#4338ca';
const GREEN  = '#22c55e';

// ── Seeded LCG PRNG — SSR-safe ──────────────────────────────────────────────
function makeLCG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ── Types ───────────────────────────────────────────────────────────────────
type Vec2     = {x: number; y: number};
type NodeData = {id: number; x: number; y: number; size: number; isHub: boolean};
type ConnData = {id: string; from: Vec2; to: Vec2; pktDur: number; pktBegin: number};

// ── Segment-segment intersection (interior points only) ──────────────────────
function segIntersect(a: Vec2, b: Vec2, c: Vec2, d: Vec2): Vec2 | null {
  const dx1 = b.x - a.x, dy1 = b.y - a.y;
  const dx2 = d.x - c.x, dy2 = d.y - c.y;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((c.x - a.x) * dy2 - (c.y - a.y) * dx2) / denom;
  const u = ((c.x - a.x) * dy1 - (c.y - a.y) * dx1) / denom;
  if (t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98) {
    return {x: a.x + t * dx1, y: a.y + t * dy1};
  }
  return null;
}

// ── Network parameters ───────────────────────────────────────────────────────
const COLS      = 10;
const ROWS      = 6;
const K_NEAREST = 3;

// ── Component ───────────────────────────────────────────────────────────────
export default function HeroBackground(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  const {nodes, connections, packetConns, intersectionNodes} = useMemo(() => {
    const rng = makeLCG(0xcafef00d);

    // ── Step 1: Stratified node placement ─────────────────────────────────
    const cellW = (W - 40) / COLS;
    const cellH = (H - 40) / ROWS;
    const rawNodes: Vec2[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        rawNodes.push({
          x: 20 + col * cellW + rng() * cellW,
          y: 20 + row * cellH + rng() * cellH,
        });
      }
    }

    // ── Step 2: K-nearest-neighbor connections ─────────────────────────────
    const degree  = new Array<number>(rawNodes.length).fill(0);
    const edgeSet = new Set<string>();
    const conns: ConnData[] = [];
    let cid = 0;

    const dist2   = (a: Vec2, b: Vec2) => (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    const edgeKey = (i: number, j: number) => `${Math.min(i, j)}-${Math.max(i, j)}`;

    for (let i = 0; i < rawNodes.length; i++) {
      const nearest = rawNodes
        .map((n, j) => ({j, d: dist2(rawNodes[i], n)}))
        .filter(({j}) => j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, K_NEAREST);

      for (const {j} of nearest) {
        const key = edgeKey(i, j);
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          degree[i]++;
          degree[j]++;
          const pktDur = 2.0 + rng() * 1.0;
          conns.push({
            id:       `c${cid++}`,
            from:     rawNodes[i],
            to:       rawNodes[j],
            pktDur,
            pktBegin: -(rng() * pktDur),
          });
        }
      }
    }

    // ── Step 3: Build node display data ───────────────────────────────────
    const nodes: NodeData[] = rawNodes.map((p, i) => ({
      id:    i,
      x:     p.x,
      y:     p.y,
      size:  degree[i] >= 4 ? 2 + rng() * 0.8 : 0.9 + rng() * 0.8,
      isHub: degree[i] >= 4,
    }));

    // 1 in 4 connections carries a visible data packet.
    const packetConns = conns.filter((_, i) => i % 4 === 0);

    // ── Step 4: Geometric intersection nodes ──────────────────────────────
    const intersectionNodes: Vec2[] = [];
    outer: for (let i = 0; i < conns.length; i++) {
      for (let j = i + 1; j < conns.length; j++) {
        const pt = segIntersect(conns[i].from, conns[i].to, conns[j].from, conns[j].to);
        if (!pt) continue;
        if (rawNodes.some(n => (n.x - pt.x) ** 2 + (n.y - pt.y) ** 2 < 144)) continue;
        if (intersectionNodes.some(n => (n.x - pt.x) ** 2 + (n.y - pt.y) ** 2 < 64)) continue;
        intersectionNodes.push(pt);
        if (intersectionNodes.length >= 200) break outer;
      }
    }

    return {nodes, connections: conns, packetConns, intersectionNodes};
  }, []);

  // ── Global mouse listener ─────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;
      el.style.setProperty('--mx', inside ? `${x}px` : '-400px');
      el.style.setProperty('--my', inside ? `${y}px` : '-400px');
    };
    document.addEventListener('mousemove', onMove, {passive: true});
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        background: BG,
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
        ['--mx' as string]: '-400px',
        ['--my' as string]: '-400px',
      }}
      aria-hidden="true"
    >
      {/* ── LAYER 1: BLUEPRINT ──────────────────────────────────────────── */}
      <svg
        width="100%" height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none'}}
      >
        <defs>
          <filter id="bp-hub" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="bp-node" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g opacity="0.15">
          {connections.map(c => (
            <line key={c.id} x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y}
              stroke={CYAN} strokeWidth="0.4" />
          ))}
          {nodes.map(n => (
            <circle key={n.id} cx={n.x} cy={n.y} r={n.size}
              fill={n.isHub ? CYAN : INDIGO}
              filter={n.isHub ? 'url(#bp-hub)' : 'url(#bp-node)'} />
          ))}
          {intersectionNodes.map((n, i) => (
            <circle key={`ix-${i}`} cx={n.x} cy={n.y} r="0.9" fill={CYAN} />
          ))}
        </g>
      </svg>

      {/* ── LAYER 2: REVEALED (mouse flashlight) ────────────────────────── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          maskImage: 'radial-gradient(circle 260px at var(--mx) var(--my), black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle 260px at var(--mx) var(--my), black 20%, transparent 80%)',
        }}
      >
        <svg
          width="100%" height="100%"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          style={{display: 'block', pointerEvents: 'none'}}
        >
          <defs>
            <filter id="rv-hub" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="rv-node" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {connections.map(c => (
            <line key={c.id} x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y}
              stroke={CYAN} strokeWidth="0.75" strokeOpacity="0.65" />
          ))}

          {packetConns.map(c => (
            <circle key={`pkt-${c.id}`} r="2" fill={GREEN}
              style={{filter: `drop-shadow(0 0 6px ${GREEN})`}}>
              <animateMotion
                path={`M ${c.from.x} ${c.from.y} L ${c.to.x} ${c.to.y}`}
                dur={`${c.pktDur}s`} begin={`${c.pktBegin}s`}
                repeatCount="indefinite" calcMode="linear" />
            </circle>
          ))}

          {packetConns.map(c => {
            const arrivalBegin = `${c.pktBegin + c.pktDur}s`;
            const period       = `${c.pktDur}s`;
            return (
              <circle key={`ring-${c.id}`} cx={c.to.x} cy={c.to.y}
                r="2" fill="none" stroke={GREEN} strokeWidth="1.2">
                <animate attributeName="r" values="2;18;18" keyTimes="0;0.7;1"
                  dur={period} begin={arrivalBegin} repeatCount="indefinite"
                  calcMode="spline" keySplines="0.1 0.8 0.2 1; 0 0 0 0" />
                <animate attributeName="stroke-opacity" values="0.8;0;0" keyTimes="0;0.7;1"
                  dur={period} begin={arrivalBegin} repeatCount="indefinite"
                  calcMode="spline" keySplines="0.15 0.8 0.2 1; 0 0 0 0" />
              </circle>
            );
          })}

          {nodes.map(n => (
            <circle key={n.id} cx={n.x} cy={n.y} r={n.size}
              fill={n.isHub ? CYAN : INDIGO}
              filter={n.isHub ? 'url(#rv-hub)' : 'url(#rv-node)'} />
          ))}

          {intersectionNodes.map((n, i) => {
            const pulseBegin = `${(i * 0.41) % 3}s`;
            return (
              <React.Fragment key={`ix-${i}`}>
                <circle cx={n.x} cy={n.y} r="0.9" fill={CYAN} opacity="0.7" />
                <circle cx={n.x} cy={n.y} r="0.9" fill="none" stroke={GREEN} strokeWidth="0.8">
                  <animate attributeName="r" values="0.9;14;14" keyTimes="0;0.7;1"
                    dur="3s" begin={pulseBegin} repeatCount="indefinite"
                    calcMode="spline" keySplines="0.1 0.8 0.2 1; 0 0 0 0" />
                  <animate attributeName="stroke-opacity" values="0.6;0;0" keyTimes="0;0.7;1"
                    dur="3s" begin={pulseBegin} repeatCount="indefinite"
                    calcMode="spline" keySplines="0.15 0.8 0.2 1; 0 0 0 0" />
                </circle>
              </React.Fragment>
            );
          })}

          {nodes.map(n => (
            <text key={`lbl-${n.id}`} x={n.x + n.size + 3} y={n.y - n.size - 1}
              fill={CYAN} fontSize="5.5" fontFamily="'Courier New', Courier, monospace"
              fontWeight="bold" letterSpacing="1" opacity="0.8">
              VERIFIED
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
