import React, {ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type LayoutType from "@theme/Layout";
import type {WrapperProps} from '@docusaurus/types';
import {defaultNetFoundryFooterProps, NetFoundryLayout} from "@openclint/docusaurus-shared/ui";

import styles from './index.module.css';

type Props = WrapperProps<typeof LayoutType>;
export default function OnPrem(props: Props): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    const footerProps = defaultNetFoundryFooterProps();
    footerProps.socialProps.facebookUrl = "http://local:1010";
    footerProps.socialProps.instagramUrl = "http://local:1010";
    footerProps.socialProps.githubUrl = "http://local:1010";
    footerProps.description = "Description here";
    footerProps.documentationLinks = [
        <a href="/docs/new/link">New Link</a>
    ];
    return (
        <NetFoundryLayout className={styles.landing} footerProps={footerProps}>
            <p>todo</p>
        </NetFoundryLayout>
    );
}
