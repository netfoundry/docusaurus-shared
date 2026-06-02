// DEV-ONLY debug probe -- DELETE ME (and remove from clientModules) when done.
//
// Renders a floating "dump" button. Clicking it snapshots the navbar + mobile
// sidebar DOM and downloads it as nf-debug.json, so the diagnostics can be read
// off disk instead of copy/pasting console output back and forth.
//
// Gated to dev (NODE_ENV !== 'production') so it never ships in a real build.

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  function collect() {
    const q = (sel) => document.querySelector(sel);
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), t: Math.round(r.top), b: Math.round(r.bottom)};
    };
    const list = (sel) => [...document.querySelectorAll(sel)].map((el) => ({
      cls: el.className, text: (el.textContent || '').trim().slice(0, 24), rect: rect(el),
    }));
    return {
      capturedAt: new Date().toISOString(),
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      pathname: window.location.pathname,
      navbarSidebarOpen: !!q('.navbar-sidebar--show'),
      // Right-navbar geometry -- to diagnose the desktop icon/search overlap.
      // Overlap shows up as one item's .l being less than the previous item's .r.
      rightItems: list('.navbar__items--right > *'),
      rightIcons: list('.navbar__items--right .nf-icon-link'),
      searchRect: rect(q('.navbar__items--right .DocSearch-Button')),
      // Left-navbar vertical alignment -- compare .t/.b of each to spot what's
      // off-center vs the Products/Resources link text.
      leftAlign: {
        brand: rect(q('.navbar__brand')),
        brandImg: rect(q('.navbar__brand img')),
        productIcon: rect(q('.nf-navbar-product-icon')),
        productImg: rect(q('.nf-navbar-product-icon img')),
        productLabel: rect(q('.nf-navbar-product-icon__label')),
        pickers: list('.navbar__items .nf-picker-trigger'),
      },
      // Full markup -- how the pickers / icon links render in the mobile sidebar.
      navbarHTML: q('.navbar')?.outerHTML ?? null,
      navbarSidebarHTML: q('.navbar-sidebar')?.outerHTML ?? null,
    };
  }

  function mount() {
    if (document.getElementById('nf-debug-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'nf-debug-btn';
    btn.type = 'button';
    btn.textContent = 'dump';
    Object.assign(btn.style, {
      position: 'fixed', bottom: '12px', left: '12px', zIndex: '2147483647',
      padding: '8px 12px', background: '#ff00aa', color: '#fff', border: 'none',
      borderRadius: '6px', font: 'bold 13px monospace', cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,.3)',
    });
    btn.addEventListener('click', () => {
      window.alert(
        'Debug probe (dev only).\n\n' +
        'This button is a debugging aid: it captures the live navbar / DOM ' +
        '(element markup, sizes, positions) into a JSON file so an AI coding ' +
        'agent can read what the page actually rendered while debugging.\n\n' +
        'The file (nf-debug.json) downloads now -- save it somewhere the agent ' +
        'can read it. Not part of the real site; remove before shipping.'
      );
      const blob = new Blob([JSON.stringify(collect(), null, 2)], {type: 'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'nf-debug.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      btn.textContent = 'dumped ✓';
      setTimeout(() => { btn.textContent = 'dump'; }, 1500);
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}
