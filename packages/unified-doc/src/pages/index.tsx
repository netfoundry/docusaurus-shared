import {JSX} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './index.module.css';
import {NetFoundryLayout} from "@openclint/docusaurus-shared";

export default function OnPrem(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    return (
        <NetFoundryLayout className={styles.landing}>
            <p>todo</p>
        </NetFoundryLayout>
  );
}
