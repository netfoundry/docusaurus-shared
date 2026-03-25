import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { WindowsLogo, MacOSLogo, LinuxLogo } from './logos';

export interface DownloadLink {
    arch: string;
    url: string;
}

export interface PlatformSpec {
    links: DownloadLink[];
    logo?: string;
}

export interface ExtraPlatform extends PlatformSpec {
    osName: string;
}

export interface DownloadSectionProps {
    windows?: PlatformSpec;
    macos?: PlatformSpec;
    linux?: PlatformSpec;
    extras?: ExtraPlatform[];
}

interface CardProps {
    osName: string;
    spec: PlatformSpec;
    defaultLogo: React.ReactNode;
    dark: boolean;
}

const v = (light: string, dark_: string, dark: boolean) => dark ? dark_ : light;

const Card: React.FC<CardProps> = ({ osName, spec, defaultLogo, dark }) => {
    const logo = spec.logo
        ? <img src={spec.logo} alt={osName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        : defaultLogo;

    const card: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1,
        width: '30%',
        borderRadius: '1em',
        overflow: 'hidden',
        border: `1px solid var(--nf-download-border, ${v('#e0d9fb', '#3a2e6e', dark)})`,
        boxShadow: v('0 0.125em 0.75em rgba(124,95,245,0.10)', '0 0.125em 0.75em rgba(0,0,0,0.35)', dark),
        background: `var(--nf-download-card-bg, ${v('#ffffff', '#1e1b2e', dark)})`,
        transition: 'box-shadow 0.2s, transform 0.2s',
    };

    const logoArea: React.CSSProperties = {
        width: '100%',
        height: '8em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `var(--nf-download-accent-soft, ${v('#f3f0fe', '#2a1f56', dark)})`,
        borderBottom: `1px solid var(--nf-download-border, ${v('#e0d9fb', '#3a2e6e', dark)})`,
        boxSizing: 'border-box',
        flexShrink: 0,
    };

    const logoWrap: React.CSSProperties = {
        width: '4em',
        height: '4em',
        color: `var(--nf-download-logo-color, ${v('#1a1a1a', '#ffffff', dark)})`,
    };

    const title: React.CSSProperties = {
        margin: '1em 0 0.75em',
        fontSize: '1rem',
        fontWeight: 600,
    };

    const buttonList: React.CSSProperties = {
        listStyle: 'none',
        padding: '0 1em',
        margin: '0 0 1.25em',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5em',
    };

    const btn: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '2em',
        minWidth: '5em',
        padding: '0 0.875em',
        margin: 0,
        background: 'var(--nf-download-accent, #7c5ff5)',
        borderRadius: '0.75em',
        cursor: 'pointer',
    };

    const linkStyle: React.CSSProperties = {
        textDecoration: 'none',
        color: 'var(--nf-download-accent-text, #ffffff)',
        fontSize: '0.8rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
    };

    return (
        <div style={card}>
            <div style={logoArea}>
                <div style={logoWrap}>{logo}</div>
            </div>
            <h3 style={title}>{osName}</h3>
            <ul style={buttonList}>
                {spec.links.map((link, i) => (
                    <li key={i} style={btn}>
                        <a href={link.url} style={linkStyle}>{link.arch}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const DownloadSection: React.FC<DownloadSectionProps> = ({ windows, macos, linux, extras = [] }) => {
    const { colorMode } = useColorMode();
    const dark = colorMode === 'dark';

    const wrap: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: '1em',
        padding: '1.5em 0',
    };

    return (
        <div style={wrap}>
            {windows && <Card osName="Windows" spec={windows} defaultLogo={<WindowsLogo />} dark={dark} />}
            {macos   && <Card osName="macOS"   spec={macos}   defaultLogo={<MacOSLogo />}   dark={dark} />}
            {linux   && <Card osName="Linux"   spec={linux}   defaultLogo={<LinuxLogo />}   dark={dark} />}
            {extras.map((p, i) => (
                <Card key={i} osName={p.osName} spec={p} defaultLogo={null} dark={dark} />
            ))}
        </div>
    );
};
