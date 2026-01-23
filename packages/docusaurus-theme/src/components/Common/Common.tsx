import React, { JSX } from 'react';
import clsx from 'clsx';
import styles from './Common.module.css';

export interface H1Props {
    children: React.ReactNode;
    id?: string;
    className?: string;
}

export interface H2Props {
    children: React.ReactNode;
    className?: string;
}

export interface H3Props {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

export interface HighlightProps {
    children: React.ReactNode;
    className?: string;
}

export function H1(props: H1Props): JSX.Element {
    const {children, id, className} = props;
    return (
        <p id={id} className={clsx(styles.h1, className)}>{children}</p>
    );
}

export function H2(props: H2Props): JSX.Element {
    const {children, className} = props;
    return (
        <p className={clsx(styles.h2, className)}>{children}</p>
    );
}

export function H3(props: H3Props): JSX.Element {
    const {children, style, className} = props;
    return (
        <h3 className={clsx(styles.h3, className)} style={style}>{children}</h3>
    );
}

export function Highlight(props: HighlightProps): JSX.Element {
    const { children, className } = props;
    return (
        <span className={clsx(styles.highlight, className)}>{children}</span>
    );
}