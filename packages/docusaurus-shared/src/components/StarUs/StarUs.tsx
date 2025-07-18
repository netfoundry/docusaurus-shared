import React, {ReactNode} from 'react';
import styles from './styles.module.css';
import GitHubButton from 'react-github-btn';

export type StarUsProps = {
    repoUrl?: string;
    label?: string;
};

export default function StarUs({repoUrl = '', label = ''}: StarUsProps): ReactNode {
    return (
        <div className={styles.starUsRoot}>
            <span style={{color: "whitesmoke"}}>{label}&nbsp;</span>
            <span style={{height: "20px"}}>
                 <GitHubButton href={repoUrl} data-icon="octicon-star" data-show-count="true" aria-label="Star buttons/github-buttons on GitHub">Star</GitHubButton>
            </span>
        </div>
    );
}