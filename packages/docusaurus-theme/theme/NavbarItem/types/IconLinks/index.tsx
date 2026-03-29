import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useLocation} from 'react-router-dom';
import {DiscourseIcon, GitHubIcon, YouTubeIcon} from '@netfoundry/docusaurus-theme/ui';
import type {NavbarIconLink} from '@netfoundry/docusaurus-theme';

const DEFAULT_ICON_LINKS: NavbarIconLink[] = [
  {href: 'https://openziti.discourse.group/', title: 'Discourse', iconName: 'discourse'},
  {href: 'https://github.com/openziti/ziti',  title: 'GitHub',    iconName: 'github', pathPrefixes: ['/docs/openziti']},
  {href: 'https://github.com/openziti/zrok',  title: 'GitHub',    iconName: 'github', pathPrefixes: ['/docs/zrok']},
];

function resolveIcon(name: string): React.ReactElement {
  if (name === 'discourse') return <DiscourseIcon />;
  if (name === 'github')    return <GitHubIcon />;
  if (name === 'youtube')   return <YouTubeIcon />;
  return <></>;
}

export default function IconLinks(_props: {position?: 'left' | 'right'}) {
  const themeConfig = useThemeConfig() as any;
  const links: NavbarIconLink[] = themeConfig?.netfoundry?.navbarIconLinks ?? DEFAULT_ICON_LINKS;
  const {pathname} = useLocation();

  const visible = links.filter(link =>
    !link.pathPrefixes || link.pathPrefixes.some((p: string) => pathname.startsWith(p))
  );

  return (
    <div className="nf-icon-links">
      {visible.map((link, i) => (
        <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
           className={`nf-icon-link nf-icon-link--${link.iconName}`} title={link.title}>
          {resolveIcon(link.iconName)}
        </a>
      ))}
    </div>
  );
}
