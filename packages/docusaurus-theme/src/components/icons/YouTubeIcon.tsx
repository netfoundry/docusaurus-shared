import React from 'react';

type Props = { width?: number; height?: number; className?: string; colored?: boolean };

const VIEWBOX = '-3.5 -6.5 36 33';
const RECT    = 'M14.4848 20C14.4848 20 23.5695 20 25.8229 19.4C27.0917 19.06 28.0459 18.08 28.3808 16.87C29 14.65 29 9.98 29 9.98C29 9.98 29 5.34 28.3808 3.14C28.0459 1.9 27.0917 0.94 25.8229 0.61C23.5695 0 14.4848 0 14.4848 0C14.4848 0 5.42037 0 3.17711 0.61C1.9286 0.94 0.954148 1.9 0.59888 3.14C0 5.34 0 9.98 0 9.98C0 9.98 0 14.65 0.59888 16.87C0.954148 18.08 1.9286 19.06 3.17711 19.4C5.42037 20 14.4848 20 14.4848 20Z';
const PLAY    = 'M19 10L11.5 5.75V14.25L19 10Z';

export default function YouTubeIcon({width = 18, height = 18, className, colored = false}: Props) {
  if (colored) {
    return (
      <svg viewBox={VIEWBOX} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className={className}>
        <path d={RECT} fill="#FF0033"/>
        <path d={PLAY} fill="white"/>
      </svg>
    );
  }
  return (
    <svg viewBox={VIEWBOX} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" className={className}>
      <defs>
        <mask id="yt-mask">
          <rect x="0" y="-4.5" width="29" height="29" fill="white"/>
          <path d={PLAY} fill="black"/>
        </mask>
      </defs>
      <path d={RECT} fill="currentColor" mask="url(#yt-mask)"/>
    </svg>
  );
}
