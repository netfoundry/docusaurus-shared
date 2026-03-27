import React, {useState, useEffect} from 'react';

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
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nf-icon-link"
          title="GitHub"
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
      )}
      <a
        href="https://openziti.discourse.group/"
        target="_blank"
        rel="noopener noreferrer"
        className="nf-icon-link nf-icon-link--discourse"
        title="Discourse"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -1 104 106" width="24" height="24">
          <path fill="#231f20" d="M51.87 0C23.71 0 0 22.83 0 51v52.81l51.86-.05c28.16 0 51-23.71 51-51.87S80 0 51.87 0Z"/>
          <path fill="#fff9ae" d="M52.37 19.74a31.62 31.62 0 0 0-27.79 46.67l-5.72 18.4 20.54-4.64a31.61 31.61 0 1 0 13-60.43Z"/>
          <path fill="#00aeef" d="M77.45 32.12a31.6 31.6 0 0 1-38.05 48l-20.54 4.7 20.91-2.47a31.6 31.6 0 0 0 37.68-50.23Z"/>
          <path fill="#00a94f" d="M71.63 26.29A31.6 31.6 0 0 1 38.8 78l-19.94 6.82 20.54-4.65a31.6 31.6 0 0 0 32.23-53.88Z"/>
          <path fill="#f15d22" d="M26.47 67.11a31.61 31.61 0 0 1 51-35 31.61 31.61 0 0 0-52.89 34.3l-5.72 18.4Z"/>
          <path fill="#e31b23" d="M24.58 66.41a31.61 31.61 0 0 1 47.05-40.12 31.61 31.61 0 0 0-49 39.63l-3.76 18.9Z"/>
        </svg>
      </a>
    </div>
  );
}
