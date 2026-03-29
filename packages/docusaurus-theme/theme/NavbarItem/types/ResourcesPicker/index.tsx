import React from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import NavbarPicker from '../../NavbarPicker';
import {DiscourseIcon, GitHubIcon, YouTubeIcon} from '@netfoundry/docusaurus-theme/ui';
import type {ResourcesPickerSection, ResourcesPickerLink} from '@netfoundry/docusaurus-theme';

const NF_LOGO_DEFAULT       = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';
const OPENZITI_LOGO_DEFAULT = 'https://netfoundry.io/docs/img/openziti-sm-logo.svg';

function resolveIcon(name: string, size = 32): React.ReactElement {
  if (name === 'discourse') return <DiscourseIcon width={size} height={size} />;
  if (name === 'github')    return <GitHubIcon    width={size} height={size} />;
  if (name === 'youtube')   return <YouTubeIcon   width={size} height={size} />;
  return <></>;
}

function ResourceLink({link}: {link: ResourcesPickerLink}) {
  const badge = link.badge ? resolveIcon(link.badge, 14) : null;
  return (
    <Link to={link.href} className="picker-link" target="_blank" rel="noopener noreferrer">
      {link.logoUrl ? (
        <span style={{position: 'relative', display: 'inline-flex', flexShrink: 0, marginRight: '0.8rem', width: 32, height: 32}}>
          <img src={link.logoUrl} style={{width: 32, height: 32, objectFit: 'contain'}} alt="" />
          {badge && (
            <span style={{position: 'absolute', bottom: -2, right: -4, width: 14, height: 14, display: 'block'}}>
              {badge}
            </span>
          )}
        </span>
      ) : link.iconName ? (
        <span className="picker-logo">{resolveIcon(link.iconName)}</span>
      ) : null}
      <div className="picker-text">
        <strong>{link.label}</strong>
        <span>{link.description}</span>
      </div>
    </Link>
  );
}

function buildDefaultSections(consoleLogo: string, openzitiLogo: string): ResourcesPickerSection[] {
  const youtubeBadge = 'youtube' as const;
  return [
    {
      header: 'Learn & Engage',
      links: [
        {label: 'NetFoundry Blog',    description: 'Latest news, updates, and insights from NetFoundry.', href: 'https://netfoundry.io/blog/',   logoUrl: consoleLogo},
        {label: 'OpenZiti Tech Blog', description: 'Technical articles and community updates.',            href: 'https://blog.openziti.io/',     logoUrl: openzitiLogo},
      ],
    },
    {
      header: 'Community & Support',
      links: [
        {label: 'NetFoundry YouTube', description: 'Video tutorials, demos, and technical deep dives.',  href: 'https://www.youtube.com/c/NetFoundry', logoUrl: consoleLogo,   badge: youtubeBadge},
        {label: 'OpenZiti YouTube',   description: 'OpenZiti community videos and project updates.',     href: 'https://www.youtube.com/openziti',      logoUrl: openzitiLogo, badge: youtubeBadge},
        {label: 'OpenZiti Discourse', description: 'Ask questions and connect with the community.',      href: 'https://openziti.discourse.group/',     iconName: 'discourse'},
      ],
    },
  ];
}

type Props = {
  label?: string;
  position?: 'left' | 'right';
  className?: string;
};

export default function ResourcesPicker({label = 'Resources', className}: Props) {
  const themeConfig   = useThemeConfig() as any;
  const consoleLogo   = themeConfig?.netfoundry?.consoleLogo   ?? NF_LOGO_DEFAULT;
  const openzitiLogo  = themeConfig?.netfoundry?.openzitiLogo  ?? OPENZITI_LOGO_DEFAULT;
  const sections: ResourcesPickerSection[] =
    themeConfig?.netfoundry?.resourcesPickerSections ?? buildDefaultSections(consoleLogo, openzitiLogo);

  return (
    <NavbarPicker label={label} className={className} panelClassName="nf-picker-panel--narrow" autoPosition>
      {sections.map((section, i) => (
        <div key={i} className="picker-column">
          <span className={`picker-header picker-header--nf-${i === 0 ? 'primary' : 'secondary'}`}
                style={i === 0 ? {color: 'var(--ifm-color-primary)'} : {marginTop: '0.75rem'}}>
            {section.header}
          </span>
          {section.links.map((link: ResourcesPickerLink, j: number) => <ResourceLink key={j} link={link} />)}
        </div>
      ))}
    </NavbarPicker>
  );
}
