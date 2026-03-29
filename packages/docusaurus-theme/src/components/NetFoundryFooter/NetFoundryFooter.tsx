import React, {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import {NetFoundryHorizontalSection} from "../NetFoundryHorizontalSection";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from './styles.module.css';

export interface SocialProps {
    twitterUrl?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
}
export const defaultSocialProps: SocialProps = {
    twitterUrl: '',
    linkedInUrl: '',
    githubUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
};

// Link can be a ReactNode (JSX) or a plain object with href/label
export type FooterLink = React.ReactNode | { href: string; label: string };

export type NetFoundryFooterProps = {
    className?: string;
    style?: CSSProperties;
    description?: string;
    socialProps?: SocialProps;
    documentationLinks?: FooterLink[];
    communityLinks?: FooterLink[];
    resourceLinks?: FooterLink[];
    children?: ReactNode;
};

// Convert a FooterLink to a ReactNode
function renderLink(link: FooterLink, index: number): React.ReactNode {
    if (link && typeof link === 'object' && 'href' in link && 'label' in link) {
        return <a key={index} href={link.href}>{link.label}</a>;
    }
    return link;
}

export function defaultNetFoundryFooterProps(overrides?: Partial<NetFoundryFooterProps>): NetFoundryFooterProps {
    return {
        description: 'Self-hosted OpenZiti for enterprises needing compliance, control, and support.',
        socialProps: {
            githubUrl: 'https://github.com/openziti/ziti',
            linkedInUrl: 'https://www.linkedin.com/company/netfoundry',
            youtubeUrl: 'https://www.youtube.com/OpenZiti',
            twitterUrl: 'https://x.com/OpenZiti'
        },
        documentationLinks: [
            <a href="/docs/openziti/learn/quickstarts/services/ztha">Getting Started</a>,
            <a href="/docs/openziti/reference/developer/api/">API Reference</a>,
            <a href="/docs/openziti/reference/developer/sdk/">SDK Integration</a>,
        ],
        communityLinks: [
            <a href="https://github.com/openziti/ziti">GitHub</a>,
            <a href="https://openziti.discourse.group/">Discourse Forum</a>,
            <a href="/docs/openziti/policies/CONTRIBUTING">Contributing</a>,
        ],
        resourceLinks: [
            <a href="https://blog.openziti.io">OpenZiti Tech Blog</a>,
            <a href="https://netfoundry.io/">NetFoundry</a>,
        ],
        ...overrides
    };
}

function ListBlock({title, items}:{title:string; items?: FooterLink[]}) {
    if (!items?.length) return null;
    return (
        <div className={styles.footerColumn}>
            <h3>{title}</h3>
            <ul className={styles.footerLinks}>
                {items.map((item, i) => <li key={i}>{renderLink(item, i)}</li>)}
            </ul>
        </div>
    );
}

export function NetFoundryFooter(props: NetFoundryFooterProps) {
    const { className, style, children, description } = props;
    const sp = {...defaultSocialProps, ...(props.socialProps ?? {})};

    if (children) return <>{children}</>;

    return (
        <footer className={clsx(className, styles.ozFooter)} style={style}>
            <NetFoundryHorizontalSection className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerColumn}>
                            <h3>NetFoundry</h3>
                            <p>{description ?? 'An open source project enabling developers to embed zero trust networking directly into applications.'}</p>
                            <div className={styles.footerSocialLinks}>
                                {sp.githubUrl && (
                                    <a href={sp.githubUrl} target="_blank" className={styles.footerSocialLink} rel="noreferrer">
                                        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"/>
                                        </svg>
                                    </a>
                                )}
                                {sp.linkedInUrl && (
                                    <a href={sp.linkedInUrl} target="_blank" className={styles.footerSocialLink} rel="noreferrer">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.996 16V10.1C15.996 7.5 15.375 5.49999 12.025 5.49999C10.4 5.49999 9.325 6.39999 8.875 7.29999H8.825V5.79999H5.65V16H8.95V10.7C8.95 9.30001 9.2 7.9 10.925 7.9C12.65 7.9 12.675 9.59999 12.675 10.8V16H15.996Z"/>
                                            <path d="M0.25 5.79999H3.575V16H0.25V5.79999Z"/>
                                            <path d="M1.9 0C0.85 0 0 0.85 0 1.9C0 2.95 0.85 3.8 1.9 3.8C2.95 3.8 3.8 2.95 3.8 1.9C3.8 0.85 2.95 0 1.9 0Z"/>
                                        </svg>
                                    </a>
                                )}
                                {sp.youtubeUrl && (
                                    <a href={sp.youtubeUrl} target="_blank" className={styles.footerSocialLink} rel="noreferrer">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.969 4.69c-.183-1.358-1.062-2.275-2.361-2.46C12.371 2 8 2 8 2S3.629 2 2.362 2.229c-1.3.186-2.179 1.103-2.361 2.461C0 6.03 0 10 0 10s0 3.97.2 5.31c.183 1.358 1.062 2.275 2.361 2.46C3.63 18 8 18 8 18s4.371 0 5.638-.23c1.3-.185 2.178-1.102 2.361-2.46.2-1.34.2-5.31.2-5.31s0-3.97-.23-5.31zm-8.36, 8.57V6.73l3.76 2.27-3.76 2.26z"/>
                                        </svg>
                                    </a>
                                )}
                                {sp.twitterUrl && (
                                    <a href={sp.twitterUrl} target="_blank" className={styles.footerSocialLink} rel="noreferrer">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                    </a>
                                )}
                                {sp.facebookUrl && (
                                    <a href={sp.facebookUrl} target="_blank" className={styles.footerSocialLink} rel="noreferrer">
                                        <span>f</span>
                                    </a>
                                )}
                                {sp.instagramUrl && (
                                    <a href={sp.instagramUrl} target="_blank" className={styles.footerSocialLink} rel="noreferrer">
                                        <span>ig</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        <ListBlock
                            title="Documentation"
                            items={props.documentationLinks ?? [
                                <a href={useBaseUrl("/docs/learn/quickstarts/services/ztha")}>Getting Started</a>,
                                <a href={useBaseUrl("/docs/reference/developer/api/")}>API Reference</a>,
                                <a href={useBaseUrl("/docs/reference/developer/sdk/")}>SDK Integration</a>,
                            ]}
                        />
                        <ListBlock
                            title="Community"
                            items={props.communityLinks ?? [
                                <a href="https://github.com/openziti/ziti">GitHub</a>,
                                <a href="https://openziti.discourse.group/">Discourse Forum</a>,
                                <a href="/docs/openziti/policies/CONTRIBUTING">Contributing</a>,
                            ]}
                        />
                        <ListBlock
                            title="Resources"
                            items={props.resourceLinks ?? [
                                <a href="https://blog.openziti.io">OpenZiti Tech Blog</a>,
                                <a href="https://netfoundry.io/">NetFoundry</a>,
                            ]}
                        />
                    </div>
                </div>

                <div className={styles.footerCopyright}>
                    <p>© {new Date().getFullYear()} NetFoundry Inc. OpenZiti is an open source project sponsored by NetFoundry. All rights reserved.</p>
                </div>
            </NetFoundryHorizontalSection>
        </footer>
    );
}
