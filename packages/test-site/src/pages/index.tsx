import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const products = [
  {
    title: 'NetFoundry Console',
    description: 'Our managed orchestration and control console.',
    link: '#'
  },
  {
    title: 'NetFoundry Self-Hosted',
    description: 'Deploy and manage the NetFoundry stack in your own environment.',
    link: '#'
  },
  {
    title: 'Frontdoor',
    description: 'Secure, private application access without a VPN.',
    link: '/docs/frontdoor'
  },
  {
    title: 'zrok',
    description: 'Geo-scale, secure sharing platform built on OpenZiti.',
    link: '/docs/zrok'
  },
  {
    title: 'OpenZiti',
    description: 'Programmable, secure networking directly in your apps.',
    link: '/docs/openziti'
  },
  {
    title: 'zLAN',
    description: 'Extend your secure local network to the cloud.',
    link: '/docs/zlan'
  },
];

export default function Home(): JSX.Element {
  return (
    <Layout title="NetFoundry Docs">
      <header className="nf-hero-stage">
        <div className="container nf-hero-content">
          <h1 className="nf-hero-title">NetFoundry <span className="nf-green-text">Docs</span></h1>
          <p className="nf-hero-subtext">Secure, high-performance networking for the modern era.</p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <Link className="button button--primary button--md" to="/docs/openziti">Get Started</Link>
            {/* Button text updated to Explore NetFoundry */}
            <Link className="button button--outline nf-cta-outline button--md" to="/docs/zrok">Explore NetFoundry</Link>
          </div>
        </div>
      </header>

      <main className="container margin-vert--xl">
        <div className="row">
          {products.map((props, idx) => (
            <div key={idx} className="col col--4 margin-bottom--lg">
              <Link to={props.link} className="nf-card">
                <h3>{props.title}</h3>
                <p>{props.description}</p>
                <div style={{color: 'var(--ifm-color-primary)', fontWeight: '700', marginTop: '1rem', fontSize: '0.9rem'}}>
                  Explore &rarr;
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}