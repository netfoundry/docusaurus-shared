import React from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import styles from './CodeBlock.module.css';

export interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = 'text',
  title,
  showLineNumbers = false,
  className
}) => {
  const { prism } = useThemeConfig();
  
  return (
    <div className={`${styles.codeBlock} ${className || ''}`}>
      {title && <div className={styles.title}>{title}</div>}
      <pre className={`language-${language}`}>
        <code className={`language-${language}`}>
          {children}
        </code>
      </pre>
    </div>
  );
};
