import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {DOCS_BASE} from '../generated/docsBase';
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
    tag: 'SaaS',
    accent: CYAN,
    link: `${DOCS_BASE}platform/intro`,
    features: ['Enterprise-grade support (24×7)', 'Fully managed by NetFoundry with 99.95% uptime SLA', 'Guidance for resilient, scalable production architecture', 'FIPS compliant'],
    description: "Cloud-managed zero-trust networking platform. Manage identities, policies, services, and routers from the console—or automate everything through the API."
  },
  {
    id: 'frontdoor',
    title: 'Frontdoor',
    logo: `${IMG}/frontdoor-sm-logo.svg`,
    tag: 'SaaS',
    accent: CYAN,
    link: `${DOCS_BASE}frontdoor/intro`,
    features: ['Enterprise-grade support (24×7)', 'Fully managed by NetFoundry with 99.95% uptime SLA', 'Guidance for resilient, scalable production architecture', 'FIPS compliant'],
    description: 'A hardened frontend for any HTTP service—no firewall changes, no client installs. Users authenticate via their existing IdP and access from any browser.'
  },
  {
    id: 'selfhosted',
    title: 'NetFoundry Self-Hosted',
    logo: `${IMG}/onprem-sm-logo.svg`,
    tag: 'Self-Hosted',
    accent: CYAN,
    link: `${DOCS_BASE}selfhosted/intro`,
    features: ['Enterprise-grade support (24×7)', 'Self-deployed and managed, self-orchestrated', 'Guidance for resilient, scalable production architecture'],
    description: 'Run the full NetFoundry stack in your own environment. On-prem, air-gapped, or any cloud. You own the infrastructure.'
  },
  {
    id: 'zlan',
    title: 'zLAN',
    logo: `${IMG}/zlan/zlan-logo.svg`,
    tag: 'OT Security',
    accent: CYAN,
    link: `${DOCS_BASE}zlan/intro`,
    features: ['Deep OT/IT traffic visibility', 'Identity-aware micro-segmentation', 'Centralized zero-trust policy'],
    description: 'Software-defined micro-segmentation for OT networks. Deploy firewall agents on Linux machines, observe traffic flows, and enforce consistent policy from a central console.'
  },
  {
    id: 'openziti',
    title: 'OpenZiti',
    logo: `${IMG}/openziti-sm-logo.svg`,
    tag: 'Open Source',
    accent: GREEN,
    link: `${DOCS_BASE}openziti/learn/introduction`,
    features: ['Community support', 'Full overlay mesh: controller, routers, and SDKs', 'Embed zero-trust in any application'],
    description: 'The open-source zero-trust networking framework behind NetFoundry. Add zero-trust to existing apps with tunnelers, or embed it directly with the SDK for the strongest posture.'
  },
  {
    id: 'zrok',
    title: 'zrok',
    logo: `${IMG}/zrok-1.0.0-rocket-purple.svg`,
    tag: 'Open Source',
    accent: GREEN,
    link: `${DOCS_BASE}zrok`,
    features: ['Community support', 'Self-host or use zrok.io', 'No open ports or firewall rules'],
    description: 'Secure peer-to-peer sharing built on the OpenZiti mesh. Share services, files, or HTTP endpoints—no open ports, no NAT traversal tricks.'
  },
];

type Product = (typeof products)[number];
const byId = Object.fromEntries(products.map(p => [p.id, p])) as Record<string, Product>;

function BentoCard({product, featured = false}: {product: Product; featured?: boolean}): JSX.Element {
  const accentMod = product.accent === CYAN ? styles['nf-bento-card--accent-cyan'] : styles['nf-bento-card--accent-green'];
  return (
    <div className={styles['nf-bento-wrap']}>
      <Link to={product.link} className={clsx(styles['nf-bento-card'], featured && styles['nf-bento-card--featured'], accentMod)} style={{borderTopColor: product.accent}}>
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
  return (
    <Layout title="NetFoundry Docs">
      <header className={styles['nf-hero-stage']}>
        <div className={clsx('container', styles['nf-hero-content'])}>
          <h1 className={styles['nf-hero-title']}>NetFoundry <span className={styles['nf-green-text']}>Docs</span></h1>
          <p className={styles['nf-hero-subtext']}>Secure Your Workloads with Identity-First Connectivity™</p>
          <div className={styles['nf-hero-ctas']}>
            <a className={styles['nf-btn-primary']} href="https://netfoundry.io/products/netfoundry-cloud-30-day-free-trial/">Get Started</a>
            <a className={styles['nf-btn-ghost']} href="https://netfoundry.io/lets-talk/">Request Demo</a>
          </div>
        </div>
      </header>
      <section className={styles['nf-features-section']} style={{marginTop: '-80px', position: 'relative', zIndex: 3}}>
        <div className="container">
          <div className={styles['nf-bento-grid']}>
            <div className={clsx(styles['nf-bento-divider'], styles['nf-divider--managed'], styles['nf-divider--top'])}>Cloud SaaS</div>
            <BentoCard product={byId['console']} featured />
            <BentoCard product={byId['frontdoor']} featured />
            <div className={styles['nf-bento-divider']}>Self-Hosted Licensed</div>
            <BentoCard product={byId['selfhosted']} />
            <BentoCard product={byId['zlan']} />
            <div className={clsx(styles['nf-bento-divider'], styles['nf-divider--open-source'])}>Self-Hosted Open Source</div>
            <BentoCard product={byId['openziti']} />
            <BentoCard product={byId['zrok']} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
