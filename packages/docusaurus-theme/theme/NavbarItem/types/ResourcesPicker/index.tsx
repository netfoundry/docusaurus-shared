import React, {useState, useRef, useEffect, useCallback} from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import clsx from 'clsx';

const NF_LOGO_DEFAULT = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';
const OPENZITI_LOGO_DEFAULT = 'https://netfoundry.io/docs/img/openziti-sm-logo.svg';

const YOUTUBE_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#ff0000"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>`;
const DISCOURSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -1 104 106"><path fill="#231f20" d="M51.87 0C23.71 0 0 22.83 0 51v52.81l51.86-.05c28.16 0 51-23.71 51-51.87S80 0 51.87 0Z"/><path fill="#fff9ae" d="M52.37 19.74a31.62 31.62 0 0 0-27.79 46.67l-5.72 18.4 20.54-4.64a31.61 31.61 0 1 0 13-60.43Z"/><path fill="#00aeef" d="M77.45 32.12a31.6 31.6 0 0 1-38.05 48l-20.54 4.7 20.91-2.47a31.6 31.6 0 0 0 37.68-50.23Z"/><path fill="#00a94f" d="M71.63 26.29A31.6 31.6 0 0 1 38.8 78l-19.94 6.82 20.54-4.65a31.6 31.6 0 0 0 32.23-53.88Z"/><path fill="#f15d22" d="M26.47 67.11a31.61 31.61 0 0 1 51-35 31.61 31.61 0 0 0-52.89 34.3l-5.72 18.4Z"/><path fill="#e31b23" d="M24.58 66.41a31.61 31.61 0 0 1 47.05-40.12 31.61 31.61 0 0 0-49 39.63l-3.76 18.9Z"/></svg>`;

type Props = {
  label?: string;
  position?: 'left' | 'right';
  className?: string;
};

export default function ResourcesPicker({label = 'Resources', className}: Props) {
  const themeConfig = useThemeConfig() as any;
  const consoleLogo = themeConfig?.netfoundry?.consoleLogo ?? NF_LOGO_DEFAULT;
  const openzitiLogo = themeConfig?.netfoundry?.openzitiLogo ?? OPENZITI_LOGO_DEFAULT;

  const wrapRef         = useRef<HTMLDivElement>(null);
  const hasEnteredPanel = useRef(false);
  const [open, setOpen] = useState(false);
  const [panelRight, setPanelRight] = useState<number>(16);

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
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setPanelRight(rect.left);
    }
    window.dispatchEvent(new CustomEvent('nf-picker:open', {detail: {label}}));
    setOpen(true);
  }, [label]);

  const handlePanelEnter = useCallback(() => {
    hasEnteredPanel.current = true;
  }, []);

  const handlePanelLeave = useCallback(() => {
    if (hasEnteredPanel.current) close();
  }, [close]);

  const learnLinks = [
    { label: 'NetFoundry Blog',    description: 'Latest news, updates, and insights from NetFoundry.', href: 'https://netfoundry.io/blog/',          logoSrc: consoleLogo },
    { label: 'OpenZiti Tech Blog', description: 'Technical articles and community updates.',            href: 'https://blog.openziti.io/',            logoSrc: openzitiLogo },
  ];

  const communityLinks = [
    { label: 'NetFoundry YouTube', description: 'Video tutorials, demos, and technical deep dives.',   href: 'https://www.youtube.com/c/NetFoundry', svgIcon: YOUTUBE_ICON },
    { label: 'OpenZiti Discourse', description: 'Ask questions and connect with the community.',       href: 'https://openziti.discourse.group/',     svgIcon: DISCOURSE_ICON },
  ];

  const renderLink = (link: typeof learnLinks[0] | typeof communityLinks[0], i: number) => (
    <Link key={i} to={link.href} className="picker-link" target="_blank" rel="noopener noreferrer">
      {'logoSrc' in link
        ? <img src={link.logoSrc} className="picker-logo" alt="" />
        : <span className="picker-logo" dangerouslySetInnerHTML={{__html: (link as any).svgIcon}} />
      }
      <div className="picker-text">
        <strong>{link.label}</strong>
        <span>{link.description}</span>
      </div>
    </Link>
  );

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
          style={{left: panelRight, right: 'auto', transform: 'none'}}
          onMouseDown={e => e.stopPropagation()}
          onMouseEnter={handlePanelEnter}
          onMouseLeave={handlePanelLeave}>
          <div className="picker-column">
            <span className="picker-header picker-header--nf-primary" style={{color: 'var(--ifm-color-primary)'}}>Learn &amp; Engage</span>
            {learnLinks.map(renderLink)}
            <span className="picker-header picker-header--nf-secondary" style={{marginTop: '0.75rem'}}>Community &amp; Support</span>
            {communityLinks.map(renderLink)}
          </div>
        </div>
      )}
    </div>
  );
}
