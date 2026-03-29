import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useLocation} from 'react-router-dom';
import {DiscourseIcon, GitHubIcon, RedditIcon, XIcon, YouTubeIcon} from '@netfoundry/docusaurus-theme/ui';
import type {NavbarIconLink} from '@netfoundry/docusaurus-theme';

const DEFAULT_ICON_LINKS: NavbarIconLink[] = [
  {href: 'https://openziti.discourse.group/', title: 'Discourse', iconName: 'discourse'},
  {href: 'https://github.com/openziti/ziti',  title: 'GitHub',    iconName: 'github', pathPrefixes: ['/docs/openziti']},
  {href: 'https://github.com/openziti/zrok',  title: 'GitHub',    iconName: 'github', pathPrefixes: ['/docs/zrok']},
];

// Icons that cross-fade from mono → colored on hover
const FADES = new Set(['reddit', 'youtube']);

// Icons that need a CSS-drawn circle background (no circle in the SVG itself)
const CSS_CIRCLES = new Set(['youtube']);

// Icons that invert (circle appears, icon flips to white) on hover
const INVERTS = new Set<string>(['github']);
const UNINVERTS = new Set<string>(['x']);

// Icons that get a visible border ring
const BORDERS = new Set(['x', 'github']);

function resolveIcon(name: string, colored?: boolean): React.ReactElement {
  if (name === 'discourse') return <DiscourseIcon colored={colored ?? true} />;
  if (name === 'github')    return <GitHubIcon colored={colored ?? false} />;
  if (name === 'reddit')    return <RedditIcon colored={colored ?? false} />;
  if (name === 'x')         return <XIcon />;
  if (name === 'youtube')   return <YouTubeIcon colored={colored ?? false} />;
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
      {visible.map((link, i) => {
        const hasFade    = FADES.has(link.iconName);
        const isCssCir   = CSS_CIRCLES.has(link.iconName);
        const isInvert   = INVERTS.has(link.iconName);
        const isUninvert = UNINVERTS.has(link.iconName);
        const isBorder   = BORDERS.has(link.iconName);
        const isCircle  = true;
        return (
          <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
             className={`nf-icon-link nf-icon-link--${link.iconName}`} title={link.title}
             {...(isCircle ? {'data-circle': ''} : {})}
             {...(isCssCir ? {'data-css-circle': ''} : {})}
             {...(isInvert   ? {'data-invert': ''} : {})}
             {...(isUninvert ? {'data-uninvert': ''} : {})}
             {...(isBorder   ? {'data-border': ''} : {})}>
            {hasFade ? (
              <>
                <span className="nf-icon-link__mono">{resolveIcon(link.iconName, false)}</span>
                <span className="nf-icon-link__colored">{resolveIcon(link.iconName, true)}</span>
              </>
            ) : resolveIcon(link.iconName, link.colored)}
          </a>
        );
      })}
    </div>
  );
}
