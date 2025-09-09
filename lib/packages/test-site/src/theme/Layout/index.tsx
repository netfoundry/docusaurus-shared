import React, {type ReactNode} from 'react';
import {unifiedFooter} from '@site/src/footer'
import {NetFoundryLayout, NetFoundryLayoutProps, StarUsProps} from '@openclint/docusaurus-shared/ui';
import {useLocation} from "@docusaurus/router";
import OriginalLayout from '@theme-original/Layout';

export default function Layout(props: React.ComponentProps<typeof OriginalLayout>) {
    const starProps: StarUsProps = {}
    const {pathname} = useLocation();
    if (pathname.startsWith('/docs/openziti')) {
        starProps.repoUrl = 'https://github.com/openziti/ziti';
        starProps.label = 'Support OpenZiti, give us a GitHub Star';
    }
    return (
        <NetFoundryLayout title={props.title} description={props.meta} footerProps={unifiedFooter} starProps={starProps} >
            {props.children}
        </NetFoundryLayout>
    );
}

