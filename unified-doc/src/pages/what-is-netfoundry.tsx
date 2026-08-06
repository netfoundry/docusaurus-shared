import React, {JSX, ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {NetFoundryHorizontalSection} from '@netfoundry/docusaurus-theme/ui';
import {DOCS_BASE} from '../generated/docsBase';
import styles from './what-is-netfoundry.module.css';

const IMG = 'https://netfoundry.io/docs/img';
const NF_LOGO = 'https://raw.githubusercontent.com/netfoundry/branding/refs/heads/main/images/svg/icon/netfoundry-icon-color.svg';

/* ------------------------------------------------------------- primitives */

/** Section heading with a monospace marker above it, so sections are scannable at a glance. */
function Section({marker, id, title, children}: {marker: string; id: string; title: string; children: ReactNode}) {
  return (
    <section className={styles.docSection}>
      <span className={styles.marker}>{marker}</span>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

/** Whole-card link that does not navigate when the click ended a text selection.
 *  A plain anchor fires click on mouseup regardless, so selecting a card's copy would activate
 *  the link the moment the mouse came up. Pressing the mouse down collapses any earlier
 *  selection, so anything still selected at click time was selected inside this card. */
function CardLink({to, className, children}: {to: string; className: string; children: ReactNode}) {
  return (
    <Link
      to={to}
      className={className}
      onClick={e => {
        if (!window.getSelection()?.isCollapsed) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </Link>
  );
}

/** A titled feature block — the bullet list alternative that still reads as documentation. */
function Item({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className={styles.item}>
      <h4>{label}</h4>
      <p>{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ data */

/** Products that make up the platform: what each one is for, not just where its docs are. */
const platformProjects = [
  {
    title: 'Console',
    logo: NF_LOGO,
    to: `${DOCS_BASE}platform/intro`,
    role: 'Operate the network',
    summary: 'The web interface. Enroll identities, define services and policies, provision routers, read metrics and events.',
  },
  {
    title: 'API',
    logo: NF_LOGO,
    to: `${DOCS_BASE}platform/api-guides/`,
    role: 'Automate the network',
    summary: 'The same surface the console drives, for pipelines and tooling: provisioning, the network model, metrics, and reporting.',
  },
  {
    title: 'Data Connector',
    logo: NF_LOGO,
    to: `${DOCS_BASE}dataconnector/intro`,
    role: 'Get the data out',
    summary: 'Stream network events and metrics into your own warehouse, SIEM, or analytics stack instead of reading them in a console.',
  },
  // Row two: the products that deliver access to someone else.
  {
    title: 'Frontdoor',
    logo: `${IMG}/frontdoor-sm-logo.svg`,
    to: `${DOCS_BASE}frontdoor/intro`,
    role: 'Publish an HTTP service',
    summary: 'Reach an HTTP service from a browser with no client software and no firewall changes — publicly or kept private to your identities. Users authenticate through your existing IdP.',
  },
  {
    title: 'Customer Connect',
    logo: NF_LOGO,
    to: `${DOCS_BASE}customer-connect/intro`,
    role: 'Serve your own customers',
    summary: 'Deliver zero trust access to the people who buy from you, each tenant isolated from every other.',
  },
];

/** Who operates the infrastructure. Both options are commercially supported NetFoundry products. */
const deploymentOptions = [
  {
    title: 'NetFoundry Cloud',
    to: `${DOCS_BASE}platform/intro`,
    operator: 'Operated by NetFoundry',
    body: 'A hybrid SaaS model: NetFoundry manages the infrastructure, you own the network configuration and policies. Nothing is multi-tenant — a neighbour’s incident is not yours.',
    points: [
      'Controllers and routers provisioned on demand, no infrastructure of your own',
      'A dedicated controller, data plane, and PKI — never shared with another customer',
      'Managed version upgrades inside maintenance windows',
      'Automated configuration backups',
      'Infrastructure inventory, allocated IPs, and component health in the console',
      'An uptime SLA on the network NetFoundry operates',
    ],
  },
  {
    title: 'NetFoundry Self-Hosted',
    to: `${DOCS_BASE}selfhosted/intro`,
    operator: 'Operated by you, supported by us',
    body: 'The same stack deployed into an environment you own — on-prem, air-gapped, or your own cloud accounts.',
    points: [
      'You deploy and run the controllers and routers on infrastructure you own',
      'Fits sovereign, air-gapped, and otherwise restricted environments',
      'You choose the platform, the sizing, and the upgrade schedule',
      'Backups and capacity planning stay under your control',
      'No dependency on a NetFoundry-operated control plane',
    ],
  },
];

/** Capabilities both options carry, so the cards above only have to state the differences. */
const sharedCapabilities = [
  'A dedicated PKI, provisioned and maintained for you',
  'Identities, services, policies, and posture checks',
  'High availability controllers',
  'Metrics, latency, and audit logging',
  'SCIM identity provisioning',
  'APIs for the network model, metrics, and reporting',
  'IPsec bridging for existing site-to-site VPNs',
  '24×7 support and production architecture guidance',
  'SOC 2 Type II audit reports and per-framework compliance guidance',
];

const relatedProjects = [
  {title: 'OpenZiti', to: `${DOCS_BASE}openziti/intro`, summary: 'The open source overlay this platform is built on.'},
  {title: 'NetFoundry Self-Hosted', to: `${DOCS_BASE}selfhosted/intro`, summary: 'Run the same stack in your own environment.'},
  {title: 'zLAN', to: `${DOCS_BASE}zlan/intro`, summary: 'Microsegmentation for OT networks.'},
  {title: 'zrok', to: `${DOCS_BASE}zrok`, summary: 'Peer-to-peer sharing built on OpenZiti.'},
];

/** Everything the managed platform includes, grouped into three buckets. Items link into the
 *  product documentation where a page covers them, and to a section on this page where none does. */
const included = [
  {
    bucket: 'Infrastructure and operations',
    items: [
      {label: 'Deploy controllers and routers on demand', to: `${DOCS_BASE}platform/how-tos/routers/create-router`},
      {label: 'Global mesh across providers and regions', to: `${DOCS_BASE}platform/core-components/routers`},
      {label: 'Dedicated control and data plane per network', to: `${DOCS_BASE}platform/intro`},
      {label: 'High availability controllers', to: `${DOCS_BASE}platform/infrastructure/managed-components`},
      {label: 'Managed version upgrades', to: `${DOCS_BASE}platform/infrastructure/managed-components`},
      {label: 'Automated configuration backups', to: '#deployment-options'},
    ],
  },
  {
    bucket: 'Visibility and audit',
    items: [
      {label: 'Usage metrics and fabric telemetry', to: `${DOCS_BASE}platform/visibility/metrics`},
      {label: 'Fabric and controller latency', to: `${DOCS_BASE}platform/visibility/metrics#fabric-latency-tab`},
      {label: 'Traffic analysis for microsegmentation', to: `${DOCS_BASE}platform/visibility/metrics#traffic-analysis-tab`},
      {label: 'Events and management audit logging', to: `${DOCS_BASE}platform/visibility/events`},
      {label: 'Streaming to your own data platform', to: `${DOCS_BASE}dataconnector/intro`},
    ],
  },
  {
    bucket: 'Access, automation, and assurance',
    items: [
      {label: 'Identity and service policies', to: `${DOCS_BASE}platform/access-management/policies/`},
      {label: 'IdP authentication and posture checks', to: `${DOCS_BASE}platform/access-management/posture-checks`},
      {label: 'SCIM identity provisioning', to: `${DOCS_BASE}platform/access-management/integrations/scim`},
      {label: 'APIs for infrastructure, network, and metrics', to: `${DOCS_BASE}platform/api-guides/`},
      {label: 'IPsec bridging for existing VPNs', to: `${DOCS_BASE}platform/core-components/ipsec-tunnelers`},
      {label: 'Audit reports, compliance guidance, support, and SLA', to: '#assurance'},
    ],
  },
];

/** Compliance posture, grouped by what NetFoundry actually provides. These are not equivalent:
 *  an audit report, an eligibility statement, and architectural guidance are three different
 *  things, and procurement will ask which one applies. */
const compliance = [
  {
    tier: 'Audited',
    note: 'Independent audit reports NetFoundry can provide.',
    items: ['SOC 2 Type II'],
  },
  {
    tier: 'Contractual and eligible',
    note: 'Supported through contract terms and platform configuration.',
    items: ['HIPAA eligibility', 'GDPR', 'CCPA', 'Data processing agreements'],
  },
  {
    tier: 'Guidance and alignment',
    note: 'NetFoundry provides guidance and controls that map to these; the attestation is yours.',
    items: [
      'FIPS', 'PCI DSS', 'NIST 800-207', 'NIST 800-171',
      'IEC 62443', 'NERC CIP', 'NIS2', 'DORA', 'CJIS',
    ],
  },
];

/* ------------------------------------------------------------------ page */

export default function CloudPlatformOverview(): JSX.Element {
  return (
    <Layout
      title="NetFoundry Cloud Platform"
      description="Overview of the NetFoundry Cloud Platform: the management and orchestration layer for zero trust overlay networks built on OpenZiti, and an index of the documentation for each platform product."
    >
      <>
        {/* Full-bleed tint band; NetFoundryHorizontalSection inside aligns the content to the
            site's --ziti-max-width, so this header lines up with every other page. */}
        <header className={styles.pageHeader}>
          <NetFoundryHorizontalSection className={styles.band}>
            <div className={clsx('container', styles.headerContent)}>
              <span className={styles.eyebrow}>Overview</span>
              <h1>NetFoundry Cloud Platform</h1>
              <p className={styles.lede}>
                NetFoundry provides a fully managed, production-ready <Link to={`${DOCS_BASE}openziti/intro`}>OpenZiti</Link>{' '}
                network without requiring you to build or operate the underlying infrastructure. Your network is your
                own: deploy controllers and routers dedicated to your organization, never shared with another customer,
                across whichever cloud providers and regions you choose.
              </p>
              <div className={styles.included}>
                <span className={styles.includedTitle}>With the NetFoundry platform you get</span>
                <div className={styles.includedGrid}>
                  {included.map(group => (
                    <div key={group.bucket} className={styles.bucket}>
                      <h3 className={styles.bucketTitle}>{group.bucket}</h3>
                      <ul className={styles.includedList}>
                        {group.items.map(f => (
                          <li key={f.label}>
                            <Link to={f.to}>{f.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </NetFoundryHorizontalSection>
        </header>

        <NetFoundryHorizontalSection className={clsx(styles.band, styles.body)}>
          <article className={clsx('markdown', 'container', styles.article)}>

            <Section marker="01" id="products" title="What is the NetFoundry Platform">
              <p>The NetFoundry Platform consists of several components and applications:</p>
              <div className={styles.projectGrid}>
                {platformProjects.map(p => (
                  <CardLink key={p.title} to={p.to} className={styles.projectCard}>
                    <span className={styles.projectRole}>{p.role}</span>
                    <div className={styles.projectHeader}>
                      <img src={p.logo} alt="" className={styles.projectLogo} />
                      <h3>{p.title}</h3>
                    </div>
                    <p>{p.summary}</p>
                  </CardLink>
                ))}
              </div>

              <div className={styles.ozCallout}>
                <img src={`${IMG}/openziti-sm-logo.svg`} alt="" className={styles.ozCalloutLogo} />
                <div>
                  <span className={styles.ozCalloutTag}>Open source foundation</span>
                  <p>
                    NetFoundry created and maintains <Link to={`${DOCS_BASE}openziti/intro`}>OpenZiti</Link>, the
                    Apache 2.0 licensed project this platform is built on, and sponsors its development. The overlay,
                    the SDKs, and the cryptography are the same in both. What the Cloud Platform adds is the operating:
                    provisioning, upgrades, high availability, telemetry, support, and an SLA.
                  </p>
                </div>
              </div>

            </Section>

            <Section marker="02" id="deployment-options" title="Let us run it for you, or run it yourself">
              <p>
                The overlay, the SDKs, and the security model are identical either way. What differs is who operates
                the infrastructure — and in both cases the network configuration and the policies that govern access
                stay yours.
              </p>
              <div className={styles.optionRow}>
                {deploymentOptions.map(o => (
                  <CardLink key={o.title} to={o.to} className={styles.option}>
                    <span className={styles.optionOperator}>{o.operator}</span>
                    <h4>{o.title}</h4>
                    <p>{o.body}</p>
                    <ul className={styles.optionPoints}>
                      {o.points.map(pt => <li key={pt}>{pt}</li>)}
                    </ul>
                    <span className={styles.optionMore}>Read the docs →</span>
                  </CardLink>
                ))}
              </div>

              <div className={styles.shared}>
                <span className={styles.sharedTitle}>Both options include</span>
                <ul className={styles.sharedList}>
                  {sharedCapabilities.map(c => <li key={c}>{c}</li>)}
                </ul>
              </div>

              <h3 id="assurance" className={styles.subhead}>Support and compliance</h3>
              <p>
                Support is 24×7 and follows the globe, and managed networks carry an uptime SLA with service credits.
                On compliance, what NetFoundry provides differs by framework — an audit report, a contractual
                commitment, and architectural guidance are not the same thing:
              </p>
              <dl className={styles.complianceList}>
                {compliance.map(group => (
                  <div key={group.tier} className={styles.complianceGroup}>
                    <dt>
                      <span className={styles.complianceTier}>{group.tier}</span>
                      <span className={styles.complianceNote}>{group.note}</span>
                    </dt>
                    <dd>
                      <div className={styles.chipRow}>
                        {group.items.map(f => <span key={f} className={styles.chip}>{f}</span>)}
                      </div>
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section marker="03" id="visibility" title="Visibility">
              <p>
                Telemetry comes out of the Ziti fabric itself, so the numbers describe the overlay rather than a proxy
                for it.
              </p>
              <div className={styles.itemGrid}>
                <Item label="Metrics">
                  Traffic volume by dialing endpoint, hosting endpoint, service, and edge router, over preset or custom
                  time ranges and filterable by endpoint attribute.{' '}
                  <Link to={`${DOCS_BASE}platform/visibility/metrics`}>Reference</Link>.
                </Item>
                <Item label="Fabric and controller latency">
                  Router-to-router link latency and router-to-controller control-channel latency, as mean, max, and
                  P99, with a link diagram and time series. Latency timeouts surface failing paths and overloaded
                  routers.
                </Item>
                <Item label="Traffic analysis">
                  For ZTNA deployments using ingress and egress gateways, the actual source IPs, destination IPs, and
                  ports crossing the funnel — so a segmentation design can be derived from observed flows rather than
                  guessed at.
                </Item>
                <Item label="Events and audit logging">
                  Management events record who changed what and when, alongside network activity.{' '}
                  <Link to={`${DOCS_BASE}platform/visibility/events`}>Reference</Link>.
                </Item>
                <Item label="Export">
                  <Link to={`${DOCS_BASE}dataconnector/intro`}>Data Connector</Link> streams events and metrics into
                  your own warehouse, SIEM, or analytics platform.
                </Item>
              </div>
            </Section>

            <Section marker="04" id="projects" title="Documentation index">
              <p>
                Every product above has its own documentation project. <Link to="#products">Section 01</Link> says what
                each one is for.
              </p>
              <ul className={styles.relatedList}>
                {platformProjects.map(p => (
                  <li key={p.title}>
                    <Link to={p.to}>{p.title}</Link> — {p.role.toLowerCase()}.
                  </li>
                ))}
              </ul>

              <h3 id="related">Related projects</h3>
              <ul className={styles.relatedList}>
                {relatedProjects.map(p => (
                  <li key={p.title}>
                    <Link to={p.to}>{p.title}</Link> — {p.summary}
                  </li>
                ))}
              </ul>
            </Section>

          </article>
        </NetFoundryHorizontalSection>
      </>
    </Layout>
  );
}
