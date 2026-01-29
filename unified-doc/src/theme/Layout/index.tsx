import React, {type ReactNode} from 'react';
import {NetFoundryLayout, NetFoundryLayoutProps, StarUsProps} from '@netfoundry/docusaurus-theme/ui';
import {useLocation} from "@docusaurus/router";
import {unifiedFooter} from "@site/src/components/footer";
import {frontdoorFooter} from "@frontdoor/src/components/footer";
import {onpremFooter} from "@onprem/src/components/footer";
import {zlanFooter} from "@zlan/src/components/footer";
import {openZitiFooter} from "@openziti/src/components/footer";
import {zrokFooter} from "@zrok/src/components/footer";

const matchPath = (p: string, segment: string) =>
    p.startsWith(`/${segment}`) || p.startsWith(`/docs/${segment}`);

const mapFooter = (p: string) => {
    if (matchPath(p, 'frontdoor')) return frontdoorFooter;
    if (matchPath(p, 'onprem')) return onpremFooter;
    if (matchPath(p, 'openziti')) return openZitiFooter;
    if (matchPath(p, 'zlan')) return zlanFooter;
    if (matchPath(p, 'zrok')) return zrokFooter;
    return unifiedFooter;
};

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    const {pathname} = useLocation();
    let starProps: StarUsProps | undefined;
    if (matchPath(pathname, 'openziti')) {
        starProps = {
            repoUrl: 'https://github.com/openziti/ziti',
            label: 'Star OpenZiti on GitHub',
        };
    } else if (matchPath(pathname, 'zrok')) {
        starProps = {
            repoUrl: 'https://github.com/openziti/zrok',
            label: 'Star zrok on GitHub',
        };
    }
    const footerToShow = mapFooter(pathname);
    return (
        <NetFoundryLayout footerProps={footerToShow} starProps={starProps} >
            {props.children}
        </NetFoundryLayout>
    );
}

