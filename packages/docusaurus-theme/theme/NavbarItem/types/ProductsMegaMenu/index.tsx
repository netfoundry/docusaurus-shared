import React, {useState, useRef, useEffect, useCallback} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';

export type MegaMenuLink = {
  label: string;
  to: string;
  logo?: string;
  description?: string;
};

export type MegaMenuColumn = {
  header: string;
  headerClass?: string;
  links: MegaMenuLink[];
};

type Props = {
  label?: string;
  position?: 'left' | 'right';
  columns: MegaMenuColumn[];
  className?: string;
};

export default function ProductsMegaMenu({label = 'Products', columns, className}: Props) {
  const wrapRef       = useRef<HTMLDivElement>(null);
  const hasEnteredPanel = useRef(false);
  const [open, setOpen] = useState(false);

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

  // Sync: close when another megamenu opens
  useEffect(() => {
    const onOtherOpen = (e: any) => {
      if (e.detail.label !== label) close();
    };
    window.addEventListener('nf-megamenu:open', onOtherOpen);
    return () => window.removeEventListener('nf-megamenu:open', onOtherOpen);
  }, [label, close]);

  const handleTriggerEnter = useCallback(() => {
    hasEnteredPanel.current = false;
    window.dispatchEvent(new CustomEvent('nf-megamenu:open', {detail: {label}}));
    setOpen(true);
  }, [label]);

  // Stay open until user enters the panel — no timer
  const handleTriggerLeave = useCallback(() => {}, []);

  const handlePanelEnter = useCallback(() => {
    hasEnteredPanel.current = true;
  }, []);

  const handlePanelLeave = useCallback(() => {
    if (hasEnteredPanel.current) close();
  }, [close]);

  return (
    <div
      ref={wrapRef}
      className={clsx('navbar__item', {'nf-products-menu--open': open})}
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}>
      <a
        role="button"
        href="#"
        aria-haspopup="true"
        aria-expanded={open}
        className={clsx('navbar__link', 'nf-mega-dropdown', className)}
        onClick={e => { e.preventDefault(); setOpen(o => !o); }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setOpen(o => !o); } }}>
        {label}
      </a>
      {open && (
        <div
          className="nf-mega-panel"
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}
          onClick={close}>
          <div className="mega-menu-content">
            {columns.map((col, i) => (
              <div key={i} className="mega-column">
                <span className={clsx('mega-header', col.headerClass)}>{col.header}</span>
                {col.links.map((link, j) => (
                  <Link key={j} to={link.to} className="mega-link">
                    {link.logo && <img src={link.logo} className="mega-logo" alt="" />}
                    <div className="mega-text">
                      <strong>{link.label}</strong>
                      {link.description && <span>{link.description}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
