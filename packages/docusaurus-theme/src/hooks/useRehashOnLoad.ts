import {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';

/**
 * Re-applies the URL hash scroll target after the page layout has stabilized.
 *
 * Why: when a page is loaded cold with a hash (e.g. /foo#bar), the browser
 * scrolls to the anchor against the SSR HTML. If client-side hydration then
 * mounts content that grows the page (window-size-conditional sections, lazy
 * components, late image/font loads), the original scroll position drifts away
 * from the intended anchor.
 *
 * Strategy: each animation frame, look for the element. Once it exists, watch
 * its position. After a few consecutive frames where the position hasn't moved,
 * the layout has settled — scroll then. Give up after MAX_MS to avoid spinning
 * forever on pages whose height never stabilizes.
 */
const MAX_MS = 3000;
const STABLE_FRAMES_NEEDED = 3;
const POSITION_EPSILON_PX = 1;

export function useRehashOnLoad(): void {
    const {pathname, hash} = useLocation();
    useEffect(() => {
        if (!hash) return;
        const id = decodeURIComponent(hash.slice(1));
        const startedAt = performance.now();
        let stableFrames = 0;
        let lastTop: number | null = null;
        let rafId = 0;

        const tick = () => {
            const el = document.getElementById(id);
            if (el) {
                const top = el.getBoundingClientRect().top;
                if (lastTop !== null && Math.abs(top - lastTop) < POSITION_EPSILON_PX) {
                    stableFrames++;
                } else {
                    stableFrames = 0;
                }
                lastTop = top;
                if (stableFrames >= STABLE_FRAMES_NEEDED) {
                    el.scrollIntoView({block: 'start'});
                    return;
                }
            }
            if (performance.now() - startedAt < MAX_MS) {
                rafId = requestAnimationFrame(tick);
            }
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [pathname, hash]);
}
