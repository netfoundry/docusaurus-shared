import React from 'react';

type Props = { width?: number | string; height?: number | string; className?: string; colored?: boolean };

export default function DiscourseIcon({width = '100%', height = '100%', className, colored = true}: Props) {
  if (colored) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -1 104 106" width={width} height={height} className={className}>
        <path fill="#231f20" d="M51.87,0C23.71,0,0,22.83,0,51c0,.91,0,52.81,0,52.81l51.86-.05c28.16,0,51-23.71,51-51.87S80,0,51.87,0Z"/>
        <path fill="#fff9ae" d="M52.37,19.74A31.62,31.62,0,0,0,24.58,66.41l-5.72,18.4L39.4,80.17a31.61,31.61,0,1,0,13-60.43Z"/>
        <path fill="#00aeef" d="M77.45,32.12a31.6,31.6,0,0,1-38.05,48L18.86,84.82l20.91-2.47A31.6,31.6,0,0,0,77.45,32.12Z"/>
        <path fill="#00a94f" d="M71.63,26.29A31.6,31.6,0,0,1,38.8,78L18.86,84.82,39.4,80.17A31.6,31.6,0,0,0,71.63,26.29Z"/>
        <path fill="#f15d22" d="M26.47,67.11a31.61,31.61,0,0,1,51-35A31.61,31.61,0,0,0,24.58,66.41l-5.72,18.4Z"/>
        <path fill="#e31b23" d="M24.58,66.41A31.61,31.61,0,0,1,71.63,26.29a31.61,31.61,0,0,0-49,39.63l-3.76,18.9Z"/>
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12v12l3.18-.004C4.895 21.086 8.27 22.5 12 22.5c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 4.5a7.5 7.5 0 0 1 4.33 13.598l-1.357 4.368-4.37-1.357A7.5 7.5 0 0 1 12 4.5z"/>
    </svg>
  );
}
