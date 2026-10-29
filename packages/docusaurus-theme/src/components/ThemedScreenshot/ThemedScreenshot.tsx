import React, { JSX } from 'react';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

export interface ThemedScreenshotProps {
    /** Light-mode image under static/, e.g. /img/zac-carol.png. The dark-mode copy is zac-carol-dark.png beside it. */
    src: string;
    alt: string;
    width?: number;
}

// Shows src in light mode and its "-dark" sibling in dark mode.
export function ThemedScreenshot({ src, alt, width }: ThemedScreenshotProps): JSX.Element {
    const light = useBaseUrl(src);
    const dark = useBaseUrl(src.replace(/(\.\w+)$/, '-dark$1'));
    return <ThemedImage sources={{ light, dark }} alt={alt} width={width} />;
}
