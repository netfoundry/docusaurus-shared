import React, {type ReactNode} from 'react';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import {NetFoundryLayout, NetFoundryLayoutProps, StarUsProps} from '@netfoundry/docusaurus-shared/ui';
import {unifiedFooter} from "@site/src/footer";
import useDocusaurusContext from "@docusaurus/core/lib/client/exports/useDocusaurusContext";

export default function Layout({
                                   children,
                                   noFooter,
                                   wrapperClassName,
                                   title,
                                   description,
                               }): ReactNode {
    useKeyboardNavigation();
    const {siteConfig} = useDocusaurusContext();
    const layoutProps: NetFoundryLayoutProps = {
        title: title,
        description: description,
        footerProps: unifiedFooter,
        meta: {
            siteName: siteConfig.title,
            twitterX: {
                creator: "@openziti",
                imageAlt: "/img/bob.jpg"
            },
        },
        noFooter: noFooter,
        className: wrapperClassName
    };
    return (
        <NetFoundryLayout {...layoutProps} >
            {children}
        </NetFoundryLayout>
    );
}
