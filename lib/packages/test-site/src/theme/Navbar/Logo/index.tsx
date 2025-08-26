import React, {JSX} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import type {DocusaurusContext} from "@docusaurus/types";
import type {DocusaurusConfig} from "@docusaurus/types/src/config";
import ThemedImage from "@theme/ThemedImage";

const mapTitle = (p: string, defTitle: string) => {
    const generic = `https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg`;
    if (p.startsWith('/docs/frontdoor')) return {to: '/frontdoor', alt:'Frontdoor', logoLight: `/docs/img/frontdoor-logo-light.svg`, logoDark: `/docs/img/frontdoor-logo-dark.svg`};
    if (p.startsWith('/docs/onprem')) return {to: '/onprem',alt:'On-Prem', logoLight: `/docs/img/onprem-logo-light.svg`, logoDark: `/docs/img/onprem-logo-dark.svg`};
    if (p.startsWith('/docs/openziti')) return {to: '/openziti',alt:'OpenZiti', logoLight: `/docs/img/openziti-logo-light.svg`, logoDark: `/docs/img/openziti-logo-dark.svg`};
    return {alt:'NetFoundry',
        logoLight: `https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/logo%20horizontal%20no%20margin/tagline/netfoundry-logo-tag-color-horizontal.svg`,
        logoDark: `https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/logo%20horizontal%20no%20margin/tagline/netfoundry-logo-tag-white-horizontal.svg`};
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
    );
}