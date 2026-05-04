import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): JSX.Element {
  return (
    <Layout title="Theme Test Site">
      <main style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center'}}>
        <h1>Theme Test Site</h1>
        <p style={{color: 'var(--ifm-color-secondary)', maxWidth: '480px'}}>
          This is the dev sandbox for <code>@netfoundry/docusaurus-theme</code>.
          Navigate using the navbar above to test theme components.
        </p>
        <Link to="/docs" style={{marginTop: '1rem'}}>Browse test docs →</Link>
      </main>
    </Layout>
  );
}
