import React, {JSX} from 'react';
import styles from './Divider.module.css';

export function Divider(): JSX.Element {
    return (
        <div className={styles.dividerConnector}>
            <div className={styles.dividerDot} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" aria-label="endpoint">
                    <circle cx="12" cy="12" r="8" fill="currentColor" />
                </svg>
            </div>
            <div className={styles.dividerLine} role="presentation" aria-hidden="true"></div>
            <div className={styles.dividerDot} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" aria-label="endpoint">
                    <circle cx="12" cy="12" r="8" fill="currentColor" />
                </svg>
            </div>
        </div>
    );
}
