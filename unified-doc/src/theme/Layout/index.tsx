import React, {type ReactNode} from 'react';
import {NetFoundryLayout, NetFoundryLayoutProps, StarUsProps} from '@openclint/docusaurus-shared/ui';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {useLocation} from "@docusaurus/router";
import {unifiedFooter} from "@site/src/components/footer";
import {frontdoorFooter} from "@frontdoor/src/components/footer";
import {onpremFooter} from "@onprem/src/components/footer";
import {zlanFooter} from "@zlan/src/components/footer";
import {openZitiFooter} from "@openziti/src/components/footer";

const mapFooter = (p: string) => {
    if (p.startsWith('/docs/frontdoor')) return frontdoorFooter;
    if (p.startsWith('/docs/onprem')) return onpremFooter;
    if (p.startsWith('/docs/openziti')) return openZitiFooter;
    if (p.startsWith('/docs/zlan')) return zlanFooter;
    return unifiedFooter;
};

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const starProps: StarUsProps = {}
    if (pathname.startsWith('/docs/openziti')) {
        starProps.repoUrl = 'https://github.com/openziti/ziti';
        starProps.label = 'Vote For Us';
    }
    const footerToShow = mapFooter(pathname);
    return (
        <NetFoundryLayout footerProps={footerToShow} starProps={starProps} >
            {props.children}
        </NetFoundryLayout>
    );
}

