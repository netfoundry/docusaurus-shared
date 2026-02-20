import React, {JSX} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import HeroBackground from '../components/HeroBackground';

// ── Accent colours ───────────────────────────────────────────────────────────
const CYAN  = '#22d3ee';  // Managed Cloud
const GREEN = '#22c55e';  // Open Source

// ── Products ────────────────────────────────────────────────────────────────
const products = [
  {
    id:          'console',
    title:       'NetFoundry Console',
    logo:        '/img/netfoundry-icon-color.svg',
    tag:         'Managed',
    accent:      CYAN,
    description: "The cloud-managed control plane for NetFoundry's global zero-trust fabric. Orchestrate identities, policies, and edge routers — no infrastructure to run.",
    link:        '#',
    features:    ['Fully managed SaaS', 'Global edge fabric', 'No infra to operate', 'Policy-based access'],
  },
  {
    id:          'openziti',
    title:       'OpenZiti',
    logo:        '/img/openziti-sm-logo.svg',
    tag:         'Open Source',
    accent:      GREEN,
    description: 'The open-source zero-trust networking framework at the heart of the NetFoundry platform. Embed dark, app-native security directly in your code — no VPN, no perimeter.',
    link:        '/docs/openziti',
  },
  {
    id:          'frontdoor',
    title:       'Frontdoor',
    logo:        '/img/frontdoor-sm-logo.svg',
    tag:         'Managed',
    accent:      CYAN,
    description: 'Secure, clientless access to any application — without a VPN or firewall rule. Expose nothing to the internet while giving authorized users instant access.',
    link:        '/docs/frontdoor',
    features:    ['No agent or VPN required', 'Zero firewall rules', 'Identity-based access', 'Any app, any browser'],
  },
  {
    id:          'zrok',
    title:       'zrok',
    logo:        '/img/zrok-logo.svg',
    tag:         'Open Source',
    accent:      GREEN,
    description: 'Geo-scale secure sharing built on the OpenZiti mesh. Share services, files, or HTTP endpoints peer-to-peer — no open ports, no NAT traversal tricks.',
    link:        '/docs/zrok',
  },
  {
    id:          'selfhosted',
    title:       'NetFoundry Self-Hosted',
    logo:        '/img/onprem-sm-logo.svg',
    tag:         'Self-Hosted',
    accent:      CYAN,
    description: 'Deploy the full NetFoundry control plane and fabric in your own environment. Full sovereignty over your zero-trust infrastructure — on-prem, air-gapped, or any cloud.',
    link:        '#',
    features:    ['Full infrastructure control', 'Air-gap compatible', 'On-prem or any cloud', 'Enterprise SLA'],
  },
  {
    id:          'zlan',
    title:       'zLAN',
    logo:        '/img/zlan-logo.svg',
    tag:         'OT Security',
    accent:      CYAN,
    description: 'Identity-aware micro-segmentation firewall for operational technology networks. Deep traffic visibility, centralized policy, and zero-trust access control for OT environments — built on Self-Hosted.',
    link:        '/docs/zlan',
    features:    ['Deep OT/IT traffic visibility', 'Identity-aware micro-segmentation', 'Centralized zero-trust policy', 'Built on NetFoundry Self-Hosted'],
  },
];

type Product = (typeof products)[number];
const byId = Object.fromEntries(products.map(p => [p.id, p])) as Record<string, Product>;


// ── BentoCard ────────────────────────────────────────────────────────────────
function BentoCard({product, featured = false}: {product: Product; featured?: boolean}): JSX.Element {
  const accentClass = product.accent === CYAN ? 'nf-bento-card--accent-cyan' : 'nf-bento-card--accent-green';
  return (
    <div className="nf-bento-wrap">
      <Link
        to={product.link}
        className={`nf-bento-card${featured ? ' nf-bento-card--featured' : ''} ${accentClass}`}
        style={{borderTopColor: product.accent}}
      >
        <span className="nf-card-badge">{product.tag}</span>

        <div className="nf-card-header">
          {product.logo && (
            <img src={product.logo} alt={product.title} className="nf-card-logo" />
          )}
          <h3>{product.title}</h3>
        </div>

        <p>{product.description}</p>

        {product.features && (
          <ul className="nf-bento-features">
            {product.features.map(f => <li key={f}>{f}</li>)}
          </ul>
        )}

        <div className="nf-card-link">Explore →</div>
      </Link>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home(): JSX.Element {
  return (
    <Layout title="NetFoundry Docs">

      {/* ── Dark hero ─────────────────────────────────────────────────────── */}
      <header className="nf-hero-stage">
        <HeroBackground />
        <div className="nf-hero-overlay" aria-hidden="true" />
        <div className="container nf-hero-content">
          <h1 className="nf-hero-title">
            NetFoundry <span className="nf-green-text">Docs</span>
          </h1>
          <p className="nf-hero-subtext">
            Secure, high-performance networking for the modern era.
          </p>
          <div className="nf-hero-ctas">
            <Link className="nf-btn-primary" to="/docs/frontdoor/intro">Get Started</Link>
            <a className="nf-btn-ghost" href="https://netfoundry.io/lets-talk/">Request Demo</a>
          </div>
        </div>
      </header>

      <section
        className="nf-features-section"
        style={{marginTop: '-80px', position: 'relative', zIndex: 3}}
      >
        <div className="container">
          <div className="nf-bento-grid">

            <div className="nf-bento-divider nf-divider--managed nf-divider--top">Managed Cloud</div>

            {/* Each nf-pair stacks managed (featured) above its OSS counterpart */}
            <div className="nf-pair">
              <BentoCard product={byId['console']}   featured />
              <div className="nf-pair-connector">open-source counterpart</div>
              <BentoCard product={byId['openziti']} />
            </div>
            <div className="nf-pair">
              <BentoCard product={byId['frontdoor']} featured />
              <div className="nf-pair-connector">open-source counterpart</div>
              <BentoCard product={byId['zrok']} />
            </div>

            <div className="nf-bento-divider">Run on your own infrastructure</div>
            <BentoCard product={byId['selfhosted']} />
            <BentoCard product={byId['zlan']} />

          </div>
        </div>
      </section>

    </Layout>
  );
}
