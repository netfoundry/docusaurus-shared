import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import styles from './index.module.css';

const CYAN  = '#22d3ee';
const GREEN = '#22c55e';
const IMG   = 'https://netfoundry.io/docs/img';
const NF_LOGO = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';

const products = [
  {
    id: 'console',
    title: 'NetFoundry Console',
    logo: NF_LOGO,
    tag: 'Managed',
    accent: CYAN,
    link: '#',
    features: ['Fully managed SaaS', 'Global edge fabric', 'No infra to operate', 'Policy-based access'],
    description: "The cloud-managed control plane for NetFoundry's global zero-trust fabric. Orchestrate identities, policies, and edge routers — no infrastructure to run."
  },
  {
    id: 'openziti',
    title: 'OpenZiti',
    logo: `${IMG}/openziti-sm-logo.svg`,
    tag: 'Open Source',
    accent: GREEN,
    link: '/openziti/learn/introduction',
    description: 'The open-source zero-trust networking framework at the heart of the NetFoundry platform. Embed dark, app-native security directly in your code — no VPN, no perimeter.'
  },
  {
    id: 'frontdoor',
    title: 'Frontdoor',
    logo: `${IMG}/frontdoor-sm-logo.svg`,
    tag: 'Managed',
    accent: CYAN,
    link: '/frontdoor/intro',
    features: ['No agent or VPN required', 'Zero firewall rules', 'Identity-based access', 'Any app, any browser'],
    description: 'Secure, clientless access to any application — without a VPN or firewall rule. Expose nothing to the internet while giving authorized users instant access.'
  },
  {
    id: 'zrok',
    title: 'zrok',
    logo: `${IMG}/zrok-1.0.0-rocket-purple.svg`,
    tag: 'Open Source',
    accent: GREEN,
    link: '/zrok',
    description: 'Geo-scale secure sharing built on the OpenZiti mesh. Share services, files, or HTTP endpoints peer-to-peer — no open ports, no NAT traversal tricks.'
  },
  {
    id:
    'selfhosted',
    title: 'NetFoundry Self-Hosted',
    logo: `${IMG}/onprem-sm-logo.svg`,
    tag: 'Self-Hosted',
    accent: CYAN,
    link: '/selfhosted/intro',
    features: ['Full infrastructure control', 'Air-gap compatible', 'On-prem or any cloud', 'Enterprise SLA'],
    description: 'Deploy the full NetFoundry control plane and fabric in your own environment. Full sovereignty over your zero-trust infrastructure — on-prem, air-gapped, or any cloud.'
  },
  {
    id: 'zlan',
    title: 'zLAN',
    logo: `${IMG}/zlan-logo.svg`,
    tag: 'OT Security',
    accent: CYAN,
    link: '/zlan/intro',
    features: ['Deep OT/IT traffic visibility', 'Identity-aware micro-segmentation', 'Centralized zero-trust policy', 'Built on NetFoundry Self-Hosted'],
    description: 'Identity-aware micro-segmentation firewall for operational technology networks. Deep traffic visibility, centralized policy, and zero-trust access control for OT environments.'
  },
];

type Product = (typeof products)[number];
const byId = Object.fromEntries(products.map(p => [p.id, p])) as Record<string, Product>;

function BentoCard({product, featured = false}: {product: Product; featured?: boolean}): JSX.Element {
  const accentMod = product.accent === CYAN ? styles['nf-bento-card--accent-cyan'] : styles['nf-bento-card--accent-green'];
  const link = useBaseUrl(product.link);
  return (
    <div className={styles['nf-bento-wrap']}>
      <Link to={link} className={clsx(styles['nf-bento-card'], featured && styles['nf-bento-card--featured'], accentMod)} style={{borderTopColor: product.accent}}>
        <span className={styles['nf-card-badge']}>{product.tag}</span>
        <div className={styles['nf-card-header']}>
          {product.logo && <img src={product.logo} alt={product.title} className={styles['nf-card-logo']} />}
          <h3>{product.title}</h3>
        </div>
        <p>{product.description}</p>
        {product.features && (
          <ul className={styles['nf-bento-features']}>
            {product.features.map(f => <li key={f}>{f}</li>)}
          </ul>
        )}
        <div className={styles['nf-card-link']}>Explore →</div>
      </Link>
    </div>
  );
}

export default function Home(): JSX.Element {
  const getStartedUrl = useBaseUrl('/frontdoor/intro');
  return (
    <Layout title="NetFoundry Docs">
      <header className={styles['nf-hero-stage']}>
        <div className={clsx('container', styles['nf-hero-content'])}>
          <h1 className={styles['nf-hero-title']}>NetFoundry <span className={styles['nf-green-text']}>Docs</span></h1>
          <p className={styles['nf-hero-subtext']}>Secure, high-performance networking for the modern era.</p>
          <div className={styles['nf-hero-ctas']}>
            <Link className={styles['nf-btn-primary']} to={getStartedUrl}>Get Started</Link>
            <a className={styles['nf-btn-ghost']} href="https://netfoundry.io/lets-talk/">Request Demo</a>
          </div>
        </div>
      </header>
      <section className={styles['nf-features-section']} style={{marginTop: '-80px', position: 'relative', zIndex: 3}}>
        <div className="container">
          <div className={styles['nf-bento-grid']}>
            <div className={clsx(styles['nf-bento-divider'], styles['nf-divider--managed'], styles['nf-divider--top'])}>Managed Cloud</div>
            <div className={styles['nf-pair']}>
              <BentoCard product={byId['console']} featured />
              <div className={styles['nf-pair-connector']}>open-source counterpart</div>
              <BentoCard product={byId['openziti']} />
            </div>
            <div className={styles['nf-pair']}>
              <BentoCard product={byId['frontdoor']} featured />
              <div className={styles['nf-pair-connector']}>open-source counterpart</div>
              <BentoCard product={byId['zrok']} />
            </div>
            <div className={styles['nf-bento-divider']}>Run on your own infrastructure</div>
            <BentoCard product={byId['selfhosted']} />
            <BentoCard product={byId['zlan']} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
