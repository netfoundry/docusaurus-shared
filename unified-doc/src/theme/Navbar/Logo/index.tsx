import React, {JSX} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import type {DocusaurusContext} from "@docusaurus/types";
import type {DocusaurusConfig} from "@docusaurus/types/src/config";

const mapTitle = (p: string, defTitle: string) => {
    if (p.startsWith('/docs/frontdoor')) return 'Frontdoor';
    if (p.startsWith('/docs/onprem')) return 'On-Prem';
    if (p.startsWith('/docs/openziti')) return 'OpenZiti';
    return defTitle;
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
        <Link className="navbar__brand" to="/">
            <img className="navbar__logo" src="https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg" alt={title} />
            <span className="navbar__title">{title}</span>
        </Link>
    );
}