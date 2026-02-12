import React, {JSX} from 'react';
import styles from './Divider.module.css';

export function Divider(): JSX.Element {
    return (
        <div className={styles.onpremConnector}>
            <div className={styles.onpremDot} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" aria-label="endpoint">
                    <circle cx="12" cy="12" r="8" fill="currentColor" />
                </svg>
            </div>
            <div className={styles.onpremLine} role="presentation" aria-hidden="true"></div>
            <div className={styles.onpremDot} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" aria-label="endpoint">
                    <circle cx="12" cy="12" r="8" fill="currentColor" />
                </svg>
            </div>
        </div>
    );
}
