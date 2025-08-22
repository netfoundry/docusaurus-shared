import React, {type ReactNode} from 'react';
import { NetFoundryLayout, NetFoundryLayoutProps } from '@openclint/docusaurus-shared/ui';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {useLocation} from "@docusaurus/router";
import {unifiedFooter} from "@site/src/components/footer";
import {frontdoorFooter} from "@frontdoor/src/components/footer";
import {openZitiFooter} from "@openziti/src/components/footer";
import {onpremFooter} from "@onprem/src/components/footer";

const mapFooter = (p: string) => {
    if (p.startsWith('/docs/frontdoor')) return frontdoorFooter;
    if (p.startsWith('/docs/onprem')) return onpremFooter;
    if (p.startsWith('/docs/openziti')) return openZitiFooter;
    return unifiedFooter;
};

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const ziti = { label: "Vote For Us", repoUrl: 'https://github.com/openziti/ziti'};
    const footerToShow = mapFooter(pathname, siteConfig.title);
    return (
        <NetFoundryLayout footerProps={footerToShow} >
            {props.children}
        </NetFoundryLayout>
    );
}

