import React, {useState, useRef, useEffect, useCallback} from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import clsx from 'clsx';

const NF_LOGO_DEFAULT = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';
const OPENZITI_LOGO_DEFAULT = 'https://netfoundry.io/docs/img/openziti-sm-logo.svg';

const YOUTUBE_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#ff0000"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>`;
const DISCOURSE_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="#ffedd5" stroke="#f97316" stroke-width="1.5"/></svg>`;

type Props = {
  label?: string;
  position?: 'left' | 'right';
  className?: string;
};

export default function ResourcesPicker({label = 'Resources', className}: Props) {
  const themeConfig = useThemeConfig() as any;
  const consoleLogo = themeConfig?.netfoundry?.consoleLogo ?? NF_LOGO_DEFAULT;
  const openzitiLogo = themeConfig?.netfoundry?.openzitiLogo ?? OPENZITI_LOGO_DEFAULT;

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
    window.dispatchEvent(new CustomEvent('nf-picker:open', {detail: {label}}));
    setOpen(true);
  }, [label]);

  const handlePanelEnter = useCallback(() => {
    hasEnteredPanel.current = true;
  }, []);

  const handlePanelLeave = useCallback(() => {
    if (hasEnteredPanel.current) close();
  }, [close]);

  const columns = [
    {
      header: 'Learn & Engage',
      headerClass: 'picker-header--nf-tertiary',
      links: [
        { label: 'NetFoundry Blog', description: 'Latest news, updates, and insights from NetFoundry.', href: 'https://netfoundry.io/blog/',  logoSrc: consoleLogo },
        { label: 'OpenZiti Tech Blog', description: 'Technical articles and community updates.',        href: 'https://blog.openziti.io/',    logoSrc: openzitiLogo },
      ],
    },
    {
      header: 'Community & Support',
      headerClass: 'picker-header--nf-secondary',
      links: [
        { label: 'NetFoundry YouTube', description: 'Video tutorials, demos, and technical deep dives.', href: 'https://www.youtube.com/c/NetFoundry', svgIcon: YOUTUBE_ICON },
        { label: 'OpenZiti Discourse', description: 'Ask questions and connect with the community.',     href: 'https://openziti.discourse.group/',     svgIcon: DISCOURSE_ICON },
      ],
    },
  ];

  return (
    <div
      ref={wrapRef}
      className={clsx('navbar__item', {'nf-picker--open': open})}>
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
          className="nf-picker-panel nf-picker-panel--narrow"
          onMouseDown={e => e.stopPropagation()}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}>
          <div className="picker-content picker-resources">
            {columns.map((col, i) => (
              <div key={i} className="picker-column">
                <span className={clsx('picker-header', col.headerClass)}>{col.header}</span>
                {col.links.map((link, j) => (
                  <Link key={j} to={link.href} className="picker-link" target="_blank" rel="noopener noreferrer">
                    {'logoSrc' in link
                      ? <img src={link.logoSrc} className="picker-logo" alt="" />
                      : <span className="picker-logo" dangerouslySetInnerHTML={{__html: (link as any).svgIcon}} />
                    }
                    <div className="picker-text">
                      <strong>{link.label}</strong>
                      <span>{link.description}</span>
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
