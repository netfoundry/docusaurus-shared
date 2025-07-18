import React, {type ReactNode} from 'react';
import { NetFoundryLayout, NetFoundryLayoutProps } from '@openclint/docusaurus-shared';

export default function LayoutWrapper(props: NetFoundryLayoutProps): ReactNode {
    return (
        <NetFoundryLayout starProps={{ label: "Vote For Us", repoUrl: 'https://github.com/openziti/ziti'}} className={styles.test}>
            {props.children}
        </NetFoundryLayout>
    );
}