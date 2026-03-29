import React, {useState, useEffect} from 'react';
import {DiscourseIcon, GitHubIcon} from '../../../../src/components/icons';

const GITHUB_ROUTES: Record<string, string> = {
  '/docs/openziti': 'https://github.com/openziti/ziti',
  '/docs/zrok':     'https://github.com/openziti/zrok',
};

export default function IconLinks(_props: {position?: 'left' | 'right'}) {
  const [githubUrl, setGithubUrl] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const {pathname} = window.location;
      const entry = Object.entries(GITHUB_ROUTES).find(([p]) => pathname.startsWith(p));
      setGithubUrl(entry ? entry[1] : null);
    };
    check();
    window.addEventListener('popstate', check);
    return () => window.removeEventListener('popstate', check);
  }, []);

  return (
    <div className="nf-icon-links">
      {githubUrl && (
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="nf-icon-link" title="GitHub">
          <GitHubIcon />
        </a>
      )}
      <a href="https://openziti.discourse.group/" target="_blank" rel="noopener noreferrer" className="nf-icon-link nf-icon-link--discourse" title="Discourse">
        <DiscourseIcon />
      </a>
    </div>
  );
}
