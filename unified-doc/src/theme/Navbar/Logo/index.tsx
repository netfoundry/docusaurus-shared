import React, {JSX} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useLocation} from '@docusaurus/router';
import type {DocusaurusConfig} from "@docusaurus/types/src/config";
import ThemedImage from "@theme/ThemedImage";

const mapTitle = (p: string) => {
    // Extract the root project segment, skipping optional /docs/ prefix
    const segments = p.split('/');
    const rootSegment = segments[1] === 'docs' ? segments[2] : segments[1];
    const checkPath = (segment: string) => rootSegment === segment;

    if (checkPath('frontdoor')) return {includeNFLogo: true, to: '/frontdoor', alt:'Frontdoor', logoLight: `/img/frontdoor-sm-logo.svg`, logoDark: `/img/frontdoor-sm-logo.svg`};
    if (checkPath('selfhosted')) return {includeNFLogo: true, to: '/selfhosted',alt:'Self-Hosted', logoLight: `/img/onprem-sm-logo.svg`, logoDark: `/img/onprem-sm-logo.svg`};
    if (checkPath('openziti')) return {includeNFLogo: true, to: '/openziti',alt:'OpenZiti', logoLight: `/img/openziti-sm-logo.svg`, logoDark: `/img/openziti-sm-logo.svg`};
    if (checkPath('zlan')) return {includeNFLogo: true, to: '/zlan', alt:'zlan', logoLight: `/img/zlan-logo.svg`, logoDark: `/img/zlan-logo.svg`};
    if (checkPath('zrok')) return {text: '', includeNFLogo: true, to: '/zrok', alt:'zrok', logoLight: `/img/zrok-1.0.0-rocket-purple.svg`, logoDark: `/img/zrok-1.0.0-rocket-green.svg`};
    return {
        includeNFLogo: false,
        to: '/',
        alt:'NetFoundry',
        logoLight: '',
        logoDark: ''
    };
};

function navbarpoke(cfg:DocusaurusConfig) {
    // console.log("A:" + JSON.stringify(cfg?.themeConfig?.navbar));
}

export default function NavbarLogo(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const title = mapTitle(pathname);
    navbarpoke(siteConfig);

    const nfLogoLight = useBaseUrl('/img/netfoundry-name-and-logo.svg');
    const nfLogoDark = useBaseUrl('/img/netfoundry-name-and-logo-dark.svg');
    const logoLight = useBaseUrl(title.logoLight);
    const logoDark = useBaseUrl(title.logoDark);

    return (
        <>
        <Link className="navbar__brand" to="https://netfoundry.io">
            <ThemedImage
                className="navbar__logo_nf"
                alt={title.alt}
                sources={{
                    light: nfLogoLight,
                    dark:  nfLogoDark,
                }}
            />
        </Link>
        {console.log('[NavbarLogo] title:', JSON.stringify(title))}
        {(title.logoLight || title.text) && (
        <Link className="navbar__brand" to={title.to}>
            {title.logoLight && (
            <ThemedImage
                className="navbar__logo"
                alt={title.alt} attr="blah"
                sources={{
                    light: logoLight,
                    dark:  logoDark,
                }}
            />
            )}
            {title.text && <span className="navbar__title">{title.text}</span>}
        </Link>
        )}
        </>
    );
}