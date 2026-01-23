import React, { ReactNode, CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export type NetFoundryHorizontalSectionProps = {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    id?: string;
};

export function NetFoundryHorizontalSection(props: NetFoundryHorizontalSectionProps) {
    const { children, className, style, id } = props;
    return (
        <section
            className={clsx(className, styles.ozHorizontalSectionRoot, styles.ozhsContent)}
            style={style}
            id={id}
        >
            {children}
        </section>
    );
}