import React, {JSX} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import type {DocusaurusConfig} from "@docusaurus/types/src/config";
import ThemedImage from "@theme/ThemedImage";

const mapTitle = (p: string, defTitle: string) => {
    if (p.startsWith('/docs/frontdoor')) return {includeNFLogo: true, to: '/frontdoor', alt:'Frontdoor', logoLight: `/docs/img/frontdoor-sm-logo.svg`, logoDark: `/docs/img/frontdoor-sm-logo.svg`};
    if (p.startsWith('/docs/onprem')) return {includeNFLogo: true, to: '/onprem',alt:'On-Prem', logoLight: `/docs/img/onprem-sm-logo.svg`, logoDark: `/docs/img/onprem-sm-logo.svg`};
    if (p.startsWith('/docs/openziti')) return {includeNFLogo: true, to: '/openziti',alt:'OpenZiti', logoLight: `/docs/img/openziti-sm-logo.svg`, logoDark: `/docs/img/openziti-sm-logo.svg`};
    if (p.startsWith('/docs/zlan')) return {includeNFLogo: true, to: '/zlan', alt:'zlan', logoLight: `/docs/img/zlan-logo.svg`, logoDark: `/docs/img/zlan-logo.svg`};
    if (p.startsWith('/docs/zrok')) return {text: '', includeNFLogo: true, to: '/zrok', alt:'zrok', logoLight: `/docs/img/zrok-1.0.0-rocket-purple.svg`, logoDark: `/docs/img/zrok-1.0.0-rocket-green.svg`};
    return {
        includeNFLogo: false,
        to: '/',
        alt:'NetFoundry',
        logoLight: `/docs/img/netfoundry-name-and-logo.svg`,
        logoDark: `/docs/img/netfoundry-name-and-logo-dark.svg`
    };
};

function navbarpoke(cfg:DocusaurusConfig) {
    // console.log("A:" + JSON.stringify(cfg?.themeConfig?.navbar));
}

export default function NavbarLogo(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const title = mapTitle(pathname, siteConfig.title);
    navbarpoke(siteConfig);
    return (
        <>
        <Link className="navbar__brand" to="https://netfoundry.io">
            <ThemedImage
                className="navbar__logo_nf"
                alt={title.alt}
                sources={{
                    light: `/docs/img/netfoundry-name-and-logo.svg`,
                    dark:  `/docs/img/netfoundry-name-and-logo-dark.svg`,
                }}
            />
        </Link>
        <Link className="navbar__brand" to={title.to}>
            <ThemedImage
                className="navbar__logo"
                alt={title.alt}
                sources={{
                    light: title.logoLight,
                    dark:  title.logoDark,
                }}
            />
            <span className="navbar__title">{title.text}</span>
        </Link>
        </>
    );
}