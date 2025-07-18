import React from 'react';
import clsx from 'clsx';
import styles from './Alert.module.css';

export interface AlertProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className
}) => {
  return (
    <div className={clsx(styles.alert, styles[type], className)}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.content}>{children}</div>
    </div>
  );
};
