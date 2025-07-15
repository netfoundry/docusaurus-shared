import React, {type ReactNode} from 'react';
import { OpenZitiLayout, OpenZitiLayoutProps } from '@netfoundry/docusaurus-shared';
import styles from './styles.module.css'

export default function LayoutWrapper(props: OpenZitiLayoutProps): ReactNode {
    return (
        <OpenZitiLayout starProps={{ label: "Vote For Us", repoUrl: 'https://github.com/openziti/ziti'}} className={styles.test}>
            {props.children}
        </OpenZitiLayout>
    );
}