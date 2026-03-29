import React, {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import {NetFoundryHorizontalSection} from "../NetFoundryHorizontalSection";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from './styles.module.css';
import {GitHubIcon, XIcon, YouTubeIcon} from '../icons';

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
                                        <GitHubIcon width={20} height={20} />
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
                                        <YouTubeIcon width={16} height={16} />
                                    </a>
                                )}
                                {sp.twitterUrl && (
                                    <a href={sp.twitterUrl} target="_blank" className={styles.footerSocialLink} rel="noreferrer">
                                        <XIcon width={16} height={16} />
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
