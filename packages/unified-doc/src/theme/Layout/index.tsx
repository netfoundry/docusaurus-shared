import React, {type ReactNode} from 'react';
import { NetFoundryLayout, NetFoundryLayoutProps } from '@openclint/docusaurus-shared';
import {onPremFooter as frontdoorFooter} from "@frontdoor/src/components/footer";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {useLocation} from "@docusaurus/router";

const mapFooter = (p: string, defTitle: string) => {
    if (p.startsWith('/docs/frontdoor')) return 'Frontdoor';
    if (p.startsWith('/docs/onprem')) return 'On-Prem';
    if (p.startsWith('/docs/ziti')) return 'OpenZiti';
    return defTitle;
};

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();

    const title = mapFooter(pathname, siteConfig.title);
    return (
        <NetFoundryLayout footerProps={frontdoorFooter}>
            {props.children}
        </NetFoundryLayout>
    );
}
