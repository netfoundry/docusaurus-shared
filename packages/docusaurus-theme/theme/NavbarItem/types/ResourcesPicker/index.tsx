import React from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import NavbarPicker from '../../NavbarPicker';
import {DiscourseIcon, YouTubeIcon} from '../../../../src/components/icons';

const NF_LOGO_DEFAULT      = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';
const OPENZITI_LOGO_DEFAULT = 'https://netfoundry.io/docs/img/openziti-sm-logo.svg';

type LogoLink = {
  label: string;
  description: string;
  href: string;
  logoSrc: string;
  badge?: React.ReactElement;
};

type IconLink = {
  label: string;
  description: string;
  href: string;
  icon: React.ReactElement;
};

type ResourceLink = LogoLink | IconLink;

function isLogoLink(link: ResourceLink): link is LogoLink {
  return 'logoSrc' in link;
}

function ResourceLink({link}: {link: ResourceLink}) {
  return (
    <Link to={link.href} className="picker-link" target="_blank" rel="noopener noreferrer">
      {isLogoLink(link) ? (
        <span style={{position: 'relative', display: 'inline-flex', flexShrink: 0, marginRight: '0.8rem', width: 32, height: 32}}>
          <img src={link.logoSrc} style={{width: 32, height: 32, objectFit: 'contain'}} alt="" />
          {link.badge && (
            <span style={{position: 'absolute', bottom: -2, right: -4, width: 14, height: 14, display: 'block'}}>
              {link.badge}
            </span>
          )}
        </span>
      ) : (
        <span className="picker-logo">{link.icon}</span>
      )}
      <div className="picker-text">
        <strong>{link.label}</strong>
        <span>{link.description}</span>
      </div>
    </Link>
  );
}

type Props = {
  label?: string;
  position?: 'left' | 'right';
  className?: string;
};

export default function ResourcesPicker({label = 'Resources', className}: Props) {
  const themeConfig  = useThemeConfig() as any;
  const consoleLogo  = themeConfig?.netfoundry?.consoleLogo  ?? NF_LOGO_DEFAULT;
  const openzitiLogo = themeConfig?.netfoundry?.openzitiLogo ?? OPENZITI_LOGO_DEFAULT;

  const youtubeBadge = <YouTubeIcon width={14} height={14} />;

  const learnLinks: ResourceLink[] = [
    { label: 'NetFoundry Blog',    description: 'Latest news, updates, and insights from NetFoundry.', href: 'https://netfoundry.io/blog/',        logoSrc: consoleLogo },
    { label: 'OpenZiti Tech Blog', description: 'Technical articles and community updates.',            href: 'https://blog.openziti.io/',          logoSrc: openzitiLogo },
  ];

  const communityLinks: ResourceLink[] = [
    { label: 'NetFoundry YouTube', description: 'Video tutorials, demos, and technical deep dives.',  href: 'https://www.youtube.com/c/NetFoundry', logoSrc: consoleLogo,   badge: youtubeBadge },
    { label: 'OpenZiti YouTube',   description: 'OpenZiti community videos and project updates.',     href: 'https://www.youtube.com/openziti',      logoSrc: openzitiLogo, badge: youtubeBadge },
    { label: 'OpenZiti Discourse', description: 'Ask questions and connect with the community.',      href: 'https://openziti.discourse.group/',     icon: <DiscourseIcon width={32} height={32} /> },
  ];

  return (
    <NavbarPicker label={label} className={className} panelClassName="nf-picker-panel--narrow" autoPosition>
      <div className="picker-column">
        <span className="picker-header picker-header--nf-primary" style={{color: 'var(--ifm-color-primary)'}}>Learn &amp; Engage</span>
        {learnLinks.map((link, i) => <ResourceLink key={i} link={link} />)}
        <span className="picker-header picker-header--nf-secondary" style={{marginTop: '0.75rem'}}>Community &amp; Support</span>
        {communityLinks.map((link, i) => <ResourceLink key={i} link={link} />)}
      </div>
    </NavbarPicker>
  );
}
