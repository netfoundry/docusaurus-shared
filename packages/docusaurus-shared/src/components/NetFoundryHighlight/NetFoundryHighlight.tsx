import React, { ReactNode, CSSProperties } from 'react';

export type NetFoundryHighlightProps = {
    children?: ReactNode;
    style?: CSSProperties;
};

export default function NetFoundryHighlight(props: NetFoundryHighlightProps) {
    const { children, style } = props;
    return (
        <span style={style}>
      <span style={{ color: 'var(--ifm-color-primary)' }}>{children}</span>
    </span>
    );
}
