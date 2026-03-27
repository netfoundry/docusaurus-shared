import React from 'react';
import styles from './HeroBackground.module.css';

export default function HeroBackground(): React.ReactElement {
  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
    </div>
  );
}
