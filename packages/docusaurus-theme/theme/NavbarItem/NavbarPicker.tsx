import React, {useState, useRef, useEffect, useCallback, ReactNode} from 'react';
import clsx from 'clsx';

type Props = {
  label: string;
  className?: string;
  panelClassName?: string;
  /** Compute left offset via getBoundingClientRect so the panel stays on-screen.
   *  Use this for right-side navbar items where CSS positioning would clip. */
  autoPosition?: boolean;
  children: ReactNode;
};

export default function NavbarPicker({label, className, panelClassName, autoPosition = false, children}: Props) {
  const wrapRef         = useRef<HTMLDivElement>(null);
  const hasEnteredPanel = useRef(false);
  const [open, setOpen] = useState(false);
  const [panelLeft, setPanelLeft] = useState<number | undefined>(undefined);

  const close = useCallback(() => {
    setOpen(false);
    hasEnteredPanel.current = false;
  }, []);

  // Close on outside click/touch
  useEffect(() => {
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [close]);

  // Close when another picker opens
  useEffect(() => {
    const onOtherOpen = (e: any) => {
      if (e.detail.label !== label) close();
    };
    window.addEventListener('nf-picker:open', onOtherOpen);
    return () => window.removeEventListener('nf-picker:open', onOtherOpen);
  }, [label, close]);

  const handleTriggerEnter = useCallback(() => {
    hasEnteredPanel.current = false;
    if (autoPosition && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const PANEL_MAX_WIDTH = 430;
      const MARGIN = 16;
      const rightEdge = rect.left + PANEL_MAX_WIDTH;
      const overflow = rightEdge - (window.innerWidth - MARGIN);
      setPanelLeft(overflow > 0 ? rect.left - overflow : rect.left);
    }
    window.dispatchEvent(new CustomEvent('nf-picker:open', {detail: {label}}));
    setOpen(true);
  }, [label, autoPosition]);

  const handlePanelEnter = useCallback(() => { hasEnteredPanel.current = true; }, []);
  const handlePanelLeave = useCallback(() => { if (hasEnteredPanel.current) close(); }, [close]);

  const panelStyle = autoPosition && panelLeft !== undefined
    ? {left: panelLeft, right: 'auto', transform: 'none'} as React.CSSProperties
    : undefined;

  return (
    <div ref={wrapRef} className={clsx('navbar__item', {'nf-picker--open': open})}>
      <a
        role="button"
        href="#"
        aria-haspopup="true"
        aria-expanded={open}
        className={clsx('navbar__link', 'nf-picker-trigger', className)}
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={() => {}}
        onClick={e => { e.preventDefault(); setOpen(o => !o); }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setOpen(o => !o); } }}>
        {label}
      </a>
      {open && (
        <div
          className={clsx('nf-picker-panel', panelClassName)}
          style={panelStyle}
          onMouseDown={e => e.stopPropagation()}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}>
          {children}
        </div>
      )}
    </div>
  );
}
