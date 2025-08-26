import React, {type ReactNode} from 'react';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {useLocation} from "@docusaurus/router";
import {unifiedFooter} from "@site/src/theme/footer";
import {frontdoorFooter} from "@frontdoor/src/components/footer";
import {openZitiFooter} from "@openziti/src/components/footer";
import {onpremFooter} from "@onprem/src/components/footer";
import {StarUsProps} from "@openclint/docusaurus-shared/src/components/StarUs";
import {NetFoundryLayout} from "@site/src/components/NetFoundryLayout";

const mapFooter = (p: string) => {
    if (p.startsWith('/docs/frontdoor')) return frontdoorFooter;
    if (p.startsWith('/docs/onprem')) return onpremFooter;
    if (p.startsWith('/docs/openziti')) return openZitiFooter;
    return unifiedFooter;
};

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const starProps: StarUsProps = {}
    if (pathname.startsWith('/docs/openziti')) {
        starProps.repoUrl = 'https://github.com/openziti/ziti';
        starProps.label = 'Support OpenZiti, give us a GitHub Star';
    }
    const footerToShow = mapFooter(pathname, siteConfig.title);
    return (
        <NetFoundryLayout footerProps={footerToShow} starProps={starProps} >
            {props.children}
        </NetFoundryLayout>
    );
}

